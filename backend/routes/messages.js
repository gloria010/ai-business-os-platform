//Messages
import express from "express";
import pool from "../db.js"; // main pool - holds the global `messages` table and `business_departments`

const router = express.Router();

// ---- POST /api/messages ----
// Body: { businessId, to, subject, message, fromDepartment }
router.post("/", async (req, res) => {
  try {
    const { businessId, to, subject, message, fromDepartment } = req.body;

    // Debug: confirm what the frontend actually sent
    console.log("POST /api/messages body:", req.body);
    console.log("fromDepartment received:", fromDepartment);

    if (!businessId || !businessId.trim()) {
      return res.status(400).json({ success: false, message: "businessId is required." });
    }
    if (!to || !to.trim()) {
      return res.status(400).json({ success: false, message: "Recipient (to) is required." });
    }
    if (!subject || !subject.trim()) {
      return res.status(400).json({ success: false, message: "Subject is required." });
    }
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: "Message is required." });
    }

    const sessionUser = req.session?.user;
    if (!sessionUser) {
      return res.status(401).json({ success: false, message: "Not authenticated." });
    }
    const fromName = sessionUser.name;

    // Validate recipient is a real department for this business.
    const [deptRows] = await pool.query(
      `SELECT bd.id
       FROM business_departments bd
       INNER JOIN business_owners bo ON bo.id = bd.owner_id
       WHERE bo.business_id = ?
         AND LOWER(bd.department) = LOWER(?)
       LIMIT 1`,
      [businessId.trim(), to.trim()]
    );

    if (deptRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No "${to.trim()}" department found for this business.`,
      });
    }

    const [result] = await pool.query(
      `INSERT INTO messages (business_id, from_name, from_department, to_recipient, subject, message)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        businessId.trim(),
        fromName,
        fromDepartment?.trim() || null,
        to.trim(),
        subject.trim(),
        message.trim(),
      ]
    );

    console.log("Inserted message id:", result.insertId, "with from_department:", fromDepartment?.trim() || null);

    return res.json({
      success: true,
      message: "Message sent successfully.",
      id: result.insertId,
    });
  } catch (err) {
    console.error("POST /api/messages error:", err);
    return res.status(500).json({ success: false, message: "Server error while sending message." });
  }
});

// ---- GET /api/messages?businessId=BIZ-XXX&to=HR ----
router.get("/", async (req, res) => {
  try {
    const { businessId, to } = req.query;

    if (!businessId || !businessId.trim()) {
      return res.status(400).json({ success: false, message: "Query param 'businessId' is required." });
    }
    if (!to || !to.trim()) {
      return res.status(400).json({ success: false, message: "Query param 'to' is required." });
    }

    const [rows] = await pool.query(
      `SELECT id, from_name, from_department, to_recipient, subject, message, created_at
       FROM messages
       WHERE business_id = ? AND to_recipient = ?
       ORDER BY created_at DESC`,
      [businessId.trim(), to.trim()]
    );

    return res.json({ success: true, messages: rows });
  } catch (err) {
    console.error("GET /api/messages error:", err);
    return res.status(500).json({ success: false, message: "Server error while fetching messages." });
  }
});

export default router;