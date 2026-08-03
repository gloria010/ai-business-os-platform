// DbHr.js
// Manages per-company HR database connections and schema initialization.
// The HR schema is auto-created when a pool is first established for a
// company's HR database.
import mysql from "mysql2/promise";
import pool from "./db.js";

const poolCache = new Map();

// ---- HR Schema ----
// Matches what HR.tsx expects: job applications (candidates) and employees.
const HR_SCHEMA = `
  CREATE TABLE IF NOT EXISTS applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    position VARCHAR(150) NOT NULL,
    experience VARCHAR(100) DEFAULT NULL,
    applied_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'applied',
    reason TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB;

  CREATE TABLE IF NOT EXISTS employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) DEFAULT NULL,
    department VARCHAR(150) DEFAULT NULL,
    designation VARCHAR(150) DEFAULT NULL,
    salary VARCHAR(100) DEFAULT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB;
`;

/** Run the HR schema against the given pool. */
async function initHrSchema(companyPool, dbName) {
  const conn = await companyPool.getConnection();
  try {
    const statements = HR_SCHEMA.split(";")
      .map((s) => s.trim())
      .filter(Boolean);
    for (const stmt of statements) {
      await conn.query(stmt);
    }
    console.log("HR schema initialised for", dbName);
  } finally {
    conn.release();
  }
}

async function resolveCompanyDb(businessId) {
  console.log("=======================================");
  console.log("Business ID:", businessId);

  const [rows] = await pool.query(
    `SELECT bd.db_name
     FROM business_departments bd
     INNER JOIN business_owners bo
       ON bo.id = bd.owner_id
     WHERE bo.business_id = ?
       AND bd.department = 'hr'
     LIMIT 1`,
    [businessId]
  );

  console.log("Database Lookup Result:", rows);

  if (rows.length === 0) {
    throw new Error(
      `No HR database found for Business ID: ${businessId}`
    );
  }

  console.log("Using HR Database:", rows[0].db_name);

  return rows[0].db_name;
}

async function getPoolFor(dbName) {
  if (poolCache.has(dbName)) {
    console.log("Using Cached Pool:", dbName);
    return poolCache.get(dbName);
  }

  console.log("Creating Pool For:", dbName);

  const companyPool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: dbName,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  // Ensure the HR schema exists before caching the pool.
  // This runs only once per database (CREATE TABLE IF NOT EXISTS).
  await initHrSchema(companyPool, dbName);

  poolCache.set(dbName, companyPool);

  return companyPool;
}

export async function getCompanyHrPool(businessId) {
  const dbName = await resolveCompanyDb(businessId);
  return getPoolFor(dbName);
}