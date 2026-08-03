// employee.js
//
// employee_id used across attendance / leave_requests / payslips / tasks /
// schedule_events IS the HR module's employees.id (see dbEmployee.js ->
// upsertProfileFromHrRow). There is only one canonical employee ID.
//
// Sections:
//   1. Profile (auto-provisioned + kept in sync with HR)  -> /profile
//   2. Attendance (check-in / check-out / history)         -> /attendance
//   3. Leave requests (stored with employee_id)            -> /leave-requests
//   4. Salary & Payslips (live basic salary from HR)       -> /payslips
//   5. Tasks                                               -> /tasks
//   6. Schedule                                            -> /schedule
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  getCompanyEmployeePool,
  getOrCreateEmployeeProfile,
  ensureEmployeeProfileById,
  getLiveBasicSalary,
} from "../dbEmployee.js";

const router = express.Router();

// ============================================================
// Multer setup for profile photo uploads
// ============================================================
const uploadDir = path.join(process.cwd(), "uploads", "profile-images");
fs.mkdirSync(uploadDir, { recursive: true });
console.log(`[employee.js] Profile image upload directory ready: ${uploadDir}`);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log(`[employee.js] Multer destination() called for file: ${file.originalname}`);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const filename = `emp-${Date.now()}${path.extname(file.originalname)}`;
    console.log(`[employee.js] Multer generated filename: ${filename}`);
    cb(null, filename);
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// ============================================================
// Helper: parse a "salary" string (e.g. "50000", "50,000", "₹50,000")
// into a clean number to compute payslips from.
// ============================================================
function parseBasicSalary(rawSalary) {
  if (rawSalary === null || rawSalary === undefined) return 0;
  const cleaned = String(rawSalary).replace(/[^0-9.]/g, "");
  const value = parseFloat(cleaned);
  return Number.isFinite(value) ? value : 0;
}

// ============================================================
// 1. PROFILE
// ============================================================

// ---- GET /api/employee/:businessId/profile ----
// Auto-provisions (and refreshes) employee_profile from the HR module's
// `employees` table, matched by the logged-in session user's email.
// employee_profile.id is set to equal the HR employees.id.
router.get("/:businessId/profile", async (req, res) => {
  console.log("\n=== GET /api/employee/:businessId/profile ===");
  try {
    const { businessId } = req.params;
    console.log("[employee.js] businessId param:", businessId);
    console.log("[employee.js] req.session.user:", req.session?.user);

    if (!req.session?.user?.id) {
      console.warn("[employee.js] ⚠️ No session user found -> returning 401");
      return res.status(401).json({ success: false, message: "Not logged in." });
    }

    const sessionUser = req.session.user;
    console.log(`[employee.js] Resolving profile for sessionUser:`, sessionUser);

    const profile = await getOrCreateEmployeeProfile(businessId, sessionUser);
    console.log("[employee.js] ✅ Profile resolved (id = HR employees.id):", profile);

    return res.json({ success: true, profile });
  } catch (err) {
    console.error("[employee.js] ❌ GET /api/employee/:businessId/profile error:", err);
    return res.status(500).json({ success: false, message: err.message || "Server error while fetching profile." });
  }
});

// ---- PUT /api/employee/:businessId/profile/:id ----
// :id is the employee_profile.id, which equals the HR employees.id.
router.put("/:businessId/profile/:id", async (req, res) => {
  console.log("\n=== PUT /api/employee/:businessId/profile/:id ===");
  try {
    const { businessId, id } = req.params;
    const { name, email, department, designation, manager, joiningDate, salary, profileImage, leaveBalance } = req.body;

    console.log("[employee.js] businessId:", businessId, "| profile id:", id);
    console.log("[employee.js] Update body received:", req.body);

    const companyPool = await getCompanyEmployeePool(businessId);

    const fields = [];
    const values = [];

    if (name !== undefined) { fields.push("name = ?"); values.push(name); }
    if (email !== undefined) { fields.push("email = ?"); values.push(email); }
    if (department !== undefined) { fields.push("department = ?"); values.push(department); }
    if (designation !== undefined) { fields.push("designation = ?"); values.push(designation); }
    if (manager !== undefined) { fields.push("manager = ?"); values.push(manager); }
    if (joiningDate !== undefined) { fields.push("joining_date = ?"); values.push(joiningDate); }
    if (salary !== undefined) { fields.push("salary = ?"); values.push(salary); }
    if (profileImage !== undefined) { fields.push("profile_image = ?"); values.push(profileImage); }
    if (leaveBalance !== undefined) { fields.push("leave_balance = ?"); values.push(leaveBalance); }

    console.log("[employee.js] Fields to update:", fields);

    if (fields.length === 0) {
      console.warn("[employee.js] ⚠️ No fields provided to update -> returning 400");
      return res.status(400).json({ success: false, message: "No fields provided to update." });
    }

    values.push(id);

    const sql = `UPDATE employee_profile SET ${fields.join(", ")} WHERE id = ?`;
    console.log("[employee.js] Running SQL:", sql, "| values:", values);

    const [result] = await companyPool.query(sql, values);
    console.log("[employee.js] Update result. Affected rows:", result.affectedRows);

    if (result.affectedRows === 0) {
      console.warn(`[employee.js] ⚠️ No profile found with id=${id} -> returning 404`);
      return res.status(404).json({ success: false, message: "Employee profile not found." });
    }

    console.log("[employee.js] ✅ Profile updated successfully.");
    return res.json({ success: true, message: "Profile updated successfully." });
  } catch (err) {
    console.error("[employee.js] ❌ PUT /api/employee/:businessId/profile/:id error:", err);
    return res.status(500).json({ success: false, message: "Server error while updating profile." });
  }
});

// ---- POST /api/employee/:businessId/profile/:id/photo ----
// Body: multipart/form-data with field name "photo"
router.post("/:businessId/profile/:id/photo", upload.single("photo"), async (req, res) => {
  console.log("\n=== POST /api/employee/:businessId/profile/:id/photo ===");
  try {
    const { businessId, id } = req.params;
    console.log("[employee.js] businessId:", businessId, "| profile id:", id);
    console.log("[employee.js] req.file:", req.file);

    if (!req.file) {
      console.warn("[employee.js] ⚠️ No file uploaded -> returning 400");
      return res.status(400).json({ success: false, message: "No photo uploaded." });
    }

    const imageUrl = `/uploads/profile-images/${req.file.filename}`;
    console.log("[employee.js] Generated image URL:", imageUrl);

    const companyPool = await getCompanyEmployeePool(businessId);

    const [result] = await companyPool.query(
      `UPDATE employee_profile SET profile_image = ? WHERE id = ?`,
      [imageUrl, id]
    );
    console.log("[employee.js] Update result. Affected rows:", result.affectedRows);

    if (result.affectedRows === 0) {
      console.warn(`[employee.js] ⚠️ No profile found with id=${id} -> returning 404`);
      return res.status(404).json({ success: false, message: "Employee profile not found." });
    }

    console.log("[employee.js] ✅ Profile photo updated:", imageUrl);
    return res.json({ success: true, profileImage: imageUrl });
  } catch (err) {
    console.error("[employee.js] ❌ POST photo upload error:", err);
    return res.status(500).json({ success: false, message: "Server error while uploading photo." });
  }
});

// ============================================================
// 2. ATTENDANCE
//    Backend is fully functional. The Employee.tsx frontend currently
//    only RENDERS attendance history — it has no Check-In / Check-Out
//    buttons wired to these two endpoints yet. See the note + snippet
//    at the end of this response for the missing frontend piece.
// ============================================================

// ---- GET /api/employee/:businessId/attendance?employeeId=5 ----
router.get("/:businessId/attendance", async (req, res) => {
  console.log("\n=== GET /api/employee/:businessId/attendance ===");
  try {
    const { businessId } = req.params;
    const { employeeId } = req.query;
    console.log("[employee.js] businessId:", businessId, "| employeeId:", employeeId);

    const companyPool = await getCompanyEmployeePool(businessId);

    let query = `SELECT id, employee_id, date, check_in, check_out, status FROM attendance`;
    const params = [];

    if (employeeId) {
      query += ` WHERE employee_id = ?`;
      params.push(employeeId);
    }

    query += ` ORDER BY date DESC`;
    console.log("[employee.js] Running SQL:", query, "| params:", params);

    const [rows] = await companyPool.query(query, params);
    console.log(`[employee.js] ✅ Fetched ${rows.length} attendance record(s).`);

    return res.json({ success: true, attendance: rows });
  } catch (err) {
    console.error("[employee.js] ❌ GET /api/employee/:businessId/attendance error:", err);
    return res.status(500).json({ success: false, message: "Server error while fetching attendance." });
  }
});

// ---- POST /api/employee/:businessId/attendance/check-in ----
// Body: { employeeId } — employeeId is the HR employees.id.
// Prevents duplicate check-ins for the same employee on the same day.
router.post("/:businessId/attendance/check-in", async (req, res) => {
  console.log("\n=== POST /api/employee/:businessId/attendance/check-in ===");
  try {
    const { businessId } = req.params;
    const { employeeId } = req.body;
    console.log("[employee.js] businessId:", businessId, "| employeeId:", employeeId);

    if (!employeeId) {
      console.warn("[employee.js] ⚠️ employeeId missing -> returning 400");
      return res.status(400).json({ success: false, message: "employeeId is required." });
    }

    // Make sure a profile row exists for this HR employee id before we
    // try to insert an attendance row that FK-references it.
    await ensureEmployeeProfileById(businessId, employeeId);

    const companyPool = await getCompanyEmployeePool(businessId);

    // Guard against double check-in on the same date
    const [already] = await companyPool.query(
      `SELECT id FROM attendance WHERE employee_id = ? AND date = CURDATE() LIMIT 1`,
      [employeeId]
    );
    console.log("[employee.js] Existing attendance row for today:", already);

    if (already.length > 0) {
      console.warn("[employee.js] ⚠️ Already checked in today -> returning 400");
      return res.status(400).json({ success: false, message: "Already checked in today.", id: already[0].id });
    }

    const [result] = await companyPool.query(
      `INSERT INTO attendance (employee_id, date, check_in, status)
       VALUES (?, CURDATE(), NOW(), 'Present')`,
      [employeeId]
    );

    console.log(`[employee.js] ✅ Checked in. New attendance id: ${result.insertId}`);
    return res.json({ success: true, message: "Checked in.", id: result.insertId });
  } catch (err) {
    console.error("[employee.js] ❌ POST /api/employee/:businessId/attendance/check-in error:", err);
    return res.status(500).json({ success: false, message: err.message || "Server error during check-in." });
  }
});

// ---- POST /api/employee/:businessId/attendance/check-out ----
// Body: { attendanceId }
router.post("/:businessId/attendance/check-out", async (req, res) => {
  console.log("\n=== POST /api/employee/:businessId/attendance/check-out ===");
  try {
    const { businessId } = req.params;
    const { attendanceId } = req.body;
    console.log("[employee.js] businessId:", businessId, "| attendanceId:", attendanceId);

    if (!attendanceId) {
      console.warn("[employee.js] ⚠️ attendanceId missing -> returning 400");
      return res.status(400).json({ success: false, message: "attendanceId is required." });
    }

    const companyPool = await getCompanyEmployeePool(businessId);

    const [result] = await companyPool.query(
      `UPDATE attendance SET check_out = NOW() WHERE id = ?`,
      [attendanceId]
    );

    console.log("[employee.js] Update result. Affected rows:", result.affectedRows);

    if (result.affectedRows === 0) {
      console.warn(`[employee.js] ⚠️ No attendance record found with id=${attendanceId} -> returning 404`);
      return res.status(404).json({ success: false, message: "Attendance record not found." });
    }

    console.log("[employee.js] ✅ Checked out successfully.");
    return res.json({ success: true, message: "Checked out." });
  } catch (err) {
    console.error("[employee.js] ❌ POST /api/employee/:businessId/attendance/check-out error:", err);
    return res.status(500).json({ success: false, message: "Server error during check-out." });
  }
});

// ============================================================
// 3. LEAVE REQUESTS (stored with employee_id = HR employees.id)
// ============================================================

// ---- GET /api/employee/:businessId/leave-requests?employeeId=5 ----
router.get("/:businessId/leave-requests", async (req, res) => {
  console.log("\n=== GET /api/employee/:businessId/leave-requests ===");
  try {
    const { businessId } = req.params;
    const { employeeId } = req.query;
    console.log("[employee.js] businessId:", businessId, "| employeeId:", employeeId);

    const companyPool = await getCompanyEmployeePool(businessId);

    let query = `SELECT id, employee_id, leave_type, duration, start_date, end_date, reason, status, created_at
                  FROM leave_requests`;
    const params = [];

    if (employeeId) {
      query += ` WHERE employee_id = ?`;
      params.push(employeeId);
    }

    query += ` ORDER BY created_at DESC`;
    console.log("[employee.js] Running SQL:", query, "| params:", params);

    const [rows] = await companyPool.query(query, params);
    console.log(`[employee.js] ✅ Fetched ${rows.length} leave request(s).`);

    return res.json({ success: true, leaveRequests: rows });
  } catch (err) {
    console.error("[employee.js] ❌ GET /api/employee/:businessId/leave-requests error:", err);
    return res.status(500).json({ success: false, message: "Server error while fetching leave requests." });
  }
});

// ---- POST /api/employee/:businessId/leave-requests ----
// Body: { employeeId, leaveType, duration, startDate, endDate, reason }
// employeeId (the HR employees.id) is REQUIRED — this is what ties the
// leave request to the employee via the employee_id FOREIGN KEY.
router.post("/:businessId/leave-requests", async (req, res) => {
  console.log("\n=== POST /api/employee/:businessId/leave-requests ===");
  try {
    const { businessId } = req.params;
    const { employeeId, leaveType, duration, startDate, endDate, reason } = req.body;
    console.log("[employee.js] businessId:", businessId, "| body:", req.body);

    if (!employeeId) {
      console.warn("[employee.js] ⚠️ employeeId missing -> returning 400");
      return res.status(400).json({ success: false, message: "employeeId is required." });
    }
    if (!startDate || !endDate) {
      console.warn("[employee.js] ⚠️ startDate/endDate missing -> returning 400");
      return res.status(400).json({ success: false, message: "startDate and endDate are required." });
    }

    // Auto-provision the profile row if this is the employee's very first
    // action in the system (avoids FK failure on the insert below).
    await ensureEmployeeProfileById(businessId, employeeId);

    const companyPool = await getCompanyEmployeePool(businessId);

    console.log(`[employee.js] Inserting leave request for employee_id=${employeeId}`);
    const [result] = await companyPool.query(
      `INSERT INTO leave_requests (employee_id, leave_type, duration, start_date, end_date, reason, status)
       VALUES (?, ?, ?, ?, ?, ?, 'Pending')`,
      [employeeId, leaveType || "Casual Leave", duration || "Full Day", startDate, endDate, reason?.trim() || null]
    );

    console.log(`[employee.js] ✅ Leave request submitted for employee_id=${employeeId}. New id: ${result.insertId}`);
    return res.json({ success: true, message: "Leave request submitted.", id: result.insertId });
  } catch (err) {
    console.error("[employee.js] ❌ POST /api/employee/:businessId/leave-requests error:", err);
    return res.status(500).json({ success: false, message: err.message || "Server error while submitting leave request." });
  }
});

// ============================================================
// 4. SALARY & PAYSLIPS
//    Payslips read the BASIC SALARY live from the HR `employees` table
//    every time a payslip is generated — not a cached copy — so a raise
//    entered in HR shows up on the very next payslip automatically.
//    Default deduction policy (override with `deductions` in body):
//      - Provident Fund (PF): 12% of basic salary
//      - Professional Tax:   flat ₹200
// ============================================================

// ---- GET /api/employee/:businessId/payslips?employeeId=5 ----
router.get("/:businessId/payslips", async (req, res) => {
  console.log("\n=== GET /api/employee/:businessId/payslips ===");
  try {
    const { businessId } = req.params;
    const { employeeId } = req.query;
    console.log("[employee.js] businessId:", businessId, "| employeeId:", employeeId);

    const companyPool = await getCompanyEmployeePool(businessId);

    let query = `SELECT id, employee_id, month, gross, deductions, net_salary, status, created_at FROM payslips`;
    const params = [];

    if (employeeId) {
      query += ` WHERE employee_id = ?`;
      params.push(employeeId);
    }

    query += ` ORDER BY created_at DESC`;
    console.log("[employee.js] Running SQL:", query, "| params:", params);

    const [rows] = await companyPool.query(query, params);
    console.log(`[employee.js] ✅ Fetched ${rows.length} payslip(s).`);

    return res.json({ success: true, payslips: rows });
  } catch (err) {
    console.error("[employee.js] ❌ GET /api/employee/:businessId/payslips error:", err);
    return res.status(500).json({ success: false, message: "Server error while fetching payslips." });
  }
});

// ---- POST /api/employee/:businessId/payslips/generate ----
// Body: { employeeId, month, deductions? }
// employeeId is the HR employees.id. Reads the LIVE basic salary from
// the HR employees table (not employee_profile) and computes the
// payslip from that.
router.post("/:businessId/payslips/generate", async (req, res) => {
  console.log("\n=== POST /api/employee/:businessId/payslips/generate ===");
  try {
    const { businessId } = req.params;
    const { employeeId, month, deductions: customDeductions } = req.body;
    console.log("[employee.js] businessId:", businessId, "| body:", req.body);

    if (!employeeId) {
      console.warn("[employee.js] ⚠️ employeeId missing -> returning 400");
      return res.status(400).json({ success: false, message: "employeeId is required." });
    }
    if (!month || !month.trim()) {
      console.warn("[employee.js] ⚠️ month missing -> returning 400");
      return res.status(400).json({ success: false, message: "month is required (e.g. 'July 2026')." });
    }

    // 1. Get the LIVE basic salary straight from HR's employees table
    const hrEmployee = await getLiveBasicSalary(businessId, employeeId);
    console.log(`[employee.js] Live HR record for employee:`, hrEmployee);

    const basicSalary = parseBasicSalary(hrEmployee.salary);
    console.log(`[employee.js] Parsed basic salary for ${hrEmployee.name}: ₹${basicSalary}`);

    if (basicSalary <= 0) {
      console.warn("[employee.js] ⚠️ Basic salary is 0 or not set in HR -> returning 400");
      return res.status(400).json({
        success: false,
        message: "This employee has no basic salary set in HR. Ask HR to set it first.",
      });
    }

    // 2. Make sure employee_profile exists (auto-provision if this is the
    //    employee's first ever record in the system).
    await ensureEmployeeProfileById(businessId, employeeId);

    const companyPool = await getCompanyEmployeePool(businessId);

    // 3. Prevent duplicate payslip generation for the same employee + month
    const [existingSlip] = await companyPool.query(
      `SELECT id FROM payslips WHERE employee_id = ? AND month = ? LIMIT 1`,
      [employeeId, month.trim()]
    );
    console.log("[employee.js] Existing payslip check:", existingSlip);

    if (existingSlip.length > 0) {
      console.warn(`[employee.js] ⚠️ Payslip already exists for employee_id=${employeeId}, month=${month} -> returning 400`);
      return res.status(400).json({
        success: false,
        message: `A payslip for ${month.trim()} already exists for this employee.`,
        id: existingSlip[0].id,
      });
    }

    // 4. Compute gross + deductions
    const gross = basicSalary;
    let deductions;
    if (customDeductions !== undefined && customDeductions !== null && customDeductions !== "") {
      deductions = parseFloat(customDeductions) || 0;
      console.log(`[employee.js] Using custom deductions override: ₹${deductions}`);
    } else {
      const providentFund = basicSalary * 0.12; // 12% PF
      const professionalTax = 200; // flat
      deductions = Math.round((providentFund + professionalTax) * 100) / 100;
      console.log(
        `[employee.js] Computed default deductions -> PF (12%): ₹${providentFund.toFixed(2)}, ` +
        `Professional Tax: ₹${professionalTax}, Total: ₹${deductions}`
      );
    }

    console.log(`[employee.js] Inserting payslip: gross=₹${gross}, deductions=₹${deductions}`);

    const [result] = await companyPool.query(
      `INSERT INTO payslips (employee_id, month, gross, deductions, status)
       VALUES (?, ?, ?, ?, 'Pending')`,
      [employeeId, month.trim(), gross, deductions]
    );

    const [newSlip] = await companyPool.query(
      `SELECT id, employee_id, month, gross, deductions, net_salary, status, created_at
       FROM payslips WHERE id = ?`,
      [result.insertId]
    );

    console.log(`[employee.js] ✅ Payslip generated:`, newSlip[0]);
    return res.json({ success: true, message: "Payslip generated.", payslip: newSlip[0] });
  } catch (err) {
    console.error("[employee.js] ❌ POST /api/employee/:businessId/payslips/generate error:", err);
    return res.status(500).json({ success: false, message: err.message || "Server error while generating payslip." });
  }
});

// ---- PATCH /api/employee/:businessId/payslips/:id ----
// Body: { status } — e.g. mark a payslip 'Paid' once processed
router.patch("/:businessId/payslips/:id", async (req, res) => {
  console.log("\n=== PATCH /api/employee/:businessId/payslips/:id ===");
  try {
    const { businessId, id } = req.params;
    const { status } = req.body;
    console.log("[employee.js] businessId:", businessId, "| payslip id:", id, "| new status:", status);

    if (!status || !["Pending", "Paid"].includes(status)) {
      console.warn("[employee.js] ⚠️ Invalid status -> returning 400");
      return res.status(400).json({ success: false, message: "status must be 'Pending' or 'Paid'." });
    }

    const companyPool = await getCompanyEmployeePool(businessId);

    const [result] = await companyPool.query(
      `UPDATE payslips SET status = ? WHERE id = ?`,
      [status, id]
    );
    console.log("[employee.js] Update result. Affected rows:", result.affectedRows);

    if (result.affectedRows === 0) {
      console.warn(`[employee.js] ⚠️ No payslip found with id=${id} -> returning 404`);
      return res.status(404).json({ success: false, message: "Payslip not found." });
    }

    console.log("[employee.js] ✅ Payslip status updated.");
    return res.json({ success: true, message: "Payslip updated." });
  } catch (err) {
    console.error("[employee.js] ❌ PATCH /api/employee/:businessId/payslips/:id error:", err);
    return res.status(500).json({ success: false, message: "Server error while updating payslip." });
  }
});

// ============================================================
// 5. TASKS
// ============================================================

// ---- GET /api/employee/:businessId/tasks?employeeId=5 ----
router.get("/:businessId/tasks", async (req, res) => {
  console.log("\n=== GET /api/employee/:businessId/tasks ===");
  try {
    const { businessId } = req.params;
    const { employeeId } = req.query;
    console.log("[employee.js] businessId:", businessId, "| employeeId:", employeeId);

    const companyPool = await getCompanyEmployeePool(businessId);

    let query = `SELECT id, employee_id, title, status, due_date, created_at FROM tasks`;
    const params = [];

    if (employeeId) {
      query += ` WHERE employee_id = ?`;
      params.push(employeeId);
    }

    query += ` ORDER BY created_at DESC`;
    console.log("[employee.js] Running SQL:", query, "| params:", params);

    const [rows] = await companyPool.query(query, params);
    console.log(`[employee.js] ✅ Fetched ${rows.length} task(s).`);

    return res.json({ success: true, tasks: rows });
  } catch (err) {
    console.error("[employee.js] ❌ GET /api/employee/:businessId/tasks error:", err);
    return res.status(500).json({ success: false, message: "Server error while fetching tasks." });
  }
});

// ---- POST /api/employee/:businessId/tasks ----
// Body: { employeeId, title, dueDate }
router.post("/:businessId/tasks", async (req, res) => {
  console.log("\n=== POST /api/employee/:businessId/tasks ===");
  try {
    const { businessId } = req.params;
    const { employeeId, title, dueDate } = req.body;
    console.log("[employee.js] businessId:", businessId, "| body:", req.body);

    if (!employeeId) {
      console.warn("[employee.js] ⚠️ employeeId missing -> returning 400");
      return res.status(400).json({ success: false, message: "employeeId is required." });
    }
    if (!title || !title.trim()) {
      console.warn("[employee.js] ⚠️ title missing/blank -> returning 400");
      return res.status(400).json({ success: false, message: "Task title is required." });
    }

    await ensureEmployeeProfileById(businessId, employeeId);

    const companyPool = await getCompanyEmployeePool(businessId);

    const [result] = await companyPool.query(
      `INSERT INTO tasks (employee_id, title, status, due_date)
       VALUES (?, ?, 'Pending', ?)`,
      [employeeId, title.trim(), dueDate || null]
    );

    console.log(`[employee.js] ✅ Task added. New id: ${result.insertId}`);
    return res.json({ success: true, message: "Task added.", id: result.insertId });
  } catch (err) {
    console.error("[employee.js] ❌ POST /api/employee/:businessId/tasks error:", err);
    return res.status(500).json({ success: false, message: err.message || "Server error while adding task." });
  }
});

// ---- PATCH /api/employee/:businessId/tasks/:id ----
// Body: { status } — 'Pending' | 'Completed'
router.patch("/:businessId/tasks/:id", async (req, res) => {
  console.log("\n=== PATCH /api/employee/:businessId/tasks/:id ===");
  try {
    const { businessId, id } = req.params;
    const { status } = req.body;
    console.log("[employee.js] businessId:", businessId, "| task id:", id, "| new status:", status);

    if (!status || !["Pending", "Completed"].includes(status)) {
      console.warn("[employee.js] ⚠️ Invalid status -> returning 400");
      return res.status(400).json({ success: false, message: "status must be 'Pending' or 'Completed'." });
    }

    const companyPool = await getCompanyEmployeePool(businessId);

    const [result] = await companyPool.query(
      `UPDATE tasks SET status = ? WHERE id = ?`,
      [status, id]
    );
    console.log("[employee.js] Update result. Affected rows:", result.affectedRows);

    if (result.affectedRows === 0) {
      console.warn(`[employee.js] ⚠️ No task found with id=${id} -> returning 404`);
      return res.status(404).json({ success: false, message: "Task not found." });
    }

    console.log("[employee.js] ✅ Task updated successfully.");
    return res.json({ success: true, message: "Task updated." });
  } catch (err) {
    console.error("[employee.js] ❌ PATCH /api/employee/:businessId/tasks/:id error:", err);
    return res.status(500).json({ success: false, message: "Server error while updating task." });
  }
});

// ============================================================
// 6. SCHEDULE
// ============================================================

// ---- GET /api/employee/:businessId/schedule?employeeId=5 ----
router.get("/:businessId/schedule", async (req, res) => {
  console.log("\n=== GET /api/employee/:businessId/schedule ===");
  try {
    const { businessId } = req.params;
    const { employeeId } = req.query;
    console.log("[employee.js] businessId:", businessId, "| employeeId:", employeeId);

    const companyPool = await getCompanyEmployeePool(businessId);

    let query = `SELECT id, employee_id, title, event_date, event_time, created_at FROM schedule_events`;
    const params = [];

    if (employeeId) {
      query += ` WHERE employee_id = ?`;
      params.push(employeeId);
    }

    query += ` ORDER BY event_date ASC, event_time ASC`;
    console.log("[employee.js] Running SQL:", query, "| params:", params);

    const [rows] = await companyPool.query(query, params);
    console.log(`[employee.js] ✅ Fetched ${rows.length} schedule event(s).`);

    return res.json({ success: true, events: rows });
  } catch (err) {
    console.error("[employee.js] ❌ GET /api/employee/:businessId/schedule error:", err);
    return res.status(500).json({ success: false, message: "Server error while fetching schedule." });
  }
});

// ---- POST /api/employee/:businessId/schedule ----
// Body: { employeeId, title, eventDate, eventTime }
router.post("/:businessId/schedule", async (req, res) => {
  console.log("\n=== POST /api/employee/:businessId/schedule ===");
  try {
    const { businessId } = req.params;
    const { employeeId, title, eventDate, eventTime } = req.body;
    console.log("[employee.js] businessId:", businessId, "| body:", req.body);

    if (!employeeId) {
      console.warn("[employee.js] ⚠️ employeeId missing -> returning 400");
      return res.status(400).json({ success: false, message: "employeeId is required." });
    }
    if (!title || !title.trim()) {
      console.warn("[employee.js] ⚠️ title missing/blank -> returning 400");
      return res.status(400).json({ success: false, message: "Event title is required." });
    }
    if (!eventDate) {
      console.warn("[employee.js] ⚠️ eventDate missing -> returning 400");
      return res.status(400).json({ success: false, message: "eventDate is required." });
    }

    await ensureEmployeeProfileById(businessId, employeeId);

    const companyPool = await getCompanyEmployeePool(businessId);

    const [result] = await companyPool.query(
      `INSERT INTO schedule_events (employee_id, title, event_date, event_time)
       VALUES (?, ?, ?, ?)`,
      [employeeId, title.trim(), eventDate, eventTime?.trim() || null]
    );

    console.log(`[employee.js] ✅ Event added. New id: ${result.insertId}`);
    return res.json({ success: true, message: "Event added.", id: result.insertId });
  } catch (err) {
    console.error("[employee.js] ❌ POST /api/employee/:businessId/schedule error:", err);
    return res.status(500).json({ success: false, message: err.message || "Server error while adding event." });
  }
});

export default router;