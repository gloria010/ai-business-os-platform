

// search.js
import express from "express";
import pool from "../../db.js"; // shared `business` DB
import { getPoolForDbName } from "../../DbInventory.js";
 
const router = express.Router();
 
// Same helper as in products.js — only companies with an approved
// 'inventory' department are searchable (business_departments rows only
// exist after admin approval, see register.js).
async function getAllInventoryCompanies() {
  const [rows] = await pool.query(
    `SELECT bo.business_id, bo.company, bd.db_name
     FROM business_departments bd
     INNER JOIN business_owners bo ON bo.id = bd.owner_id
     WHERE bd.department = 'inventory'`
  );
  return rows;
}
 
/* ---------------- GET /api/user/search?q=... ----------------
   Public search: products (across every registered company's inventory
   DB) + businesses (from the shared business_owners table). */
router.get("/search", async (req, res) => {
  const q = (req.query.q || "").toString().trim();
 
  if (!q) {
    return res.json({ success: true, products: [], businesses: [] });
  }
 
  const like = `%${q}%`;
 
  try {
    const [products, businesses] = await Promise.all([
      searchProducts(like),
      searchBusinesses(like),
    ]);
 
    res.json({ success: true, products, businesses });
  } catch (err) {
    console.error("[Search] Failed:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});
 
// --- products: same shape as GET /api/user/products in products.js,
// just filtered with a WHERE instead of pulling every row. ---
async function searchProducts(like) {
  const companies = await getAllInventoryCompanies();
  const results = [];
 
  for (const { business_id, company, db_name } of companies) {
    try {
      const companyPool = await getPoolForDbName(db_name);
      const [rows] = await companyPool.query(
        `SELECT p.id, p.name, p.sku, p.price, p.stock, p.status,
                p.image_path, p.created_at,
                c.id AS category_id, c.name AS category
         FROM products p
         JOIN categories c ON c.id = p.category_id
         WHERE p.name LIKE ? OR p.sku LIKE ? OR c.name LIKE ?`,
        [like, like, like]
      );
 
      for (const r of rows) {
        results.push({
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
      // One company's DB having an issue shouldn't break the whole search.
      console.error(
        `[Search] Failed to search products for ${company} (${db_name}):`,
        err.message
      );
    }
  }
 
  return results;
}
 
// --- businesses: pulled straight from business_owners (see register.js
// for the columns it inserts: business_id, company, business_category,
// pincode, subscription, company_password, status). We only surface
// businesses that have at least one approved department, so a business
// still in 'pending' status never shows up in public search — matching
// the "department DBs only exist after admin approval" rule. ---
async function searchBusinesses(like) {
  const [rows] = await pool.query(
    `SELECT DISTINCT bo.business_id, bo.company, bo.business_category, bo.pincode
     FROM business_owners bo
     INNER JOIN business_departments bd ON bd.owner_id = bo.id
     WHERE bo.company LIKE ? OR bo.business_category LIKE ?`,
    [like, like]
  );
 
  return rows.map((b) => ({
    id: b.business_id,
    name: b.company,
    category: b.business_category,
    pincode: b.pincode,
  }));
}
 
export default router;
 
