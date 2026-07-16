import express from "express";
import pool from "../db.js";
import { dropDepartmentDatabases } from "../createDepartmentDatabases.js";

const router = express.Router();

// Deletes a business owner's account entirely: the real per-department
// databases (biz_xxx_xxx_ceo, biz_xxx_xxx_hr, etc.), the business_departments
// tracking rows, any employees attached to the company, and the
// business_owners row itself.
//
// Order matters here:
//   1. Drop the real per-department databases FIRST, while business_departments
//      still has rows telling us which db_names exist. business_departments
//      has ON DELETE CASCADE from business_owners, so if we deleted the owner
//      row first, those tracking rows (and our only record of what to drop)
//      would vanish before we ever got to clean up the actual databases.
//   2. Only after that succeeds, delete the business_owners row. employees and
//      business_departments rows cascade automatically via their FKs.
router.delete("/business/:ownerId", async (req, res) => {
  const { ownerId } = req.params;

  if (!ownerId || isNaN(Number(ownerId))) {
    return res.status(400).json({
      success: false,
      message: "A valid ownerId is required",
    });
  }

  const conn = await pool.getConnection();

  try {
    // Look up the business_id first — dropDepartmentDatabases needs it, and
    // we also use it to confirm the business actually exists.
    const [ownerRows] = await conn.query(
      "SELECT business_id, company FROM business_owners WHERE id = ?",
      [ownerId]
    );

    if (ownerRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    const { business_id: businessId, company } = ownerRows[0];

    // --- Drop the real per-department databases ---
    // Runs on the shared `pool` (not `conn`), because DROP DATABASE causes an
    // implicit commit in MySQL and can't be part of a rollback-able
    // transaction anyway (same reason CREATE DATABASE works this way in
    // createDepartmentDatabases.js).
    let droppedDbs = [];
    try {
      droppedDbs = await dropDepartmentDatabases(ownerId, businessId);
      console.log(`Dropped department databases for owner ${ownerId}:`, droppedDbs);
    } catch (dropErr) {
      console.error(
        `Failed to drop department databases for owner ${ownerId}:`,
        dropErr
      );
      // Abort here rather than continuing — if we can't confirm the real
      // databases were dropped, deleting the owner row would orphan them
      // with no tracking row left to clean them up later.
      return res.status(500).json({
        success: false,
        message: "Failed to delete department databases. Account was not deleted.",
      });
    }

    // --- Delete the account itself ---
    await conn.beginTransaction();

    // employees.business_owner_id -> business_owners.id should cascade,
    // but deleting explicitly here too in case that FK isn't set to CASCADE.
    await conn.query(
      "DELETE FROM employees WHERE business_owner_id = ?",
      [ownerId]
    );

    await conn.query("DELETE FROM business_owners WHERE id = ?", [ownerId]);

    // The owner's row in `users` too, if business owners always have a
    // matching users row and you want the whole account gone.
    await conn.query(
      "DELETE FROM users WHERE id = (SELECT user_id FROM business_owners WHERE id = ?)",
      [ownerId]
    );

    await conn.commit();

    res.json({
      success: true,
      message: `Business "${company}" and its ${droppedDbs.length} department database(s) deleted`,
      droppedDatabases: droppedDbs,
    });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  } finally {
    conn.release();
  }
});

export default router;