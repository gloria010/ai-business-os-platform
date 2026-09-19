// routes/user/forgotPassword.js
import express from "express";
import pool from "../../db.js";

const router = express.Router();

// Looks up an account by email. `users` matches the table userdashboard.js's
// /change-password route reads/writes (id, password). business_owners is
// checked as a fallback for owner accounts. Employees (per-company HR DBs)
// are intentionally out of scope — no reliable way to resolve their company
// from email alone.
async function findAccountByEmail(email) {
  const [userRows] = await pool.query(
    `SELECT id, name, email FROM users WHERE email = ? LIMIT 1`,
    [email]
  );
  if (userRows.length) {
    return { table: "users", row: userRows[0] };
  }

  const [ownerRows] = await pool.query(
    `SELECT id, name, email FROM business_owners WHERE email = ? LIMIT 1`,
    [email]
  );
  if (ownerRows.length) {
    return { table: "business_owners", row: ownerRows[0] };
  }

  return null;
}

// POST /api/user/forgot-password { email, password }
// No login required. The email MUST already exist in the database (users or
// business_owners) or this returns a 404 — it never creates a new account.
// If found, that account's password is updated directly, stored as plain
// text (existing project convention, matches users.password /
// business_owners.password columns). No hashing/encryption applied.
router.post("/forgot-password", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and new password are required." });
  }

  if (password.length < 8) {
    return res.status(400).json({ success: false, message: "Password must be at least 8 characters." });
  }

  try {
    const account = await findAccountByEmail(email);

    if (!account) {
      return res.status(404).json({ success: false, message: "No account found with that email." });
    }

    const [result] = await pool.query(
      `UPDATE ${account.table} SET password = ? WHERE id = ?`,
      [password, account.row.id]
    );

    if (result.affectedRows === 0) {
      return res.status(500).json({ success: false, message: "Password update failed. Please try again." });
    }

    res.json({ success: true, message: "Password reset successfully." });
  } catch (err) {
    console.error("POST /api/user/forgot-password error:", err);
    res.status(500).json({ success: false, message: err.message || "Server error while resetting password." });
  }
});

export default router;