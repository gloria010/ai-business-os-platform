// HR.tsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import MessageForm from "../../components/Businesses/MessageForm";
import {
  LayoutDashboard,
  Users,
  Bell,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  TrendingUp,
  MessageSquare,
  Plus,
  X,
  Pencil,
  Plane,
  Receipt,
} from "lucide-react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const API_BASE = "http://localhost:5000";

// ---- Types ----
type Candidate = {
  id: number | string;
  name: string;
  email: string;
  position: string;
  experience: string;
  applied_date: string;
  reason?: string;
};

type Employee = {
  id: number | string;
  name: string;
  email: string;
  department: string;
  designation: string;
  salary: string;
  status: string;
};

export default function HR() {
  const { company: businessId } = useParams(); // URL param already IS the businessId

  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [applicationTab, setApplicationTab] = useState("applied");

  // ---- Candidate / employee state (now loaded from the API) ----
  const [applied, setApplied] = useState<Candidate[]>([]);
  const [accepted, setAccepted] = useState<Candidate[]>([]);
  const [rejected, setRejected] = useState<Candidate[]>([]);
  const [employeeList, setEmployeeList] = useState<Employee[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [employeesLoading, setEmployeesLoading] = useState(false);

  // ---- Notifications (department messages) ----
  type DeptMessage = {
    id: number;
    from_name: string;
    to_recipient: string;
    subject: string;
    message: string;
    created_at: string;
  };
  const [deptMessages, setDeptMessages] = useState<DeptMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);

  // ---- Modal state ----
  const [showAddModal, setShowAddModal] = useState(false);
  const [resumeCandidate, setResumeCandidate] = useState<Candidate | null>(null);
  const [rejectTarget, setRejectTarget] = useState<{ id: Candidate["id"] } | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // ---- Move to Employees (salary) modal state ----
  const [salaryTarget, setSalaryTarget] = useState<Candidate | null>(null);
  const [salaryInput, setSalaryInput] = useState("");

  // ---- Edit employee modal state ----
  const [editTarget, setEditTarget] = useState<Employee | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    department: "",
    designation: "",
    salary: "",
    status: "",
  });

  const [newCandidate, setNewCandidate] = useState({
    name: "",
    email: "",
    position: "",
    experience: "",
  });

  const companyNames: Record<string, string> = {
    "techzone-store": "TechZone Store",
    "urban-fashion-hub": "Urban Fashion Hub",
    "luxe-living-furniture": "Luxe Living Furniture",
    "prosports-gear": "ProSports Gear",
    "glow-beauty-studio": "Glow Beauty Studio",
  };

  const employeeGrowth = [
    { month: "Jan", employees: 2 },
    { month: "Feb", employees: 2 },
    { month: "Mar", employees: 3 },
    { month: "Apr", employees: 4 },
    { month: "May", employees: 5 },
    { month: "Jun", employees: 5 },
  ];

  // ---- Leave requests (HR view/approve/reject) ----
  type LeaveRequest = {
    id: number;
    employee_id: number;
    employee_name: string;
    department: string;
    leave_type: string;
    duration: string;
    start_date: string;
    end_date: string;
    reason: string;
    status: string;
    created_at: string;
  };
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [leaveActionId, setLeaveActionId] = useState<number | null>(null);

  const loadLeaveRequests = async () => {
    if (!businessId) return;
    setLeaveLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/hr/${businessId}/leave-requests`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setLeaveRequests(data.leaveRequests);
      }
    } catch (err) {
      console.error("Failed to load leave requests:", err);
    } finally {
      setLeaveLoading(false);
    }
  };

  const handleLeaveDecision = async (id: number, status: "Approved" | "Rejected") => {
    setLeaveActionId(id);
    try {
      const res = await fetch(`${API_BASE}/api/hr/${businessId}/leave-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.message || "Failed to update leave request.");
        return;
      }
      loadLeaveRequests();
    } catch (err) {
      console.error("Leave decision error:", err);
      alert("Network error while updating leave request.");
    } finally {
      setLeaveActionId(null);
    }
  };

  // ---- Payslip generation (per employee) ----
  const [payslipTarget, setPayslipTarget] = useState<Employee | null>(null);
  const [payslipMonth, setPayslipMonth] = useState("");
  const [generatingPayslip, setGeneratingPayslip] = useState(false);

  const openPayslipModal = (employee: Employee) => {
    setPayslipTarget(employee);
    setPayslipMonth("");
  };

  const handleGeneratePayslip = async () => {
    if (!payslipTarget || !payslipMonth.trim()) return;
    setGeneratingPayslip(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/hr/${businessId}/employees/${payslipTarget.id}/payslips/generate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ month: payslipMonth.trim() }),
        }
      );
      const data = await res.json();
      if (!data.success) {
        alert(data.message || "Failed to generate payslip.");
        return;
      }
      setPayslipTarget(null);
      setPayslipMonth("");
      alert("Payslip generated successfully!");
    } catch (err) {
      console.error("Generate payslip error:", err);
      alert("Network error while generating payslip.");
    } finally {
      setGeneratingPayslip(false);
    }
  };

  // ===================== DATA LOADING =====================

  const loadApplications = async () => {
    if (!businessId) return;
    setApplicationsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/hr/${businessId}/applications`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        const all: Candidate[] = data.applications;
        setApplied(all.filter((c: any) => c.status === "applied"));
        setAccepted(all.filter((c: any) => c.status === "accepted"));
        setRejected(all.filter((c: any) => c.status === "rejected"));
      }
    } catch (err) {
      console.error("Failed to load applications:", err);
    } finally {
      setApplicationsLoading(false);
    }
  };

  const loadEmployees = async () => {
    if (!businessId) return;
    setEmployeesLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/hr/${businessId}/employees`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setEmployeeList(data.employees);
      }
    } catch (err) {
      console.error("Failed to load employees:", err);
    } finally {
      setEmployeesLoading(false);
    }
  };

  const loadNotifications = async () => {
    if (!businessId) return;
    setMessagesLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/messages?businessId=${businessId}&to=HR`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setDeptMessages(data.messages);
      }
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      setMessagesLoading(false);
    }
  };

  useEffect(() => {
    if (activeMenu === "applications" || activeMenu === "dashboard") {
      loadApplications();
    }
    if (activeMenu === "employees" || activeMenu === "dashboard") {
      loadEmployees();
    }
    if (activeMenu === "notifications" || activeMenu === "dashboard") {
      loadNotifications();
    }
    if (activeMenu === "leaveRequests") {
      loadLeaveRequests();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMenu, businessId]);

  // ===================== ACTIONS =====================

  const handleAddCandidate = async () => {
    if (!newCandidate.name || !newCandidate.email || !newCandidate.position) return;

    try {
      const res = await fetch(`${API_BASE}/api/hr/${businessId}/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newCandidate),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.message || "Failed to add candidate.");
        return;
      }
      setNewCandidate({ name: "", email: "", position: "", experience: "" });
      setShowAddModal(false);
      loadApplications();
    } catch (err) {
      console.error("Add candidate error:", err);
      alert("Network error while adding candidate.");
    }
  };

  const handleAcceptApplied = async (candidate: Candidate) => {
    try {
      const res = await fetch(
        `${API_BASE}/api/hr/${businessId}/applications/${candidate.id}/accept`,
        { method: "PUT", credentials: "include" }
      );
      const data = await res.json();
      if (!data.success) {
        alert(data.message || "Failed to accept candidate.");
        return;
      }
      loadApplications();
    } catch (err) {
      console.error("Accept candidate error:", err);
      alert("Network error while accepting candidate.");
    }
  };

  const openSalaryModal = (candidate: Candidate) => {
    setSalaryTarget(candidate);
    setSalaryInput("");
  };

  const confirmMoveToEmployees = async () => {
    if (!salaryTarget || !salaryInput.trim()) return;

    try {
      const res = await fetch(
        `${API_BASE}/api/hr/${businessId}/applications/${salaryTarget.id}/move-to-employee`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ salary: salaryInput.trim() }),
        }
      );
      const data = await res.json();
      if (!data.success) {
        alert(data.message || "Failed to move candidate to employees.");
        return;
      }
      setSalaryTarget(null);
      setSalaryInput("");
      loadApplications();
      loadEmployees();
    } catch (err) {
      console.error("Move to employees error:", err);
      alert("Network error while moving candidate to employees.");
    }
  };

  const openRejectModal = (id: Candidate["id"]) => {
    setRejectTarget({ id });
    setRejectReason("");
  };

  const confirmReject = async () => {
    if (!rejectTarget) return;

    try {
      const res = await fetch(
        `${API_BASE}/api/hr/${businessId}/applications/${rejectTarget.id}/reject`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ reason: rejectReason }),
        }
      );
      const data = await res.json();
      if (!data.success) {
        alert(data.message || "Failed to reject candidate.");
        return;
      }
      setRejectTarget(null);
      setRejectReason("");
      loadApplications();
    } catch (err) {
      console.error("Reject candidate error:", err);
      alert("Network error while rejecting candidate.");
    }
  };

  const openEditModal = (employee: Employee) => {
    setEditTarget(employee);
    setEditForm({
      name: employee.name,
      email: employee.email,
      department: employee.department,
      designation: employee.designation,
      salary: employee.salary,
      status: employee.status,
    });
  };

  const confirmEditEmployee = async () => {
    if (!editTarget) return;

    try {
      const res = await fetch(`${API_BASE}/api/hr/${businessId}/employees/${editTarget.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.message || "Failed to update employee.");
        return;
      }
      setEditTarget(null);
      loadEmployees();
    } catch (err) {
      console.error("Edit employee error:", err);
      alert("Network error while updating employee.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">

      {/* Sidebar */}
      <aside className="w-72 bg-white shadow-lg border-r">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold">
            {companyNames[businessId || ""] || "Business Workspace"}
          </h1>
          <p className="text-slate-500 text-sm">HR Workspace</p>
        </div>
        <nav className="p-4 space-y-2">
          <button
            onClick={() => setActiveMenu("dashboard")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
              activeMenu === "dashboard" ? "bg-blue-600 text-white" : "hover:bg-slate-100"
            }`}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </button>

          <button
            onClick={() => setActiveMenu("applications")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
              activeMenu === "applications" ? "bg-blue-600 text-white" : "hover:bg-slate-100"
            }`}
          >
            <FileText size={20} />
            Applications
          </button>

          <button
            onClick={() => setActiveMenu("employees")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
              activeMenu === "employees" ? "bg-blue-600 text-white" : "hover:bg-slate-100"
            }`}
          >
            <Users size={20} />
            Employees
          </button>

          <button
            onClick={() => setActiveMenu("leaveRequests")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
              activeMenu === "leaveRequests" ? "bg-blue-600 text-white" : "hover:bg-slate-100"
            }`}
          >
            <Plane size={20} />
            Leave Requests
          </button>

          <button
            onClick={() => setActiveMenu("notifications")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
              activeMenu === "notifications" ? "bg-blue-600 text-white" : "hover:bg-slate-100"
            }`}
          >
            <Bell size={20} />
            Notifications
          </button>

          <button
            onClick={() => setActiveMenu("messages")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
              activeMenu === "messages" ? "bg-blue-600 text-white" : "hover:bg-slate-100"
            }`}
          >
            <MessageSquare size={20} />
            Messages
          </button>
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8">Human Resources</h1>

        {/* ================= Dashboard ================= */}
        {activeMenu === "dashboard" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Applications */}
              <div
                onClick={() => setActiveMenu("applications")}
                className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-slate-500 text-sm">Applications</p>
                    <h2 className="text-3xl font-bold mt-2">
                      {applied.length + rejected.length + accepted.length}
                    </h2>
                  </div>
                  <div className="bg-blue-100 p-4 rounded-full">
                    <FileText className="text-blue-600" size={28} />
                  </div>
                </div>
                <div className="mt-6 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Applied</span>
                    <span className="font-semibold text-green-600">{applied.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Accepted</span>
                    <span className="font-semibold text-blue-600">{accepted.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rejected</span>
                    <span className="font-semibold text-red-600">{rejected.length}</span>
                  </div>
                </div>
              </div>

              {/* Employees */}
              <div
                onClick={() => setActiveMenu("employees")}
                className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-slate-500 text-sm">Employees</p>
                    <h2 className="text-3xl font-bold mt-2">{employeeList.length}</h2>
                  </div>
                  <div className="bg-green-100 p-4 rounded-full">
                    <Users className="text-green-600" size={28} />
                  </div>
                </div>
                <div className="mt-6">
                  <div className="flex justify-between text-sm">
                    <span>Total Employees</span>
                    <span className="font-semibold">{employeeList.length}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span>On Leave</span>
                    <span className="font-semibold text-yellow-600">
                      {employeeList.filter((e) => e.status !== "Active").length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notifications */}
              <div
                onClick={() => setActiveMenu("notifications")}
                className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-slate-500 text-sm">Notifications</p>
                    <h2 className="text-3xl font-bold mt-2">{deptMessages.length}</h2>
                  </div>
                  <div className="bg-yellow-100 p-4 rounded-full">
                    <Bell className="text-yellow-600" size={28} />
                  </div>
                </div>
                <div className="mt-6">
                  <div className="flex justify-between text-sm">
                    <span>Total Notifications</span>
                    <span className="font-semibold">{deptMessages.length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Employee Growth */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-100 p-3 rounded-full">
                  <TrendingUp className="text-blue-600" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Employee Growth</h2>
                  <p className="text-slate-500 text-sm">Monthly employee growth</p>
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={employeeGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="employees"
                      stroke="#2563eb"
                      strokeWidth={3}
                      dot={{ r: 6 }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* ================= Applications ================= */}
        {activeMenu === "applications" && (
          <div className="bg-white rounded-2xl shadow p-6">
            <div className="flex gap-4 mb-8 items-center justify-between flex-wrap">
              <div className="flex gap-4 flex-wrap">
                <button
                  onClick={() => setApplicationTab("applied")}
                  className={`px-6 py-3 rounded-xl font-semibold transition ${
                    applicationTab === "applied" ? "bg-green-600 text-white" : "bg-slate-100"
                  }`}
                >
                  Applied
                </button>
                <button
                  onClick={() => setApplicationTab("accepted")}
                  className={`px-6 py-3 rounded-xl font-semibold transition ${
                    applicationTab === "accepted" ? "bg-blue-600 text-white" : "bg-slate-100"
                  }`}
                >
                  Accepted
                </button>
                <button
                  onClick={() => setApplicationTab("rejected")}
                  className={`px-6 py-3 rounded-xl font-semibold transition ${
                    applicationTab === "rejected" ? "bg-red-600 text-white" : "bg-slate-100"
                  }`}
                >
                  Rejected
                </button>
              </div>
              {applicationTab === "applied" && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
                >
                  <Plus size={18} />
                  Add Candidate
                </button>
              )}
            </div>

            {applicationsLoading && (
              <p className="text-slate-400 text-center py-8">Loading applications...</p>
            )}

            {/* Applied */}
            {!applicationsLoading && applicationTab === "applied" && (
              <div className="space-y-5">
                {applied.length === 0 && (
                  <p className="text-slate-400 text-center py-8">No applied candidates.</p>
                )}
                {applied.map((candidate) => (
                  <div
                    key={candidate.id}
                    className="border rounded-xl p-5 flex justify-between items-center flex-wrap gap-4"
                  >
                    <div>
                      <h2 className="font-bold text-lg">{candidate.name}</h2>
                      <p>{candidate.email}</p>
                      <p>{candidate.position}</p>
                      <p>{candidate.experience}</p>
                      <p>{candidate.applied_date}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => setResumeCandidate(candidate)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                      >
                        <Eye size={18} />
                        View Resume
                      </button>
                      <button
                        onClick={() => handleAcceptApplied(candidate)}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                      >
                        <CheckCircle size={18} />
                        Accept
                      </button>
                      <button
                        onClick={() => openRejectModal(candidate.id)}
                        className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                      >
                        <XCircle size={18} />
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Accepted */}
            {!applicationsLoading && applicationTab === "accepted" && (
              <div className="space-y-5">
                {accepted.length === 0 && (
                  <p className="text-slate-400 text-center py-8">No accepted candidates yet.</p>
                )}
                {accepted.map((candidate) => (
                  <div
                    key={candidate.id}
                    className="border rounded-xl p-5 flex justify-between items-center flex-wrap gap-4"
                  >
                    <div>
                      <h2 className="font-bold text-lg">{candidate.name}</h2>
                      <p>{candidate.email}</p>
                      <p>{candidate.position}</p>
                      <p>{candidate.experience}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => setResumeCandidate(candidate)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                      >
                        <Eye size={18} />
                        View Resume
                      </button>
                      <button
                        onClick={() => openSalaryModal(candidate)}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                      >
                        <Users size={18} />
                        Move to Employees
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Rejected */}
            {!applicationsLoading && applicationTab === "rejected" && (
              <div className="space-y-5">
                {rejected.length === 0 && (
                  <p className="text-slate-400 text-center py-8">No rejected candidates.</p>
                )}
                {rejected.map((candidate) => (
                  <div key={candidate.id} className="border rounded-xl p-5">
                    <h2 className="font-bold text-lg">{candidate.name}</h2>
                    <p>{candidate.email}</p>
                    <p>{candidate.position}</p>
                    <p className="text-red-600 font-semibold mt-2">
                      Reason : {candidate.reason}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= Employees ================= */}
        {activeMenu === "employees" && (
          <div className="bg-white rounded-2xl shadow p-6">
            {employeesLoading && (
              <p className="text-slate-400 text-center py-8">Loading employees...</p>
            )}

            {!employeesLoading && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="text-left p-4">ID</th>
                      <th className="text-left p-4">Name</th>
                      <th className="text-left p-4">Email</th>
                      <th className="text-left p-4">Department</th>
                      <th className="text-left p-4">Designation</th>
                      <th className="text-left p-4">Salary</th>
                      <th className="text-left p-4">Status</th>
                      <th className="text-left p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employeeList.map((employee) => (
                      <tr key={employee.id} className="border-b hover:bg-slate-50">
                        <td className="p-4">{employee.id}</td>
                        <td className="p-4 font-medium">{employee.name}</td>
                        <td className="p-4">{employee.email}</td>
                        <td className="p-4">{employee.department}</td>
                        <td className="p-4">{employee.designation}</td>
                        <td className="p-4">{employee.salary}</td>
                        <td className="p-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              employee.status === "Active"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {employee.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3 flex-wrap">
                            <button
                              onClick={() => openEditModal(employee)}
                              className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
                            >
                              <Pencil size={16} />
                              Edit
                            </button>
                            <button
                              onClick={() => openPayslipModal(employee)}
                              className="flex items-center gap-1 text-green-600 hover:text-green-800 font-medium"
                            >
                              <Receipt size={16} />
                              Generate Payslip
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {employeeList.length === 0 && (
                  <p className="text-slate-400 text-center py-8">No employees yet.</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* ================= Leave Requests ================= */}
        {activeMenu === "leaveRequests" && (
          <div className="bg-white rounded-2xl shadow p-6 space-y-5">
            {leaveLoading && (
              <p className="text-slate-400 text-center py-8">Loading leave requests...</p>
            )}

            {!leaveLoading && leaveRequests.length === 0 && (
              <p className="text-slate-400 text-center py-8">No leave requests yet.</p>
            )}

            {!leaveLoading &&
              leaveRequests.map((leave) => (
                <div
                  key={leave.id}
                  className="border rounded-xl p-5 flex justify-between items-center flex-wrap gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-bold text-lg">{leave.employee_name}</h2>
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                        {leave.department}
                      </span>
                    </div>
                    <p className="mt-1">
                      {leave.leave_type} ({leave.duration}) — {leave.start_date} to {leave.end_date}
                    </p>
                    {leave.reason && <p className="text-slate-500 mt-1">Reason: {leave.reason}</p>}
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        leave.status === "Approved"
                          ? "bg-green-100 text-green-700"
                          : leave.status === "Rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {leave.status}
                    </span>

                    {leave.status === "Pending" && (
                      <>
                        <button
                          onClick={() => handleLeaveDecision(leave.id, "Approved")}
                          disabled={leaveActionId === leave.id}
                          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                        >
                          <CheckCircle size={16} />
                          Approve
                        </button>
                        <button
                          onClick={() => handleLeaveDecision(leave.id, "Rejected")}
                          disabled={leaveActionId === leave.id}
                          className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                        >
                          <XCircle size={16} />
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* ================= Notifications ================= */}
        {activeMenu === "notifications" && (
          <div className="bg-white rounded-2xl shadow p-6 space-y-5">
            {messagesLoading && (
              <p className="text-slate-400 text-center py-8">Loading messages...</p>
            )}

            {!messagesLoading && deptMessages.length === 0 && (
              <p className="text-slate-400 text-center py-8">No messages yet.</p>
            )}

            {!messagesLoading && deptMessages.map((msg) => (
              <div
                key={msg.id}
                className="border border-yellow-200 rounded-xl p-5 transition-all duration-300 cursor-pointer hover:bg-yellow-100 hover:border-yellow-400 hover:shadow-lg"
              >
                <div className="flex justify-between items-start">
                  <h2 className="font-bold text-lg">{msg.subject}</h2>
                  <span className="text-sm text-slate-400">from {msg.from_name}</span>
                </div>
                <p className="text-slate-600 mt-2">{msg.message}</p>
                <p className="text-sm text-slate-400 mt-2">
                  {new Date(msg.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}

        {activeMenu === "messages" && <MessageForm sender="HR" businessId={businessId || ""} />}
      </main>

      {/* ================= Add Candidate Modal ================= */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-4">Add Candidate</h2>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Full name"
                value={newCandidate.name}
                onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })}
                className="w-full border rounded-lg px-4 py-2"
              />
              <input
                type="email"
                placeholder="Email"
                value={newCandidate.email}
                onChange={(e) => setNewCandidate({ ...newCandidate, email: e.target.value })}
                className="w-full border rounded-lg px-4 py-2"
              />
              <input
                type="text"
                placeholder="Position"
                value={newCandidate.position}
                onChange={(e) => setNewCandidate({ ...newCandidate, position: e.target.value })}
                className="w-full border rounded-lg px-4 py-2"
              />
              <input
                type="text"
                placeholder="Experience (e.g. 2 years)"
                value={newCandidate.experience}
                onChange={(e) => setNewCandidate({ ...newCandidate, experience: e.target.value })}
                className="w-full border rounded-lg px-4 py-2"
              />
            </div>
            <button
              onClick={handleAddCandidate}
              className="w-full mt-5 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
            >
              Add Candidate
            </button>
          </div>
        </div>
      )}

      {/* ================= View Resume Modal ================= */}
      {resumeCandidate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md relative">
            <button
              onClick={() => setResumeCandidate(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-4">Resume — {resumeCandidate.name}</h2>
            <div className="space-y-2 text-slate-600">
              <p><span className="font-semibold text-slate-800">Email:</span> {resumeCandidate.email}</p>
              <p><span className="font-semibold text-slate-800">Position:</span> {resumeCandidate.position}</p>
              <p><span className="font-semibold text-slate-800">Experience:</span> {resumeCandidate.experience}</p>
              <p><span className="font-semibold text-slate-800">Applied:</span> {resumeCandidate.applied_date}</p>
            </div>
            <p className="text-sm text-slate-400 mt-4">
              Hook this modal up to an actual resume file/URL once that field exists on candidate records.
            </p>
          </div>
        </div>
      )}

      {/* ================= Reject Reason Modal ================= */}
      {rejectTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md relative">
            <button
              onClick={() => setRejectTarget(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-4">Reject Candidate</h2>
            <textarea
              placeholder="Reason for rejection"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 h-28 resize-none"
            />
            <button
              onClick={confirmReject}
              className="w-full mt-5 bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition"
            >
              Confirm Reject
            </button>
          </div>
        </div>
      )}

      {/* ================= Set Salary / Move to Employees Modal ================= */}
      {salaryTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md relative">
            <button
              onClick={() => setSalaryTarget(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-4">Move {salaryTarget.name} to Employees</h2>
            <label className="text-sm font-medium text-slate-600 mb-1 block">Salary</label>
            <input
              type="text"
              placeholder="e.g. 50,000 / month"
              value={salaryInput}
              onChange={(e) => setSalaryInput(e.target.value)}
              className="w-full border rounded-lg px-4 py-2"
              autoFocus
            />
            <button
              onClick={confirmMoveToEmployees}
              disabled={!salaryInput.trim()}
              className="w-full mt-5 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirm &amp; Move to Employees
            </button>
          </div>
        </div>
      )}

      {/* ================= Generate Payslip Modal ================= */}
      {payslipTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md relative">
            <button
              onClick={() => setPayslipTarget(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-2">Generate Payslip — {payslipTarget.name}</h2>
            <p className="text-sm text-slate-500 mb-4">
              Gross pay uses this employee's current salary on record ({payslipTarget.salary}). Deductions
              (12% PF + ₹200 professional tax) are calculated automatically.
            </p>
            <label className="text-sm font-medium text-slate-600 mb-1 block">Month</label>
            <input
              type="text"
              placeholder="e.g. July 2026"
              value={payslipMonth}
              onChange={(e) => setPayslipMonth(e.target.value)}
              className="w-full border rounded-lg px-4 py-2"
              autoFocus
            />
            <button
              onClick={handleGeneratePayslip}
              disabled={generatingPayslip || !payslipMonth.trim()}
              className="w-full mt-5 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generatingPayslip ? "Generating..." : "Generate Payslip"}
            </button>
          </div>
        </div>
      )}

      {/* ================= Edit Employee Modal ================= */}
      {editTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md relative">
            <button
              onClick={() => setEditTarget(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-4">Edit {editTarget.name}</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-slate-600 mb-1 block">Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 mb-1 block">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 mb-1 block">Department</label>
                <input
                  type="text"
                  value={editForm.department}
                  onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 mb-1 block">Designation</label>
                <input
                  type="text"
                  value={editForm.designation}
                  onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 mb-1 block">Salary</label>
                <input
                  type="text"
                  value={editForm.salary}
                  onChange={(e) => setEditForm({ ...editForm, salary: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 mb-1 block">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2"
                >
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
            <button
              onClick={confirmEditEmployee}
              className="w-full mt-5 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}