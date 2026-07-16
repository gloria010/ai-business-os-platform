import mysql from "mysql2/promise";

// ---- Connection pool ----
// Adjust these via environment variables in production.
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "business",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// ---- Schema bootstrap ----
// Runs once at startup. Safe to re-run (CREATE TABLE IF NOT EXISTS).
const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  phone VARCHAR(15) NOT NULL,
  password VARCHAR(255) NOT NULL,
 role ENUM('consumer','business_owner','employee','admin') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS business_owners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  business_id VARCHAR(20) NOT NULL UNIQUE,
  company VARCHAR(150) NOT NULL UNIQUE,
  business_category VARCHAR(100) NOT NULL,
  subscription VARCHAR(20) NOT NULL DEFAULT 'trial',
  subscription_type VARCHAR(20) NOT NULL DEFAULT 'monthly',
  pincode VARCHAR(10) DEFAULT NULL,
  company_password VARCHAR(8) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  business_owner_id INT NOT NULL,
  employee_role VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (business_owner_id) REFERENCES business_owners(id) ON DELETE CASCADE
) ENGINE=InnoDB;
`;

export async function initSchema() {
  const conn = await pool.getConnection();
  try {
    const statements = SCHEMA.split(";").map((s) => s.trim()).filter(Boolean);
    for (const stmt of statements) {
      await conn.query(stmt);
    }
    console.log("Database schema ready.");
  } finally {
    conn.release();
  }
}

export default pool;