import express from "express";
import pool from "../../db.js";

const router = express.Router();

// POST /api/user/feedback { message } -> stores feedback.
// Works for both logged-in and guest users — if a session exists,
// user_id is recorded; otherwise it's stored as anonymous feedback.
router.post("/feedback", async (req, res) => {
  const { message } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ success: false, message: "Feedback message is required" });
  }

  const userId = req.session?.user?.id || null;

  try {
    await pool.query(
      `INSERT INTO feedback (user_id, message) VALUES (?, ?)`,
      [userId, message.trim()]
    );
    res.json({ success: true, message: "Feedback submitted" });
  } catch (err) {
    console.error("[Feedback] POST failed:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;