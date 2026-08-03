// dbInventory.js
// Manages per-company inventory database connections and schema initialization.
// The inventory schema is auto-created when a pool is first established for a
// company's inventory database.
import mysql from "mysql2/promise";
import pool from "./db.js";

const poolCache = new Map();

// ---- Inventory Schema ----
// The starter table in createDepartmentDatabases.js only has a minimal
// inventory_items table.  This schema provides the full set of tables that
// routes/inventory.js expects (categories, products, stock_movements,
// warehouses, suppliers, supplier_ratings, purchase_orders).
const INVENTORY_SCHEMA = `
  CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE,
    description TEXT,
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB;

  CREATE TABLE IF NOT EXISTS warehouses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    manager VARCHAR(255),
    capacity INT DEFAULT 0,
    current_stock INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB;

  CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category_id INT NOT NULL,
    sku VARCHAR(100) NOT NULL UNIQUE,
    price DECIMAL(12, 2) DEFAULT 0,
    stock INT DEFAULT 0,
    status VARCHAR(20) GENERATED ALWAYS AS (
      CASE WHEN stock > COALESCE(low_stock_threshold, 20) THEN 'In Stock' ELSE 'Low Stock' END
    ) STORED,
    low_stock_threshold INT DEFAULT 20,
    warehouse_id INT DEFAULT NULL,
    image_path VARCHAR(500) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE SET NULL
  ) ENGINE=InnoDB;

  CREATE TABLE IF NOT EXISTS stock_movements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    quantity INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  ) ENGINE=InnoDB;

  CREATE TABLE IF NOT EXISTS suppliers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    category_id INT DEFAULT NULL,
    status VARCHAR(20) DEFAULT 'Pending',
    rating DECIMAL(3, 2) DEFAULT NULL,
    rating_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
  ) ENGINE=InnoDB;

  CREATE TABLE IF NOT EXISTS supplier_ratings (
    supplier_id INT NOT NULL,
    user_id INT NOT NULL,
    rating TINYINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (supplier_id, user_id),
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE
  ) ENGINE=InnoDB;

  CREATE TABLE IF NOT EXISTS purchase_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    po_number VARCHAR(100) NOT NULL UNIQUE,
    supplier_id INT NOT NULL,
    product_id INT DEFAULT NULL,
    amount DECIMAL(12, 2) DEFAULT 0,
    expected_date DATE DEFAULT NULL,
    status VARCHAR(20) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
  ) ENGINE=InnoDB;
`;

/**
 * Adds columns that were introduced after the initial CREATE TABLE IF NOT
 * EXISTS statements above, so databases created before this change still
 * pick up the new column. Safe to run every time a pool is created —
 * "duplicate column" errors are swallowed.
 */
async function runSchemaMigrations(conn) {
  const migrations = [
    `ALTER TABLE products ADD COLUMN image_path VARCHAR(500) DEFAULT NULL`,
  ];

  for (const stmt of migrations) {
    try {
      await conn.query(stmt);
    } catch (err) {
      // ER_DUP_FIELDNAME (1060) = column already exists, nothing to do.
      if (err.code !== "ER_DUP_FIELDNAME") {
        console.error("Migration failed:", stmt, err.message);
      }
    }
  }
}

/** Run the full inventory schema against the given pool. */
async function initInventorySchema(companyPool, dbName) {
  const conn = await companyPool.getConnection();
  try {
    const statements = INVENTORY_SCHEMA.split(";")
      .map((s) => s.trim())
      .filter(Boolean);
    for (const stmt of statements) {
      await conn.query(stmt);
    }

    await runSchemaMigrations(conn);

    // Log the db name we already know, rather than digging through the
    // mysql2 pool's internal config shape (companyPool.config.connectionConfig
    // does not exist on this pool object and was throwing here).
    console.log("Inventory schema initialised for", dbName);
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
       AND bd.department = 'inventory'
     LIMIT 1`,
    [businessId]
  );

  console.log("Database Lookup Result:", rows);

  if (rows.length === 0) {
    throw new Error(
      `No inventory database found for Business ID: ${businessId}`
    );
  }

  console.log("Using Inventory Database:", rows[0].db_name);

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

  // Ensure the full inventory schema exists before caching the pool.
  // This runs only once per database (CREATE TABLE IF NOT EXISTS).
  await initInventorySchema(companyPool, dbName);

  poolCache.set(dbName, companyPool);

  return companyPool;
}

export { getPoolFor as getPoolForDbName };

export async function getCompanyInventoryPool(businessId) {
  const dbName = await resolveCompanyDb(businessId);
  return getPoolFor(dbName);
}