import { Router } from "express";
import pool from "../../db.js"; // adjust path to wherever your pool export lives

const router = Router();

// GET /api/user/categories/counts
// Returns ONLY { [business_category]: count } for approved businesses.
// The category list itself (names, icons, images) stays static on the
// frontend — this endpoint's only job is to supply live numbers.
router.get("/counts", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT business_category, COUNT(*) AS count
       FROM business_owners
       WHERE status = 'approved'
       GROUP BY business_category`
    );

    const countMap = {};
    for (const row of rows) {
      countMap[row.business_category] = row.count;
    }

    res.json(countMap);
  } catch (err) {
    console.error("Failed to fetch category counts:", err);
    res.status(500).json({ error: "Failed to fetch category counts" });
  }
});

export default router;