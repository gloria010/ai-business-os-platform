// advertisement.js
import express from "express";
import pool from "../db.js";

const router = express.Router();

// GET /api/advertisement
router.get("/advertisement", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, user_id, company, title, description, image, created_at
       FROM advertisements
       ORDER BY created_at DESC`
    );

    res.json({
      success: true,
      ads: rows,
    });
  } catch (err) {
    console.error("GET /advertisement error:", err.sqlMessage || err.message);
    res.status(500).json({
      success: false,
      message: err.sqlMessage || err.message,
    });
  }
});

// POST /api/advertisement
router.post("/advertisement", async (req, res) => {
  console.log("FULL session.user object:", JSON.stringify(req.session.user, null, 2));

  const sessionUser = req.session.user;

  if (!sessionUser) {
    console.error("No session user — request rejected as unauthenticated");
    return res.status(401).json({
      success: false,
      message: "Not logged in",
    });
  }

  const { title, description, image } = req.body;

  if (!title || !description || !image) {
    console.error("Missing field(s):", {
      title: !!title,
      description: !!description,
      image: !!image,
    });
    return res.status(400).json({
      success: false,
      message: "Title, description and image are required",
    });
  }

  let conn;
  try {
    conn = await pool.getConnection();
  } catch (err) {
    console.error("Failed to get DB connection:", err.sqlMessage || err.message);
    return res.status(500).json({
      success: false,
      message: "Database connection failed: " + (err.sqlMessage || err.message),
    });
  }

  try {
       // user_id may be null (e.g. admin sessions aren't backed by a users row) —
    // the FK column allows NULL so this never blocks the insert.
    const userId = sessionUser.id || null;

    // Company name resolution:
    // - business_owner -> their own company from business_owners
    // - employee -> their employer's company via employees -> business_owners join
    // - anyone else (e.g. admin) -> falls back to name/role
    let company = sessionUser.name || sessionUser.role || "Unknown";

    if (userId) {
      if (sessionUser.role === "employee") {
        const [empRows] = await conn.query(
          `SELECT bo.company
           FROM employees e
           JOIN business_owners bo ON bo.id = e.business_owner_id
           WHERE e.user_id = ?`,
          [userId]
        );
        if (empRows.length > 0) {
          company = empRows[0].company;
        }
      } else {
        const [ownerRows] = await conn.query(
          "SELECT company FROM business_owners WHERE user_id = ?",
          [userId]
        );
        if (ownerRows.length > 0) {
          company = ownerRows[0].company;
        }
      }
    }

    console.log("Inserting ad — userId:", userId, "company:", company);

    const [result] = await conn.query(
      `INSERT INTO advertisements (user_id, company, title, description, image)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, company, title.trim(), description.trim(), image]
    );

    console.log("Insert successful, insertId:", result.insertId);

    res.json({
      success: true,
      message: "Advertisement posted successfully",
      ad: {
        id: result.insertId,
        user_id: userId,
        company,
        title: title.trim(),
        description: description.trim(),
        image,
      },
    });
  } catch (err) {
    console.error("POST /advertisement DB error:");
    console.error("  code:", err.code);
    console.error("  sqlMessage:", err.sqlMessage);
    res.status(500).json({
      success: false,
      message: err.sqlMessage || err.message,
    });
  } finally {
    if (conn) conn.release();
  }
});

export default router;