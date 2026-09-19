import express from "express";
import { getCompanyInventoryPool } from "../DbInventory.js";
import { getCompanyHrPool } from "../dbHr.js";
import pool from "../db.js";

const router = express.Router();

async function getBusinessId(req) {
  const sessionUser = req.session?.user;
  return sessionUser?.company || req.session?.workspace || req.session?.businessId || null;
}

function normalizeOrderRow(row) {
  return {
    id: row.id,
    order_code: row.order_code,
    customer_name: row.customer_name,
    email: row.email,
    phone: row.phone,
    product: row.product,
    quantity: Number(row.quantity || 0),
    price: Number(row.price || 0),
    gst: Number(row.gst || 0),
    total: Number(row.total || 0),
    payment_method: row.payment_method,
    payment_status: row.payment_status,
    transaction_id: row.transaction_id,
    status: row.status,
    order_date: row.order_date,
    delivery_date: row.delivery_date,
    address: row.address,
    created_at: row.created_at,
  };
}

router.get("/insights", async (req, res) => {
  try {
    const businessId = await getBusinessId(req);

    if (!businessId) {
      return res.status(401).json({ success: false, message: "Business not identified" });
    }

    const hrPool = await getCompanyHrPool(businessId);

    const [employeeStatsRows] = await hrPool.query(`
      SELECT
        COUNT(*) AS totalEmployees,
        SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) AS activeEmployees
      FROM employees
    `);

    const [applicationStatsRows] = await hrPool.query(`
      SELECT
        SUM(CASE WHEN status IN ('applied', 'pending') THEN 1 ELSE 0 END) AS pendingCandidates,
        SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END) AS acceptedCandidates
      FROM applications
    `);

    const [recentApplications] = await hrPool.query(`
      SELECT id, name, position, status, created_at
      FROM applications
      ORDER BY created_at DESC
      LIMIT 4
    `);

    const [recentEmployees] = await hrPool.query(`
      SELECT id, name, department, status, created_at
      FROM employees
      ORDER BY created_at DESC
      LIMIT 4
    `);

    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const currentMonthLabel = currentMonthStart.toISOString().slice(0, 10);
    const nextMonthLabel = nextMonthStart.toISOString().slice(0, 10);
    const previousMonthLabel = previousMonthStart.toISOString().slice(0, 10);

    const [salesStatsRows] = await pool.query(
      `
        SELECT
          COUNT(*) AS totalOrders,
          SUM(CASE WHEN order_date >= ? AND order_date < ? THEN total ELSE 0 END) AS currentMonthSales,
          SUM(CASE WHEN order_date >= ? AND order_date < ? THEN 1 ELSE 0 END) AS currentMonthOrders,
          SUM(CASE WHEN order_date >= ? AND order_date < ? THEN total ELSE 0 END) AS previousMonthSales,
          SUM(CASE WHEN order_date >= ? AND order_date < ? THEN 1 ELSE 0 END) AS previousMonthOrders
        FROM orders
        WHERE business_id = ?
      `,
      [
        currentMonthLabel,
        nextMonthLabel,
        currentMonthLabel,
        nextMonthLabel,
        previousMonthLabel,
        currentMonthLabel,
        previousMonthLabel,
        currentMonthLabel,
        businessId,
      ]
    );

    const employeeStats = employeeStatsRows[0] || {};
    const applicationStats = applicationStatsRows[0] || {};
    const salesStats = salesStatsRows[0] || {};

    const currentMonthSales = Number(salesStats.currentMonthSales || 0);
    const previousMonthSales = Number(salesStats.previousMonthSales || 0);
    const salesGrowth = previousMonthSales > 0
      ? ((currentMonthSales - previousMonthSales) / previousMonthSales) * 100
      : 0;

    return res.json({
      success: true,
      insights: {
        employees: {
          total: Number(employeeStats.totalEmployees || 0),
          active: Number(employeeStats.activeEmployees || 0),
        },
        hr: {
          pendingCandidates: Number(applicationStats.pendingCandidates || 0),
          acceptedCandidates: Number(applicationStats.acceptedCandidates || 0),
          recentApplications,
          recentEmployees,
        },
        orders: {
          totalOrders: Number(salesStats.totalOrders || 0),
          currentMonthOrders: Number(salesStats.currentMonthOrders || 0),
          previousMonthOrders: Number(salesStats.previousMonthOrders || 0),
        },
        sales: {
          currentMonthSales,
          previousMonthSales,
          salesGrowth,
        },
      },
    });
  } catch (err) {
    console.error("CEO insights error:", err);
    return res.status(500).json({ success: false, message: "Failed to load insights" });
  }
});

router.get("/products", async (req, res) => {
  try {
    const businessId = await getBusinessId(req);

    if (!businessId) {
      return res.status(401).json({ success: false, message: "Business not identified" });
    }

    const companyPool = await getCompanyInventoryPool(businessId);
    const [rows] = await companyPool.query(`
      SELECT p.*, c.name AS category, w.name AS warehouseName
      FROM products p
      JOIN categories c ON c.id = p.category_id
      LEFT JOIN warehouses w ON w.id = p.warehouse_id
      ORDER BY p.created_at DESC
    `);

    return res.json({ success: true, products: rows });
  } catch (err) {
    console.error("CEO products error:", err);
    return res.status(500).json({ success: false, message: "Failed to load products" });
  }
});

// ---- GET /api/ceo/employees ----
// Full company employee list (read-only view for CEO dashboard).
// Same "employees" table/columns hr.js exposes at GET /api/hr/:businessId/employees,
// but scoped via getBusinessId(req) to match the rest of ceo.js.
router.get("/employees", async (req, res) => {
  try {
    const businessId = await getBusinessId(req);

    if (!businessId) {
      return res.status(401).json({ success: false, message: "Business not identified" });
    }

    const hrPool = await getCompanyHrPool(businessId);

    const [rows] = await hrPool.query(`
      SELECT id, name, email, department, designation, salary, status, created_at
      FROM employees
      ORDER BY created_at DESC
    `);

    return res.json({ success: true, employees: rows });
  } catch (err) {
    console.error("CEO employees error:", err);
    return res.status(500).json({ success: false, message: "Failed to load employees" });
  }
});


router.get("/orders", async (req, res) => {
  try {
    const businessId = await getBusinessId(req);

    if (!businessId) {
      return res.status(401).json({ success: false, message: "Business not identified" });
    }

    const [rows] = await pool.query(
      `SELECT * FROM orders WHERE business_id = ? ORDER BY created_at DESC`,
      [businessId]
    );

    return res.json({ success: true, orders: rows.map(normalizeOrderRow) });
  } catch (err) {
    console.error("CEO orders error:", err);
    return res.status(500).json({ success: false, message: "Failed to load orders" });
  }
});

router.get("/reports/monthly-sales", async (req, res) => {
  try {
    const businessId = await getBusinessId(req);

    if (!businessId) {
      return res.status(401).json({ success: false, message: "Business not identified" });
    }

    const now = new Date();
    const sixMonthsAgoStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const startLabel = sixMonthsAgoStart.toISOString().slice(0, 10);

    const [rows] = await pool.query(
      `
        SELECT
          DATE_FORMAT(order_date, '%Y-%m') AS month,
          SUM(total) AS sales
        FROM orders
        WHERE business_id = ? AND order_date >= ?
        GROUP BY DATE_FORMAT(order_date, '%Y-%m')
        ORDER BY month ASC
      `,
      [businessId, startLabel]
    );

    const salesByMonth = {};
    rows.forEach((row) => {
      salesByMonth[row.month] = Number(row.sales || 0);
    });

    const monthlySales = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthlySales.push({
        month: key,
        sales: salesByMonth[key] || 0,
      });
    }

    return res.json({ success: true, monthlySales });
  } catch (err) {
    console.error("CEO monthly-sales error:", err);
    return res.status(500).json({ success: false, message: "Failed to load monthly sales" });
  }
});

router.get("/orders/:id", async (req, res) => {  try {
    const businessId = await getBusinessId(req);

    if (!businessId) {
      return res.status(401).json({ success: false, message: "Business not identified" });
    }

    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT * FROM orders WHERE id = ? AND business_id = ? LIMIT 1`,
      [id, businessId]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    return res.json({ success: true, order: normalizeOrderRow(rows[0]) });
  } catch (err) {
    console.error("CEO order detail error:", err);
    return res.status(500).json({ success: false, message: "Failed to load order" });
  }
});

// ---- GET /api/ceo/notifications ----
// All messages addressed to any department within the CEO's own business.
// Same `messages` table messages.js reads from, but scoped via getBusinessId(req)
// to match the rest of ceo.js — no cross-business access.
router.get("/notifications", async (req, res) => {
  try {
    const businessId = await getBusinessId(req);

    if (!businessId) {
      return res.status(401).json({ success: false, message: "Business not identified" });
    }

    const [rows] = await pool.query(
      `SELECT id, business_id, from_name, from_department, to_recipient, subject, message, created_at
       FROM messages
       WHERE business_id = ?
       ORDER BY created_at DESC`,
      [businessId]
    );

    return res.json({ success: true, notifications: rows });
  } catch (err) {
    console.error("CEO notifications error:", err);
    return res.status(500).json({ success: false, message: "Failed to load notifications" });
  }
});

export default router;