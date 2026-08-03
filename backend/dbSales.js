// salesRoutes.js
import express from "express";
import { getCompanySalesPool } from "../dbSales.js";

const router = express.Router();

function nextOrderCode(lastCode) {
  // ORD1001, ORD1002, ... fallback if table is empty
  if (!lastCode) return "ORD1001";
  const num = parseInt(lastCode.replace(/\D/g, ""), 10) || 1000;
  return `ORD${num + 1}`;
}

// ============================================================
// ORDERS
// ============================================================

// ---- GET /api/sales/:businessId/orders ----
router.get("/:businessId/orders", async (req, res) => {
  try {
    const { businessId } = req.params;
    const pool = await getCompanySalesPool(businessId);

    const [rows] = await pool.query(
      `SELECT id, order_code, customer_name, email, phone, product, quantity,
              price, gst, total, payment_method, payment_status, transaction_id,
              status, order_date, delivery_date, address, created_at
       FROM orders
       ORDER BY created_at DESC`
    );

    return res.json({ success: true, orders: rows });
  } catch (err) {
    console.error("GET /api/sales/:businessId/orders error:", err);
    return res.status(500).json({ success: false, message: "Server error while fetching orders." });
  }
});

// ---- GET /api/sales/:businessId/orders/:id ----
router.get("/:businessId/orders/:id", async (req, res) => {
  try {
    const { businessId, id } = req.params;
    const pool = await getCompanySalesPool(businessId);

    const [rows] = await pool.query(`SELECT * FROM orders WHERE id = ?`, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    return res.json({ success: true, order: rows[0] });
  } catch (err) {
    console.error("GET /api/sales/:businessId/orders/:id error:", err);
    return res.status(500).json({ success: false, message: "Server error while fetching order." });
  }
});

// ---- POST /api/sales/:businessId/orders ----
// Body: { customerName, email, phone, product, quantity, price, gst, paymentMethod, paymentStatus, transactionId, orderDate, deliveryDate, address }
router.post("/:businessId/orders", async (req, res) => {
  try {
    const { businessId } = req.params;
    const {
      customerName, email, phone, product, quantity, price, gst,
      paymentMethod, paymentStatus, transactionId, orderDate, deliveryDate, address,
    } = req.body;

    if (!customerName || !customerName.trim()) {
      return res.status(400).json({ success: false, message: "Customer name is required." });
    }
    if (!product || !product.trim()) {
      return res.status(400).json({ success: false, message: "Product is required." });
    }

    const pool = await getCompanySalesPool(businessId);

    const [lastRows] = await pool.query(
      `SELECT order_code FROM orders ORDER BY id DESC LIMIT 1`
    );
    const orderCode = nextOrderCode(lastRows[0]?.order_code);

    const qty = parseInt(quantity, 10) || 1;
    const priceVal = parseFloat(price) || 0;
    const gstVal = parseFloat(gst) || 0;
    const total = Math.round((priceVal * qty + gstVal) * 100) / 100;

    const [result] = await pool.query(
      `INSERT INTO orders
       (order_code, customer_name, email, phone, product, quantity, price, gst, total,
        payment_method, payment_status, transaction_id, status, order_date, delivery_date, address)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?, ?, ?)`,
      [
        orderCode, customerName.trim(), email?.trim() || null, phone?.trim() || null,
        product.trim(), qty, priceVal, gstVal, total,
        paymentMethod?.trim() || null, paymentStatus || "Pending", transactionId?.trim() || null,
        orderDate || new Date().toISOString().slice(0, 10), deliveryDate || null, address?.trim() || null,
      ]
    );

    return res.json({ success: true, message: "Order created.", id: result.insertId, orderCode });
  } catch (err) {
    console.error("POST /api/sales/:businessId/orders error:", err);
    return res.status(500).json({ success: false, message: "Server error while creating order." });
  }
});

// ---- PUT /api/sales/:businessId/orders/:id/status ----
// Body: { status } — 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled'
router.put("/:businessId/orders/:id/status", async (req, res) => {
  try {
    const { businessId, id } = req.params;
    const { status } = req.body;

    const validStatuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `status must be one of ${validStatuses.join(", ")}.` });
    }

    const pool = await getCompanySalesPool(businessId);

    const [result] = await pool.query(`UPDATE orders SET status = ? WHERE id = ?`, [status, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    return res.json({ success: true, message: `Order marked as ${status}.` });
  } catch (err) {
    console.error("PUT /api/sales/:businessId/orders/:id/status error:", err);
    return res.status(500).json({ success: false, message: "Server error while updating order status." });
  }
});

// ---- PUT /api/sales/:businessId/orders/:id ----
// Full edit — same fields as create
router.put("/:businessId/orders/:id", async (req, res) => {
  try {
    const { businessId, id } = req.params;
    const {
      customerName, email, phone, product, quantity, price, gst,
      paymentMethod, paymentStatus, transactionId, status, orderDate, deliveryDate, address,
    } = req.body;

    const pool = await getCompanySalesPool(businessId);

    const qty = parseInt(quantity, 10) || 1;
    const priceVal = parseFloat(price) || 0;
    const gstVal = parseFloat(gst) || 0;
    const total = Math.round((priceVal * qty + gstVal) * 100) / 100;

    const [result] = await pool.query(
      `UPDATE orders SET
         customer_name = ?, email = ?, phone = ?, product = ?, quantity = ?, price = ?, gst = ?, total = ?,
         payment_method = ?, payment_status = ?, transaction_id = ?, status = ?, order_date = ?, delivery_date = ?, address = ?
       WHERE id = ?`,
      [
        customerName?.trim() || null, email?.trim() || null, phone?.trim() || null,
        product?.trim() || null, qty, priceVal, gstVal, total,
        paymentMethod?.trim() || null, paymentStatus || "Pending", transactionId?.trim() || null,
        status || "Pending", orderDate || null, deliveryDate || null, address?.trim() || null,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    return res.json({ success: true, message: "Order updated." });
  } catch (err) {
    console.error("PUT /api/sales/:businessId/orders/:id error:", err);
    return res.status(500).json({ success: false, message: "Server error while updating order." });
  }
});

// ---- DELETE /api/sales/:businessId/orders/:id ----
router.delete("/:businessId/orders/:id", async (req, res) => {
  try {
    const { businessId, id } = req.params;
    const pool = await getCompanySalesPool(businessId);

    const [result] = await pool.query(`DELETE FROM orders WHERE id = ?`, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    return res.json({ success: true, message: "Order deleted." });
  } catch (err) {
    console.error("DELETE /api/sales/:businessId/orders/:id error:", err);
    return res.status(500).json({ success: false, message: "Server error while deleting order." });
  }
});

// ============================================================
// REPORTS
// ============================================================

// ---- GET /api/sales/:businessId/reports/summary ----
router.get("/:businessId/reports/summary", async (req, res) => {
  try {
    const { businessId } = req.params;
    const pool = await getCompanySalesPool(businessId);

    const [[revenueRow]] = await pool.query(
      `SELECT COALESCE(SUM(total), 0) AS totalRevenue,
              COALESCE(SUM(CASE WHEN MONTH(order_date) = MONTH(CURDATE()) AND YEAR(order_date) = YEAR(CURDATE()) THEN total ELSE 0 END), 0) AS monthRevenue
       FROM orders`
    );

    const [[ordersRow]] = await pool.query(
      `SELECT COUNT(*) AS totalOrders,
              SUM(CASE WHEN status = 'Delivered' THEN 1 ELSE 0 END) AS completedOrders
       FROM orders`
    );

    const [[productsRow]] = await pool.query(
      `SELECT COALESCE(SUM(quantity), 0) AS productsSold FROM orders`
    );

    const [topProductRows] = await pool.query(
      `SELECT product, SUM(quantity) AS unitsSold
       FROM orders
       GROUP BY product
       ORDER BY unitsSold DESC
       LIMIT 1`
    );

    return res.json({
      success: true,
      summary: {
        totalRevenue: revenueRow.totalRevenue,
        monthRevenue: revenueRow.monthRevenue,
        totalOrders: ordersRow.totalOrders,
        completedOrders: ordersRow.completedOrders,
        productsSold: productsRow.productsSold,
        topProduct: topProductRows[0]?.product || "N/A",
        topProductUnits: topProductRows[0]?.unitsSold || 0,
      },
    });
  } catch (err) {
    console.error("GET /api/sales/:businessId/reports/summary error:", err);
    return res.status(500).json({ success: false, message: "Server error while fetching report summary." });
  }
});

// ---- GET /api/sales/:businessId/reports/monthly-sales ----
router.get("/:businessId/reports/monthly-sales", async (req, res) => {
  try {
    const { businessId } = req.params;
    const pool = await getCompanySalesPool(businessId);

    const [rows] = await pool.query(
      `SELECT DATE_FORMAT(order_date, '%b') AS month, MONTH(order_date) AS monthNum, SUM(total) AS sales
       FROM orders
       WHERE order_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
       GROUP BY monthNum, month
       ORDER BY monthNum ASC`
    );

    return res.json({ success: true, monthlySales: rows.map((r) => ({ month: r.month, sales: Number(r.sales) })) });
  } catch (err) {
    console.error("GET /api/sales/:businessId/reports/monthly-sales error:", err);
    return res.status(500).json({ success: false, message: "Server error while fetching monthly sales." });
  }
});

// ---- GET /api/sales/:businessId/reports/product-sales ----
router.get("/:businessId/reports/product-sales", async (req, res) => {
  try {
    const { businessId } = req.params;
    const pool = await getCompanySalesPool(businessId);

    const [rows] = await pool.query(
      `SELECT product, SUM(quantity) AS sold
       FROM orders
       GROUP BY product
       ORDER BY sold DESC
       LIMIT 8`
    );

    return res.json({ success: true, productSales: rows.map((r) => ({ product: r.product, sold: Number(r.sold) })) });
  } catch (err) {
    console.error("GET /api/sales/:businessId/reports/product-sales error:", err);
    return res.status(500).json({ success: false, message: "Server error while fetching product sales." });
  }
});

export default router;