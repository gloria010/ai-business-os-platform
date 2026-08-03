//Employees.tsx
import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useLocation, useParams } from "react-router-dom";
import MessageForm from "../../components/Businesses/MessageForm";
import {
  LayoutDashboard,
  User,
  ClipboardList,
  CalendarCheck,
  Wallet,
  Plane,
  CalendarDays,
  Bell,
  Brain,
  Building2,
  TrendingUp,
  CheckCircle,
  Clock3,
  Award,
  ArrowUpRight,
  Target,
  Activity,
  Star,
  Coffee,
  ChevronRight,
  MessageSquare,
  LogIn,
  LogOut,
} from "lucide-react";

const API_BASE = "http://localhost:5000";

interface EmployeeProfile {
  id: number;
  employee_code: string;
  name: string;
  email: string;
  department: string;
  designation: string;
  manager: string;
  joining_date: string;
  salary: string;
  profile_image: string;
  leave_balance: number;
}

interface AttendanceRecord {
  id: number;
  employee_id: number;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: string;
}

interface LeaveRequest {
  id: number;
  employee_id: number;
  leave_type: string;
  duration: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
  created_at: string;
}

interface Payslip {
  id: number;
  employee_id: number;
  month: string;
  gross: number;
  deductions: number;
  net_salary: number;
  status: string;
  created_at: string;
}

export default function Employee() {
  const location = useLocation();
  const { company: businessId } = useParams();

  const company =
    location.state?.company || {
      name: "NexGen Mobiles",
    };

  const [activeMenu, setActiveMenu] = useState("Dashboard");

  // ---- AI Assistant chat (still mock — no real backend/AI wired up yet) ----
  const [aiMessages, setAiMessages] = useState([
    { sender: "ai", text: "👋 Hello! How can I help you today?" },
  ]);
  const handleQuickAction = (action: string) => {
    let response = "";
    switch (action) {
      case "Generate Weekly Report":
        response = "Your weekly report has been generated successfully.";
        break;
      case "Summarize Notifications":
        response = `You currently have ${deptMessages.length} notification(s).`;
        break;
      case "Check Leave Balance":
        response = profile
          ? `You have ${profile.leave_balance} leave days remaining.`
          : "Leave balance isn't available yet.";
        break;
      case "Improve Productivity":
        response =
          "Try completing pending tasks first, attend meetings on time, and take short breaks every 2 hours.";
        break;
      default:
        response = "I'm here to help!";
    }
    setAiMessages((prev) => [
      ...prev,
      { sender: "user", text: action },
      { sender: "ai", text: response },
    ]);
  };

  // ---- Profile (real data) ----
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    if (!businessId) return;
    setProfileLoading(true);
    setProfileError(null);
    try {
      const res = await fetch(`${API_BASE}/api/employee/${businessId}/profile`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setProfile(data.profile);
      } else {
        setProfileError(data.message || "Failed to load profile.");
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
      setProfileError("Network error while loading profile.");
    } finally {
      setProfileLoading(false);
    }
  }, [businessId]);

  // ---- Attendance (real data) ----
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  const loadAttendance = useCallback(async () => {
    if (!businessId || !profile?.id) return;
    setAttendanceLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/employee/${businessId}/attendance?employeeId=${profile.id}`,
        { credentials: "include" }
      );
      const data = await res.json();
      if (data.success) {
        setAttendanceRecords(data.attendance);
      }
    } catch (err) {
      console.error("Failed to load attendance:", err);
    } finally {
      setAttendanceLoading(false);
    }
  }, [businessId, profile?.id]);

  const handleCheckIn = async () => {
    if (!profile?.id) return;
    setCheckingIn(true);
    try {
      const res = await fetch(`${API_BASE}/api/employee/${businessId}/attendance/check-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ employeeId: profile.id }),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.message || "Failed to check in.");
        return;
      }
      loadAttendance();
    } catch (err) {
      console.error("Check-in error:", err);
      alert("Network error while checking in.");
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async (attendanceId: number) => {
    setCheckingOut(true);
    try {
      const res = await fetch(`${API_BASE}/api/employee/${businessId}/attendance/check-out`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ attendanceId }),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.message || "Failed to check out.");
        return;
      }
      loadAttendance();
    } catch (err) {
      console.error("Check-out error:", err);
      alert("Network error while checking out.");
    } finally {
      setCheckingOut(false);
    }
  };

  // Today's attendance row (if any) — drives which button (Check In / Check Out) shows
  const todayDateStr = new Date().toISOString().slice(0, 10);
  const todaysAttendance = attendanceRecords.find((a) => a.date?.slice(0, 10) === todayDateStr);
  const hasCheckedInToday = !!todaysAttendance?.check_in;
  const hasCheckedOutToday = !!todaysAttendance?.check_out;

  // ---- Leave requests (real data) ----
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    leaveType: "Casual Leave",
    duration: "Full Day",
    startDate: "",
    endDate: "",
    reason: "",
  });
  const [submittingLeave, setSubmittingLeave] = useState(false);

  const loadLeaveRequests = useCallback(async () => {
    if (!businessId || !profile?.id) return;
    setLeaveLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/employee/${businessId}/leave-requests?employeeId=${profile.id}`,
        { credentials: "include" }
      );
      const data = await res.json();
      if (data.success) {
        setLeaveRequests(data.leaveRequests);
      }
    } catch (err) {
      console.error("Failed to load leave requests:", err);
    } finally {
      setLeaveLoading(false);
    }
  }, [businessId, profile?.id]);

  const handleSubmitLeave = async () => {
    if (!profile?.id) return;
    if (!leaveForm.startDate || !leaveForm.endDate) {
      alert("Please select start and end dates.");
      return;
    }
    setSubmittingLeave(true);
    try {
      const res = await fetch(`${API_BASE}/api/employee/${businessId}/leave-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          employeeId: profile.id,
          leaveType: leaveForm.leaveType,
          duration: leaveForm.duration,
          startDate: leaveForm.startDate,
          endDate: leaveForm.endDate,
          reason: leaveForm.reason,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.message || "Failed to submit leave request.");
        return;
      }
      setLeaveForm({ leaveType: "Casual Leave", duration: "Full Day", startDate: "", endDate: "", reason: "" });
      loadLeaveRequests();
      alert("Leave request submitted successfully!");
    } catch (err) {
      console.error("Leave request error:", err);
      alert("Network error while submitting leave request.");
    } finally {
      setSubmittingLeave(false);
    }
  };

  // ---- Tasks (real data) ----
  const [tasks, setTasks] = useState<
    { id: number; employee_id: number; title: string; status: string; due_date: string | null }[]
  >([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [addingTask, setAddingTask] = useState(false);

  const loadTasks = useCallback(async () => {
    if (!businessId || !profile?.id) return;
    setTasksLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/employee/${businessId}/tasks?employeeId=${profile.id}`,
        { credentials: "include" }
      );
      const data = await res.json();
      if (data.success) {
        setTasks(data.tasks);
      }
    } catch (err) {
      console.error("Failed to load tasks:", err);
    } finally {
      setTasksLoading(false);
    }
  }, [businessId, profile?.id]);

  const handleAddTask = async () => {
    if (!profile?.id || !newTaskTitle.trim()) return;
    setAddingTask(true);
    try {
      const res = await fetch(`${API_BASE}/api/employee/${businessId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          employeeId: profile.id,
          title: newTaskTitle.trim(),
          dueDate: newTaskDueDate || null,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.message || "Failed to add task.");
        return;
      }
      setNewTaskTitle("");
      setNewTaskDueDate("");
      loadTasks();
    } catch (err) {
      console.error("Add task error:", err);
      alert("Network error while adding task.");
    } finally {
      setAddingTask(false);
    }
  };

  const handleToggleTask = async (taskId: number, currentStatus: string) => {
    const nextStatus = currentStatus === "Completed" ? "Pending" : "Completed";
    try {
      const res = await fetch(`${API_BASE}/api/employee/${businessId}/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.message || "Failed to update task.");
        return;
      }
      loadTasks();
    } catch (err) {
      console.error("Update task error:", err);
      alert("Network error while updating task.");
    }
  };

  // ---- Schedule (real data) ----
  const [scheduleEvents, setScheduleEvents] = useState<
    { id: number; employee_id: number; title: string; event_date: string; event_time: string | null }[]
  >([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDate, setNewEventDate] = useState("");
  const [newEventTime, setNewEventTime] = useState("");
  const [addingEvent, setAddingEvent] = useState(false);

  const loadSchedule = useCallback(async () => {
    if (!businessId || !profile?.id) return;
    setScheduleLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/employee/${businessId}/schedule?employeeId=${profile.id}`,
        { credentials: "include" }
      );
      const data = await res.json();
      if (data.success) {
        setScheduleEvents(data.events);
      }
    } catch (err) {
      console.error("Failed to load schedule:", err);
    } finally {
      setScheduleLoading(false);
    }
  }, [businessId, profile?.id]);

  const handleAddEvent = async () => {
    if (!profile?.id || !newEventTitle.trim() || !newEventDate) return;
    setAddingEvent(true);
    try {
      const res = await fetch(`${API_BASE}/api/employee/${businessId}/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          employeeId: profile.id,
          title: newEventTitle.trim(),
          eventDate: newEventDate,
          eventTime: newEventTime || null,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.message || "Failed to add event.");
        return;
      }
      setNewEventTitle("");
      setNewEventDate("");
      setNewEventTime("");
      loadSchedule();
    } catch (err) {
      console.error("Add event error:", err);
      alert("Network error while adding event.");
    } finally {
      setAddingEvent(false);
    }
  };

  // ---- Payslips (view only — generation is HR-only, see hr.js) ----
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [payslipsLoading, setPayslipsLoading] = useState(false);

  const loadPayslips = useCallback(async () => {
    if (!businessId || !profile?.id) return;
    setPayslipsLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/employee/${businessId}/payslips?employeeId=${profile.id}`,
        { credentials: "include" }
      );
      const data = await res.json();
      if (data.success) {
        setPayslips(data.payslips);
      }
    } catch (err) {
      console.error("Failed to load payslips:", err);
    } finally {
      setPayslipsLoading(false);
    }
  }, [businessId, profile?.id]);

  // ---- Notifications (real messages sent to Employees — untouched) ----
  type DeptMessage = {
    id: number;
    from_name: string;
    from_department: string;
    to_recipient: string;
    subject: string;
    message: string;
    created_at: string;
  };
  const [deptMessages, setDeptMessages] = useState<DeptMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);

  const loadNotifications = async () => {
    if (!businessId) return;
    setMessagesLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/messages?businessId=${businessId}&to=Employees`,
        { credentials: "include" }
      );
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
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    if (activeMenu === "Notifications" || activeMenu === "Dashboard") {
      loadNotifications();
    }
  }, [activeMenu, businessId]);

  useEffect(() => {
    if (!profile?.id) return;
    if (activeMenu === "Attendance" || activeMenu === "Dashboard") {
      loadAttendance();
    }
    if (activeMenu === "Leave" || activeMenu === "Dashboard") {
      loadLeaveRequests();
    }
    if (activeMenu === "Salary & Payslips") {
      loadPayslips();
    }
    if (activeMenu === "My Tasks" || activeMenu === "Dashboard") {
      loadTasks();
    }
    if (activeMenu === "Schedule" || activeMenu === "Dashboard") {
      loadSchedule();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMenu, profile?.id]);

  const sidebarItems = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "My Profile", icon: User },
    { name: "My Tasks", icon: ClipboardList },
    { name: "Attendance", icon: CalendarCheck },
    { name: "Salary & Payslips", icon: Wallet },
    { name: "Leave", icon: Plane },
    { name: "Schedule", icon: CalendarDays },
    { name: "Notifications", icon: Bell },
    { name: "Messages", icon: MessageSquare },
    { name: "AI Assistant", icon: Brain },
  ];

  // ---- Derived values (computed from real data, no hardcoded numbers) ----
  const presentDays = attendanceRecords.filter((a) => a.status === "Present").length;
  const lateDays = attendanceRecords.filter((a) => a.status === "Late").length;
  const absentDays = attendanceRecords.filter((a) => a.status === "Absent").length;
  const attendancePct =
    attendanceRecords.length > 0 ? Math.round((presentDays / attendanceRecords.length) * 100) : 0;

  const pendingLeaveCount = leaveRequests.filter((l) => l.status === "Pending").length;
  const approvedLeaveDays = leaveRequests
    .filter((l) => l.status === "Approved")
    .reduce((sum, l) => {
      const days =
        (new Date(l.end_date).getTime() - new Date(l.start_date).getTime()) / (1000 * 60 * 60 * 24) + 1;
      return sum + Math.max(1, Math.round(days));
    }, 0);

  const latestPayslip = payslips[0];

  const completedTasksCount = tasks.filter((t) => t.status === "Completed").length;
  const pendingTasksCount = tasks.filter((t) => t.status === "Pending").length;

  const todayStr = new Date().toISOString().slice(0, 10);
  const todaysEvents = scheduleEvents.filter((e) => e.event_date?.slice(0, 10) === todayStr);
  const upcomingEvents = scheduleEvents.filter((e) => e.event_date?.slice(0, 10) > todayStr);

  const quickStats = [
    {
      title: "Attendance",
      value: attendanceRecords.length > 0 ? `${attendancePct}%` : "—",
      icon: CalendarCheck,
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "Completed Tasks",
      value: String(completedTasksCount),
      icon: CheckCircle,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Pending Tasks",
      value: String(pendingTasksCount),
      icon: Clock3,
      color: "from-orange-500 to-red-500",
    },
    {
      title: "Leave Balance",
      value: profile ? String(profile.leave_balance) : "—",
      icon: Plane,
      color: "from-purple-500 to-pink-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-purple-100 flex">
      {/* ================= Sidebar ================= */}
      <motion.aside
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-72 bg-white/90 backdrop-blur-xl border-r border-gray-200 shadow-2xl flex flex-col"
      >
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
              <Building2 className="text-white" size={28} />
            </div>
            <div>
              <h2 className="font-bold text-lg text-gray-900">{company.name}</h2>
              <p className="text-sm text-gray-500">Employee Workspace</p>
            </div>
          </div>
        </div>

        <div className="flex-1 py-5 px-4">
          <div className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <motion.button
                  whileHover={{ x: 6 }}
                  whileTap={{ scale: 0.98 }}
                  key={item.name}
                  onClick={() => setActiveMenu(item.name)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                    activeMenu === item.name
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl"
                      : "hover:bg-blue-50 text-gray-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={20} />
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <ChevronRight size={16} />
                </motion.button>
              );
            })}
          </div>
        </div>
      </motion.aside>

      {/* ================= Main ================= */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/80 backdrop-blur-xl border-b px-8 py-6 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Employee Dashboard</h1>
              <p className="text-gray-500 mt-1">
                {profile ? `Welcome back, ${profile.name}` : profileLoading ? "Loading..." : "Welcome"}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-semibold text-gray-900">{company.name}</p>
                <p className="text-sm text-gray-500">{profile?.designation || ""}</p>
              </div>
              {profile?.profile_image && (
                <img
                  src={profile.profile_image}
                  alt=""
                  className="w-14 h-14 rounded-full object-cover border-4 border-white shadow-lg"
                />
              )}
            </div>
          </div>
        </motion.div>

        <div className="p-8">
          {profileError && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
              {profileError}
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {quickStats.map((card, index) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.03 }}
                  className={`bg-gradient-to-r ${card.color} rounded-3xl p-6 text-white shadow-2xl`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-white/80">{card.title}</p>
                      <h2 className="text-3xl font-bold mt-2">{card.value}</h2>
                    </div>
                    <div className="bg-white/20 p-4 rounded-2xl">
                      <Icon size={30} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* ================= Dashboard Content ================= */}
          {activeMenu === "Dashboard" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-8 grid grid-cols-1 xl:grid-cols-3 gap-6"
            >
              {/* Employee Overview */}
              <div className="xl:col-span-2 bg-white rounded-3xl shadow-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Employee Overview</h2>
                  <Award className="text-yellow-500" size={28} />
                </div>

                {profileLoading ? (
                  <p className="text-gray-400 text-center py-8">Loading profile...</p>
                ) : profile ? (
                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="rounded-2xl bg-blue-50 p-5">
                      <p className="text-gray-500 text-sm">Employee ID</p>
                      <h3 className="font-bold text-lg mt-1">{profile.employee_code}</h3>
                    </div>
                    <div className="rounded-2xl bg-green-50 p-5">
                      <p className="text-gray-500 text-sm">Department</p>
                      <h3 className="font-bold text-lg mt-1">{profile.department}</h3>
                    </div>
                    <div className="rounded-2xl bg-purple-50 p-5">
                      <p className="text-gray-500 text-sm">Manager</p>
                      <h3 className="font-bold text-lg mt-1">{profile.manager}</h3>
                    </div>
                    <div className="rounded-2xl bg-orange-50 p-5">
                      <p className="text-gray-500 text-sm">Joining Date</p>
                      <h3 className="font-bold text-lg mt-1">{profile.joining_date}</h3>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-8">No profile data available.</p>
                )}
              </div>

              {/* Attendance */}
              <div className="bg-white rounded-3xl shadow-xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Recent Attendance</h2>
                  <CalendarCheck className="text-green-600" />
                </div>

                <div className="space-y-4">
                  {attendanceLoading && <p className="text-gray-400 text-center py-4">Loading...</p>}
                  {!attendanceLoading && attendanceRecords.length === 0 && (
                    <p className="text-gray-400 text-center py-4">No attendance records yet.</p>
                  )}
                  {!attendanceLoading &&
                    attendanceRecords.slice(0, 5).map((item) => (
                      <div key={item.id} className="flex justify-between items-center">
                        <span className="font-medium">{item.date}</span>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            item.status === "Present"
                              ? "bg-green-100 text-green-700"
                              : item.status === "Late"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Upcoming Schedule */}
              <div className="bg-white rounded-3xl shadow-xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Upcoming Schedule</h2>
                  <CalendarDays className="text-blue-600" />
                </div>
                <div className="space-y-4">
                  {scheduleLoading && <p className="text-gray-400 text-center py-4">Loading...</p>}
                  {!scheduleLoading && upcomingEvents.length === 0 && (
                    <p className="text-gray-400 text-center py-4">No upcoming events.</p>
                  )}
                  {!scheduleLoading &&
                    upcomingEvents.slice(0, 3).map((event) => (
                      <motion.div whileHover={{ scale: 1.02 }} key={event.id} className="border rounded-2xl p-4">
                        <h3 className="font-semibold">{event.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{event.event_date}</p>
                        {event.event_time && <p className="text-sm text-blue-600 mt-1">{event.event_time}</p>}
                      </motion.div>
                    ))}
                </div>
              </div>

              {/* Recent Leave Activity */}
              <div className="bg-white rounded-3xl shadow-xl p-6 xl:col-span-2">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Recent Leave Requests</h2>
                  <Activity className="text-purple-600" />
                </div>
                <div className="space-y-4">
                  {leaveLoading && <p className="text-gray-400 text-center py-4">Loading...</p>}
                  {!leaveLoading && leaveRequests.length === 0 && (
                    <p className="text-gray-400 text-center py-4">No leave requests yet.</p>
                  )}
                  {!leaveLoading &&
                    leaveRequests.slice(0, 4).map((leave) => (
                      <div key={leave.id} className="flex gap-3">
                        {leave.status === "Approved" ? (
                          <CheckCircle className="text-green-600 mt-1" size={18} />
                        ) : leave.status === "Rejected" ? (
                          <Target className="text-red-600 mt-1" size={18} />
                        ) : (
                          <Clock3 className="text-orange-600 mt-1" size={18} />
                        )}
                        <div>
                          <p className="font-medium">
                            {leave.leave_type}: {leave.start_date} – {leave.end_date}
                          </p>
                          <span className="text-sm text-gray-500">{leave.status}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ================= MY PROFILE ================= */}
          {activeMenu === "My Profile" && (
            <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
              <div className="bg-white rounded-3xl shadow-xl p-8">
                {profileLoading ? (
                  <p className="text-gray-400 text-center py-8">Loading profile...</p>
                ) : !profile ? (
                  <p className="text-gray-400 text-center py-8">No profile data available.</p>
                ) : (
                  <div className="flex flex-col lg:flex-row gap-8">
                    <div className="flex flex-col items-center">
                      {profile.profile_image ? (
                        <img
                          src={profile.profile_image}
                          alt={profile.name}
                          className="w-40 h-40 rounded-full object-cover border-4 border-blue-500 shadow-xl"
                        />
                      ) : (
                        <div className="w-40 h-40 rounded-full bg-gray-200 flex items-center justify-center border-4 border-blue-500 shadow-xl">
                          <User size={48} className="text-gray-400" />
                        </div>
                      )}
                      <h2 className="mt-5 text-2xl font-bold">{profile.name}</h2>
                      <p className="text-gray-500">{profile.designation}</p>
                      <span className="mt-3 px-4 py-2 rounded-full bg-green-100 text-green-700 font-semibold">
                        Active Employee
                      </span>
                    </div>

                    <div className="flex-1">
                      <h2 className="text-2xl font-bold mb-6">Personal Information</h2>
                      <div className="grid md:grid-cols-2 gap-5">
                        <div className="bg-gray-50 rounded-2xl p-5">
                          <p className="text-gray-500 text-sm">Employee ID</p>
                          <h3 className="font-semibold mt-2">{profile.employee_code}</h3>
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-5">
                          <p className="text-gray-500 text-sm">Email</p>
                          <h3 className="font-semibold mt-2">{profile.email}</h3>
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-5">
                          <p className="text-gray-500 text-sm">Department</p>
                          <h3 className="font-semibold mt-2">{profile.department}</h3>
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-5">
                          <p className="text-gray-500 text-sm">Manager</p>
                          <h3 className="font-semibold mt-2">{profile.manager}</h3>
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-5">
                          <p className="text-gray-500 text-sm">Joining Date</p>
                          <h3 className="font-semibold mt-2">{profile.joining_date}</h3>
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-5">
                          <p className="text-gray-500 text-sm">Monthly Salary</p>
                          <h3 className="font-semibold mt-2 text-green-600">{profile.salary}</h3>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ================= MY TASKS ================= */}
          {activeMenu === "My Tasks" && (
            <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-3xl shadow-xl p-6">
                  <h2 className="text-xl font-bold mb-5">Completed Tasks</h2>
                  <div className="space-y-4">
                    {tasksLoading && <p className="text-gray-400 text-center py-4">Loading...</p>}
                    {!tasksLoading && tasks.filter((t) => t.status === "Completed").length === 0 && (
                      <p className="text-gray-400 text-center py-4">No completed tasks yet.</p>
                    )}
                    {!tasksLoading &&
                      tasks
                        .filter((t) => t.status === "Completed")
                        .map((task) => (
                          <motion.div
                            whileHover={{ x: 5 }}
                            key={task.id}
                            onClick={() => handleToggleTask(task.id, task.status)}
                            className="flex items-center justify-between border rounded-2xl p-4 cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <CheckCircle className="text-green-500" />
                              <span>{task.title}</span>
                            </div>
                            <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700">
                              Completed
                            </span>
                          </motion.div>
                        ))}
                  </div>
                </div>

                <div className="bg-white rounded-3xl shadow-xl p-6">
                  <h2 className="text-xl font-bold mb-5">Pending Tasks</h2>
                  <div className="space-y-4">
                    {tasksLoading && <p className="text-gray-400 text-center py-4">Loading...</p>}
                    {!tasksLoading && tasks.filter((t) => t.status === "Pending").length === 0 && (
                      <p className="text-gray-400 text-center py-4">No pending tasks.</p>
                    )}
                    {!tasksLoading &&
                      tasks
                        .filter((t) => t.status === "Pending")
                        .map((task) => (
                          <motion.div
                            whileHover={{ x: 5 }}
                            key={task.id}
                            onClick={() => handleToggleTask(task.id, task.status)}
                            className="flex items-center justify-between border rounded-2xl p-4 cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <Clock3 className="text-orange-500" />
                              <span>{task.title}</span>
                            </div>
                            <span className="text-xs px-3 py-1 rounded-full bg-yellow-100 text-yellow-700">
                              Pending
                            </span>
                          </motion.div>
                        ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl shadow-xl p-6 text-white">
                  <h2 className="text-xl font-bold mb-6">Add a Task</h2>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Task title"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="w-full rounded-xl px-4 py-3 text-gray-900"
                    />
                    <input
                      type="date"
                      value={newTaskDueDate}
                      onChange={(e) => setNewTaskDueDate(e.target.value)}
                      className="w-full rounded-xl px-4 py-3 text-gray-900"
                    />
                    <button
                      onClick={handleAddTask}
                      disabled={addingTask || !newTaskTitle.trim() || !profile}
                      className="w-full bg-white text-blue-600 font-semibold rounded-xl py-3 disabled:opacity-50"
                    >
                      {addingTask ? "Adding..." : "Add Task"}
                    </button>

                    <div className="pt-4 border-t border-white/20 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-white/80">Completed</span>
                        <h2 className="text-2xl font-bold">{completedTasksCount}</h2>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/80">Pending</span>
                        <h2 className="text-2xl font-bold">{pendingTasksCount}</h2>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ================= ATTENDANCE ================= */}
          {activeMenu === "Attendance" && (
            <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} className="mt-8 space-y-6">
              {/* Summary Cards */}
              <div className="grid md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl p-6 text-white shadow-xl">
                  <p className="text-white/80">Attendance</p>
                  <h2 className="text-4xl font-bold mt-2">{attendancePct}%</h2>
                </div>
                <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-3xl p-6 text-white shadow-xl">
                  <p className="text-white/80">Present</p>
                  <h2 className="text-4xl font-bold mt-2">{presentDays}</h2>
                </div>
                <div className="bg-gradient-to-r from-yellow-500 to-orange-600 rounded-3xl p-6 text-white shadow-xl">
                  <p className="text-white/80">Late</p>
                  <h2 className="text-4xl font-bold mt-2">{lateDays}</h2>
                </div>
                <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-3xl p-6 text-white shadow-xl">
                  <p className="text-white/80">Absent</p>
                  <h2 className="text-4xl font-bold mt-2">{absentDays}</h2>
                </div>
              </div>

              {/* Check In / Check Out */}
              <div className="bg-white rounded-3xl shadow-xl p-6 flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-xl font-bold">Today's Attendance</h2>
                  <p className="text-gray-500 mt-1">
                    {todaysAttendance
                      ? `Checked in at ${
                          todaysAttendance.check_in
                            ? new Date(todaysAttendance.check_in).toLocaleTimeString()
                            : "--"
                        }${
                          todaysAttendance.check_out
                            ? ` · Checked out at ${new Date(todaysAttendance.check_out).toLocaleTimeString()}`
                            : ""
                        }`
                      : "You haven't checked in today."}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleCheckIn}
                    disabled={checkingIn || hasCheckedInToday || !profile}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition disabled:opacity-50"
                  >
                    <LogIn size={18} />
                    {checkingIn ? "Checking In..." : "Check In"}
                  </button>
                  <button
                    onClick={() => todaysAttendance && handleCheckOut(todaysAttendance.id)}
                    disabled={checkingOut || !hasCheckedInToday || hasCheckedOutToday}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition disabled:opacity-50"
                  >
                    <LogOut size={18} />
                    {checkingOut ? "Checking Out..." : "Check Out"}
                  </button>
                </div>
              </div>

              {/* Attendance Table */}
              <div className="bg-white rounded-3xl shadow-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Attendance History</h2>
                  <CalendarCheck className="text-green-600" />
                </div>

                {attendanceLoading && <p className="text-gray-400 text-center py-8">Loading...</p>}
                {!attendanceLoading && attendanceRecords.length === 0 && (
                  <p className="text-gray-400 text-center py-8">No attendance records yet.</p>
                )}

                {!attendanceLoading && attendanceRecords.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-4">Date</th>
                          <th className="text-left py-4">Check In</th>
                          <th className="text-left py-4">Check Out</th>
                          <th className="text-left py-4">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendanceRecords.map((row) => (
                          <tr key={row.id} className="border-b hover:bg-gray-50 transition">
                            <td className="py-4 font-medium">{row.date}</td>
                            <td>{row.check_in ? new Date(row.check_in).toLocaleTimeString() : "--"}</td>
                            <td>{row.check_out ? new Date(row.check_out).toLocaleTimeString() : "--"}</td>
                            <td>
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  row.status === "Present"
                                    ? "bg-green-100 text-green-700"
                                    : row.status === "Late"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {row.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ================= SALARY & PAYSLIPS ================= */}
          {activeMenu === "Salary & Payslips" && (
            <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} className="mt-8 space-y-6">
              {/* Salary Cards */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-3xl p-6 text-white shadow-xl">
                  <p className="text-white/80">Net Salary (Latest)</p>
                  <h2 className="text-3xl font-bold mt-2">
                    {latestPayslip ? `₹${Number(latestPayslip.net_salary).toLocaleString("en-IN")}` : "—"}
                  </h2>
                </div>
                <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-3xl p-6 text-white shadow-xl">
                  <p className="text-white/80">Gross (Latest)</p>
                  <h2 className="text-3xl font-bold mt-2">
                    {latestPayslip ? `₹${Number(latestPayslip.gross).toLocaleString("en-IN")}` : "—"}
                  </h2>
                </div>
                <div className="bg-gradient-to-r from-red-500 to-orange-600 rounded-3xl p-6 text-white shadow-xl">
                  <p className="text-white/80">Deductions (Latest)</p>
                  <h2 className="text-3xl font-bold mt-2">
                    {latestPayslip ? `₹${Number(latestPayslip.deductions).toLocaleString("en-IN")}` : "—"}
                  </h2>
                </div>
              </div>

              {/* Payslip History (view only — HR generates payslips) */}
              <div className="bg-white rounded-3xl shadow-xl p-6">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-2xl font-bold">Payslip History</h2>
                </div>
                <p className="text-gray-500 text-sm mb-6">
                  Payslips are generated by HR. Contact HR if you're expecting one that isn't listed yet.
                </p>

                {payslipsLoading && <p className="text-gray-400 text-center py-8">Loading...</p>}
                {!payslipsLoading && payslips.length === 0 && (
                  <p className="text-gray-400 text-center py-8">No payslips yet.</p>
                )}

                {!payslipsLoading && payslips.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-4">Month</th>
                          <th className="text-left py-4">Gross</th>
                          <th className="text-left py-4">Deductions</th>
                          <th className="text-left py-4">Net Salary</th>
                          <th className="text-left py-4">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payslips.map((row) => (
                          <tr key={row.id} className="border-b hover:bg-gray-50">
                            <td className="py-4">{row.month}</td>
                            <td>₹{Number(row.gross).toLocaleString("en-IN")}</td>
                            <td>₹{Number(row.deductions).toLocaleString("en-IN")}</td>
                            <td className="font-semibold text-green-600">
                              ₹{Number(row.net_salary).toLocaleString("en-IN")}
                            </td>
                            <td>
                              <span
                                className={`px-3 py-1 rounded-full text-sm ${
                                  row.status === "Paid"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-yellow-100 text-yellow-700"
                                }`}
                              >
                                {row.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ================= LEAVE ================= */}
          {activeMenu === "Leave" && (
            <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} className="mt-8 space-y-6">
              {/* Leave Summary */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl p-6 text-white shadow-xl">
                  <p className="text-white/80">Remaining</p>
                  <h2 className="text-4xl font-bold mt-2">{profile ? profile.leave_balance : "—"}</h2>
                </div>
                <div className="bg-gradient-to-r from-yellow-500 to-orange-600 rounded-3xl p-6 text-white shadow-xl">
                  <p className="text-white/80">Used (Approved)</p>
                  <h2 className="text-4xl font-bold mt-2">{approvedLeaveDays}</h2>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-3xl p-6 text-white shadow-xl">
                  <p className="text-white/80">Pending</p>
                  <h2 className="text-4xl font-bold mt-2">{pendingLeaveCount}</h2>
                </div>
              </div>

              {/* Apply Leave */}
              <div className="bg-white rounded-3xl shadow-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Apply for Leave</h2>
                  <button
                    onClick={handleSubmitLeave}
                    disabled={submittingLeave || !profile}
                    className="px-5 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {submittingLeave ? "Submitting..." : "Submit Request"}
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium mb-2">Leave Type</label>
                    <select
                      value={leaveForm.leaveType}
                      onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
                      className="w-full rounded-xl border p-3 outline-none"
                    >
                      <option>Casual Leave</option>
                      <option>Sick Leave</option>
                      <option>Earned Leave</option>
                      <option>Work From Home</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Duration</label>
                    <select
                      value={leaveForm.duration}
                      onChange={(e) => setLeaveForm({ ...leaveForm, duration: e.target.value })}
                      className="w-full rounded-xl border p-3 outline-none"
                    >
                      <option>Full Day</option>
                      <option>Half Day</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Start Date</label>
                    <input
                      type="date"
                      value={leaveForm.startDate}
                      onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                      className="w-full rounded-xl border p-3"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">End Date</label>
                    <input
                      type="date"
                      value={leaveForm.endDate}
                      onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                      className="w-full rounded-xl border p-3"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium mb-2">Reason</label>
                  <textarea
                    rows={4}
                    placeholder="Enter leave reason..."
                    value={leaveForm.reason}
                    onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                    className="w-full rounded-xl border p-4 resize-none"
                  />
                </div>
              </div>

              {/* Leave History */}
              <div className="bg-white rounded-3xl shadow-xl p-6">
                <h2 className="text-2xl font-bold mb-6">Leave History</h2>

                {leaveLoading && <p className="text-gray-400 text-center py-8">Loading...</p>}
                {!leaveLoading && leaveRequests.length === 0 && (
                  <p className="text-gray-400 text-center py-8">No leave requests yet.</p>
                )}

                {!leaveLoading && leaveRequests.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-4">Type</th>
                          <th className="text-left py-4">From</th>
                          <th className="text-left py-4">To</th>
                          <th className="text-left py-4">Reason</th>
                          <th className="text-left py-4">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaveRequests.map((leave) => (
                          <tr key={leave.id} className="border-b hover:bg-gray-50">
                            <td className="py-4">{leave.leave_type}</td>
                            <td>{leave.start_date}</td>
                            <td>{leave.end_date}</td>
                            <td>{leave.reason || "—"}</td>
                            <td>
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
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ================= SCHEDULE ================= */}
          {activeMenu === "Schedule" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-3xl p-6 text-white shadow-xl">
                  <CalendarDays size={32} />
                  <p className="mt-4 text-white/80">Today's Events</p>
                  <h2 className="text-4xl font-bold mt-2">{todaysEvents.length}</h2>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-3xl p-6 text-white shadow-xl">
                  <Target size={32} />
                  <p className="mt-4 text-white/80">Upcoming Events</p>
                  <h2 className="text-4xl font-bold mt-2">{upcomingEvents.length}</h2>
                </div>
              </div>

              {/* Today's Timeline */}
              <div className="bg-white rounded-3xl shadow-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Today's Schedule</h2>
                  <CalendarDays className="text-blue-600" />
                </div>

                <div className="space-y-5">
                  {scheduleLoading && <p className="text-gray-400 text-center py-4">Loading...</p>}
                  {!scheduleLoading && todaysEvents.length === 0 && (
                    <p className="text-gray-400 text-center py-4">No events scheduled for today.</p>
                  )}
                  {!scheduleLoading &&
                    todaysEvents.map((event) => (
                      <motion.div key={event.id} whileHover={{ x: 5 }} className="flex items-center gap-5 border rounded-2xl p-5">
                        <div className="w-4 h-4 rounded-full bg-blue-500" />
                        <div className="w-28 font-semibold text-blue-600">{event.event_time || "--"}</div>
                        <div className="font-medium">{event.title}</div>
                      </motion.div>
                    ))}
                </div>
              </div>

              {/* Upcoming + Add Event */}
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-3xl shadow-xl p-6">
                  <h2 className="text-2xl font-bold mb-6">Upcoming Events</h2>
                  <div className="space-y-4">
                    {!scheduleLoading && upcomingEvents.length === 0 && (
                      <p className="text-gray-400 text-center py-4">No upcoming events.</p>
                    )}
                    {!scheduleLoading &&
                      upcomingEvents.map((event) => (
                        <motion.div whileHover={{ scale: 1.02 }} key={event.id} className="rounded-2xl border p-5">
                          <h3 className="font-bold text-lg">{event.title}</h3>
                          <p className="text-gray-500 mt-2">{event.event_date}</p>
                          {event.event_time && <p className="text-blue-600 font-medium">{event.event_time}</p>}
                        </motion.div>
                      ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl shadow-xl p-6 text-white">
                  <h2 className="text-2xl font-bold mb-6">Add Event</h2>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Event title"
                      value={newEventTitle}
                      onChange={(e) => setNewEventTitle(e.target.value)}
                      className="w-full rounded-xl px-4 py-3 text-gray-900"
                    />
                    <input
                      type="date"
                      value={newEventDate}
                      onChange={(e) => setNewEventDate(e.target.value)}
                      className="w-full rounded-xl px-4 py-3 text-gray-900"
                    />
                    <input
                      type="time"
                      value={newEventTime}
                      onChange={(e) => setNewEventTime(e.target.value)}
                      className="w-full rounded-xl px-4 py-3 text-gray-900"
                    />
                    <button
                      onClick={handleAddEvent}
                      disabled={addingEvent || !newEventTitle.trim() || !newEventDate || !profile}
                      className="w-full bg-white text-purple-600 font-semibold rounded-xl py-3 disabled:opacity-50"
                    >
                      {addingEvent ? "Adding..." : "Add Event"}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ================= NOTIFICATIONS ================= */}
          {activeMenu === "Notifications" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 space-y-6"
            >
              {/* Notification Summary */}
              <div className="grid md:grid-cols-4 gap-6">
                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-3xl p-6 text-white shadow-xl"
                >
                  <Bell size={32} />
                  <p className="mt-4 text-white/80">Total Notifications</p>
                  <h2 className="text-4xl font-bold mt-2">{deptMessages.length}</h2>
                </motion.div>

                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-3xl p-6 text-white shadow-xl"
                >
                  <Activity size={32} />
                  <p className="mt-4 text-white/80">Today</p>
                  <h2 className="text-4xl font-bold mt-2">
                    {
                      deptMessages.filter(
                        (m) => new Date(m.created_at).toDateString() === new Date().toDateString()
                      ).length
                    }
                  </h2>
                </motion.div>
              </div>

              {/* Notifications List */}
              <div className="bg-white rounded-3xl shadow-xl p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold">Recent Notifications</h2>
                </div>

                <div className="space-y-4">
                  {messagesLoading && (
                    <p className="text-gray-400 text-center py-8">Loading messages...</p>
                  )}

                  {!messagesLoading && deptMessages.length === 0 && (
                    <p className="text-gray-400 text-center py-8">No messages yet.</p>
                  )}

                  {!messagesLoading &&
                    deptMessages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        whileHover={{ x: 6 }}
                        className="flex items-start gap-4 p-5 rounded-2xl border hover:shadow-lg transition"
                      >
                        <div className="w-4 h-4 mt-2 rounded-full bg-blue-500" />

                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{msg.subject}</h3>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                              {msg.from_department}
                            </span>
                          </div>
                          <p className="text-gray-500 mt-1">{msg.message}</p>
                        </div>

                        <span className="text-sm text-gray-400 whitespace-nowrap">
                          {new Date(msg.created_at).toLocaleString()}
                        </span>
                      </motion.div>
                    ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid md:grid-cols-3 gap-6">
                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-6 text-white shadow-xl"
                >
                  <Bell size={28} />
                  <h3 className="mt-5 text-xl font-bold">HR Updates</h3>
                  <p className="text-white/80 mt-2">View latest HR policies and announcements.</p>
                </motion.div>

                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-gradient-to-r from-emerald-600 to-green-600 rounded-3xl p-6 text-white shadow-xl"
                >
                  <CalendarCheck size={28} />
                  <h3 className="mt-5 text-xl font-bold">Attendance Alerts</h3>
                  <p className="text-white/80 mt-2">Never miss attendance reminders.</p>
                </motion.div>

                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-gradient-to-r from-orange-500 to-red-600 rounded-3xl p-6 text-white shadow-xl"
                >
                  <Wallet size={28} />
                  <h3 className="mt-5 text-xl font-bold">Payroll Alerts</h3>
                  <p className="text-white/80 mt-2">Salary and payslip notifications.</p>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* ================= AI ASSISTANT (still mock chat) ================= */}
          {activeMenu === "AI Assistant" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 space-y-6">
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 flex items-center justify-center">
                      <Brain className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">AI Workplace Assistant</h2>
                      <p className="text-gray-500">Ask anything about work, HR or productivity.</p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    {aiMessages.map((msg, index) => (
                      <div
                        key={index}
                        className={
                          msg.sender === "user"
                            ? "bg-blue-600 text-white rounded-2xl p-4 ml-16"
                            : "bg-gray-100 rounded-2xl p-4"
                        }
                      >
                        {msg.text}
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex gap-3">
                    <input
                      type="text"
                      placeholder="Ask AI anything..."
                      className="flex-1 border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                    <button className="px-6 py-3 rounded-xl bg-violet-600 text-white hover:bg-violet-700 transition">
                      Send
                    </button>
                  </div>
                </div>

                {/* Quick AI Actions */}
                <div className="bg-white rounded-3xl shadow-xl p-6">
                  <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
                  <div className="space-y-4">
                    {[
                      "Generate Weekly Report",
                      "Summarize Notifications",
                      "Check Leave Balance",
                      "Improve Productivity",
                    ].map((action) => (
                      <motion.button
                        key={action}
                        whileHover={{ scale: 1.02, x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleQuickAction(action)}
                        className="w-full text-left bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-2xl p-4 shadow-md font-semibold"
                      >
                        {action}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeMenu === "Messages" && <MessageForm sender="Employees" businessId={businessId || ""} />}
        </div>
      </main>
    </div>
  );
}