// hr.js
import express from "express";
import { getCompanyHrPool } from "../dbHr.js";
import { getCompanyEmployeePool, ensureEmployeeProfileById, getLiveBasicSalary } from "../dbEmployee.js";

const router = express.Router();

function parseBasicSalary(rawSalary) {
  if (rawSalary === null || rawSalary === undefined) return 0;
  const cleaned = String(rawSalary).replace(/[^0-9.]/g, "");
  const value = parseFloat(cleaned);
  return Number.isFinite(value) ? value : 0;
}

// ---- GET /api/hr/:businessId/applications ----
router.get("/:businessId/applications", async (req, res) => {
  try {
    const { businessId } = req.params;
    const companyPool = await getCompanyHrPool(businessId);

    const [rows] = await companyPool.query(
      `SELECT id, name, email, position, experience, applied_date, status, reason
       FROM applications
       ORDER BY created_at DESC`
    );

    return res.json({ success: true, applications: rows });
  } catch (err) {
    console.error("GET /api/hr/:businessId/applications error:", err);
    return res.status(500).json({ success: false, message: "Server error while fetching applications." });
  }
});

// ---- POST /api/hr/:businessId/applications ----
// Body: { name, email, position, experience }
router.post("/:businessId/applications", async (req, res) => {
  try {
    const { businessId } = req.params;
    const { name, email, position, experience } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Name is required." });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }
    if (!position || !position.trim()) {
      return res.status(400).json({ success: false, message: "Position is required." });
    }

    const companyPool = await getCompanyHrPool(businessId);

    const [result] = await companyPool.query(
      `INSERT INTO applications (name, email, position, experience, applied_date, status)
       VALUES (?, ?, ?, ?, CURDATE(), 'applied')`,
      [name.trim(), email.trim(), position.trim(), experience?.trim() || null]
    );

    return res.json({ success: true, message: "Candidate added.", id: result.insertId });
  } catch (err) {
    console.error("POST /api/hr/:businessId/applications error:", err);
    return res.status(500).json({ success: false, message: "Server error while adding candidate." });
  }
});

// ---- PUT /api/hr/:businessId/applications/:id/accept ----
router.put("/:businessId/applications/:id/accept", async (req, res) => {
  try {
    const { businessId, id } = req.params;
    const companyPool = await getCompanyHrPool(businessId);

    const [result] = await companyPool.query(
      `UPDATE applications SET status = 'accepted' WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Candidate not found." });
    }

    return res.json({ success: true, message: "Candidate accepted." });
  } catch (err) {
    console.error("PUT /api/hr/:businessId/applications/:id/accept error:", err);
    return res.status(500).json({ success: false, message: "Server error while accepting candidate." });
  }
});

// ---- PUT /api/hr/:businessId/applications/:id/reject ----
// Body: { reason }
router.put("/:businessId/applications/:id/reject", async (req, res) => {
  try {
    const { businessId, id } = req.params;
    const { reason } = req.body;
    const companyPool = await getCompanyHrPool(businessId);

    const [result] = await companyPool.query(
      `UPDATE applications SET status = 'rejected', reason = ? WHERE id = ?`,
      [reason?.trim() || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Candidate not found." });
    }

    return res.json({ success: true, message: "Candidate rejected." });
  } catch (err) {
    console.error("PUT /api/hr/:businessId/applications/:id/reject error:", err);
    return res.status(500).json({ success: false, message: "Server error while rejecting candidate." });
  }
});

// ---- POST /api/hr/:businessId/applications/:id/move-to-employee ----
// Body: { salary, department }
router.post("/:businessId/applications/:id/move-to-employee", async (req, res) => {
  try {
    const { businessId, id } = req.params;
    const { salary, department } = req.body;

    if (!salary || !salary.trim()) {
      return res.status(400).json({ success: false, message: "Salary is required." });
    }
    if (!department || !department.trim()) {
      return res.status(400).json({ success: false, message: "Department is required." });
    }

    const companyPool = await getCompanyHrPool(businessId);

    const [candidateRows] = await companyPool.query(
      `SELECT name, email, position FROM applications WHERE id = ?`,
      [id]
    );

    if (candidateRows.length === 0) {
      return res.status(404).json({ success: false, message: "Candidate not found." });
    }

    const candidate = candidateRows[0];

    const conn = await companyPool.getConnection();
    try {
      await conn.beginTransaction();

      const [empResult] = await conn.query(
        `INSERT INTO employees (name, email, department, designation, salary, status)
         VALUES (?, ?, ?, ?, ?, 'Active')`,
        [candidate.name, candidate.email, department.trim(), candidate.position, salary.trim()]
      );

      await conn.query(
        `UPDATE applications SET status = 'hired' WHERE id = ?`,
        [id]
      );

      await conn.commit();

      return res.json({
        success: true,
        message: "Candidate moved to employees.",
        employeeId: empResult.insertId,
      });
    } catch (txErr) {
      await conn.rollback();
      throw txErr;
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error("POST /api/hr/:businessId/applications/:id/move-to-employee error:", err);
    return res.status(500).json({ success: false, message: "Server error while moving candidate to employees." });
  }
});

// ---- GET /api/hr/:businessId/employees ----
router.get("/:businessId/employees", async (req, res) => {
  try {
    const { businessId } = req.params;
    const companyPool = await getCompanyHrPool(businessId);

    const [rows] = await companyPool.query(
      `SELECT id, name, email, department, designation, salary, status
       FROM employees
       ORDER BY created_at DESC`
    );

    return res.json({ success: true, employees: rows });
  } catch (err) {
    console.error("GET /api/hr/:businessId/employees error:", err);
    return res.status(500).json({ success: false, message: "Server error while fetching employees." });
  }
});

// ---- PUT /api/hr/:businessId/employees/:id ----
// Body: { name, email, department, designation, salary, status }
router.put("/:businessId/employees/:id", async (req, res) => {
  try {
    const { businessId, id } = req.params;
    const { name, email, department, designation, salary, status } = req.body;

    const companyPool = await getCompanyHrPool(businessId);

    const [result] = await companyPool.query(
      `UPDATE employees
       SET name = ?, email = ?, department = ?, designation = ?, salary = ?, status = ?
       WHERE id = ?`,
      [
        name?.trim() || null,
        email?.trim() || null,
        department?.trim() || null,
        designation?.trim() || null,
        salary?.trim() || null,
        status || "Active",
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Employee not found." });
    }

    return res.json({ success: true, message: "Employee updated successfully." });
  } catch (err) {
    console.error("PUT /api/hr/:businessId/employees/:id error:", err);
    return res.status(500).json({ success: false, message: "Server error while updating employee." });
  }
});

// ============================================================
// LEAVE REQUESTS (HR view/approve/reject)
// Reads/writes the SAME leave_requests table Employee.tsx uses,
// in the per-company employee database. No new tables.
// ============================================================

// ---- GET /api/hr/:businessId/leave-requests ----
// Returns all leave requests across all employees, with employee name/
// department joined in from employee_profile for display.
router.get("/:businessId/leave-requests", async (req, res) => {
  try {
    const { businessId } = req.params;
    const empPool = await getCompanyEmployeePool(businessId);

    const [rows] = await empPool.query(
      `SELECT lr.id, lr.employee_id, lr.leave_type, lr.duration, lr.start_date, lr.end_date,
              lr.reason, lr.status, lr.created_at,
              ep.name AS employee_name, ep.department, ep.employee_code
       FROM leave_requests lr
       INNER JOIN employee_profile ep ON ep.id = lr.employee_id
       ORDER BY lr.created_at DESC`
    );

    return res.json({ success: true, leaveRequests: rows });
  } catch (err) {
    console.error("GET /api/hr/:businessId/leave-requests error:", err);
    return res.status(500).json({ success: false, message: "Server error while fetching leave requests." });
  }
});

// ---- PATCH /api/hr/:businessId/leave-requests/:id ----
// Body: { status } — 'Approved' | 'Rejected'
// On approval, deducts the leave duration from employee_profile.leave_balance
// (only once — won't double-deduct if called again on an already-approved row).
router.patch("/:businessId/leave-requests/:id", async (req, res) => {
  try {
    const { businessId, id } = req.params;
    const { status } = req.body;

    if (!status || !["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "status must be 'Approved' or 'Rejected'." });
    }

    const empPool = await getCompanyEmployeePool(businessId);

    const [leaveRows] = await empPool.query(
      `SELECT id, employee_id, start_date, end_date, status FROM leave_requests WHERE id = ?`,
      [id]
    );

    if (leaveRows.length === 0) {
      return res.status(404).json({ success: false, message: "Leave request not found." });
    }

    const leave = leaveRows[0];

    const conn = await empPool.getConnection();
    try {
      await conn.beginTransaction();

      await conn.query(`UPDATE leave_requests SET status = ? WHERE id = ?`, [status, id]);

      if (status === "Approved" && leave.status !== "Approved") {
        const days =
          Math.round(
            (new Date(leave.end_date).getTime() - new Date(leave.start_date).getTime()) / (1000 * 60 * 60 * 24)
          ) + 1;
        await conn.query(
          `UPDATE employee_profile SET leave_balance = GREATEST(0, leave_balance - ?) WHERE id = ?`,
          [Math.max(1, days), leave.employee_id]
        );
      }

      await conn.commit();
    } catch (txErr) {
      await conn.rollback();
      throw txErr;
    } finally {
      conn.release();
    }

    return res.json({ success: true, message: `Leave request ${status.toLowerCase()}.` });
  } catch (err) {
    console.error("PATCH /api/hr/:businessId/leave-requests/:id error:", err);
    return res.status(500).json({ success: false, message: "Server error while updating leave request." });
  }
});

// ============================================================
// PAYSLIPS (HR generates + views reports)
// Reads/writes the SAME payslips table Employee.tsx reads from.
// Gross salary is pulled LIVE from the HR employees table every time,
// same policy as employee.js: PF 12% + flat ₹200 professional tax
// (overridable via `deductions` in the body).
// ============================================================

// ---- POST /api/hr/:businessId/employees/:id/payslips/generate ----
// Body: { month, deductions? }
router.post("/:businessId/employees/:id/payslips/generate", async (req, res) => {
  try {
    const { businessId, id } = req.params;
    const { month, deductions: customDeductions } = req.body;

    if (!month || !month.trim()) {
      return res.status(400).json({ success: false, message: "month is required (e.g. 'July 2026')." });
    }

    const hrEmployee = await getLiveBasicSalary(businessId, id);
    const basicSalary = parseBasicSalary(hrEmployee.salary);

    if (basicSalary <= 0) {
      return res.status(400).json({
        success: false,
        message: "This employee has no basic salary set. Set it in the Employees tab first.",
      });
    }

    await ensureEmployeeProfileById(businessId, id);

    const empPool = await getCompanyEmployeePool(businessId);

    const [existingSlip] = await empPool.query(
      `SELECT id FROM payslips WHERE employee_id = ? AND month = ? LIMIT 1`,
      [id, month.trim()]
    );

    if (existingSlip.length > 0) {
      return res.status(400).json({
        success: false,
        message: `A payslip for ${month.trim()} already exists for this employee.`,
        id: existingSlip[0].id,
      });
    }

    const gross = basicSalary;
    let deductions;
    if (customDeductions !== undefined && customDeductions !== null && customDeductions !== "") {
      deductions = parseFloat(customDeductions) || 0;
    } else {
      const providentFund = basicSalary * 0.12;
      const professionalTax = 200;
      deductions = Math.round((providentFund + professionalTax) * 100) / 100;
    }

    const [result] = await empPool.query(
      `INSERT INTO payslips (employee_id, month, gross, deductions, status)
       VALUES (?, ?, ?, ?, 'Paid')`,
      [id, month.trim(), gross, deductions]
    );

    const [newSlip] = await empPool.query(
      `SELECT id, employee_id, month, gross, deductions, net_salary, status, created_at
       FROM payslips WHERE id = ?`,
      [result.insertId]
    );

    return res.json({ success: true, message: "Payslip generated.", payslip: newSlip[0] });
  } catch (err) {
    console.error("POST /api/hr/:businessId/employees/:id/payslips/generate error:", err);
    return res.status(500).json({ success: false, message: err.message || "Server error while generating payslip." });
  }
});

// ---- GET /api/hr/:businessId/employees/:id/payslips ----
// Payslip report/history for a single employee.
router.get("/:businessId/employees/:id/payslips", async (req, res) => {
  try {
    const { businessId, id } = req.params;
    const empPool = await getCompanyEmployeePool(businessId);

    const [rows] = await empPool.query(
      `SELECT id, employee_id, month, gross, deductions, net_salary, status, created_at
       FROM payslips WHERE employee_id = ? ORDER BY created_at DESC`,
      [id]
    );

    return res.json({ success: true, payslips: rows });
  } catch (err) {
    console.error("GET /api/hr/:businessId/employees/:id/payslips error:", err);
    return res.status(500).json({ success: false, message: "Server error while fetching payslips." });
  }
});

// ---- GET /api/hr/:businessId/payslips ----
// Company-wide payslip report across ALL employees (for HR's full payroll view).
router.get("/:businessId/payslips", async (req, res) => {
  try {
    const { businessId } = req.params;
    const empPool = await getCompanyEmployeePool(businessId);

    const [rows] = await empPool.query(
      `SELECT p.id, p.employee_id, p.month, p.gross, p.deductions, p.net_salary, p.status, p.created_at,
              ep.name AS employee_name, ep.department
       FROM payslips p
       INNER JOIN employee_profile ep ON ep.id = p.employee_id
       ORDER BY p.created_at DESC`
    );

    return res.json({ success: true, payslips: rows });
  } catch (err) {
    console.error("GET /api/hr/:businessId/payslips error:", err);
    return res.status(500).json({ success: false, message: "Server error while fetching payslip report." });
  }
});

export default router;