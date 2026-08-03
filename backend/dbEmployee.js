// dbEmployee.js
// Manages per-company employee-facing database connections and schema
// initialization. Covers what Employee.tsx needs for its own
// profile / attendance / leave / payroll / tasks / schedule views, kept
// separate from dbHr.js (HR-side applications + employees management)
// and dbMessages.js (department messaging, left untouched).
//
// KEY DESIGN DECISION: employee_profile.id is NOT an independent
// auto-increment number. It is always set EXPLICITLY to match the id of
// the corresponding row in the HR module's `employees` table (dbHr.js).
// That means "employee_id" used everywhere downstream — attendance,
// leave_requests, payslips, tasks, schedule_events — IS the HR
// employees.id. There's only ever one canonical ID per employee.
import mysql from "mysql2/promise";
import pool from "./db.js";
import { getCompanyHrPool } from "./dbHr.js";

const poolCache = new Map();

// ---- Employee-facing Schema ----
// NOTE: employee_profile.id is intentionally NOT AUTO_INCREMENT — we
// always supply it explicitly (copied from the HR employees.id) so the
// same numeric ID is shared across the HR DB and the employee DB.
const EMPLOYEE_SCHEMA = `
  CREATE TABLE IF NOT EXISTS employee_profile (
    id INT PRIMARY KEY,
    user_id INT DEFAULT NULL,
    employee_code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) DEFAULT NULL,
    department VARCHAR(150) DEFAULT NULL,
    designation VARCHAR(150) DEFAULT NULL,
    manager VARCHAR(255) DEFAULT NULL,
    joining_date DATE DEFAULT NULL,
    salary VARCHAR(100) DEFAULT NULL,
    profile_image VARCHAR(500) DEFAULT NULL,
    leave_balance INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB;

  CREATE TABLE IF NOT EXISTS attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    date DATE NOT NULL,
    check_in DATETIME DEFAULT NULL,
    check_out DATETIME DEFAULT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Present',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employee_profile(id) ON DELETE CASCADE
  ) ENGINE=InnoDB;

  CREATE TABLE IF NOT EXISTS leave_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    leave_type VARCHAR(50) NOT NULL DEFAULT 'Casual Leave',
    duration VARCHAR(20) NOT NULL DEFAULT 'Full Day',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT DEFAULT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employee_profile(id) ON DELETE CASCADE
  ) ENGINE=InnoDB;

  CREATE TABLE IF NOT EXISTS payslips (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    month VARCHAR(20) NOT NULL,
    gross DECIMAL(12, 2) DEFAULT 0,
    deductions DECIMAL(12, 2) DEFAULT 0,
    net_salary DECIMAL(12, 2) GENERATED ALWAYS AS (gross - deductions) STORED,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employee_profile(id) ON DELETE CASCADE
  ) ENGINE=InnoDB;

  CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending',
    due_date DATE DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employee_profile(id) ON DELETE CASCADE
  ) ENGINE=InnoDB;

  CREATE TABLE IF NOT EXISTS schedule_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    event_date DATE NOT NULL,
    event_time VARCHAR(50) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employee_profile(id) ON DELETE CASCADE
  ) ENGINE=InnoDB;
`;

/** Run the employee schema against the given pool. */
async function initEmployeeSchema(companyPool, dbName) {
  console.log(`[dbEmployee] Initialising schema for database: ${dbName}`);
  const conn = await companyPool.getConnection();
  try {
    const statements = EMPLOYEE_SCHEMA.split(";")
      .map((s) => s.trim())
      .filter(Boolean);
    for (const stmt of statements) {
      await conn.query(stmt);
    }
    console.log(`[dbEmployee] ✅ Employee schema initialised for "${dbName}"`);
  } catch (err) {
    console.error(`[dbEmployee] ❌ Failed to initialise schema for "${dbName}":`, err);
    throw err;
  } finally {
    conn.release();
  }
}

async function resolveCompanyDb(businessId) {
  console.log("=======================================");
  console.log("[dbEmployee] resolveCompanyDb() called");
  console.log("[dbEmployee] Business ID:", businessId);

  const [rows] = await pool.query(
    `SELECT bd.db_name
     FROM business_departments bd
     INNER JOIN business_owners bo
       ON bo.id = bd.owner_id
     WHERE bo.business_id = ?
       AND bd.department = 'employees'
     LIMIT 1`,
    [businessId]
  );

  console.log("[dbEmployee] Database Lookup Result:", rows);

  if (rows.length === 0) {
    console.error(`[dbEmployee] ❌ No employee database found for Business ID: ${businessId}`);
    throw new Error(
      `No employee database found for Business ID: ${businessId}`
    );
  }

  console.log("[dbEmployee] ✅ Using Employee Database:", rows[0].db_name);
  console.log("=======================================");

  return rows[0].db_name;
}

async function getPoolFor(dbName) {
  if (poolCache.has(dbName)) {
    console.log(`[dbEmployee] Using cached pool for: ${dbName}`);
    return poolCache.get(dbName);
  }

  console.log(`[dbEmployee] Creating new pool for: ${dbName}`);

  const companyPool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: dbName,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  // Ensure the employee schema exists before caching the pool.
  // This runs only once per database (CREATE TABLE IF NOT EXISTS).
  await initEmployeeSchema(companyPool, dbName);

  poolCache.set(dbName, companyPool);
  console.log(`[dbEmployee] Pool cached for: ${dbName}`);

  return companyPool;
}

export async function getCompanyEmployeePool(businessId) {
  console.log(`[dbEmployee] getCompanyEmployeePool() called for businessId: ${businessId}`);
  const dbName = await resolveCompanyDb(businessId);
  return getPoolFor(dbName);
}

/**
 * Shared upsert: given an HR employees row, creates (or refreshes) the
 * matching employee_profile row using the SAME id as the HR record.
 * This is the one place that keeps employee_profile.id == HR employees.id.
 *
 * Only HR-sourced fields (name, email, department, designation, salary)
 * are kept in sync. Employee-specific extras (manager, joining_date,
 * profile_image, leave_balance) are left alone once set.
 */
async function upsertProfileFromHrRow(companyPool, hrEmployee, userId = null) {
  console.log(`[dbEmployee] upsertProfileFromHrRow() for HR employee id=${hrEmployee.id}`, hrEmployee);

  const employeeCode = `EMP-${hrEmployee.id}`;

  await companyPool.query(
    `INSERT INTO employee_profile
       (id, user_id, employee_code, name, email, department, designation, salary, leave_balance)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
     ON DUPLICATE KEY UPDATE
       user_id     = COALESCE(user_id, VALUES(user_id)),
       name        = VALUES(name),
       email       = VALUES(email),
       department  = VALUES(department),
       designation = VALUES(designation),
       salary      = VALUES(salary)`,
    [
      hrEmployee.id,
      userId,
      employeeCode,
      hrEmployee.name,
      hrEmployee.email,
      hrEmployee.department || null,
      hrEmployee.designation || null,
      hrEmployee.salary || null,
    ]
  );

  console.log(`[dbEmployee] ✅ employee_profile row upserted for id=${hrEmployee.id}`);

  const [rows] = await companyPool.query(
    `SELECT id, user_id, employee_code, name, email, department, designation,
            manager, joining_date, salary, profile_image, leave_balance
     FROM employee_profile WHERE id = ?`,
    [hrEmployee.id]
  );

  console.log(`[dbEmployee] Profile after upsert:`, rows[0]);
  return rows[0];
}

/**
 * Used by GET /profile at login time. Looks up the HR employees row by
 * the session user's email, then upserts the matching employee_profile
 * row (creating it on first login, refreshing HR-sourced fields on every
 * subsequent login).
 *
 * @param {string} businessId
 * @param {{ id: number, name: string, email: string }} sessionUser - req.session.user
 */
export async function getOrCreateEmployeeProfile(businessId, sessionUser) {
  console.log("---------------------------------------");
  console.log(`[dbEmployee] getOrCreateEmployeeProfile() called`);
  console.log(`[dbEmployee] businessId=${businessId}`);
  console.log(`[dbEmployee] sessionUser:`, sessionUser);

  const { id: userId, email } = sessionUser;

  if (!email) {
    console.error(`[dbEmployee] ❌ sessionUser has no email — cannot match against HR employees table.`);
    throw new Error("Session user has no email on file.");
  }

  const companyPool = await getCompanyEmployeePool(businessId);
  const hrPool = await getCompanyHrPool(businessId);

  console.log(`[dbEmployee] Looking up HR employees table for email=${email}...`);
  const [hrRows] = await hrPool.query(
    `SELECT id, name, email, department, designation, salary, status
     FROM employees
     WHERE email = ?
     ORDER BY created_at DESC
     LIMIT 1`,
    [email]
  );

  console.log(`[dbEmployee] HR employees table lookup result:`, hrRows);

  if (hrRows.length === 0) {
    console.error(`[dbEmployee] ❌ No matching HR employee record found for email: ${email}`);
    throw new Error(
      `No HR employee record found for email "${email}". This employee has not been added by HR yet.`
    );
  }

  const profile = await upsertProfileFromHrRow(companyPool, hrRows[0], userId);
  console.log("---------------------------------------");
  return profile;
}

/**
 * Used by routes that only have an employee_id in hand (e.g. HR
 * generating a payslip before the employee has ever logged in). Looks up
 * the HR employees row by ID directly and ensures the matching
 * employee_profile row exists, auto-provisioning it if needed.
 *
 * @param {string} businessId
 * @param {number} employeeId - this IS the HR employees.id
 */
export async function ensureEmployeeProfileById(businessId, employeeId) {
  console.log("---------------------------------------");
  console.log(`[dbEmployee] ensureEmployeeProfileById() called for employeeId=${employeeId}`);

  const companyPool = await getCompanyEmployeePool(businessId);
  const hrPool = await getCompanyHrPool(businessId);

  const [hrRows] = await hrPool.query(
    `SELECT id, name, email, department, designation, salary, status
     FROM employees
     WHERE id = ?
     LIMIT 1`,
    [employeeId]
  );

  console.log(`[dbEmployee] HR employees table lookup by id result:`, hrRows);

  if (hrRows.length === 0) {
    console.error(`[dbEmployee] ❌ No HR employee record found for id=${employeeId}`);
    throw new Error(`No HR employee record found for id ${employeeId}.`);
  }

  const profile = await upsertProfileFromHrRow(companyPool, hrRows[0]);
  console.log("---------------------------------------");
  return profile;
}

/**
 * Fetches the LIVE basic salary straight from the HR employees table
 * (not the possibly-stale copy on employee_profile). Used by payslip
 * generation so a raise given in HR is reflected on the very next
 * payslip without needing to touch employee_profile manually.
 *
 * @param {string} businessId
 * @param {number} employeeId - HR employees.id
 * @returns {Promise<{ id: number, name: string, salary: string|null }>}
 */
export async function getLiveBasicSalary(businessId, employeeId) {
  console.log(`[dbEmployee] getLiveBasicSalary() called for employeeId=${employeeId}`);
  const hrPool = await getCompanyHrPool(businessId);

  const [rows] = await hrPool.query(
    `SELECT id, name, salary FROM employees WHERE id = ? LIMIT 1`,
    [employeeId]
  );

  console.log(`[dbEmployee] HR salary lookup result:`, rows);

  if (rows.length === 0) {
    console.error(`[dbEmployee] ❌ No HR employee record found for id=${employeeId}`);
    throw new Error(`No HR employee record found for id ${employeeId}.`);
  }

  return rows[0];
}