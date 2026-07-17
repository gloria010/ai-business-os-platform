import express from "express";
import pool from "../db.js";

const router = express.Router();

// Generates a short unique business id e.g. BIZ-7F3K9A2
const categoryCodes = {
  Electronics: "ELE",
  Fashion: "FAS",
  Furniture: "FUR",
  Sports: "SPO",
  "Beauty & Wellness": "BEA",
  Agriculture: "AGR",
  Healthcare: "HEA",
  Education: "EDU",
  Grocery: "GRO",
  Restaurant: "RES",
  Other: "OTH",
};

function generateBusinessId(category, company) {
  const code = categoryCodes[category] || "GEN";

  const companyCode = company
    .replace(/[^a-zA-Z]/g, "")
    .substring(0, 4)
    .toUpperCase();

  return `BIZ-${code}-${companyCode}`;
}

// Generates an 8-digit numeric company password, e.g. "48213967"
function generateCompanyPassword() {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
}

router.post("/register", async (req, res) => {
  console.log("Received:", req.body);

  const {
    name,
    email,
    phone,
    company,
    businessCategory,
    employeeRole,
    pincode, // optional - see note in chat about adding this field to the form
    password,
    role,
  } = req.body;

  if (!name || !email || !phone || !password || !role) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields",
    });
  }

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // Duplicate email check up front for a clean error message
    const [existing] = await conn.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    if (existing.length > 0) {
      await conn.rollback();
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    const [userResult] = await conn.query(
      `INSERT INTO users (name, email, phone, password, role)
       VALUES (?, ?, ?, ?, ?)`,
      [name, email, phone, password, role]
    );
    const userId = userResult.insertId;

    let companyPassword = null; // only set for business_owner, returned in the response below
    let businessId = null; // only set for business_owner

    if (role === "business_owner") {
      if (!company || !businessCategory) {
        await conn.rollback();
        return res.status(400).json({
          success: false,
          message: "Company name and business category are required",
        });
      }

      const [companyExists] = await conn.query(
        "SELECT id FROM business_owners WHERE company = ?",
        [company]
      );
      if (companyExists.length > 0) {
        await conn.rollback();
        return res.status(409).json({
          success: false,
          message: "A business with this company name is already registered",
        });
      }

      businessId = generateBusinessId(businessCategory, company);
      companyPassword = generateCompanyPassword();

      // status defaults to 'pending' in the schema — department databases are
      // NOT created here anymore. They only get created once an admin approves
      // this business owner via PATCH /api/admin/business-owners/:id/approve
      await conn.query(
        `INSERT INTO business_owners
        (user_id, business_id, company, business_category, subscription, subscription_date, pincode, company_password)
         VALUES (?, ?, ?, ?, NULL, NULL, ?, ?)`,
        [userId, businessId, company, businessCategory, pincode || null, companyPassword]
      );
    }

    if (role === "employee") {
      if (!company || !employeeRole) {
        await conn.rollback();
        return res.status(400).json({
          success: false,
          message: "Company and role are required",
        });
      }

      // Only allow employees to attach to a company that is actually registered
      const [ownerRows] = await conn.query(
        "SELECT id FROM business_owners WHERE company = ?",
        [company]
      );

      if (ownerRows.length === 0) {
        await conn.rollback();
        return res.status(400).json({
          success: false,
          message: "Selected company is not a registered business",
        });
      }

      await conn.query(
        `INSERT INTO employees (user_id, business_owner_id, employee_role)
         VALUES (?, ?, ?)`,
        [userId, ownerRows[0].id, employeeRole]
      );
    }

    await conn.commit();

    res.json({
      success: true,
      message:
        role === "business_owner"
          ? `User registered successfully. Your company password is ${companyPassword} — keep it safe, you'll need it for company-level access. Your business is now pending admin approval.`
          : "User registered successfully",
      id: userId,
      ...(companyPassword ? { companyPassword } : {}),
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