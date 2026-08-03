import express from "express";
import pool from "../../db.js";

const router = express.Router();

// Requires a logged-in consumer. login.js sets req.session.user = { id, name, email, role, company }
// on successful login, so req.session.user.id is the users.id foreign key.
function requireLogin(req, res, next) {
  console.log("[Cart] requireLogin check — session.user:", req.session?.user);
  if (!req.session?.user?.id) {
    return res.status(401).json({ success: false, message: "Not logged in" });
  }
  next();
}

router.use(requireLogin);

// GET /api/user/cart -> list of { productId, quantity } for the logged-in user
router.get("/cart", async (req, res) => {
  console.log("[Cart] GET /cart called for user:", req.session?.user?.id);
  try {
    const [rows] = await pool.query(
      `SELECT product_id, quantity FROM cart_items WHERE user_id = ? ORDER BY created_at DESC`,
      [req.session.user.id]
    );
    res.json({
      success: true,
      items: rows.map((r) => ({ productId: r.product_id, quantity: r.quantity })),
    });
  } catch (err) {
    console.error("[Cart] GET failed:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/user/cart { productId, quantity } -> add to cart, or bump quantity if already present
router.post("/cart", async (req, res) => {
  const { productId, quantity } = req.body;
  if (!productId) {
    return res.status(400).json({ success: false, message: "productId is required" });
  }
  const qty = Number.isInteger(quantity) && quantity > 0 ? quantity : 1;
  try {
    await pool.query(
      `INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
      [req.session.user.id, productId, qty]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("[Cart] POST failed:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/user/cart/:productId { quantity } -> set exact quantity (removes row if quantity <= 0)
router.put("/cart/:productId", async (req, res) => {
  const { quantity } = req.body;
  if (!Number.isInteger(quantity)) {
    return res.status(400).json({ success: false, message: "quantity must be an integer" });
  }
  try {
    if (quantity <= 0) {
      await pool.query(
        `DELETE FROM cart_items WHERE user_id = ? AND product_id = ?`,
        [req.session.user.id, req.params.productId]
      );
    } else {
      await pool.query(
        `UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?`,
        [quantity, req.session.user.id, req.params.productId]
      );
    }
    res.json({ success: true });
  } catch (err) {
    console.error("[Cart] PUT failed:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/user/cart/:productId -> remove item entirely
router.delete("/cart/:productId", async (req, res) => {
  try {
    await pool.query(
      `DELETE FROM cart_items WHERE user_id = ? AND product_id = ?`,
      [req.session.user.id, req.params.productId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("[Cart] DELETE failed:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;