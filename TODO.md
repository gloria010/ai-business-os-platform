# Inventory Schema Fix - Implementation TODO

## Goal
Add full inventory schema initialization to `backend/dbInventory.js` so all required tables exist when a company's inventory database pool is created.

## Steps

- [x] **Step 0**: Analyze codebase and create plan (Approach B approved)
- [x] **Step 1**: Edit `backend/dbInventory.js` - Added `INVENTORY_SCHEMA` SQL constant with all 7 tables
- [x] **Step 2**: Edited `backend/dbInventory.js` - Added `initInventorySchema(companyPool)` async function
- [x] **Step 3**: Edited `backend/dbInventory.js` - Made `getPoolFor()` async and calls `await initInventorySchema(companyPool)` before caching the pool
- [x] **Step 4 (FIX)**: Edited `backend/db.js` - Added `status VARCHAR(20) DEFAULT 'pending'` to `business_owners` schema + migration for existing databases

## Root Cause of 404 Errors

The inventory 404s were **not** caused by the missing inventory tables. They were caused by:
1. `business_owners` table was **missing the `status` column** in the schema
2. Admin approval (`UPDATE business_owners SET status = 'approved'`) silently failed — no rows matched
3. `createDepartmentDatabases()` never ran because it's gated behind successful approval
4. The inventory database never existed → `getCompanyInventoryPool()` threw 404

## Fixes Applied

| File | Change |
|------|--------|
| `backend/db.js` | Added `status VARCHAR(20) DEFAULT 'pending'` to `business_owners` CREATE TABLE + ALTER TABLE migration for existing databases |
| `backend/dbInventory.js` | Added full 7-table inventory schema auto-creation on first pool connection |


