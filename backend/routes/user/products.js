import express from "express";
import pool from "../../db.js"; // shared `business` DB
import { getPoolForDbName } from "../../DbInventory.js";

const router = express.Router();

// getPoolForDbName (re-exported from DbInventory.js) already caches pools
// AND runs the full inventory schema + migrations before returning — so
// every company's products/categories/image_path columns are guaranteed
// to exist, even for companies whose dashboard has never been opened.

// Returns every company that has an approved inventory department.
// (business_departments rows only exist after admin approval — see register.js
// comment: "department databases are NOT created here anymore... only
// created once an admin approves this business owner".)
async function getAllInventoryCompanies() {
  const [rows] = await pool.query(
    `SELECT bo.business_id, bo.company, bd.db_name
     FROM business_departments bd
     INNER JOIN business_owners bo ON bo.id = bd.owner_id
     WHERE bd.department = 'inventory'`
  );
  return rows;
}

/* ---------------- GET /api/user/products ----------------
   Public storefront listing: products from every registered company. */
router.get("/products", async (req, res) => {
  try {
    const companies = await getAllInventoryCompanies();

    const allProducts = [];

    for (const { business_id, company, db_name } of companies) {
      try {
        const companyPool = await getPoolForDbName(db_name);
        const [rows] = await companyPool.query(
          `SELECT p.id, p.name, p.sku, p.price, p.stock, p.status,
                  p.image_path, p.created_at,
                  c.id AS category_id, c.name AS category
           FROM products p
           JOIN categories c ON c.id = p.category_id`
        );

        for (const r of rows) {
          allProducts.push({
            id: `${business_id}-${r.id}`, // globally unique across companies
            name: r.name,
            sku: r.sku,
            price: Number(r.price),
            stock: r.stock,
            status: r.status,
            image: r.image_path || null,
            categoryId: r.category_id,
            category: r.category,
            company,
            businessId: business_id,
            createdAt: r.created_at,
          });
        }
      } catch (err) {
        // One company's DB having an issue shouldn't break the whole listing.
        console.error(`[PublicProducts] Failed to read products for ${company} (${db_name}):`, err.message);
      }
    }

    res.json({ success: true, products: allProducts });
  } catch (err) {
    console.error("[PublicProducts] Failed:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ---------------- GET /api/user/products/:id ----------------
   :id is "<businessId>-<productId>" from the list above. */
router.get("/products/:id", async (req, res) => {
  try {
    const lastDash = req.params.id.lastIndexOf("-");
    const businessId = req.params.id.slice(0, lastDash);
    const productId = req.params.id.slice(lastDash + 1);
    if (!businessId || !productId) {
      return res.status(400).json({ success: false, message: "Invalid product id" });
    }

    const [[dept]] = await pool.query(
      `SELECT bd.db_name, bo.company
       FROM business_departments bd
       INNER JOIN business_owners bo ON bo.id = bd.owner_id
       WHERE bo.business_id = ? AND bd.department = 'inventory'
       LIMIT 1`,
      [businessId]
    );
    if (!dept) return res.status(404).json({ success: false, message: "Company not found" });

    const companyPool = await getPoolForDbName(dept.db_name);
    const [[row]] = await companyPool.query(
      `SELECT p.*, c.name AS category
       FROM products p
       JOIN categories c ON c.id = p.category_id
       WHERE p.id = ?`,
      [productId]
    );

    if (!row) return res.status(404).json({ success: false, message: "Product not found" });

    res.json({
      success: true,
      product: {
        id: req.params.id,
        name: row.name,
        sku: row.sku,
        price: Number(row.price),
        stock: row.stock,
        status: row.status,
        image: row.image_path || null,
        category: row.category,
        company: dept.company,
      },
    });
  } catch (err) {
    console.error("[PublicProducts] Failed:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;