import express from "express";
import pool from "../db.js";
import { createDepartmentDatabases } from "../createDepartmentDatabases.js";
import { getCompanyInventoryPool } from "../DbInventory.js";

const router = express.Router();

function requireAdmin(req, res, next) {
  if (!req.session || !req.session.user || req.session.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Admin access required" });
  }
  next();
}

async function safeCount(label, queryFn, fallback = 0) {
  try {
    return await queryFn();
  } catch (err) {
    console.error(`[AdminStats] ${label} failed:`, err.message);
    return fallback;
  }
}

// Builds a full N-month label series so charts don't have gaps for empty months
function buildMonthSeries(months = 6) {
  const series = [];
  const now = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    series.push({ month: key, label: d.toLocaleString("default", { month: "short" }) });
  }
  return series;
}

// GET /api/admin/stats
router.get("/admin/stats", requireAdmin, async (req, res) => {
  try {
    const [
      totalBusinesses,
      pendingBusinesses,
      totalConsumers,
      totalAdmins,
      totalEmployees,
      totalOrders,
      totalRevenue,
      totalCategories,
      totalProducts,
      monthlyRevenueRows,
      monthlyGrowthRows,
    ] = await Promise.all([
      safeCount("totalBusinesses", async () => {
        const [rows] = await pool.query(`SELECT COUNT(*) AS c FROM business_owners WHERE status = 'approved'`);
        return Number(rows[0]?.c || 0);
      }),
      safeCount("pendingBusinesses", async () => {
        const [rows] = await pool.query(`SELECT COUNT(*) AS c FROM business_owners WHERE status = 'pending'`);
        return Number(rows[0]?.c || 0);
      }),
      safeCount("totalConsumers", async () => {
        const [rows] = await pool.query(`SELECT COUNT(*) AS c FROM users WHERE role = 'consumer'`);
        return Number(rows[0]?.c || 0);
      }),
      safeCount("totalAdmins", async () => {
        const [rows] = await pool.query(`SELECT COUNT(*) AS c FROM users WHERE role = 'admin'`);
        return Number(rows[0]?.c || 0);
      }),
      safeCount("totalEmployees", async () => {
        const [rows] = await pool.query(`SELECT COUNT(*) AS c FROM users WHERE role = 'employee'`);
        return Number(rows[0]?.c || 0);
      }),
      safeCount("totalOrders", async () => {
        const [rows] = await pool.query(`SELECT COUNT(*) AS c FROM orders`);
        return Number(rows[0]?.c || 0);
      }),
      safeCount("totalRevenue", async () => {
        const [rows] = await pool.query(`SELECT COALESCE(SUM(total), 0) AS s FROM orders`);
        return Number(rows[0]?.s || 0);
      }),
      safeCount("totalCategories", async () => {
        const [rows] = await pool.query(`SELECT COUNT(DISTINCT business_category) AS c FROM business_owners`);
        return Number(rows[0]?.c || 0);
      }),
      safeCount("totalProducts", async () => {
        // products lives per-company in each business's own inventory DB
        // (see inventory.js/getCompanyInventoryPool), not a shared table —
        // so this has to open every approved business's DB and sum counts.
        const [businesses] = await pool.query(
          `SELECT business_id FROM business_owners WHERE status = 'approved'`
        );

        let total = 0;
        for (const biz of businesses) {
          try {
            const companyPool = await getCompanyInventoryPool(biz.business_id);
            const [rows] = await companyPool.query(`SELECT COUNT(*) AS c FROM products`);
            total += Number(rows[0]?.c || 0);
          } catch (err) {
            console.warn(`[AdminStats] Could not count products for ${biz.business_id}: ${err.message}`);
          }
        }
        return total;
      }),
      safeCount("monthlyRevenue", async () => {
        const [rows] = await pool.query(
          `SELECT DATE_FORMAT(order_date, '%Y-%m') AS month, SUM(total) AS value
           FROM orders
           WHERE order_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
           GROUP BY DATE_FORMAT(order_date, '%Y-%m')
           ORDER BY month ASC`
        );
        return rows;
      }, []),
      safeCount("monthlyGrowth", async () => {
        const [rows] = await pool.query(
          `SELECT DATE_FORMAT(created_at, '%Y-%m') AS month,
                  SUM(CASE WHEN role = 'consumer' THEN 1 ELSE 0 END) AS users,
                  SUM(CASE WHEN role = 'business_owner' THEN 1 ELSE 0 END) AS businesses
           FROM users
           WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
           GROUP BY DATE_FORMAT(created_at, '%Y-%m')
           ORDER BY month ASC`
        );
        return rows;
      }, []),
    ]);

    // Fill gaps for months with no orders/signups
    const revenueMap = new Map(monthlyRevenueRows.map((r) => [r.month, Number(r.value) || 0]));
    const growthMap = new Map(monthlyGrowthRows.map((r) => [r.month, r]));

    const revenueSeries = buildMonthSeries(6).map(({ month, label }) => ({
      label,
      value: revenueMap.get(month) || 0,
    }));

    const growthSeries = buildMonthSeries(6).map(({ month, label }) => {
      const row = growthMap.get(month);
      return {
        label,
        value: Number(row?.users || 0),
        value2: Number(row?.businesses || 0),
      };
    });

    res.json({
      success: true,
      stats: {
        totalBusinesses,
        pendingBusinesses,
        totalConsumers,
        totalAdmins,
        totalEmployees,
        totalOrders,
        totalRevenue,
        totalCategories,
        totalProducts,
      },
      revenueData: revenueSeries,
      userGrowthData: growthSeries,
    });
  } catch (err) {
    console.error("GET /api/admin/stats fatal error:", err);
    res.status(500).json({ success: false, message: err.message || "Server error while loading stats." });
  }
});

// GET /api/admin/users -> combined list: consumers, businesses, admins
router.get("/admin/users", requireAdmin, async (req, res) => {
  try {
    const [consumers] = await pool.query(
      `SELECT u.id, 'consumer' AS type, u.name, u.email, u.phone, u.created_at,
              NULL AS company, NULL AS status
       FROM users u WHERE u.role = 'consumer'`
    );
    const [businesses] = await pool.query(
      `SELECT bo.user_id AS id, 'business' AS type, u.name, u.email, u.phone, bo.created_at,
              bo.company, bo.status
       FROM business_owners bo JOIN users u ON u.id = bo.user_id`
    );
    const [admins] = await pool.query(
      `SELECT u.id, 'admin' AS type, u.name, u.email, u.phone, u.created_at,
              NULL AS company, NULL AS status
       FROM users u WHERE u.role = 'admin'`
    );

    const users = [...consumers, ...businesses, ...admins].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    res.json({ success: true, users });
  } catch (err) {
    console.error("GET /api/admin/users error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/users/:type/:id -> full detail, shape depends on type
router.get("/admin/users/:type/:id", requireAdmin, async (req, res) => {
  const { type, id } = req.params;

  try {
    if (type === "consumer") {
      const [userRows] = await pool.query(
        `SELECT id, name, email, phone, role, created_at
         FROM users WHERE id = ? AND role = 'consumer'`,
        [id]
      );
      if (userRows.length === 0) {
        return res.status(404).json({ success: false, message: "Consumer not found" });
      }
      const user = userRows[0];

      const [orders] = await pool.query(
        `SELECT id, order_code, company, product, quantity, price, gst, total,
                payment_method, payment_status, transaction_id, status,
                order_date, delivery_date, address
         FROM orders WHERE email = ? ORDER BY created_at DESC`,
        [user.email]
      );
      const [wishlist] = await pool.query(
        `SELECT product_id, created_at FROM wishlist_items WHERE user_id = ? ORDER BY created_at DESC`,
        [id]
      );
      const [cart] = await pool.query(
        `SELECT product_id, quantity, created_at FROM cart_items WHERE user_id = ? ORDER BY created_at DESC`,
        [id]
      );

      const totalSpent = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);

      return res.json({
        success: true,
        type: "consumer",
        data: { ...user, totalOrders: orders.length, totalSpent, orders, wishlist, cart },
      });
    }

    if (type === "business") {
      const [rows] = await pool.query(
        `SELECT bo.id, bo.business_id, bo.company, bo.business_category, bo.pincode,
                bo.status, bo.created_at, bo.subscription, bo.subscription_date,
                u.name AS owner_name, u.email, u.phone
         FROM business_owners bo
         JOIN users u ON u.id = bo.user_id
         WHERE bo.user_id = ?`,
        [id]
      );
      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: "Business not found" });
      }
      const biz = rows[0];

      const [orders] = await pool.query(
        `SELECT id, order_code, product, quantity, total, status, order_date
         FROM orders WHERE business_id = ? ORDER BY created_at DESC LIMIT 20`,
        [biz.business_id]
      );

      let productCount = 0;
      try {
        const companyPool = await getCompanyInventoryPool(biz.business_id);
        const [[row]] = await companyPool.query(`SELECT COUNT(*) AS c FROM products`);
        productCount = Number(row?.c || 0);
      } catch (err) {
        console.warn(`[AdminUsers] Could not count products for ${biz.business_id}: ${err.message}`);
      }

      return res.json({
        success: true,
        type: "business",
        data: { ...biz, orders, productCount },
      });
    }

    if (type === "admin") {
      const [rows] = await pool.query(
        `SELECT id, name, email, phone, created_at FROM users WHERE id = ? AND role = 'admin'`,
        [id]
      );
      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: "Admin not found" });
      }
      return res.json({ success: true, type: "admin", data: rows[0] });
    }

    res.status(400).json({ success: false, message: "Unknown user type" });
  } catch (err) {
    console.error("GET /api/admin/users/:type/:id error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/consumers -> list all consumers with order summary
router.get("/admin/consumers", requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         u.id, u.name, u.email, u.phone, u.created_at,
         COUNT(o.id) AS totalOrders,
         COALESCE(SUM(o.total), 0) AS totalSpent
       FROM users u
       LEFT JOIN orders o ON o.email = u.email
       WHERE u.role = 'consumer'
       GROUP BY u.id, u.name, u.email, u.phone, u.created_at
       ORDER BY u.created_at DESC`
    );
    res.json({ success: true, consumers: rows });
  } catch (err) {
    console.error("GET /api/admin/consumers error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/consumers/:id -> full detail for one consumer:
// profile+ every order + wishlist + cart snapshot
router.get("/admin/consumers/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const [userRows] = await pool.query(
      `SELECT id, name, email, phone, role, created_at
       FROM users WHERE id = ? AND role = 'consumer'`,
      [id]
    );
    if (userRows.length === 0) {
      return res.status(404).json({ success: false, message: "Consumer not found" });
    }
    const user = userRows[0];

    const [orders] = await pool.query(
      `SELECT id, order_code, company, product, quantity, price, gst, total,
              payment_method, payment_status, transaction_id, status,
              order_date, delivery_date, address
       FROM orders
       WHERE email = ?
       ORDER BY created_at DESC`,
      [user.email]
    );

    const [wishlist] = await pool.query(
      `SELECT product_id, created_at FROM wishlist_items WHERE user_id = ? ORDER BY created_at DESC`,
      [id]
    );

    const [cart] = await pool.query(
      `SELECT product_id, quantity, created_at FROM cart_items WHERE user_id = ? ORDER BY created_at DESC`,
      [id]
    );

    const totalSpent = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);

    res.json({
      success: true,
      consumer: {
        ...user,
        totalOrders: orders.length,
        totalSpent,
        orders,
        wishlist,
        cart,
      },
    });
  } catch (err) {
    console.error("GET /api/admin/consumers/:id error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/products -> every product across every approved business,
// since products live per-company in each business's own inventory DB.
router.get("/admin/products", requireAdmin, async (req, res) => {
  try {
    const [businesses] = await pool.query(
      `SELECT business_id, company FROM business_owners WHERE status = 'approved'`
    );

    const allProducts = [];
    for (const biz of businesses) {
      try {
        const companyPool = await getCompanyInventoryPool(biz.business_id);
        const [rows] = await companyPool.query(
          `SELECT p.id, p.name, p.sku, p.price, p.stock, p.status, p.image_path,
                  c.name AS category, w.name AS warehouseName
           FROM products p
           LEFT JOIN categories c ON c.id = p.category_id
           LEFT JOIN warehouses w ON w.id = p.warehouse_id`
        );
        rows.forEach((r) => allProducts.push({ ...r, company: biz.company, business_id: biz.business_id }));
      } catch (err) {
        console.warn(`[AdminProducts] Could not load products for ${biz.business_id}: ${err.message}`);
      }
    }

    res.json({ success: true, products: allProducts });
  } catch (err) {
    console.error("GET /api/admin/products error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/categories -> business categories with counts + which
// businesses fall under each (this is business_owners.business_category,
// e.g. Electronics/Fashion — set at registration in register.js)
router.get("/admin/categories", requireAdmin, async (req, res) => {
  try {
    const [businesses] = await pool.query(
      `SELECT business_id, company, business_category
       FROM business_owners WHERE status = 'approved'`
    );

    const byCategory = new Map();
    for (const b of businesses) {
      const key = b.business_category || "Uncategorized";
      if (!byCategory.has(key)) byCategory.set(key, []);
      byCategory.get(key).push({ business_id: b.business_id, company: b.company });
    }

    const categories = Array.from(byCategory.entries())
      .map(([category, list]) => ({ category, businessCount: list.length, businesses: list }))
      .sort((a, b) => b.businessCount - a.businessCount);

    res.json({ success: true, categories });
  } catch (err) {
    console.error("GET /api/admin/categories error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/orders -> every order platform-wide
router.get("/admin/orders", requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, order_code, business_id, company, customer_name, email, product,
              quantity, price, gst, total, payment_method, payment_status,
              transaction_id, status, order_date, delivery_date, address, created_at
       FROM orders
       ORDER BY created_at DESC`
    );
    res.json({ success: true, orders: rows });
  } catch (err) {
    console.error("GET /api/admin/orders error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/admin/orders/:id/status -> admin override, no business_id/company
// scoping needed since admin can act on any order
router.patch("/admin/orders/:id/status", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const validStatuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: `Status must be one of: ${validStatuses.join(", ")}` });
  }

  try {
    const [result] = await pool.query(`UPDATE orders SET status = ? WHERE id = ?`, [status, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }
    res.json({ success: true, message: "Order status updated." });
  } catch (err) {
    console.error("PATCH /api/admin/orders/:id/status error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/business-owners?status=pending
router.get("/admin/business-owners", requireAdmin, async (req, res) => {
  const { status } = req.query;
  try {
    let query = `
      SELECT bo.id, bo.business_id, bo.company, bo.business_category,
             bo.pincode, bo.status, bo.created_at,
             u.name AS owner_name, u.email, u.phone
      FROM business_owners bo
      JOIN users u ON u.id = bo.user_id
    `;
    const params = [];
    if (status) {
      query += " WHERE bo.status = ?";
      params.push(status);
    }
    query += " ORDER BY bo.created_at DESC";

    const [rows] = await pool.query(query, params);
    res.json({ success: true, businessOwners: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/admin/business-owners/:id/approve
router.patch("/admin/business-owners/:id/approve", requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      "SELECT id, business_id, company, company_password, status FROM business_owners WHERE id = ?",
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Business owner not found" });
    }
    if (rows[0].status === "approved") {
      return res.status(409).json({ success: false, message: "Already approved" });
    }

    await pool.query(
      "UPDATE business_owners SET status = 'approved' WHERE id = ?",
      [id]
    );

    try {
      const createdDbs = await createDepartmentDatabases(rows[0].id, rows[0].business_id);
      console.log(`Department databases created for owner ${id}:`, createdDbs);
    } catch (dbErr) {
      console.error(`Failed to create department databases for owner ${id}:`, dbErr);
    }

    // Notify the business owner with their company password now that
    // they're approved — same messages table used by Sales/Inventory/
    // Employees notification bells (business_owner_id, sender, receiver, message).
    try {
      await pool.query(
        `INSERT INTO messages (business_owner_id, sender, receiver, message)
         VALUES (?, ?, ?, ?)`,
        [
          rows[0].id,
          "Admin",
          "Owner",
          `Your business "${rows[0].company}" has been approved! Your company password is ${rows[0].company_password} — use it for company-level access.`,
        ]
      );
      console.log(`Approval notification with company password sent for owner ${id}`);
    } catch (msgErr) {
      console.error(`Failed to send approval notification for owner ${id}:`, msgErr);
    }

    res.json({ success: true, message: "Business approved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/admin/business-owners/:id/reject
router.patch("/admin/business-owners/:id/reject", requireAdmin, async (req, res) => {
  const { id } = req.params;
  console.log(`[Reject] Route hit. id param = ${id}, admin user =`, req.session?.user?.email);

  try {
    const [result] = await pool.query(
      "UPDATE business_owners SET status = 'rejected' WHERE id = ?",
      [id]
    );
    console.log(`[Reject] Query ran. affectedRows = ${result.affectedRows}`);

    if (result.affectedRows === 0) {
      console.log(`[Reject] No matching business_owners.id = ${id}. Sending 404.`);
      return res.status(404).json({ success: false, message: "Business owner not found" });
    }

    console.log(`[Reject] Success. business_owners.id = ${id} set to rejected.`);
    res.json({ success: true, message: "Business rejected" });
  } catch (err) {
    console.error(`[Reject] Threw an error for id = ${id}:`, err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/business-owners/:id -> permanently removes the business
// owner row (pending, approved, or rejected). This does NOT drop the
// business's per-company inventory/department databases (see
// createDepartmentDatabases.js) or the underlying users row — it only
// removes the business_owners record so the business no longer appears
// anywhere in the admin panel or storefront.
router.delete("/admin/business-owners/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      "SELECT id, company FROM business_owners WHERE id = ?",
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Business owner not found" });
    }

    const [result] = await pool.query(
      "DELETE FROM business_owners WHERE id = ?",
      [id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Business owner not found" });
    }

    res.json({ success: true, message: `${rows[0].company} removed` });
  } catch (err) {
    console.error("DELETE /api/admin/business-owners/:id error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;