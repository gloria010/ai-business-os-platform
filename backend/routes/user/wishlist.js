//wishlist.js
import express from "express";
import pool from "../../db.js";

const router = express.Router();

// Requires a logged-in consumer. login.js sets req.session.user = { id, name, email, role, company }
// on successful login, so req.session.user.id is the users.id foreign key.
function requireLogin(req, res, next) {
  if (!req.session?.user?.id) {
    return res.status(401).json({ success: false, message: "Not logged in" });
  }
  next();
}

router.use(requireLogin);

// GET /api/user/wishlist -> list of product IDs the user has saved
router.get("/wishlist", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT product_id FROM wishlist_items WHERE user_id = ? ORDER BY created_at DESC`,
      [req.session.user.id]
    );
    res.json({ success: true, productIds: rows.map((r) => r.product_id) });
  } catch (err) {
    console.error("[Wishlist] GET failed:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/user/wishlist { productId } -> add to wishlist (idempotent)
router.post("/wishlist", async (req, res) => {
  const { productId } = req.body;
  if (!productId) {
    return res.status(400).json({ success: false, message: "productId is required" });
  }
  try {
    await pool.query(
      `INSERT INTO wishlist_items (user_id, product_id) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE product_id = product_id`,
      [req.session.user.id, productId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("[Wishlist] POST failed:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/user/wishlist/:productId -> remove from wishlist
router.delete("/wishlist/:productId", async (req, res) => {
  try {
    await pool.query(
      `DELETE FROM wishlist_items WHERE user_id = ? AND product_id = ?`,
      [req.session.user.id, req.params.productId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("[Wishlist] DELETE failed:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;