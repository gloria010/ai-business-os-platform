import express from "express";
import pool from "../../db.js";

const router = express.Router();

// POST /api/user/contact { subject, message }
// user_id comes from session if logged in; otherwise stored as anonymous.
router.post("/contact", async (req, res) => {
  const { subject, message } = req.body;

  if (!subject || !message) {
    return res.status(400).json({ success: false, message: "Subject and message are required" });
  }

  const userId = req.session?.user?.id || null;

  try {
    await pool.query(
      `INSERT INTO contact_messages (user_id, subject, message)
       VALUES (?, ?, ?)`,
      [userId, subject, message]
    );
    res.json({ success: true, message: "Message sent" });
  } catch (err) {
    console.error("[Contact] POST failed:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;