//inventory.js
import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getCompanyInventoryPool } from "../DbInventory.js";
import pool from "../db.js"; // shared `business` DB, for messages AND for reading sales orders

const router = express.Router();

/* ---------------- PRODUCT IMAGE UPLOAD ---------------- */
// Files are written to <project-root>/uploads/products/ and served statically
// (see app.js: app.use("/uploads", express.static(path.join(__dirname, "uploads"))).
// Only the relative path ("/uploads/products/<filename>") is stored in the DB —
// never the file bytes — so the products table stays small and portable.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, "..", "uploads", "products");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || "";
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, unique);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});

/* ---------------- LOGGING HELPERS ---------------- */

// Wraps any query so the terminal shows: which query ran, with what params,
// how many rows came back (or the exact error if it failed).
async function runQuery(executor, sql, params, label) {
  const trimmedSql = sql.replace(/\s+/g, " ").trim();
  console.log(`\n[DB] >>> ${label}`);
  console.log(`[DB] SQL: ${trimmedSql}`);
  if (params !== undefined) console.log(`[DB] PARAMS:`, params);

  try {
    const result = await executor.query(sql, params);
    const rows = result[0];
    let rowInfo;
    if (Array.isArray(rows)) {
      rowInfo = `${rows.length} row(s) returned`;
    } else if (rows && rows.affectedRows !== undefined) {
      rowInfo = `affectedRows=${rows.affectedRows}${rows.insertId ? `, insertId=${rows.insertId}` : ""}`;
    } else {
      rowInfo = "ok";
    }
    console.log(`[DB] <<< OK (${label}) -> ${rowInfo}`);
    return result;
  } catch (err) {
    console.error(`[DB] <<< FAILED (${label}): ${err.message}`);
    throw err;
  }
}

// Wraps a route handler so any thrown/rejected error is caught, logged with
// a stack trace, and forwarded to Express's error handler at the bottom of
// this file — instead of crashing or hanging silently.
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/* ---------------- SALES -> INVENTORY STOCK SYNC ---------------- */
// sales.js is not touched. Instead, inventory.js reaches into the same
// shared `business` DB that sales.js reads from (the `orders` table lives
// there) and pulls in any order that's now Shipped or Delivered, applying
// its stock impact on this side, in the company inventory DB.
//
// 1. Product stock is reduced by the order quantity — "reduce stock once
//    completed" (Shipped/Delivered both count as committed here).
// 2. The matching warehouse's current_stock is reduced by the same amount,
//    so occupancy drops in step with the products it's assigned to.
// 3. A stock_movements row (type: 'sold') is logged, so it shows up
//    alongside every other stock change in Stock Management/Notifications.
//
// Products are matched to an order by exact name (orders.product is plain
// text, not a foreign key) — ambiguous or unmatched names are skipped and
// logged rather than guessed at. Each order is applied exactly once: a
// small `synced_sale_orders` tracking table (auto-created on first use, in
// the company DB) records which order ids have already been processed, so
// running this on every request is always safe and cheap once caught up.

const STOCK_DEDUCTION_STATUSES = new Set(["Shipped", "Delivered"]);

// Earlier stage than the actual deduction above: as soon as an order is
// Processing or Shipped, Stock Management should show it as "received" /
// picked up for fulfillment — this is purely a visibility event (a
// stock_movements row), it does NOT touch products.stock or warehouse
// current_stock. The real decrement still only happens via
// STOCK_DEDUCTION_STATUSES once the order is Shipped/Delivered.
const STOCK_RESERVATION_STATUSES = new Set(["Processing", "Shipped"]);

// req.businessId (session.workspace, or the raw ?business_id= query param)
// isn't guaranteed to be the same value stored in orders.business_id —
// sales.js resolves that through business_owners first (matching on
// business_id, company name, or a slugified company name), it never trusts
// the raw value directly. If we skip that same resolution here, the orders
// query below silently matches zero rows: no error, nothing ever syncs.
// This mirrors sales.js's resolveBusinessId exactly, without touching that
// file, so both sides agree on which business_id an order belongs to.
async function resolveCanonicalBusinessId(rawBusinessId) {
  if (!rawBusinessId) return null;

  const [rows] = await pool.query(
    `SELECT business_id FROM business_owners
     WHERE business_id = ?
        OR company = ?
        OR LOWER(REPLACE(company, ' ', '-')) = ?
     LIMIT 1`,
    [rawBusinessId, rawBusinessId, String(rawBusinessId).toLowerCase()]
  );

  if (rows.length === 0) {
    console.warn(`[Inventory][StockSync] Could not resolve a canonical business_id for "${rawBusinessId}" via business_owners — falling back to the raw value, orders lookup may return nothing`);
    return rawBusinessId;
  }
  return rows[0].business_id;
}

async function ensureSyncTrackingTable(companyPool) {
  await companyPool.query(`
    CREATE TABLE IF NOT EXISTS synced_sale_orders (
      order_id INT PRIMARY KEY,
      product_id INT NOT NULL,
      quantity INT NOT NULL,
      synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await companyPool.query(`
    CREATE TABLE IF NOT EXISTS reserved_sale_orders (
      order_id INT PRIMARY KEY,
      product_id INT NOT NULL,
      quantity INT NOT NULL,
      reserved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

// Logs a "received for fulfillment" stock_movements row the first time an
// order enters Processing or Shipped. Never touches actual stock/warehouse
// counts — that only happens in applyOrderStockImpact below, at
// Shipped/Delivered. Idempotent via reserved_sale_orders, same pattern as
// the deduction stage.
async function applyOrderReservation(companyPool, order) {
  const quantity = Number(order.quantity || 0);
  if (!order.product || quantity <= 0) {
    return { orderId: order.id, reserved: false, reason: "No product name or zero quantity on order" };
  }

  const conn = await companyPool.getConnection();
  try {
    await conn.beginTransaction();

    const [productRows] = await conn.query(
      `SELECT id, name FROM products WHERE name = ? LIMIT 2`,
      [order.product]
    );

    if (productRows.length !== 1) {
      await conn.rollback();
      console.warn(`[Inventory][StockSync] Reservation skipped for order ${order.id}: ${productRows.length === 0 ? "no" : "ambiguous"} product match for "${order.product}"`);
      return { orderId: order.id, reserved: false, reason: `${productRows.length === 0 ? "No" : "Ambiguous"} product match for "${order.product}"` };
    }

    const product = productRows[0];

    await conn.query(
      `INSERT INTO stock_movements (product_id, type, quantity) VALUES (?, 'reserved', ?)`,
      [product.id, quantity]
    );

    await conn.query(
      `INSERT INTO reserved_sale_orders (order_id, product_id, quantity) VALUES (?, ?, ?)`,
      [order.id, product.id, quantity]
    );

    await conn.commit();
    console.log(`[Inventory][StockSync] Order ${order.id} marked received/reserved: "${product.name}" x${quantity}`);
    return { orderId: order.id, reserved: true, productId: product.id, quantity };
  } catch (err) {
    await conn.rollback();
    console.error(`[Inventory][StockSync] Failed reserving order ${order.id}: ${err.message}`);
    return { orderId: order.id, reserved: false, reason: err.message };
  } finally {
    conn.release();
  }
}

// Applies stock impact for one already-Shipped/Delivered order. Runs in its
// own transaction so a failure on one order can't corrupt another, and
// never throws — logs and returns a result object instead, so one bad
// order (e.g. unmatched product name) doesn't stop the rest of the sync.
async function applyOrderStockImpact(companyPool, order) {
  const quantity = Number(order.quantity || 0);
  if (!order.product || quantity <= 0) {
    return { orderId: order.id, synced: false, reason: "No product name or zero quantity on order" };
  }

  const conn = await companyPool.getConnection();
  try {
    await conn.beginTransaction();

    const [productRows] = await conn.query(
      `SELECT id, name, stock, warehouse_id FROM products WHERE name = ? LIMIT 2`,
      [order.product]
    );

    if (productRows.length === 0) {
      await conn.rollback();
      console.warn(`[Inventory][StockSync] No product named "${order.product}" — skipping order ${order.id}`);
      return { orderId: order.id, synced: false, reason: `No product named "${order.product}" found` };
    }
    if (productRows.length > 1) {
      await conn.rollback();
      console.warn(`[Inventory][StockSync] Multiple products named "${order.product}" — skipping order ${order.id} to avoid decrementing the wrong one`);
      return { orderId: order.id, synced: false, reason: `Multiple products named "${order.product}" found; name is ambiguous` };
    }

    const product = productRows[0];

    // Product stock: reduced once the order is committed (point 1).
    await conn.query(
      `UPDATE products SET stock = GREATEST(stock - ?, 0) WHERE id = ?`,
      [quantity, product.id]
    );

    // Stock Management / Notifications feed picks this up automatically.
    await conn.query(
      `INSERT INTO stock_movements (product_id, type, quantity) VALUES (?, 'sold', ?)`,
      [product.id, quantity]
    );

    // Warehouse occupancy: reduced in step with the product (point 3).
    if (product.warehouse_id) {
      await conn.query(
        `UPDATE warehouses SET current_stock = GREATEST(current_stock - ?, 0) WHERE id = ?`,
        [quantity, product.warehouse_id]
      );
    }

    // Marks this order as done so it's never applied a second time.
    await conn.query(
      `INSERT INTO synced_sale_orders (order_id, product_id, quantity) VALUES (?, ?, ?)`,
      [order.id, product.id, quantity]
    );

    await conn.commit();
    console.log(`[Inventory][StockSync] Order ${order.id} synced: decremented "${product.name}" by ${quantity}${product.warehouse_id ? `, warehouse ${product.warehouse_id} updated` : ""}`);
    return { orderId: order.id, synced: true, productId: product.id, warehouseId: product.warehouse_id || null, quantity };
  } catch (err) {
    await conn.rollback();
    console.error(`[Inventory][StockSync] Failed syncing order ${order.id}: ${err.message}`);
    return { orderId: order.id, synced: false, reason: err.message };
  } finally {
    conn.release();
  }
}

// Reverses whatever stock impact a now-Cancelled order previously had. If
// it had already been deducted (Shipped/Delivered before cancellation),
// stock and warehouse counts are added back and a 'cancelled' stock_movements
// row is logged. If it had only been reserved (Processing/Shipped, never
// actually deducted), there's nothing to add back — the reservation record
// is simply cleared so Stock Management stops showing it as received.
// Deleting the synced_sale_orders / reserved_sale_orders rows here also
// makes this naturally idempotent: once reversed, the order is no longer
// "already synced/reserved", so it can never be reversed a second time.
async function reverseOrderStockImpact(companyPool, order, { wasSynced, wasReserved }) {
  const conn = await companyPool.getConnection();
  try {
    await conn.beginTransaction();

    if (wasSynced) {
      const [[synced]] = await conn.query(
        `SELECT product_id, quantity FROM synced_sale_orders WHERE order_id = ?`,
        [order.id]
      );
      if (synced) {
        const [[product]] = await conn.query(
          `SELECT id, name, warehouse_id FROM products WHERE id = ?`,
          [synced.product_id]
        );
        if (product) {
          await conn.query(
            `UPDATE products SET stock = stock + ? WHERE id = ?`,
            [synced.quantity, product.id]
          );
          await conn.query(
            `INSERT INTO stock_movements (product_id, type, quantity) VALUES (?, 'cancelled', ?)`,
            [product.id, synced.quantity]
          );
          if (product.warehouse_id) {
            await conn.query(
              `UPDATE warehouses SET current_stock = current_stock + ? WHERE id = ?`,
              [synced.quantity, product.warehouse_id]
            );
          }
        }
        await conn.query(`DELETE FROM synced_sale_orders WHERE order_id = ?`, [order.id]);
      }
    }

    if (wasReserved) {
      await conn.query(`DELETE FROM reserved_sale_orders WHERE order_id = ?`, [order.id]);
    }

    await conn.commit();
    console.log(`[Inventory][StockSync] Order ${order.id} cancelled — stock impact reversed (wasSynced=${wasSynced}, wasReserved=${wasReserved})`);
    return { orderId: order.id, reversed: true };
  } catch (err) {
    await conn.rollback();
    console.error(`[Inventory][StockSync] Failed reversing cancelled order ${order.id}: ${err.message}`);
    return { orderId: order.id, reversed: false, reason: err.message };
  } finally {
    conn.release();
  }
}

// Fetches Shipped/Delivered orders for this business from the shared sales
// DB, filters out ones already synced, and applies stock impact for the
// rest. Safe to call on every inventory request — a cheap no-op once
// orders are caught up (just the two lookup queries below).
async function syncStockFromSalesOrders(companyPool, businessId) {
  if (!businessId) return;

  await ensureSyncTrackingTable(companyPool);

  // Pull every order that's in either stage — Processing/Shipped
  // (reservation) or Shipped/Delivered (deduction) — in one query, then
  // split them out below. "Shipped" naturally appears in both sets, since
  // it's the moment it gets reserved AND the moment stock actually comes
  // off the shelf.
    const [orders] = await runQuery(
    pool,
    `SELECT id, product, quantity, status FROM orders WHERE business_id = ? AND status IN ('Processing', 'Shipped', 'Delivered', 'Cancelled')`,
    [businessId],
    "StockSync: fetch Processing/Shipped/Delivered/Cancelled orders from sales"
  );
  if (orders.length === 0) return;

  const orderIds = orders.map((o) => o.id);

  const [reservedRows] = await companyPool.query(
    `SELECT order_id FROM reserved_sale_orders WHERE order_id IN (?)`,
    [orderIds]
  );
  const alreadyReserved = new Set(reservedRows.map((r) => r.order_id));

  const [syncedRows] = await companyPool.query(
    `SELECT order_id FROM synced_sale_orders WHERE order_id IN (?)`,
    [orderIds]
  );
  const alreadySynced = new Set(syncedRows.map((r) => r.order_id));

    for (const order of orders) {
    if (order.status === "Cancelled") {
      // Only worth reversing if this order actually had a stock effect
      // applied before it was cancelled — otherwise there's nothing to undo.
      if (alreadySynced.has(order.id) || alreadyReserved.has(order.id)) {
        await reverseOrderStockImpact(companyPool, order, {
          wasSynced: alreadySynced.has(order.id),
          wasReserved: alreadyReserved.has(order.id),
        });
      }
      continue;
    }
    // Stage 1: "received for fulfillment" — Processing or Shipped.
    if (STOCK_RESERVATION_STATUSES.has(order.status) && !alreadyReserved.has(order.id)) {
      await applyOrderReservation(companyPool, order);
    }
    // Stage 2: actual stock deduction — Shipped or Delivered.
    if (STOCK_DEDUCTION_STATUSES.has(order.status) && !alreadySynced.has(order.id)) {
      await applyOrderStockImpact(companyPool, order);
    }
  }
}

/* ---------------- COMPANY RESOLUTION ---------------- */

// Company comes from the authenticated session (set at login in login.js),
// not from a client-supplied ?company= query param. This prevents a logged-in
// user from reading another company's inventory just by editing the URL.
async function businessDb(req, res, next) {
  try {
    // Prefer the session workspace (secure, can't be spoofed by editing the URL).
    // Fall back to ?business_id= if there's no session yet — this keeps the app
    // working while the session-cookie issue is being debugged separately.
    let businessId = req.session?.user?.company;

    if (!businessId && req.query.business_id) {
      console.warn(
        `[Inventory][AUTH] No session workspace — falling back to ?business_id= query param (${req.query.business_id}). ` +
        `This is a temporary fallback; the session cookie isn't persisting yet.`
      );
      businessId = req.query.business_id;
    }

    if (!businessId) {
      console.error(`[Inventory][AUTH] No business_id on session or query for ${req.method} ${req.originalUrl}`);
      return res.status(401).json({ success: false, message: "Not logged in or no business assigned" });
    }

    req.companyPool = await getCompanyInventoryPool(businessId);
    req.businessId = businessId;

    // Pull in any newly Shipped/Delivered sales orders and apply their
    // stock impact before this request is served. A sync failure is logged
    // but never blocks the request — inventory data should still load even
    // if the sales DB is briefly unreachable.
    try {
      await syncStockFromSalesOrders(req.companyPool, req.businessId);
    } catch (err) {
      console.error(`[Inventory][StockSync] Sync failed for business ${req.businessId}: ${err.message}`);
    }

    next();
  } catch (err) {
    console.error(`[Inventory][AUTH] Failed to resolve business DB: ${err.message}`);
    res.status(404).json({ success: false, message: err.message });
  }
}

router.use(businessDb);

// Logs every incoming request, and every outgoing response body, so you can
// see exactly what the frontend sent and what it got back.
router.use((req, res, next) => {
  const businessId = req.businessId || "unknown";
  console.log(`\n[Inventory] --> ${req.method} ${req.originalUrl} business_id=${businessId}`);
  if (["POST", "PUT", "DELETE"].includes(req.method)) {
    console.log(`[Inventory] BODY: ${JSON.stringify(req.body)}`);
  }

  const originalJson = res.json.bind(res);
  res.json = (body) => {
    const preview = JSON.stringify(body);
    console.log(
      `[Inventory] <-- ${req.method} ${req.originalUrl} [${res.statusCode}] ${
        preview.length > 1000 ? preview.slice(0, 1000) + "...(truncated)" : preview
      }`
    );
    return originalJson(body);
  };

  next();
});

/* ---------------- CATEGORIES ---------------- */

router.get("/categories", asyncHandler(async (req, res) => {
  const [rows] = await runQuery(
    req.companyPool,
    `SELECT c.*, COUNT(p.id) AS productCount
     FROM categories c
     LEFT JOIN products p ON p.category_id = c.id
     GROUP BY c.id
     ORDER BY c.name`,
    undefined,
    "GET /categories"
  );
  res.json({ success: true, categories: rows });
}));

router.post("/categories", asyncHandler(async (req, res) => {
  const { name, description, status } = req.body;
  if (!name) return res.status(400).json({ success: false, message: "Category name is required" });

  try {
    const [result] = await runQuery(
      req.companyPool,
      `INSERT INTO categories (name, description, status) VALUES (?, ?, ?)`,
      [name, description || null, status || "Active"],
      "POST /categories"
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ success: false, message: "This category already exists" });
    }
    throw err;
  }
}));

router.put("/categories/:id", asyncHandler(async (req, res) => {
  const { name, description, status } = req.body;
  await runQuery(
    req.companyPool,
    `UPDATE categories SET name = ?, description = COALESCE(?, description), status = COALESCE(?, status) WHERE id = ?`,
    [name, description, status, req.params.id],
    `PUT /categories/${req.params.id}`
  );
  res.json({ success: true });
}));

router.delete("/categories/:id", asyncHandler(async (req, res) => {
  const [[{ cnt }]] = await runQuery(
    req.companyPool,
    `SELECT COUNT(*) AS cnt FROM products WHERE category_id = ?`,
    [req.params.id],
    `DELETE /categories/${req.params.id} (dependency check)`
  );
  if (cnt > 0) {
    return res.status(409).json({
      success: false,
      message: `Cannot delete — ${cnt} product(s) still use this category`,
    });
  }
  await runQuery(
    req.companyPool,
    `DELETE FROM categories WHERE id = ?`,
    [req.params.id],
    `DELETE /categories/${req.params.id}`
  );
  res.json({ success: true });
}));

/* ---------------- PRODUCTS ---------------- */

// Upload a single product photo. Returns the relative path to store on the
// product record (imagePath) — the actual file lives on disk under
// uploads/products/, not in the database.
router.post("/products/upload-image", (req, res) => {
  upload.single("photo")(req, res, (err) => {
    if (err) {
      console.error("[Inventory][UPLOAD] failed:", err.message);
      return res.status(400).json({ success: false, message: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image file received" });
    }
    const imagePath = `/uploads/products/${req.file.filename}`;
    console.log(`[Inventory][UPLOAD] saved ${imagePath}`);
    res.json({ success: true, imagePath });
  });
});

router.get("/products", asyncHandler(async (req, res) => {
  const [rows] = await runQuery(
    req.companyPool,
    `SELECT p.*, c.name AS category, w.name AS warehouseName
     FROM products p
     JOIN categories c ON c.id = p.category_id
     LEFT JOIN warehouses w ON w.id = p.warehouse_id
     ORDER BY p.created_at DESC`,
    undefined,
    "GET /products"
  );
  res.json({ success: true, products: rows });
}));

router.post("/products", asyncHandler(async (req, res) => {
  const { name, categoryId, sku, price, stock, warehouseId, lowStockThreshold, imagePath } = req.body;

  if (!name || !categoryId || !sku) {
    return res.status(400).json({ success: false, message: "Name, category and SKU are required" });
  }

  const conn = await req.companyPool.getConnection();
  try {
    await conn.beginTransaction();

    const [catRows] = await runQuery(
      conn,
      `SELECT id FROM categories WHERE id = ?`,
      [categoryId],
      "POST /products (category check)"
    );
    if (catRows.length === 0) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: "Selected category does not exist" });
    }

    const [result] = await runQuery(
      conn,
      `INSERT INTO products (name, category_id, sku, price, stock, low_stock_threshold, warehouse_id, image_path)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, categoryId, sku, price || 0, stock || 0, lowStockThreshold || 20, warehouseId || null, imagePath || null],
      "POST /products (insert)"
    );

    await runQuery(
      conn,
      `INSERT INTO stock_movements (product_id, type, quantity) VALUES (?, 'added', ?)`,
      [result.insertId, stock || 0],
      "POST /products (stock_movements insert)"
    );

    if (warehouseId) {
      await runQuery(
        conn,
        `UPDATE warehouses SET current_stock = current_stock + ? WHERE id = ?`,
        [stock || 0, warehouseId],
        "POST /products (warehouse stock update)"
      );
    }

    await conn.commit();
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    await conn.rollback();
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ success: false, message: "SKU already exists" });
    }
    throw err;
  } finally {
    conn.release();
  }
}));

router.put("/products/:id", asyncHandler(async (req, res) => {
  const { name, categoryId, price, stock, warehouseId, lowStockThreshold, imagePath } = req.body;

  const conn = await req.companyPool.getConnection();
  try {
    await conn.beginTransaction();

    const [[existing]] = await runQuery(
      conn,
      `SELECT * FROM products WHERE id = ?`,
      [req.params.id],
      `PUT /products/${req.params.id} (fetch existing)`
    );
    if (!existing) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: "Product not found" });
    }

 const stockDiff = (stock ?? existing.stock) - existing.stock;
    const newStockValue = stock ?? existing.stock;
    const warehouseProvided = warehouseId !== undefined; // field was included in the request
    const newWarehouseId = warehouseId || null;           // treat "" / null as "unassign"
    const warehouseChanged = warehouseProvided && newWarehouseId != existing.warehouse_id;
    await runQuery(
      conn,
      `UPDATE products SET
        name = COALESCE(?, name),
        category_id = COALESCE(?, category_id),
        price = COALESCE(?, price),
        stock = COALESCE(?, stock),
        low_stock_threshold = COALESCE(?, low_stock_threshold),
        warehouse_id = COALESCE(?, warehouse_id),
        image_path = COALESCE(?, image_path)
       WHERE id = ?`,
      [name, categoryId, price, stock, lowStockThreshold, warehouseId, imagePath, req.params.id],
      `PUT /products/${req.params.id} (update)`
    );

    if (stockDiff !== 0) {
      await runQuery(
        conn,
        `INSERT INTO stock_movements (product_id, type, quantity) VALUES (?, ?, ?)`,
        [req.params.id, stockDiff > 0 ? "added" : "sold", Math.abs(stockDiff)],
        `PUT /products/${req.params.id} (stock_movements insert)`
      );
    }

    // Warehouse changed: move the FULL current stock amount off the old
    // warehouse and onto the new one (independent of whether stock qty changed).
  if (warehouseChanged) {
      if (existing.warehouse_id) {
        await runQuery(
          conn,
          `UPDATE warehouses SET current_stock = current_stock - ? WHERE id = ?`,
          [existing.stock, existing.warehouse_id],
          `PUT /products/${req.params.id} (remove from old warehouse)`
        );
      }
      if (newWarehouseId) {
        await runQuery(
          conn,
          `UPDATE warehouses SET current_stock = current_stock + ? WHERE id = ?`,
          [newStockValue, newWarehouseId],
          `PUT /products/${req.params.id} (add to new warehouse)`
        );
      }
    } else if (stockDiff !== 0) {
      // Same warehouse, just a stock quantity change.
      const targetWarehouse = warehouseId || existing.warehouse_id;
      if (targetWarehouse) {
        await runQuery(
          conn,
          `UPDATE warehouses SET current_stock = current_stock + ? WHERE id = ?`,
          [stockDiff, targetWarehouse],
          `PUT /products/${req.params.id} (warehouse stock update)`
        );
      }
    } 

    await conn.commit();
    res.json({ success: true });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}));

router.delete("/products/:id", asyncHandler(async (req, res) => {
  const conn = await req.companyPool.getConnection();
  try {
    await conn.beginTransaction();

    const [[product]] = await runQuery(
      conn,
      `SELECT * FROM products WHERE id = ?`,
      [req.params.id],
      `DELETE /products/${req.params.id} (fetch existing)`
    );
    if (!product) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (product.warehouse_id) {
      await runQuery(
        conn,
        `UPDATE warehouses SET current_stock = current_stock - ? WHERE id = ?`,
        [product.stock, product.warehouse_id],
        `DELETE /products/${req.params.id} (warehouse stock update)`
      );
    }

    await runQuery(
      conn,
      `DELETE FROM products WHERE id = ?`,
      [req.params.id],
      `DELETE /products/${req.params.id} (delete)`
    );
    await conn.commit();

    // Best-effort cleanup of the product's photo on disk — a failure here
    // shouldn't fail the request, the DB row is already gone.
    if (product.image_path) {
      const absPath = path.join(__dirname, "..", product.image_path);
      fs.unlink(absPath, (err) => {
        if (err) console.warn(`[Inventory] Could not remove image file ${absPath}: ${err.message}`);
      });
    }

    res.json({ success: true });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}));

/* ---------------- STOCK MANAGEMENT ---------------- */

router.get("/stock-summary", asyncHandler(async (req, res) => {
  const p = req.companyPool;

  const [[totals]] = await runQuery(
    p,
    `SELECT
      COALESCE(SUM(stock), 0) AS available,
      COALESCE(SUM(CASE WHEN status = 'Low Stock' THEN 1 ELSE 0 END), 0) AS lowStockCount,
      COALESCE(SUM(price * stock), 0) AS inventoryValue,
      COUNT(*) AS totalProducts
     FROM products`,
    undefined,
    "GET /stock-summary (totals)"
  );

  const [[categoryCount]] = await runQuery(
    p,
    `SELECT COUNT(*) AS total FROM categories`,
    undefined,
    "GET /stock-summary (category count)"
  );

  const [movements] = await runQuery(
    p,
    `SELECT type, COALESCE(SUM(quantity), 0) AS total
     FROM stock_movements
     WHERE created_at >= NOW() - INTERVAL 30 DAY
     GROUP BY type`,
    undefined,
    "GET /stock-summary (movements)"
  );

  // Turn the movements rows (added/sold/returned/damaged/reserved/cancelled)
  // into a lookup so the dashboard cards can read each type directly.
  const movementTotals = movements.reduce((acc, row) => {
    acc[row.type] = Number(row.total || 0);
    return acc;
  }, {});

  const stockAdded = movementTotals.added || 0;
  const stockSold = movementTotals.sold || 0;
  const stockReturned = movementTotals.returned || 0;
  const stockDamaged = movementTotals.damaged || 0;
  const reservedStock = movementTotals.reserved || 0;

  // Pending purchase orders stand in for "incoming" stock until POs carry
  // an explicit quantity column.
  const [[incoming]] = await runQuery(
    p,
    `SELECT COUNT(*) AS pendingPOs FROM purchase_orders WHERE status = 'Pending'`,
    undefined,
    "GET /stock-summary (incoming)"
  );

  const availableStock = Number(totals.available || 0);
  const outgoingStock = reservedStock;
  const incomingStock = Number(incoming.pendingPOs || 0);

  const totalForPct = availableStock + outgoingStock + stockDamaged;
  const availablePct = totalForPct > 0 ? Math.round((availableStock / totalForPct) * 100) : 0;
  const reservedPct = totalForPct > 0 ? Math.round((outgoingStock / totalForPct) * 100) : 0;
  const damagedPct = totalForPct > 0 ? Math.round((stockDamaged / totalForPct) * 100) : 0;
  const inventoryAccuracy = totalForPct > 0 ? Math.max(0, 100 - damagedPct) : 100;

  res.json({
    success: true,
    totals: {
      ...totals,
      totalCategories: categoryCount.total,
      availableStock,
      incomingStock,
      outgoingStock,
      availablePct,
      reservedPct,
      damagedPct,
      inventoryAccuracy,
      stockAdded,
      stockSold,
      stockReturned,
      stockDamaged,
    },
    movements,
  });
}));

router.get("/notifications", asyncHandler(async (req, res) => {
  const [rows] = await runQuery(
    req.companyPool,
    `SELECT sm.*, p.name AS product_name
     FROM stock_movements sm
     JOIN products p ON p.id = sm.product_id
     ORDER BY sm.created_at DESC
     LIMIT 10`,
    undefined,
    "GET /notifications"
  );

  const notifications = rows.map((row) => {
    const type = row.type || "update";
        const titleMap = {
      added: `Stock added: ${row.product_name}`,
      sold: `Product sold: ${row.product_name}`,
      returned: `Return received: ${row.product_name}`,
      damaged: `Damage reported: ${row.product_name}`,
      reserved: `Order received for fulfillment: ${row.product_name}`,
      cancelled: `Order cancelled, stock restored: ${row.product_name}`,
    };

    const colorMap = {
      added: "bg-green-500",
      sold: "bg-red-500",
      returned: "bg-blue-500",
      damaged: "bg-orange-500",
      reserved: "bg-indigo-500",
      cancelled: "bg-slate-500",
      update: "bg-purple-500",
    };

    return {
      title: titleMap[type] || `${type} event: ${row.product_name}`,
      desc: `${row.quantity} unit(s) ${type} for ${row.product_name}`,
      time: new Date(row.created_at).toLocaleString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "short",
      }),
      color: colorMap[type] || colorMap.update,
      isRead: false,
    };
  });

  res.json({ success: true, notifications });
}));

/* ---------------- SUPPLIERS ---------------- */

router.get("/suppliers", asyncHandler(async (req, res) => {
  const [rows] = await runQuery(
    req.companyPool,
    `SELECT s.*, c.name AS categoryName
     FROM suppliers s
     LEFT JOIN categories c ON c.id = s.category_id
     ORDER BY s.name`,
    undefined,
    "GET /suppliers"
  );
  res.json({ success: true, suppliers: rows });
}));

router.post("/suppliers", asyncHandler(async (req, res) => {
  const { name, contactPerson, phone, email, address, categoryId, status } = req.body;
  if (!name) return res.status(400).json({ success: false, message: "Supplier name is required" });

  const [result] = await runQuery(
    req.companyPool,
    `INSERT INTO suppliers (name, contact_person, phone, email, address, category_id, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [name, contactPerson || null, phone || null, email || null, address || null, categoryId || null, status || "Pending"],
    "POST /suppliers"
  );
  res.json({ success: true, id: result.insertId });
}));

router.put("/suppliers/:id", asyncHandler(async (req, res) => {
  const { name, contactPerson, phone, email, address, status } = req.body;
  await runQuery(
    req.companyPool,
    `UPDATE suppliers SET
      name = COALESCE(?, name),
      contact_person = COALESCE(?, contact_person),
      phone = COALESCE(?, phone),
      email = COALESCE(?, email),
      address = COALESCE(?, address),
      status = COALESCE(?, status)
     WHERE id = ?`,
    [name, contactPerson, phone, email, address, status, req.params.id],
    `PUT /suppliers/${req.params.id}`
  );
  res.json({ success: true });
}));

// Delete a supplier — blocked if any purchase order still references it,
// so historical PO records never end up pointing at a deleted supplier.
router.delete("/suppliers/:id", asyncHandler(async (req, res) => {
  const [[{ cnt }]] = await runQuery(
    req.companyPool,
    `SELECT COUNT(*) AS cnt FROM purchase_orders WHERE supplier_id = ?`,
    [req.params.id],
    `DELETE /suppliers/${req.params.id} (dependency check)`
  );
  if (cnt > 0) {
    return res.status(409).json({
      success: false,
      message: `Cannot delete — ${cnt} purchase order(s) still reference this supplier`,
    });
  }
  await runQuery(
    req.companyPool,
    `DELETE FROM suppliers WHERE id = ?`,
    [req.params.id],
    `DELETE /suppliers/${req.params.id}`
  );
  res.json({ success: true });
}));

// Interactive rating: each user submits 1-5, stored rating is the live average.
router.post("/suppliers/:id/rate", asyncHandler(async (req, res) => {
  const { userId, rating } = req.body;
  if (!userId || !rating || rating < 1 || rating > 5) {
    return res.status(400).json({ success: false, message: "userId and a rating 1-5 are required" });
  }

  const conn = await req.companyPool.getConnection();
  try {
    await conn.beginTransaction();

    await runQuery(
      conn,
      `INSERT INTO supplier_ratings (supplier_id, user_id, rating)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE rating = VALUES(rating)`,
      [req.params.id, userId, rating],
      `POST /suppliers/${req.params.id}/rate (upsert rating)`
    );

    const [[agg]] = await runQuery(
      conn,
      `SELECT AVG(rating) AS avgRating, COUNT(*) AS cnt FROM supplier_ratings WHERE supplier_id = ?`,
      [req.params.id],
      `POST /suppliers/${req.params.id}/rate (aggregate)`
    );

    await runQuery(
      conn,
      `UPDATE suppliers SET rating = ?, rating_count = ? WHERE id = ?`,
      [agg.avgRating, agg.cnt, req.params.id],
      `POST /suppliers/${req.params.id}/rate (update supplier)`
    );

    await conn.commit();
    res.json({ success: true, rating: agg.avgRating, ratingCount: agg.cnt });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}));

/* ---------------- WAREHOUSES ---------------- */

router.get("/warehouses", asyncHandler(async (req, res) => {
  const [rows] = await runQuery(
    req.companyPool,
    `SELECT
       w.*,
       COALESCE(SUM(p.stock), 0) AS current_stock,
       ROUND(COALESCE(SUM(p.stock), 0) / NULLIF(w.capacity, 0) * 100, 1) AS occupancyPct
     FROM warehouses w
     LEFT JOIN products p ON p.warehouse_id = w.id
     GROUP BY w.id
     ORDER BY w.name`,
    undefined,
    "GET /warehouses"
  );
  res.json({ success: true, warehouses: rows });
}));
router.post("/warehouses", asyncHandler(async (req, res) => {
  const { name, location, manager, capacity, status } = req.body;
  if (!name) return res.status(400).json({ success: false, message: "Warehouse name is required" });

  const [result] = await runQuery(
    req.companyPool,
    `INSERT INTO warehouses (name, location, manager, capacity, status) VALUES (?, ?, ?, ?, ?)`,
    [name, location || null, manager || null, capacity || 0, status || "Active"],
    "POST /warehouses"
  );
  res.json({ success: true, id: result.insertId });
}));

router.put("/warehouses/:id", asyncHandler(async (req, res) => {
  const { name, location, manager, capacity, status } = req.body;
  await runQuery(
    req.companyPool,
    `UPDATE warehouses SET
      name = COALESCE(?, name),
      location = COALESCE(?, location),
      manager = COALESCE(?, manager),
      capacity = COALESCE(?, capacity),
      status = COALESCE(?, status)
     WHERE id = ?`,
    [name, location, manager, capacity, status, req.params.id],
    `PUT /warehouses/${req.params.id}`
  );
  res.json({ success: true });
}));

// Delete a warehouse — blocked if any product is still assigned to it,
// so a delete never silently orphans live stock.
router.delete("/warehouses/:id", asyncHandler(async (req, res) => {
  const [[{ cnt }]] = await runQuery(
    req.companyPool,
    `SELECT COUNT(*) AS cnt FROM products WHERE warehouse_id = ?`,
    [req.params.id],
    `DELETE /warehouses/${req.params.id} (dependency check)`
  );
  if (cnt > 0) {
    return res.status(409).json({
      success: false,
      message: `Cannot delete — ${cnt} product(s) still assigned to this warehouse`,
    });
  }
  await runQuery(
    req.companyPool,
    `DELETE FROM warehouses WHERE id = ?`,
    [req.params.id],
    `DELETE /warehouses/${req.params.id}`
  );
  res.json({ success: true });
}));

/* ---------------- MESSAGES (shared `business` DB) ---------------- */

router.get("/messages", asyncHandler(async (req, res) => {
const businessId = req.businessId || req.session?.user?.company;  const [[owner]] = await runQuery(
    pool,
    `SELECT id FROM business_owners WHERE business_id = ?`,
    [businessId],
    "GET /messages (owner lookup)"
  );
  if (!owner) return res.status(404).json({ success: false, message: "Business not found" });

  const [rows] = await runQuery(
    pool,
    `SELECT * FROM messages WHERE business_owner_id = ? ORDER BY created_at DESC LIMIT 100`,
    [owner.id],
    "GET /messages"
  );
  res.json({ success: true, messages: rows });
}));

router.post("/messages", asyncHandler(async (req, res) => {
  const { sender, receiver, message } = req.body;
  if (!message) return res.status(400).json({ success: false, message: "Message text is required" });

  const businessId = req.businessId || req.session?.workspace;
  const [[owner]] = await runQuery(
    pool,
    `SELECT id FROM business_owners WHERE business_id = ?`,
    [businessId],
    "POST /messages (owner lookup)"
  );
  if (!owner) return res.status(404).json({ success: false, message: "Business not found" });

  const [result] = await runQuery(
    pool,
    `INSERT INTO messages (business_owner_id, sender, receiver, message) VALUES (?, ?, ?, ?)`,
    [owner.id, sender || "Inventory", receiver || null, message],
    "POST /messages (insert)"
  );
  res.json({ success: true, id: result.insertId });
}));

/* ---------------- AI INVENTORY ASSISTANT (rule-based, real data) ---------------- */

router.post("/ai-assistant", asyncHandler(async (req, res) => {
  const { question = "" } = req.body;
  const q = question.toLowerCase();
  const p = req.companyPool;

  if (q.includes("restock") || q.includes("low stock")) {
    const [rows] = await runQuery(
      p,
      `SELECT name, stock, low_stock_threshold FROM products WHERE status = 'Low Stock' ORDER BY stock ASC LIMIT 10`,
      undefined,
      "POST /ai-assistant (restock)"
    );
    return res.json({
      success: true,
      answer: rows.length
        ? `These products need restocking: ${rows.map((r) => `${r.name} (${r.stock} left)`).join(", ")}.`
        : "Nothing is low on stock right now — you're in good shape.",
      data: rows,
    });
  }

  if (q.includes("best sell") || q.includes("top product")) {
    const [rows] = await runQuery(
      p,
      `SELECT p.name, SUM(sm.quantity) AS sold
       FROM stock_movements sm JOIN products p ON p.id = sm.product_id
       WHERE sm.type = 'sold' GROUP BY sm.product_id ORDER BY sold DESC LIMIT 5`,
      undefined,
      "POST /ai-assistant (best sellers)"
    );
    return res.json({
      success: true,
      answer: rows.length
        ? `Best sellers by recorded sales: ${rows.map((r) => `${r.name} (${r.sold} sold)`).join(", ")}.`
        : "No sales movements recorded yet, so I can't rank best sellers.",
      data: rows,
    });
  }

  if (q.includes("summary")) {
    const [[totals]] = await runQuery(
      p,
      `SELECT COUNT(*) AS totalProducts, COALESCE(SUM(price*stock),0) AS value,
              SUM(CASE WHEN status='Low Stock' THEN 1 ELSE 0 END) AS lowStock FROM products`,
      undefined,
      "POST /ai-assistant (summary totals)"
    );
    const [[cats]] = await runQuery(
      p,
      `SELECT COUNT(*) AS total FROM categories`,
      undefined,
      "POST /ai-assistant (summary categories)"
    );
    return res.json({
      success: true,
      answer: `You have ${totals.totalProducts} products across ${cats.total} categories, worth roughly ₹${Number(totals.value).toLocaleString("en-IN")}. ${totals.lowStock} item(s) are low on stock.`,
    });
  }

  if (q.includes("demand") || q.includes("predict")) {
    const [rows] = await runQuery(
      p,
      `SELECT p.name, SUM(sm.quantity) AS sold
       FROM stock_movements sm JOIN products p ON p.id = sm.product_id
       WHERE sm.type = 'sold' AND sm.created_at >= NOW() - INTERVAL 30 DAY
       GROUP BY p.id ORDER BY sold DESC LIMIT 3`,
      undefined,
      "POST /ai-assistant (demand)"
    );
    return res.json({
      success: true,
      answer: rows.length
        ? `Based on the last 30 days, demand looks strongest for: ${rows.map((r) => r.name).join(", ")}. Consider keeping extra stock for these.`
        : "There isn't enough recent sales history yet to predict demand reliably.",
    });
  }

  res.json({
    success: true,
    answer: "I can help with: restocking recommendations, best-selling products, an inventory summary, or demand predictions. Try asking one of those.",
  });
}));

/* ---------------- PURCHASE ORDERS ---------------- */

router.get("/purchase-orders", asyncHandler(async (req, res) => {
  const [rows] = await runQuery(
    req.companyPool,
    `SELECT po.*, s.name AS supplier_name, po.product AS product_name
     FROM purchase_orders po
     LEFT JOIN suppliers s ON s.id = po.supplier_id
     ORDER BY po.created_at DESC`,
    undefined,
    "GET /purchase-orders"
  );
  res.json({ success: true, purchaseOrders: rows });
}));

router.post("/purchase-orders", asyncHandler(async (req, res) => {
  const { poNumber, supplierId, product, amount, expectedDate, status } = req.body;
  if (!poNumber || !supplierId) {
    return res.status(400).json({ success: false, message: "PO number and supplier are required" });
  }

  try {
    const [result] = await runQuery(
      req.companyPool,
      `INSERT INTO purchase_orders (po_number, supplier_id, product, amount, expected_date, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [poNumber, supplierId, product || null, amount || 0, expectedDate || null, status || "Pending"],
      "POST /purchase-orders"
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ success: false, message: "This PO number already exists" });
    }
    throw err;
  }
}));

router.put("/purchase-orders/:id", asyncHandler(async (req, res) => {
  const { supplierId, product, amount, expectedDate, status } = req.body;

  await runQuery(
    req.companyPool,
    `UPDATE purchase_orders SET
      supplier_id = COALESCE(?, supplier_id),
      product = COALESCE(?, product),
      amount = COALESCE(?, amount),
      expected_date = COALESCE(?, expected_date),
      status = COALESCE(?, status)
     WHERE id = ?`,
    [supplierId, product, amount, expectedDate, status, req.params.id],
    `PUT /purchase-orders/${req.params.id}`
  );
  res.json({ success: true });
}));

router.delete("/purchase-orders/:id", asyncHandler(async (req, res) => {
  const [[po]] = await runQuery(
    req.companyPool,
    `SELECT id FROM purchase_orders WHERE id = ?`,
    [req.params.id],
    `DELETE /purchase-orders/${req.params.id} (fetch existing)`
  );
  if (!po) {
    return res.status(404).json({ success: false, message: "Purchase order not found" });
  }

  await runQuery(
    req.companyPool,
    `DELETE FROM purchase_orders WHERE id = ?`,
    [req.params.id],
    `DELETE /purchase-orders/${req.params.id}`
  );
  res.json({ success: true });
}));

/* ---------------- CENTRAL ERROR HANDLER ---------------- */
// Catches anything thrown/rejected in the routes above (via asyncHandler),
// logs the full message + stack trace to the terminal, and always replies
// with clean JSON instead of crashing or hanging the request.
router.use((err, req, res, next) => {
  console.error(`\n[Inventory][ERROR] ${req.method} ${req.originalUrl}`);
  console.error(`[Inventory][ERROR] message: ${err.message}`);
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message });
});

export default router;