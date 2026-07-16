// backend/db/createDepartmentDatabases.js
import pool from "./db.js";

// Departments every business owner gets, each as its own separate database.
// Matches the "AI Business Workspace" cards: CEO, HR, Employees, Sales, Inventory.
// Analytics is NOT its own department — it lives inside Sales/Inventory/CEO as a feature.
const DEPARTMENTS = ["ceo", "hr", "employees", "sales", "inventory"];

// Starter table definition for each department database.
// Keep these simple for now — expand columns later as each department page needs real data.
const STARTER_TABLE_SQL = {
  ceo: `
    CREATE TABLE IF NOT EXISTS ceo_overview (
      id INT AUTO_INCREMENT PRIMARY KEY,
      metric_name VARCHAR(255) NOT NULL,
      metric_value DECIMAL(15, 2),
      recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `,
  hr: `
    CREATE TABLE IF NOT EXISTS hr_records (
      id INT AUTO_INCREMENT PRIMARY KEY,
      candidate_name VARCHAR(255) NOT NULL,
      position VARCHAR(255),
      status ENUM('applied', 'interviewing', 'hired', 'rejected') DEFAULT 'applied',
      applied_at DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `,
  employees: `
    CREATE TABLE IF NOT EXISTS employee_directory (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255),
      role VARCHAR(255),
      status ENUM('active', 'inactive') DEFAULT 'active',
      joined_at DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `,
  sales: `
    CREATE TABLE IF NOT EXISTS sales_records (
      id INT AUTO_INCREMENT PRIMARY KEY,
      item_name VARCHAR(255) NOT NULL,
      amount DECIMAL(10, 2) NOT NULL,
      quantity INT DEFAULT 1,
      sold_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `,
  inventory: `
    CREATE TABLE IF NOT EXISTS inventory_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      item_name VARCHAR(255) NOT NULL,
      sku VARCHAR(100),
      quantity INT DEFAULT 0,
      unit_price DECIMAL(10, 2),
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `,
};

/**
 * Builds a safe, unique database name for a given owner + business + department.
 * Only allows alphanumeric + underscore to prevent SQL injection via identifiers
 * (since database/table names can't be parameterized with placeholders).
 */
function buildDbName(ownerId, businessId, department) {
  const safeOwnerId = String(ownerId)
    .replace(/[^a-zA-Z0-9]/g, "");

  const safeBusinessId = String(businessId)
    .replace(/[^a-zA-Z0-9]/g, "");

  const safeDept = department
    .replace(/[^a-zA-Z0-9]/g, "");

  return `biz_${safeOwnerId}_${safeBusinessId}_${safeDept}`.toLowerCase();
}

/**
 * Creates one database per department for the given business owner,
 * seeds each with its starter table, and records them in the tracking table.
 * Safe to call multiple times — uses IF NOT EXISTS throughout.
 *
 * NOTE: both ownerId AND businessId are required. The original version of
 * this function only accepted ownerId but referenced an undefined
 * `businessId` inside the loop, which threw a ReferenceError before any
 * database, table, or tracking row was ever created.
 */
export async function createDepartmentDatabases(ownerId, businessId) {
  if (!ownerId || isNaN(Number(ownerId))) {
    throw new Error("createDepartmentDatabases requires a valid numeric ownerId");
  }

  if (!businessId || String(businessId).trim() === "") {
    throw new Error("createDepartmentDatabases requires a valid businessId");
  }

  // Ensure the tracking table exists in the main database
  await pool.query(`
    CREATE TABLE IF NOT EXISTS business_departments (
      id INT AUTO_INCREMENT PRIMARY KEY,

      owner_id INT NOT NULL,
      business_id VARCHAR(20) NOT NULL,

      department VARCHAR(100) NOT NULL,
      db_name VARCHAR(150) NOT NULL,

      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

      UNIQUE KEY unique_owner_business_department (owner_id, business_id, department),

      FOREIGN KEY (owner_id)
        REFERENCES business_owners(id)
        ON DELETE CASCADE,

      FOREIGN KEY (business_id)
        REFERENCES business_owners(business_id)
        ON DELETE CASCADE

    ) ENGINE=InnoDB;
  `);

  const created = [];

  for (const department of DEPARTMENTS) {
    const dbName = buildDbName(ownerId, businessId, department);

    // Create the database itself
    await pool.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);

    // Create the starter table inside that database
    // (must fully-qualify the table name with the db, since `pool` is connected to the main db)
    const tableSql = STARTER_TABLE_SQL[department].trim();
    const qualifiedSql = tableSql.replace(
      /CREATE TABLE IF NOT EXISTS (\w+)/,
      `CREATE TABLE IF NOT EXISTS \`${dbName}\`.$1`
    );
    await pool.query(qualifiedSql);

    // Record it in the tracking table.
    // NOTE: temporarily using a plain INSERT (no IGNORE) so that real errors
    // (FK violations, truncation, etc.) actually throw and get logged instead
    // of being silently swallowed. Once confirmed working, you can switch
    // back to `INSERT IGNORE ... ON DUPLICATE KEY UPDATE db_name = db_name`
    // if you want it to stay idempotent on re-runs without hiding real errors.
    const [insertResult] = await pool.query(
      `INSERT INTO business_departments (owner_id, business_id, department, db_name) VALUES (?, ?, ?, ?)`,
      [ownerId, businessId, department, dbName]
    );
    console.log(
      `Inserted business_departments row for ${department}: affectedRows=${insertResult.affectedRows}, insertId=${insertResult.insertId}`
    );

    created.push({ department, dbName });
  }

  return created;
}

/**
 * Drops all per-department databases for a given owner + business, and removes
 * their tracking rows from business_departments.
 *
 * IMPORTANT: call this BEFORE deleting the row from business_owners (or in the
 * same transaction, before the delete/commit). The FK on business_departments
 * is ON DELETE CASCADE, so once the business_owners row is gone, the tracking
 * rows disappear too — and with them, the only record of which databases
 * (biz_xxx_xxx_ceo, biz_xxx_xxx_hr, etc.) need to be dropped. If you delete the
 * owner first, this function will find nothing to clean up and the real
 * databases will be orphaned on the MySQL server forever.
 *
 * Safe to call multiple times — uses IF EXISTS throughout.
 */
export async function dropDepartmentDatabases(ownerId, businessId) {
  if (!ownerId || isNaN(Number(ownerId))) {
    throw new Error("dropDepartmentDatabases requires a valid numeric ownerId");
  }

  if (!businessId || String(businessId).trim() === "") {
    throw new Error("dropDepartmentDatabases requires a valid businessId");
  }

  const [rows] = await pool.query(
    `SELECT department, db_name FROM business_departments WHERE owner_id = ? AND business_id = ?`,
    [ownerId, businessId]
  );

  const dropped = [];

  for (const row of rows) {
    // db_name was built from buildDbName(), which only ever allows
    // alphanumeric characters, so this is safe to interpolate directly.
    await pool.query(`DROP DATABASE IF EXISTS \`${row.db_name}\``);
    dropped.push({ department: row.department, dbName: row.db_name });
  }

  // Clean up tracking rows too (harmless no-op if the owner row is later
  // deleted and the FK cascade removes them anyway).
  await pool.query(
    `DELETE FROM business_departments WHERE owner_id = ? AND business_id = ?`,
    [ownerId, businessId]
  );

  return dropped;
}

/**
 * Fetches the department -> database name mapping for a given owner + business,
 * so the rest of the app knows which database to query for each department.
 *
 * businessId is included in the filter so this works correctly if an owner
 * ever has more than one business (the unique key on business_departments is
 * now (owner_id, business_id, department), so this keeps lookups consistent
 * with that).
 */
export async function getDepartmentDatabases(ownerId, businessId) {
  const [rows] = await pool.query(
    `SELECT department, db_name FROM business_departments WHERE owner_id = ? AND business_id = ?`,
    [ownerId, businessId]
  );
  return rows.reduce((acc, row) => {
    acc[row.department] = row.db_name;
    return acc;
  }, {});
}