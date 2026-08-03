import express from "express";
import pool from "../../db.js";

const router = express.Router();

export async function createOrder({
  businessId,
  customerName,
  email,
  product,
  quantity,
  price,
  gst,
  paymentMethod,
  paymentStatus,
  orderDate,
  deliveryDate,
  address,
}) {
  const [ownerRows] = await pool.query(
    `SELECT business_id, company FROM business_owners WHERE business_id = ? OR company = ? LIMIT 1`,
    [businessId, businessId]
  );

  if (ownerRows.length === 0) {
    throw new Error("Business not found.");
  }

  const resolvedBusinessId = ownerRows[0].business_id;
  const company = ownerRows[0].company;

  const qty = Number(quantity) || 1;
  const unitPrice = Number(price) || 0;
  const gstAmount = Number(gst) || 0;
  const total = qty * unitPrice + gstAmount;

  const orderCode = "ORD-" + Date.now().toString(36).toUpperCase();
  const transactionId = "TXN-" + Date.now().toString(36).toUpperCase() + Math.floor(Math.random() * 1000);
  const finalOrderDate = orderDate || new Date().toISOString().slice(0, 10);

  const [result] = await pool.query(
    `INSERT INTO orders
      (order_code, business_id, company, customer_name, email,
       product, quantity, price, gst, total, payment_method, payment_status,
       transaction_id, status, order_date, delivery_date, address)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      orderCode,
      resolvedBusinessId,
      company,
      customerName || null,
      email || null,
      product,
      qty,
      unitPrice,
      gstAmount,
      total,
      paymentMethod || null,
      paymentStatus || "Pending",
      transactionId,
      "Pending",
      finalOrderDate,
      deliveryDate || null,
      address || null,    ]
  );

  return {
    orderId: result.insertId,
    orderCode,
    transactionId,
  };
}

router.get("/:company/orders", async (req, res) => {
  try {
    const { company } = req.params;
    const [rows] = await pool.query(
      `SELECT * FROM orders WHERE company = ? ORDER BY created_at DESC`,
      [company]
    );

    res.json({ success: true, orders: rows });
  } catch (err) {
    console.error("GET /api/user/orders/:company/orders error:", err);
    res.status(500).json({ success: false, message: err.message || "Server error while loading orders." });
  }
});

router.patch("/:company/orders/:id/status", async (req, res) => {
  try {
    const { company, id } = req.params;
    const { status } = req.body;

    const [result] = await pool.query(
      `UPDATE orders SET status = ? WHERE id = ? AND company = ?`,
      [status, id, company]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    res.json({ success: true, message: "Order status updated." });
  } catch (err) {
    console.error("PATCH /api/user/orders/:company/orders/:id/status error:", err);
    res.status(500).json({ success: false, message: err.message || "Server error while updating order status." });
  }
});

router.get("/:company/reports/summary", async (req, res) => {
  try {
    const { company } = req.params;
    const [rows] = await pool.query(
      `SELECT
         COUNT(*) AS totalOrders,
         SUM(CASE WHEN status = 'Delivered' THEN 1 ELSE 0 END) AS completedOrders,
         SUM(total) AS totalRevenue,
         SUM(quantity) AS productsSold
       FROM orders
       WHERE company = ?`,
      [company]
    );

    const summary = rows[0] || {};
    res.json({
      success: true,
      summary: {
        totalRevenue: Number(summary.totalRevenue || 0),
        monthRevenue: 0,
        totalOrders: Number(summary.totalOrders || 0),
        completedOrders: Number(summary.completedOrders || 0),
        productsSold: Number(summary.productsSold || 0),
        topProduct: "-",
        topProductUnits: 0,
      },
    });
  } catch (err) {
    console.error("GET /api/user/orders/:company/reports/summary error:", err);
    res.status(500).json({ success: false, message: err.message || "Server error while loading reports." });
  }
});

router.get("/:company/reports/monthly-sales", async (req, res) => {
  try {
    const { company } = req.params;
    const [rows] = await pool.query(
      `SELECT DATE_FORMAT(order_date, '%Y-%m') AS month, SUM(total) AS sales
       FROM orders
       WHERE company = ?
       GROUP BY DATE_FORMAT(order_date, '%Y-%m')
       ORDER BY month ASC`,
      [company]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("GET /api/user/orders/:company/reports/monthly-sales error:", err);
    res.status(500).json({ success: false, message: err.message || "Server error while loading monthly sales." });
  }
});

router.get("/:company/reports/product-sales", async (req, res) => {
  try {
    const { company } = req.params;
    const [rows] = await pool.query(
      `SELECT product, SUM(quantity) AS sold
       FROM orders
       WHERE company = ?
       GROUP BY product
       ORDER BY sold DESC
       LIMIT 5`,
      [company]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("GET /api/user/orders/:company/reports/product-sales error:", err);
    res.status(500).json({ success: false, message: err.message || "Server error while loading product sales." });
  }
});

export default router;