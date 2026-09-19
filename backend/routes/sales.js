//sales.js  
import express from "express";
import pool from "../db.js";

const router = express.Router();

async function resolveBusinessId(req) {
  const fromSession = req.session?.user?.company || req.session?.workspace || null;
  if (fromSession) return fromSession;

  const fromParam = req.params?.company || req.query?.company || req.query?.businessId || null;
  if (!fromParam) return null;

  const [rows] = await pool.query(
    `SELECT business_id FROM business_owners
     WHERE business_id = ?
        OR company = ?
        OR LOWER(REPLACE(company, ' ', '-')) = ?
     LIMIT 1`,
    [fromParam, fromParam, String(fromParam).toLowerCase()]
  );

  return rows[0]?.business_id || null;
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

router.get(["/orders", "/:company/orders"], async (req, res) => {
  try {
    const businessId = await resolveBusinessId(req);
    if (!businessId) {
      return res.status(401).json({ success: false, message: "Business session not found" });
    }

    const [rows] = await pool.query(
      `SELECT * FROM orders WHERE business_id = ? ORDER BY created_at DESC`,
      [businessId]
    );

    res.json({ success: true, orders: rows.map(normalizeOrderRow) });
  } catch (err) {
    console.error("GET /api/sales/orders error:", err);
    res.status(500).json({ success: false, message: err.message || "Failed to load sales orders" });
  }
});

router.put(["/orders/:id/status", "/:company/orders/:id/status"], async (req, res) => {
  try {
    const businessId = await resolveBusinessId(req);
    if (!businessId) {
      return res.status(401).json({ success: false, message: "Business session not found" });
    }

    const { id } = req.params;
    const { status } = req.body || {};
    const allowedStatuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid order status" });
    }

    const [result] = await pool.query(
      `UPDATE orders SET status = ? WHERE id = ? AND business_id = ?`,
      [status, id, businessId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, message: "Order status updated" });
  } catch (err) {
    console.error("PUT /api/sales/orders/:id/status error:", err);
    res.status(500).json({ success: false, message: err.message || "Failed to update order status" });
  }
});

router.get(["/reports/summary", "/:company/reports/summary"], async (req, res) => {
  try {
    const businessId = await resolveBusinessId(req);
    if (!businessId) {
      return res.status(401).json({ success: false, message: "Business session not found" });
    }

    const [rows] = await pool.query(
      `SELECT
         COALESCE(SUM(CASE WHEN status != 'Cancelled' THEN total ELSE 0 END), 0) AS totalRevenue,
         COUNT(*) AS totalOrders,
         SUM(CASE WHEN status IN ('Delivered', 'Shipped') THEN 1 ELSE 0 END) AS completedOrders,
         SUM(CASE WHEN status != 'Cancelled' THEN quantity ELSE 0 END) AS productsSold
       FROM orders WHERE business_id = ?`,
      [businessId]
    );

    const [topProductRows] = await pool.query(
      `SELECT product, SUM(quantity) AS units
       FROM orders WHERE business_id = ? AND status != 'Cancelled'
       GROUP BY product ORDER BY units DESC LIMIT 1`,
      [businessId]
    );

    const summary = rows[0];
    const topProduct = topProductRows[0];

    res.json({
      success: true,
      summary: {
        totalRevenue: Number(summary.totalRevenue || 0),
        monthRevenue: Number(summary.totalRevenue || 0),
        totalOrders: Number(summary.totalOrders || 0),
        completedOrders: Number(summary.completedOrders || 0),
        productsSold: Number(summary.productsSold || 0),
        topProduct: topProduct ? topProduct.product : "-",
        topProductUnits: topProduct ? Number(topProduct.units || 0) : 0,
      },
    });
  } catch (err) {
    console.error("GET /api/sales/reports/summary error:", err);
    res.status(500).json({ success: false, message: err.message || "Failed to load sales summary" });
  }
});

router.get(["/reports/monthly-sales", "/:company/reports/monthly-sales"], async (req, res) => {
  try {
    const businessId = await resolveBusinessId(req);
    if (!businessId) {
      return res.status(401).json({ success: false, message: "Business session not found" });
    }

    const [rows] = await pool.query(
      `SELECT DATE_FORMAT(order_date, '%Y-%m') AS month, SUM(total) AS sales
       FROM orders WHERE business_id = ? AND status != 'Cancelled'
       GROUP BY DATE_FORMAT(order_date, '%Y-%m') ORDER BY month ASC`,
      [businessId]
    );

    res.json({ success: true, monthlySales: rows.map((row) => ({ month: row.month, sales: Number(row.sales || 0) })) });
  } catch (err) {
    console.error("GET /api/sales/reports/monthly-sales error:", err);
    res.status(500).json({ success: false, message: err.message || "Failed to load monthly sales" });
  }
});

router.get(["/reports/product-sales", "/:company/reports/product-sales"], async (req, res) => {
  try {
    const businessId = await resolveBusinessId(req);
    if (!businessId) {
      return res.status(401).json({ success: false, message: "Business session not found" });
    }

    const [rows] = await pool.query(
      `SELECT product, SUM(quantity) AS sold
       FROM orders WHERE business_id = ? AND status != 'Cancelled'
       GROUP BY product ORDER BY sold DESC LIMIT 5`,
      [businessId]
    );

    res.json({ success: true, productSales: rows.map((row) => ({ product: row.product, sold: Number(row.sold || 0) })) });
  } catch (err) {
    console.error("GET /api/sales/reports/product-sales error:", err);
    res.status(500).json({ success: false, message: err.message || "Failed to load product sales" });
  }
});

router.post(["/ai-assistant", "/:company/ai-assistant"], async (req, res) => {
  try {
    const businessId = await resolveBusinessId(req);
    if (!businessId) {
      return res.status(401).json({ success: false, message: "Business session not found" });
    }

    const { message } = req.body || {};
    const text = (message || "").toLowerCase();

    let reply = "I can help with sales, orders, and demand questions. Try asking about low sales, best sellers, or a summary.";

    if (text.includes("low sales") || text.includes("push")) {
      const [rows] = await pool.query(
        `SELECT product, SUM(quantity) AS sold
         FROM orders WHERE business_id = ?
         GROUP BY product ORDER BY sold ASC LIMIT 3`,
        [businessId]
      );
      if (rows.length === 0) {
        reply = "I don't have enough order data yet to identify low performers.";
      } else {
        reply = `Lowest performing products: ${rows.map(r => `${r.product} (${r.sold} sold)`).join(", ")}. Consider a promotion or bundling to boost these.`;
      }
    } else if (text.includes("predict") || text.includes("demand")) {
      const [rows] = await pool.query(
        `SELECT DATE_FORMAT(order_date, '%Y-%m') AS month, SUM(total) AS sales
         FROM orders WHERE business_id = ?
         GROUP BY DATE_FORMAT(order_date, '%Y-%m') ORDER BY month DESC LIMIT 3`,
        [businessId]
      );
      if (rows.length < 2) {
        reply = "I need at least two months of order history to predict demand trends.";
      } else {
        const latest = Number(rows[0].sales);
        const prev = Number(rows[1].sales);
        const growth = prev > 0 ? (((latest - prev) / prev) * 100).toFixed(1) : "0";
        reply = `Based on recent trends, sales changed by ${growth}% month-over-month. Projected next month revenue: ₹${Math.round(latest * (1 + growth / 100)).toLocaleString("en-IN")}.`;
      }
    } else if (text.includes("best selling") || text.includes("best-selling")) {
      const [rows] = await pool.query(
        `SELECT product, SUM(quantity) AS sold
         FROM orders WHERE business_id = ?
         GROUP BY product ORDER BY sold DESC LIMIT 3`,
        [businessId]
      );
      reply = rows.length === 0
        ? "No product sales data available yet."
        : `Best sellers: ${rows.map(r => `${r.product} (${r.sold} units)`).join(", ")}.`;
    } else if (text.includes("summary")) {
      const [rows] = await pool.query(
        `SELECT COALESCE(SUM(total), 0) AS revenue, COUNT(*) AS orders
         FROM orders WHERE business_id = ?`,
        [businessId]
      );
      const r = rows[0];
      reply = `You've made ₹${Number(r.revenue).toLocaleString("en-IN")} across ${r.orders} orders so far.`;
    }

    res.json({ success: true, reply });
  } catch (err) {
    console.error("POST /api/sales/ai-assistant error:", err);
    res.status(500).json({ success: false, message: err.message || "AI assistant failed" });
  }
});

export default router;
