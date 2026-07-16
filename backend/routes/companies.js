import express from "express";
import pool from "../db.js";

const router = express.Router();

// GET /api/companies -> list of registered businesses for the employee dropdown
router.get("/companies", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, company, business_category FROM business_owners ORDER BY company ASC"
    );
    res.json({ success: true, companies: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;