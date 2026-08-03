// routes/user/checkout.js
import express from "express";
import { createOrder } from "./orders.js";
import pool from "../../db.js";

const router = express.Router();

// ---- POST /api/user/checkout ----
// Body: {
//   items: [{ company, product, quantity, price }],
//   customerName, email, phone,
//   address: { line1, city, state, zip },
//   paymentMethod
// }
// Creates one order per cart item (each resolved to its own business),
// then clears the signed-in user's server-side cart.
router.post("/", async (req, res) => {
  try {
    const { items, customerName, email, phone, address, paymentMethod } = req.body;
    const sessionUser = req.session?.user;
    const resolvedCustomerName = customerName || sessionUser?.name || "Guest";
    const resolvedEmail = email || sessionUser?.email || null;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty." });
    }

    const paymentStatus = paymentMethod === "cod" ? "Pending" : "Paid";
    const orderDate = new Date().toISOString().slice(0, 10);
    const addressStr = address
      ? `${address.line1 || ""}, ${address.city || ""}, ${address.state || ""} ${address.zip || ""}`.trim()
      : "";

    const results = [];
    for (const item of items) {
      if (!item.company || !item.product) {
        return res.status(400).json({ success: false, message: "Each item needs a company and product." });
      }

      const qty = parseInt(item.quantity, 10) || 1;
      const priceVal = parseFloat(item.price) || 0;
      const gst = Math.round(priceVal * qty * 0.08 * 100) / 100;

      const result = await createOrder({
        businessId: item.company,
        customerName: resolvedCustomerName,
        email: resolvedEmail,
        product: item.product,
        quantity: qty,
        price: priceVal,
        gst,
        paymentMethod,
        paymentStatus,
        orderDate,
        address: addressStr,
      });

      results.push(result);
    }

    // Clear the signed-in user's server-side cart, if there is a session.
    if (req.session?.userId) {
      await pool.query(`DELETE FROM cart_items WHERE user_id = ?`, [req.session.userId]);
    }

    return res.json({ success: true, message: "Order placed.", orders: results });
  } catch (err) {
    console.error("POST /api/user/checkout error:", err);
    return res.status(500).json({ success: false, message: err.message || "Server error while placing order." });
  }
});

export default router;