import express from "express";
import pool from "../db.js";
import { createDepartmentDatabases } from "../createDepartmentDatabases.js";

const router = express.Router();

// Matches the session shape set in login.js: req.session.user = { id, name, email, role }
function requireAdmin(req, res, next) {
  if (!req.session || !req.session.user || req.session.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Admin access required" });
  }
  next();
}

// GET /api/admin/business-owners?status=pending
router.get("/admin/business-owners", requireAdmin, async (req, res) => {
  const { status } = req.query;
  try {
    let query = `
      SELECT bo.id, bo.business_id, bo.company, bo.business_category,
             bo.pincode, bo.status, bo.created_at,
             u.name AS owner_name, u.email, u.phone
      FROM business_owners bo
      JOIN users u ON u.id = bo.user_id
    `;
    const params = [];
    if (status) {
      query += " WHERE bo.status = ?";
      params.push(status);
    }
    query += " ORDER BY bo.created_at DESC";

    const [rows] = await pool.query(query, params);
    res.json({ success: true, businessOwners: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/admin/business-owners/:id/approve
router.patch("/admin/business-owners/:id/approve", requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      "SELECT id, business_id, status FROM business_owners WHERE id = ?",
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Business owner not found" });
    }
    if (rows[0].status === "approved") {
      return res.status(409).json({ success: false, message: "Already approved" });
    }

    await pool.query(
      "UPDATE business_owners SET status = 'approved' WHERE id = ?",
      [id]
    );

    // Create department databases only now, on approval
    try {
      const createdDbs = await createDepartmentDatabases(rows[0].id, rows[0].business_id);
      console.log(`Department databases created for owner ${id}:`, createdDbs);
    } catch (dbErr) {
      console.error(`Failed to create department databases for owner ${id}:`, dbErr);
      // Approval itself still succeeds — log for follow-up
    }

    res.json({ success: true, message: "Business approved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/admin/business-owners/:id/reject
router.patch("/admin/business-owners/:id/reject", requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query(
      "UPDATE business_owners SET status = 'rejected' WHERE id = ?",
      [id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Business owner not found" });
    }
    res.json({ success: true, message: "Business rejected" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;