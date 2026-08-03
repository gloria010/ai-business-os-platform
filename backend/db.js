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
  status VARCHAR(20) DEFAULT 'pending',
  subscription VARCHAR(20) DEFAULT NULL,
  subscription_date VARCHAR(20) DEFAULT NULL,
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

CREATE TABLE IF NOT EXISTS wishlist_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_product (user_id, product_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS cart_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id VARCHAR(50) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_product (user_id, product_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT DEFAULT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS contact_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT DEFAULT NULL,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_code VARCHAR(20) NOT NULL UNIQUE,
  business_id VARCHAR(20) NOT NULL,
  company VARCHAR(150) NOT NULL,
  customer_name VARCHAR(150) NOT NULL,
  email VARCHAR(150),
  product VARCHAR(150) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  gst DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  payment_method VARCHAR(50),
  payment_status ENUM('Paid','Pending','Refunded','Failed') DEFAULT 'Pending',
  transaction_id VARCHAR(50) UNIQUE,
  status ENUM('Pending','Processing','Shipped','Delivered','Cancelled') DEFAULT 'Pending',
  order_date DATE NOT NULL,
  delivery_date DATE NULL,
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_business_id (business_id),
  FOREIGN KEY (business_id) REFERENCES business_owners(business_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  from_name VARCHAR(255) NOT NULL,
  to_recipient VARCHAR(100) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_to_recipient (to_recipient)
) ENGINE=InnoDB;
`;

export async function initSchema() {
  const conn = await pool.getConnection();
  try {
    const statements = SCHEMA.split(";").map((s) => s.trim()).filter(Boolean);
    for (const stmt of statements) {
      await conn.query(stmt);
    }

    // Add status column to business_owners if missing (for databases
    // created before the column was added to the schema).
    try {
      await conn.query(
        `ALTER TABLE business_owners
         ADD COLUMN status VARCHAR(20) DEFAULT 'pending'
         AFTER business_category`
      );
      // For existing rows that got NULL because they were created before the
      // column existed, set them to 'pending' so the admin flow works.
      await conn.query(
        `UPDATE business_owners SET status = 'pending' WHERE status IS NULL`
      );
      console.log("Added status column to business_owners");
    } catch (_) {
      // Column already exists — safe to ignore
    }

    console.log("Database schema ready.");
  } finally {
    conn.release();
  }
}

export default pool;