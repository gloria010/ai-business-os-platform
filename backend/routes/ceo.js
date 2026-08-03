import express from "express";
import { getCompanyInventoryPool } from "../DbInventory.js";

const router = express.Router();

async function getBusinessId(req) {
  const fromSession = req.session?.workspace || req.session?.businessId;
  if (fromSession) return fromSession;

  if (req.query.business_id) return req.query.business_id;
  if (req.query.businessId) return req.query.businessId;

  return null;
}

router.get("/products", async (req, res) => {
  try {
    const businessId = await getBusinessId(req);

    if (!businessId) {
      return res.status(401).json({ success: false, message: "Business not identified" });
    }

    const companyPool = await getCompanyInventoryPool(businessId);
    const [rows] = await companyPool.query(`
      SELECT p.*, c.name AS category, w.name AS warehouseName
      FROM products p
      JOIN categories c ON c.id = p.category_id
      LEFT JOIN warehouses w ON w.id = p.warehouse_id
      ORDER BY p.created_at DESC
    `);

    return res.json({ success: true, products: rows });
  } catch (err) {
    console.error("CEO products error:", err);
    return res.status(500).json({ success: false, message: "Failed to load products" });
  }
});

export default router;

