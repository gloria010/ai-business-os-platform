import express from "express";
import pool from "../db.js"; // adjust path if your db.js lives elsewhere

const router = express.Router();

/**
 * GET /api/businesses
 * Returns all approved businesses, shaped for the public BusinessesPage:
 *   { id, name, category, workspace }
 *
 * NOTE: named /businesses (not /companies) to avoid colliding with
 * routes/company.js, which already owns GET /api/companies for the
 * employee dropdown.
 */
router.get("/businesses", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         id,
         company            AS name,
         business_category  AS category,
         business_id        AS workspace
       FROM business_owners
       WHERE status = 'approved'
       ORDER BY company ASC`
    );

    console.log(`Fetched ${rows.length} approved businesses`);

    return res.json({
      success: true,
      businesses: rows,
    });
  } catch (err) {
    console.error("Error fetching businesses:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to load businesses",
    });
  }
});

/**
 * POST /api/businesses/login
 * Body: { workspace, password }
 * Verifies the workspace password for an approved business and,
 * on success, starts a session and returns the company info.
 */
router.post("/businesses/login", async (req, res) => {
  const { workspace, password } = req.body || {};

  console.log("=== BUSINESS WORKSPACE LOGIN REQUEST RECEIVED ===");
  console.log("Request body:", req.body);
  console.log("Workspace received:", workspace);
  console.log("Password received:", password);

  if (!workspace || !password) {
    return res.status(400).json({
      success: false,
      message: "Workspace and password are required",
    });
  }

  try {
    const [rows] = await pool.query(
      `SELECT
         id,
         company            AS name,
         business_category  AS category,
         business_id        AS workspace,
         company_password,
         status
       FROM business_owners
       WHERE business_id = ?
       LIMIT 1`,
      [workspace]
    );

    const business = rows[0];

    console.log("DB results:", rows);

    if (!business) {
      console.log("No business found for workspace:", workspace);
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    if (business.status !== "approved") {
      console.log("Business not approved, status:", business.status);
      return res.status(403).json({
        success: false,
        message: "This business is not yet approved",
      });
    }

    // company_password is stored as-is (VARCHAR(8)) per current schema.
    // If you later hash it, swap this for a bcrypt.compare(...) check.
    console.log("\n === PASSWORD VERIFICATION FOR BUSINESS LOGIN ===");
    console.log("Password from form :", password);
    console.log("Password from DB   :", business.company_password);
    console.log("Do they match?     :", password === business.company_password);

    if (password !== business.company_password) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password",
      });
    }

    // Optional: persist the workspace in session so protected routes
    // can verify the caller without re-sending the password.
    if (req.session) {
      req.session.workspace = business.workspace;
      req.session.businessOwnerId = business.id;
    }

    const { company_password, ...company } = business;

    console.log("Login successful for workspace:", business.workspace);

    return res.json({
      success: true,
      company,
    });
  } catch (err) {
    console.error("Error logging into business workspace:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
});

export default router;
// Mount in server.js: app.use("/api", businessRoute) where
// `businessRoute` is the default export of this file.