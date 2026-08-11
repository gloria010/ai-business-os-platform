//userdashboard.js
import express from "express";
import pool from "../../db.js";

const router = express.Router();

// Requires a logged-in consumer. login.js sets req.session.user = { id, name, email, role, company }
// on successful login, so req.session.user.id / .email are the identifiers used below.
function requireLogin(req, res, next) {
  if (!req.session?.user?.id) {
    return res.status(401).json({ success: false, message: "Not logged in" });
  }
  next();
}

router.use(requireLogin);

// Small helper so one broken query doesn't 500 the whole dashboard.
// Logs the real error server-side and returns a fallback value instead.
async function safeQuery(label, queryFn, fallback) {
  try {
    return await queryFn();
  } catch (err) {
    console.error(`[Dashboard] ${label} failed:`, err.message);
    return fallback;
  }
}

// GET /api/user/dashboard
router.get("/dashboard", async (req, res) => {
  const userId = req.session.user.id;
  const userEmail = req.session.user.email;

  try {
    const [
      recentOrdersRows,
      totalOrders,
      spendingRows,
      cartCount,
      wishlistCount,
      unreadCount,
      recommendedRows,
    ] = await Promise.all([
      safeQuery(
        "recentOrders",
        async () => {
          const [rows] = await pool.query(
            `SELECT id, order_code, product, quantity, price, gst, total,
                    status, payment_status, order_date, delivery_date
             FROM orders
             WHERE email = ?
             ORDER BY created_at DESC
             LIMIT 3`,
            [userEmail]
          );
          return rows;
        },
        []
      ),
      safeQuery(
        "totalOrders",
        async () => {
          const [rows] = await pool.query(
            `SELECT COUNT(*) AS totalOrders FROM orders WHERE email = ?`,
            [userEmail]
          );
          return Number(rows[0]?.totalOrders || 0);
        },
        0
      ),
      safeQuery(
        "spending",
        async () => {
          const [rows] = await pool.query(
            `SELECT DATE_FORMAT(order_date, '%Y-%m') AS month, SUM(total) AS spent
             FROM orders
             WHERE email = ?
               AND order_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
             GROUP BY DATE_FORMAT(order_date, '%Y-%m')
             ORDER BY month ASC`,
            [userEmail]
          );
          return rows;
        },
        []
      ),
      safeQuery(
        "cartCount",
        async () => {
          const [rows] = await pool.query(
            `SELECT COALESCE(SUM(quantity), 0) AS cartCount FROM cart_items WHERE user_id = ?`,
            [userId]
          );
          return Number(rows[0]?.cartCount || 0);
        },
        0
      ),
      safeQuery(
        "wishlistCount",
        async () => {
          const [rows] = await pool.query(
            `SELECT COUNT(*) AS wishlistCount FROM wishlist_items WHERE user_id = ?`,
            [userId]
          );
          return Number(rows[0]?.wishlistCount || 0);
        },
        0
      ),
      safeQuery(
        "unreadNotifications",
        async () => {
          const [rows] = await pool.query(
            `SELECT COUNT(*) AS unreadCount FROM notifications WHERE user_id = ? AND is_read = 0`,
            [userId]
          );
          return Number(rows[0]?.unreadCount || 0);
        },
        0
      ),
      safeQuery(
        "recommendedProducts",
        async () => {
          const [rows] = await pool.query(
            `SELECT id, name, price, rating, image
             FROM products
             ORDER BY rating DESC
             LIMIT 4`
          );
          return rows;
        },
        []
      ),
    ]);

    // Build a full 6-month label series so the chart doesn't have gaps
    const spendMap = new Map(spendingRows.map((r) => [r.month, Number(r.spent) || 0]));
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      months.push({
        month: key,
        label: d.toLocaleString("default", { month: "short" }),
        value: spendMap.get(key) || 0,
      });
    }

    res.json({
      success: true,
      stats: {
        totalOrders,
        cartItems: cartCount,
        wishlistItems: wishlistCount,
        unreadNotifications: unreadCount,
      },
      recentOrders: recentOrdersRows,
      spendingOverview: months,
      recommendedProducts: recommendedRows,
    });
  } catch (err) {
    // Should be unreachable now that every sub-query is wrapped, but kept as a safety net
    console.error("GET /api/user/dashboard fatal error:", err);
    res.status(500).json({ success: false, message: err.message || "Server error while loading dashboard." });
  }
});

// GET /api/user/my-orders -> all orders placed by the logged-in consumer,
// matched by email since orders has no user_id column.
router.get("/my-orders", async (req, res) => {
  const userEmail = req.session.user.email;

  try {
    const [rows] = await pool.query(
      `SELECT id, order_code, company, product, quantity, price, gst, total,
              payment_method, payment_status, transaction_id, status,
              order_date, delivery_date, address
       FROM orders
       WHERE email = ?
       ORDER BY created_at DESC`,
      [userEmail]
    );

    res.json({ success: true, orders: rows });
  } catch (err) {
    console.error("GET /api/user/my-orders error:", err);
    res.status(500).json({ success: false, message: err.message || "Server error while loading orders." });
  }
});

// POST /api/user/change-password { currentPassword, newPassword }
router.post("/change-password", async (req, res) => {
  const userId = req.session.user.id;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: "Both current and new password are required." });
  }

  try {
    const [rows] = await pool.query(
      `SELECT password FROM users WHERE id = ? LIMIT 1`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    if (rows[0].password !== currentPassword) {
      return res.status(401).json({ success: false, message: "Current password is incorrect." });
    }

    await pool.query(
      `UPDATE users SET password = ? WHERE id = ?`,
      [newPassword, userId]
    );

    res.json({ success: true, message: "Password updated successfully." });
  } catch (err) {
    console.error("POST /api/user/change-password error:", err);
    res.status(500).json({ success: false, message: err.message || "Server error while updating password." });
  }
});

export default router;