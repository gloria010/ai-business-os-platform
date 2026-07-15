import React, { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
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
} from "lucide-react";

interface EmployeeData {
  id: string;
  name: string;
  email: string;
  department: string;
  designation: string;
  employeeId: string;
  joiningDate: string;
  manager: string;
  attendance: number;
  completedTasks: number;
  pendingTasks: number;
  leaveBalance: number;
  salary: string;
  profileImage: string;
}

const employee: EmployeeData = {
  id: "EMP001",
  name: "Rahul Sharma",
  email: "rahul.sharma@nexgen.com",
  department: "Software Development",
  designation: "Frontend Developer",
  employeeId: "NXG-EMP-1001",
  joiningDate: "12 Jan 2024",
  manager: "Priya Nair",
  attendance: 96,
  completedTasks: 42,
  pendingTasks: 6,
  leaveBalance: 14,
  salary: "₹65,000",
  profileImage:
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300",
};

const attendanceData = [
  { day: "Mon", status: "Present" },
  { day: "Tue", status: "Present" },
  { day: "Wed", status: "Present" },
  { day: "Thu", status: "Late" },
  { day: "Fri", status: "Present" },
];

const upcomingEvents = [
  {
    title: "Sprint Planning",
    date: "Tomorrow",
    time: "10:00 AM",
  },
  {
    title: "Client Meeting",
    date: "Friday",
    time: "2:30 PM",
  },
  {
    title: "Performance Review",
    date: "Next Week",
    time: "11:00 AM",
  },
];

const quickStats = [
  {
    title: "Attendance",
    value: "96%",
    icon: CalendarCheck,
    color: "from-green-500 to-emerald-500",
  },
  {
    title: "Completed Tasks",
    value: "42",
    icon: CheckCircle,
    color: "from-blue-500 to-cyan-500",
  },
  {
    title: "Pending Tasks",
    value: "6",
    icon: Clock3,
    color: "from-orange-500 to-red-500",
  },
  {
    title: "Leave Balance",
    value: "14",
    icon: Plane,
    color: "from-purple-500 to-pink-500",
  },
];

export default function Employee() {
  const [aiMessages, setAiMessages] = useState([
  {
    sender: "ai",
    text: "👋 Hello Rahul! How can I help you today?",
  },
]);
const handleQuickAction = (action: string) => {
  let response = "";

  switch (action) {
    case "Generate Weekly Report":
      response =
        "Your weekly report has been generated successfully.";
      break;

    case "Summarize Notifications":
      response =
        "You currently have 5 unread notifications and 13 completed notifications.";
      break;

    case "Check Leave Balance":
      response =
        `You have ${employee.leaveBalance} leave days remaining.`;
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
  const location = useLocation();

  const company =
    location.state?.company || {
      name: "NexGen Mobiles",
    };

  const [activeMenu, setActiveMenu] = useState("Dashboard");

  const sidebarItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "My Profile",
      icon: User,
    },
    {
      name: "My Tasks",
      icon: ClipboardList,
    },
    {
      name: "Attendance",
      icon: CalendarCheck,
    },
    {
      name: "Salary & Payslips",
      icon: Wallet,
    },
    {
      name: "Leave",
      icon: Plane,
    },
    {
      name: "Schedule",
      icon: CalendarDays,
    },
    {
      name: "Notifications",
      icon: Bell,
    },
    {
      name: "AI Assistant",
      icon: Brain,
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
              <h2 className="font-bold text-lg text-gray-900">
                {company.name}
              </h2>
              <p className="text-sm text-gray-500">
                Employee Workspace
              </p>
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
                    <span className="font-medium">
                      {item.name}
                    </span>
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

              <h1 className="text-3xl font-bold text-gray-900">
                Employee Dashboard
              </h1>

              <p className="text-gray-500 mt-1">
                Welcome back, {employee.name}
              </p>

            </div>

            <div className="flex items-center gap-4">

              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  {company.name}
                </p>

                <p className="text-sm text-gray-500">
                  {employee.designation}
                </p>
              </div>

              <img
                src={employee.profileImage}
                alt=""
                className="w-14 h-14 rounded-full object-cover border-4 border-white shadow-lg"
              />

            </div>

          </div>
        </motion.div>

        <div className="p-8">

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
                  whileHover={{
                    y: -8,
                    scale: 1.03,
                  }}
                  className={`bg-gradient-to-r ${card.color} rounded-3xl p-6 text-white shadow-2xl`}
                >

                  <div className="flex justify-between items-center">

                    <div>

                      <p className="text-white/80">
                        {card.title}
                      </p>

                      <h2 className="text-3xl font-bold mt-2">
                        {card.value}
                      </h2>

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
                  <h2 className="text-2xl font-bold text-gray-800">
                    Employee Overview
                  </h2>

                  <Award className="text-yellow-500" size={28} />
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div className="rounded-2xl bg-blue-50 p-5">
                    <p className="text-gray-500 text-sm">Employee ID</p>
                    <h3 className="font-bold text-lg mt-1">
                      {employee.employeeId}
                    </h3>
                  </div>

                  <div className="rounded-2xl bg-green-50 p-5">
                    <p className="text-gray-500 text-sm">Department</p>
                    <h3 className="font-bold text-lg mt-1">
                      {employee.department}
                    </h3>
                  </div>

                  <div className="rounded-2xl bg-purple-50 p-5">
                    <p className="text-gray-500 text-sm">Manager</p>
                    <h3 className="font-bold text-lg mt-1">
                      {employee.manager}
                    </h3>
                  </div>

                  <div className="rounded-2xl bg-orange-50 p-5">
                    <p className="text-gray-500 text-sm">Joining Date</p>
                    <h3 className="font-bold text-lg mt-1">
                      {employee.joiningDate}
                    </h3>
                  </div>
                </div>

                <div className="mt-8">
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold text-gray-700">
                      Overall Performance
                    </span>

                    <span className="font-bold text-blue-600">94%</span>
                  </div>

                  <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "94%" }}
                      transition={{ duration: 1 }}
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
                    />
                  </div>
                </div>
              </div>

              {/* Attendance */}
              <div className="bg-white rounded-3xl shadow-xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">
                    This Week
                  </h2>

                  <CalendarCheck className="text-green-600" />
                </div>

                <div className="space-y-4">
                  {attendanceData.map((item) => (
                    <div
                      key={item.day}
                      className="flex justify-between items-center"
                    >
                      <span className="font-medium">
                        {item.day}
                      </span>

                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          item.status === "Present"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
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
                  <h2 className="text-xl font-bold">
                    Upcoming Schedule
                  </h2>

                  <CalendarDays className="text-blue-600" />
                </div>

                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      key={event.title}
                      className="border rounded-2xl p-4"
                    >
                      <h3 className="font-semibold">
                        {event.title}
                      </h3>

                      <p className="text-sm text-gray-500 mt-1">
                        {event.date}
                      </p>

                      <p className="text-sm text-blue-600 mt-1">
                        {event.time}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Performance */}
              <div className="bg-white rounded-3xl shadow-xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">
                    Performance
                  </h2>

                  <TrendingUp className="text-blue-600" />
                </div>

                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Productivity</span>
                      <span>92%</span>
                    </div>

                    <div className="h-3 bg-gray-200 rounded-full">
                      <div className="h-3 rounded-full w-[92%] bg-blue-500" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Quality</span>
                      <span>97%</span>
                    </div>

                    <div className="h-3 bg-gray-200 rounded-full">
                      <div className="h-3 rounded-full w-[97%] bg-green-500" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Team Work</span>
                      <span>95%</span>
                    </div>

                    <div className="h-3 bg-gray-200 rounded-full">
                      <div className="h-3 rounded-full w-[95%] bg-purple-500" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-3xl shadow-xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">
                    Recent Activity
                  </h2>

                  <Activity className="text-purple-600" />
                </div>

                <div className="space-y-5">
                  <div className="flex gap-3">
                    <CheckCircle className="text-green-600 mt-1" />
                    <div>
                      <p className="font-medium">
                        Completed UI Dashboard
                      </p>
                      <span className="text-sm text-gray-500">
                        Today • 10:15 AM
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Target className="text-blue-600 mt-1" />
                    <div>
                      <p className="font-medium">
                        New sprint assigned
                      </p>
                      <span className="text-sm text-gray-500">
                        Yesterday
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Coffee className="text-orange-600 mt-1" />
                    <div>
                      <p className="font-medium">
                        Team Coffee Meeting
                      </p>
                      <span className="text-sm text-gray-500">
                        Monday
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Star className="text-yellow-500 mt-1" />
                    <div>
                      <p className="font-medium">
                        Employee of the Week
                      </p>
                      <span className="text-sm text-gray-500">
                        Last Friday
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
                    {/* ================= MY PROFILE ================= */}

          {activeMenu === "My Profile" && (
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8"
            >
              <div className="bg-white rounded-3xl shadow-xl p-8">

                <div className="flex flex-col lg:flex-row gap-8">

                  <div className="flex flex-col items-center">

                    <img
                      src={employee.profileImage}
                      alt={employee.name}
                      className="w-40 h-40 rounded-full object-cover border-4 border-blue-500 shadow-xl"
                    />

                    <h2 className="mt-5 text-2xl font-bold">
                      {employee.name}
                    </h2>

                    <p className="text-gray-500">
                      {employee.designation}
                    </p>

                    <span className="mt-3 px-4 py-2 rounded-full bg-green-100 text-green-700 font-semibold">
                      Active Employee
                    </span>

                  </div>

                  <div className="flex-1">

                    <h2 className="text-2xl font-bold mb-6">
                      Personal Information
                    </h2>

                    <div className="grid md:grid-cols-2 gap-5">

                      <div className="bg-gray-50 rounded-2xl p-5">
                        <p className="text-gray-500 text-sm">Employee ID</p>
                        <h3 className="font-semibold mt-2">
                          {employee.employeeId}
                        </h3>
                      </div>

                      <div className="bg-gray-50 rounded-2xl p-5">
                        <p className="text-gray-500 text-sm">Email</p>
                        <h3 className="font-semibold mt-2">
                          {employee.email}
                        </h3>
                      </div>

                      <div className="bg-gray-50 rounded-2xl p-5">
                        <p className="text-gray-500 text-sm">Department</p>
                        <h3 className="font-semibold mt-2">
                          {employee.department}
                        </h3>
                      </div>

                      <div className="bg-gray-50 rounded-2xl p-5">
                        <p className="text-gray-500 text-sm">Manager</p>
                        <h3 className="font-semibold mt-2">
                          {employee.manager}
                        </h3>
                      </div>

                      <div className="bg-gray-50 rounded-2xl p-5">
                        <p className="text-gray-500 text-sm">Joining Date</p>
                        <h3 className="font-semibold mt-2">
                          {employee.joiningDate}
                        </h3>
                      </div>

                      <div className="bg-gray-50 rounded-2xl p-5">
                        <p className="text-gray-500 text-sm">Monthly Salary</p>
                        <h3 className="font-semibold mt-2 text-green-600">
                          {employee.salary}
                        </h3>
                      </div>

                    </div>

                  </div>

                </div>

              </div>
            </motion.div>
          )}

          {/* ================= MY TASKS ================= */}

          {activeMenu === "My Tasks" && (
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8"
            >
              <div className="grid lg:grid-cols-3 gap-6">

                <div className="bg-white rounded-3xl shadow-xl p-6">
                  <h2 className="text-xl font-bold mb-5">
                    Today's Tasks
                  </h2>

                  <div className="space-y-4">

                    {[
                      "Finish Employee Dashboard UI",
                      "Fix attendance bug",
                      "Review pull requests",
                      "Attend sprint meeting",
                    ].map((task) => (

                      <motion.div
                        whileHover={{ x: 5 }}
                        key={task}
                        className="flex items-center justify-between border rounded-2xl p-4"
                      >

                        <div className="flex items-center gap-3">
                          <CheckCircle className="text-green-500" />
                          <span>{task}</span>
                        </div>

                        <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700">
                          Completed
                        </span>

                      </motion.div>

                    ))}

                  </div>
                </div>

                <div className="bg-white rounded-3xl shadow-xl p-6">

                  <h2 className="text-xl font-bold mb-5">
                    Pending Tasks
                  </h2>

                  <div className="space-y-4">

                    {[
                      "Prepare weekly report",
                      "Client UI revisions",
                      "Update documentation",
                    ].map((task) => (

                      <motion.div
                        whileHover={{ x: 5 }}
                        key={task}
                        className="flex items-center justify-between border rounded-2xl p-4"
                      >

                        <div className="flex items-center gap-3">
                          <Clock3 className="text-orange-500" />
                          <span>{task}</span>
                        </div>

                        <span className="text-xs px-3 py-1 rounded-full bg-yellow-100 text-yellow-700">
                          Pending
                        </span>

                      </motion.div>

                    ))}

                  </div>

                </div>

                <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl shadow-xl p-6 text-white">

                  <h2 className="text-xl font-bold mb-6">
                    Task Summary
                  </h2>

                  <div className="space-y-6">

                    <div>
                      <p className="text-white/80">
                        Completed
                      </p>

                      <h2 className="text-4xl font-bold">
                        {employee.completedTasks}
                      </h2>
                    </div>

                    <div>
                      <p className="text-white/80">
                        Pending
                      </p>

                      <h2 className="text-4xl font-bold">
                        {employee.pendingTasks}
                      </h2>
                    </div>

                    <div>
                      <p className="text-white/80">
                        Productivity
                      </p>

                      <h2 className="text-4xl font-bold">
                        94%
                      </h2>
                    </div>

                  </div>

                </div>

              </div>
            </motion.div>
          )}
                    {/* ================= ATTENDANCE ================= */}

          {activeMenu === "Attendance" && (
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 space-y-6"
            >
              {/* Summary Cards */}
              <div className="grid md:grid-cols-4 gap-6">

                <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl p-6 text-white shadow-xl">
                  <p className="text-white/80">Attendance</p>
                  <h2 className="text-4xl font-bold mt-2">
                    {employee.attendance}%
                  </h2>
                </div>

                <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-3xl p-6 text-white shadow-xl">
                  <p className="text-white/80">Present</p>
                  <h2 className="text-4xl font-bold mt-2">
                    23
                  </h2>
                </div>

                <div className="bg-gradient-to-r from-yellow-500 to-orange-600 rounded-3xl p-6 text-white shadow-xl">
                  <p className="text-white/80">Late</p>
                  <h2 className="text-4xl font-bold mt-2">
                    2
                  </h2>
                </div>

                <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-3xl p-6 text-white shadow-xl">
                  <p className="text-white/80">Absent</p>
                  <h2 className="text-4xl font-bold mt-2">
                    1
                  </h2>
                </div>

              </div>

              {/* Attendance Table */}

              <div className="bg-white rounded-3xl shadow-xl p-6">

                <div className="flex items-center justify-between mb-6">

                  <h2 className="text-2xl font-bold">
                    Monthly Attendance
                  </h2>

                  <CalendarCheck className="text-green-600" />

                </div>

                <div className="overflow-x-auto">

                  <table className="w-full">

                    <thead>

                      <tr className="border-b">

                        <th className="text-left py-4">Date</th>
                        <th className="text-left py-4">Check In</th>
                        <th className="text-left py-4">Check Out</th>
                        <th className="text-left py-4">Working Hours</th>
                        <th className="text-left py-4">Status</th>

                      </tr>

                    </thead>

                    <tbody>

                      {[
                        {
                          date: "01 Jul",
                          in: "09:02 AM",
                          out: "06:01 PM",
                          hours: "9 hrs",
                          status: "Present",
                        },
                        {
                          date: "02 Jul",
                          in: "09:15 AM",
                          out: "06:10 PM",
                          hours: "8.9 hrs",
                          status: "Late",
                        },
                        {
                          date: "03 Jul",
                          in: "08:57 AM",
                          out: "06:00 PM",
                          hours: "9 hrs",
                          status: "Present",
                        },
                        {
                          date: "04 Jul",
                          in: "09:01 AM",
                          out: "06:05 PM",
                          hours: "9 hrs",
                          status: "Present",
                        },
                        {
                          date: "05 Jul",
                          in: "--",
                          out: "--",
                          hours: "--",
                          status: "Leave",
                        },
                      ].map((row) => (

                        <tr
                          key={row.date}
                          className="border-b hover:bg-gray-50 transition"
                        >

                          <td className="py-4 font-medium">
                            {row.date}
                          </td>

                          <td>{row.in}</td>

                          <td>{row.out}</td>

                          <td>{row.hours}</td>

                          <td>

                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium
                                ${
                                  row.status === "Present"
                                    ? "bg-green-100 text-green-700"
                                    : row.status === "Late"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-blue-100 text-blue-700"
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

              </div>

              {/* Weekly Overview */}

              <div className="grid lg:grid-cols-2 gap-6">

                <div className="bg-white rounded-3xl shadow-xl p-6">

                  <h2 className="text-xl font-bold mb-5">
                    Weekly Performance
                  </h2>

                  <div className="space-y-5">

                    {[
                      { day: "Monday", value: 100 },
                      { day: "Tuesday", value: 95 },
                      { day: "Wednesday", value: 100 },
                      { day: "Thursday", value: 88 },
                      { day: "Friday", value: 100 },
                    ].map((item) => (

                      <div key={item.day}>

                        <div className="flex justify-between mb-2">
                          <span>{item.day}</span>
                          <span>{item.value}%</span>
                        </div>

                        <div className="h-3 rounded-full bg-gray-200">

                          <motion.div
                            initial={{ width: 0 }}
                            animate={{
                              width: `${item.value}%`,
                            }}
                            transition={{ duration: 0.8 }}
                            className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
                          />

                        </div>

                      </div>

                    ))}

                  </div>

                </div>

                <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl shadow-xl p-6 text-white">

                  <h2 className="text-2xl font-bold mb-6">
                    Attendance Insights
                  </h2>

                  <div className="space-y-5">

                    <div className="flex justify-between">
                      <span>This Month</span>
                      <strong>96%</strong>
                    </div>

                    <div className="flex justify-between">
                      <span>Average Check In</span>
                      <strong>09:03 AM</strong>
                    </div>

                    <div className="flex justify-between">
                      <span>Average Check Out</span>
                      <strong>06:04 PM</strong>
                    </div>

                    <div className="flex justify-between">
                      <span>Working Hours</span>
                      <strong>8.9 hrs/day</strong>
                    </div>

                    <div className="flex justify-between">
                      <span>Overtime</span>
                      <strong>6 hrs</strong>
                    </div>

                  </div>

                </div>

              </div>

            </motion.div>
          )}
                    {/* ================= SALARY & PAYSLIPS ================= */}

          {activeMenu === "Salary & Payslips" && (
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 space-y-6"
            >
              {/* Salary Cards */}
              <div className="grid md:grid-cols-4 gap-6">

                <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-3xl p-6 text-white shadow-xl">
                  <p className="text-white/80">Net Salary</p>
                  <h2 className="text-3xl font-bold mt-2">₹65,000</h2>
                </div>

                <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-3xl p-6 text-white shadow-xl">
                  <p className="text-white/80">Basic Pay</p>
                  <h2 className="text-3xl font-bold mt-2">₹50,000</h2>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-3xl p-6 text-white shadow-xl">
                  <p className="text-white/80">Allowances</p>
                  <h2 className="text-3xl font-bold mt-2">₹18,000</h2>
                </div>

                <div className="bg-gradient-to-r from-red-500 to-orange-600 rounded-3xl p-6 text-white shadow-xl">
                  <p className="text-white/80">Deductions</p>
                  <h2 className="text-3xl font-bold mt-2">₹3,000</h2>
                </div>

              </div>

              {/* Salary Breakdown */}
              <div className="grid lg:grid-cols-2 gap-6">

                <div className="bg-white rounded-3xl shadow-xl p-6">
                  <h2 className="text-2xl font-bold mb-6">
                    Salary Breakdown
                  </h2>

                  <div className="space-y-4">

                    {[
                      ["Basic Salary", "₹50,000"],
                      ["House Rent Allowance", "₹8,000"],
                      ["Medical Allowance", "₹4,000"],
                      ["Travel Allowance", "₹3,000"],
                      ["Performance Bonus", "₹3,000"],
                    ].map(([title, value]) => (
                      <div
                        key={title}
                        className="flex justify-between items-center border-b pb-3"
                      >
                        <span>{title}</span>
                        <span className="font-semibold">{value}</span>
                      </div>
                    ))}

                  </div>
                </div>

                <div className="bg-white rounded-3xl shadow-xl p-6">
                  <h2 className="text-2xl font-bold mb-6">
                    Deductions
                  </h2>

                  <div className="space-y-4">

                    {[
                      ["Provident Fund", "₹1,500"],
                      ["Professional Tax", "₹200"],
                      ["Income Tax", "₹1,300"],
                    ].map(([title, value]) => (
                      <div
                        key={title}
                        className="flex justify-between items-center border-b pb-3"
                      >
                        <span>{title}</span>
                        <span className="font-semibold text-red-600">
                          {value}
                        </span>
                      </div>
                    ))}

                  </div>

                  <div className="mt-8 rounded-2xl bg-green-50 p-5">
                    <div className="flex justify-between">
                      <span className="font-semibold">Final Salary</span>
                      <span className="text-2xl font-bold text-green-600">
                        ₹65,000
                      </span>
                    </div>
                  </div>

                </div>

              </div>

              {/* Payslip History */}
              <div className="bg-white rounded-3xl shadow-xl p-6">

                <div className="flex justify-between items-center mb-6">

                  <h2 className="text-2xl font-bold">
                    Payslip History
                  </h2>

                  <button
  onClick={() => alert("Payslip downloaded successfully!")}
  className="px-5 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
>
  Download Latest
</button>

                </div>

                <div className="overflow-x-auto">

                  <table className="w-full">

                    <thead>

                      <tr className="border-b">

                        <th className="text-left py-4">Month</th>
                        <th className="text-left py-4">Gross</th>
                        <th className="text-left py-4">Deduction</th>
                        <th className="text-left py-4">Net Salary</th>
                        <th className="text-left py-4">Status</th>

                      </tr>

                    </thead>

                    <tbody>

                      {[
                        ["July 2026", "₹68,000", "₹3,000", "₹65,000"],
                        ["June 2026", "₹68,000", "₹3,000", "₹65,000"],
                        ["May 2026", "₹68,000", "₹3,000", "₹65,000"],
                        ["April 2026", "₹68,000", "₹3,000", "₹65,000"],
                      ].map((row) => (

                        <tr
                          key={row[0]}
                          className="border-b hover:bg-gray-50"
                        >

                          <td className="py-4">{row[0]}</td>
                          <td>{row[1]}</td>
                          <td>{row[2]}</td>
                          <td className="font-semibold text-green-600">
                            {row[3]}
                          </td>

                          <td>
                            <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm">
                              Paid
                            </span>
                          </td>

                        </tr>

                      ))}

                    </tbody>

                  </table>

                </div>

              </div>


            </motion.div>
          )}
                    {/* ================= LEAVE ================= */}

          {activeMenu === "Leave" && (
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 space-y-6"
            >
              {/* Leave Summary */}
              <div className="grid md:grid-cols-4 gap-6">

                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl p-6 text-white shadow-xl">
                  <p className="text-white/80">Total Leave</p>
                  <h2 className="text-4xl font-bold mt-2">24</h2>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl p-6 text-white shadow-xl">
                  <p className="text-white/80">Remaining</p>
                  <h2 className="text-4xl font-bold mt-2">
                    {employee.leaveBalance}
                  </h2>
                </div>

                <div className="bg-gradient-to-r from-yellow-500 to-orange-600 rounded-3xl p-6 text-white shadow-xl">
                  <p className="text-white/80">Used</p>
                  <h2 className="text-4xl font-bold mt-2">10</h2>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-3xl p-6 text-white shadow-xl">
                  <p className="text-white/80">Pending</p>
                  <h2 className="text-4xl font-bold mt-2">2</h2>
                </div>

              </div>

              {/* Apply Leave */}

              <div className="bg-white rounded-3xl shadow-xl p-6">

                <div className="flex items-center justify-between mb-6">

                  <h2 className="text-2xl font-bold">
                    Apply for Leave
                  </h2>

                  <button
  onClick={() => alert("Leave request submitted successfully!")}
  className="px-5 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
>
  Submit Request
</button>

                </div>

                <div className="grid md:grid-cols-2 gap-5">

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Leave Type
                    </label>

                    <select className="w-full rounded-xl border p-3 outline-none">
                      <option>Casual Leave</option>
                      <option>Sick Leave</option>
                      <option>Earned Leave</option>
                      <option>Work From Home</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Duration
                    </label>

                    <select className="w-full rounded-xl border p-3 outline-none">
                      <option>Full Day</option>
                      <option>Half Day</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Start Date
                    </label>

                    <input
                      type="date"
                      className="w-full rounded-xl border p-3"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      End Date
                    </label>

                    <input
                      type="date"
                      className="w-full rounded-xl border p-3"
                    />
                  </div>

                </div>

                <div className="mt-6">

                  <label className="block text-sm font-medium mb-2">
                    Reason
                  </label>

                  <textarea
                    rows={4}
                    placeholder="Enter leave reason..."
                    className="w-full rounded-xl border p-4 resize-none"
                  />

                </div>

              </div>

              {/* Leave History */}

              <div className="bg-white rounded-3xl shadow-xl p-6">

                <h2 className="text-2xl font-bold mb-6">
                  Leave History
                </h2>

                <div className="overflow-x-auto">

                  <table className="w-full">

                    <thead>

                      <tr className="border-b">

                        <th className="text-left py-4">Type</th>
                        <th className="text-left py-4">From</th>
                        <th className="text-left py-4">To</th>
                        <th className="text-left py-4">Days</th>
                        <th className="text-left py-4">Status</th>

                      </tr>

                    </thead>

                    <tbody>

                      {[
                        {
                          type: "Casual Leave",
                          from: "10 Jul",
                          to: "11 Jul",
                          days: "2",
                          status: "Approved",
                        },
                        {
                          type: "Sick Leave",
                          from: "25 Jun",
                          to: "25 Jun",
                          days: "1",
                          status: "Approved",
                        },
                        {
                          type: "Earned Leave",
                          from: "18 Aug",
                          to: "20 Aug",
                          days: "3",
                          status: "Pending",
                        },
                      ].map((leave) => (

                        <tr
                          key={leave.from}
                          className="border-b hover:bg-gray-50"
                        >

                          <td className="py-4">
                            {leave.type}
                          </td>

                          <td>{leave.from}</td>

                          <td>{leave.to}</td>

                          <td>{leave.days}</td>

                          <td>

                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${
                                leave.status === "Approved"
                                  ? "bg-green-100 text-green-700"
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

              </div>

            </motion.div>
          )}
                    {/* ================= SCHEDULE ================= */}

          {activeMenu === "Schedule" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 space-y-6"
            >
              {/* Schedule Summary */}
              <div className="grid md:grid-cols-4 gap-6">

                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-3xl p-6 text-white shadow-xl"
                >
                  <CalendarDays size={32} />
                  <p className="mt-4 text-white/80">Today's Meetings</p>
                  <h2 className="text-4xl font-bold mt-2">4</h2>
                </motion.div>

                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl p-6 text-white shadow-xl"
                >
                  <Clock3 size={32} />
                  <p className="mt-4 text-white/80">Working Hours</p>
                  <h2 className="text-4xl font-bold mt-2">8.5h</h2>
                </motion.div>

                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-3xl p-6 text-white shadow-xl"
                >
                  <Target size={32} />
                  <p className="mt-4 text-white/80">Tasks Today</p>
                  <h2 className="text-4xl font-bold mt-2">7</h2>
                </motion.div>

                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-gradient-to-r from-orange-500 to-red-600 rounded-3xl p-6 text-white shadow-xl"
                >
                  <Coffee size={32} />
                  <p className="mt-4 text-white/80">Break Time</p>
                  <h2 className="text-4xl font-bold mt-2">1h</h2>
                </motion.div>

              </div>

              {/* Today's Timeline */}

              <div className="bg-white rounded-3xl shadow-xl p-6">

                <div className="flex items-center justify-between mb-6">

                  <h2 className="text-2xl font-bold">
                    Today's Schedule
                  </h2>

                  <CalendarDays className="text-blue-600" />

                </div>

                <div className="space-y-5">

                  {[
                    {
                      time: "09:00 AM",
                      title: "Daily Stand-up Meeting",
                      color: "bg-blue-500",
                    },
                    {
                      time: "10:30 AM",
                      title: "Frontend Development",
                      color: "bg-green-500",
                    },
                    {
                      time: "01:00 PM",
                      title: "Lunch Break",
                      color: "bg-orange-500",
                    },
                    {
                      time: "02:00 PM",
                      title: "Client Discussion",
                      color: "bg-purple-500",
                    },
                    {
                      time: "04:30 PM",
                      title: "Code Review",
                      color: "bg-pink-500",
                    },
                    {
                      time: "06:00 PM",
                      title: "End of Work",
                      color: "bg-gray-500",
                    },
                  ].map((event) => (

                    <motion.div
                      key={event.time}
                      whileHover={{ x: 5 }}
                      className="flex items-center gap-5 border rounded-2xl p-5"
                    >

                      <div
                        className={`w-4 h-4 rounded-full ${event.color}`}
                      />

                      <div className="w-28 font-semibold text-blue-600">
                        {event.time}
                      </div>

                      <div className="font-medium">
                        {event.title}
                      </div>

                    </motion.div>

                  ))}

                </div>

              </div>

              {/* Upcoming Meetings */}

              <div className="grid lg:grid-cols-2 gap-6">

                <div className="bg-white rounded-3xl shadow-xl p-6">

                  <h2 className="text-2xl font-bold mb-6">
                    Upcoming Meetings
                  </h2>

                  <div className="space-y-4">

                    {[
                      {
                        title: "Sprint Planning",
                        date: "Tomorrow",
                        time: "10:00 AM",
                      },
                      {
                        title: "HR Discussion",
                        date: "Friday",
                        time: "11:30 AM",
                      },
                      {
                        title: "Product Demo",
                        date: "Monday",
                        time: "03:00 PM",
                      },
                    ].map((meeting) => (

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        key={meeting.title}
                        className="rounded-2xl border p-5"
                      >

                        <h3 className="font-bold text-lg">
                          {meeting.title}
                        </h3>

                        <p className="text-gray-500 mt-2">
                          {meeting.date}
                        </p>

                        <p className="text-blue-600 font-medium">
                          {meeting.time}
                        </p>

                      </motion.div>

                    ))}

                  </div>

                </div>

                <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl shadow-xl p-6 text-white">

                  <h2 className="text-2xl font-bold mb-6">
                    Weekly Planner
                  </h2>

                  <div className="space-y-5">

                    {[
                      ["Monday", "Development"],
                      ["Tuesday", "Testing"],
                      ["Wednesday", "Client Meeting"],
                      ["Thursday", "Deployment"],
                      ["Friday", "Review & Planning"],
                    ].map(([day, work]) => (

                      <div
                        key={day}
                        className="flex justify-between items-center border-b border-white/20 pb-3"
                      >

                        <span>{day}</span>

                        <span className="font-semibold">
                          {work}
                        </span>

                      </div>

                    ))}

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
                  <h2 className="text-4xl font-bold mt-2">18</h2>
                </motion.div>

                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-gradient-to-r from-red-500 to-pink-600 rounded-3xl p-6 text-white shadow-xl"
                >
                  <Bell size={32} />
                  <p className="mt-4 text-white/80">Unread</p>
                  <h2 className="text-4xl font-bold mt-2">5</h2>
                </motion.div>

                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl p-6 text-white shadow-xl"
                >
                  <CheckCircle size={32} />
                  <p className="mt-4 text-white/80">Read</p>
                  <h2 className="text-4xl font-bold mt-2">13</h2>
                </motion.div>

                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-3xl p-6 text-white shadow-xl"
                >
                  <Activity size={32} />
                  <p className="mt-4 text-white/80">Today</p>
                  <h2 className="text-4xl font-bold mt-2">7</h2>
                </motion.div>

              </div>

              {/* Notifications List */}
              <div className="bg-white rounded-3xl shadow-xl p-6">

                <div className="mb-6">
                  <h2 className="text-2xl font-bold">
                    Recent Notifications
                  </h2>

  
                </div>

                <div className="space-y-4">

                  {[
                    {
                      title: "Salary Credited",
                      desc: "Your July salary has been credited successfully.",
                      time: "10 mins ago",
                      color: "bg-green-500",
                    },
                    {
                      title: "Leave Approved",
                      desc: "Your casual leave request has been approved.",
                      time: "1 hour ago",
                      color: "bg-blue-500",
                    },
                    {
                      title: "Sprint Planning Meeting",
                      desc: "Sprint planning starts tomorrow at 10:00 AM.",
                      time: "3 hours ago",
                      color: "bg-purple-500",
                    },
                    {
                      title: "Performance Review",
                      desc: "Your quarterly review is scheduled for Friday.",
                      time: "Yesterday",
                      color: "bg-orange-500",
                    },
                    {
                      title: "Company Announcement",
                      desc: "Work from office on Monday for all employees.",
                      time: "Yesterday",
                      color: "bg-pink-500",
                    },
                  ].map((item) => (

                    <motion.div
                      key={item.title}
                      whileHover={{ x: 6 }}
                      className="flex items-start gap-4 p-5 rounded-2xl border hover:shadow-lg transition"
                    >
                      <div
                        className={`w-4 h-4 mt-2 rounded-full ${item.color}`}
                      />

                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          {item.title}
                        </h3>

                        <p className="text-gray-500 mt-1">
                          {item.desc}
                        </p>
                      </div>

                      <span className="text-sm text-gray-400">
                        {item.time}
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

                  <h3 className="mt-5 text-xl font-bold">
                    HR Updates
                  </h3>

                  <p className="text-white/80 mt-2">
                    View latest HR policies and announcements.
                  </p>
                </motion.div>

                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-gradient-to-r from-emerald-600 to-green-600 rounded-3xl p-6 text-white shadow-xl"
                >
                  <CalendarCheck size={28} />

                  <h3 className="mt-5 text-xl font-bold">
                    Attendance Alerts
                  </h3>

                  <p className="text-white/80 mt-2">
                    Never miss attendance reminders.
                  </p>
                </motion.div>

                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-gradient-to-r from-orange-500 to-red-600 rounded-3xl p-6 text-white shadow-xl"
                >
                  <Wallet size={28} />

                  <h3 className="mt-5 text-xl font-bold">
                    Payroll Alerts
                  </h3>

                  <p className="text-white/80 mt-2">
                    Salary and payslip notifications.
                  </p>
                </motion.div>

              </div>

            </motion.div>
          )}
                    {/* ================= AI ASSISTANT ================= */}

          {activeMenu === "AI Assistant" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 space-y-6"
            >
              {/* AI Summary Cards */}
              <div className="grid md:grid-cols-4 gap-6">

                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl p-6 text-white shadow-xl"
                >
                  <Brain size={34} />
                  <p className="mt-4 text-white/80">AI Suggestions</p>
                  <h2 className="text-4xl font-bold mt-2">12</h2>
                </motion.div>

                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl p-6 text-white shadow-xl"
                >
                  <Target size={34} />
                  <p className="mt-4 text-white/80">Productivity</p>
                  <h2 className="text-4xl font-bold mt-2">94%</h2>
                </motion.div>

                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-3xl p-6 text-white shadow-xl"
                >
                  <Activity size={34} />
                  <p className="mt-4 text-white/80">Tasks Analysed</p>
                  <h2 className="text-4xl font-bold mt-2">58</h2>
                </motion.div>

                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-gradient-to-r from-pink-500 to-red-500 rounded-3xl p-6 text-white shadow-xl"
                >
                  <Star size={34} />
                  <p className="mt-4 text-white/80">Performance Score</p>
                  <h2 className="text-4xl font-bold mt-2">A+</h2>
                </motion.div>

              </div>

              {/* AI Chat */}

              <div className="grid lg:grid-cols-3 gap-6">

                <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl p-6">

                  <div className="flex items-center gap-3 mb-6">

                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 flex items-center justify-center">
                      <Brain className="text-white" />
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold">
                        AI Workplace Assistant
                      </h2>

                      <p className="text-gray-500">
                        Ask anything about work, HR or productivity.
                      </p>
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

                {/* AI Suggestions */}

                <div className="bg-white rounded-3xl shadow-xl p-6">

                  <h2 className="text-2xl font-bold mb-6">
                    Smart Suggestions
                  </h2>

                  <div className="space-y-4">

                    {[
                      "Complete pending reports before 4 PM.",
                      "Take a short break after 2 hours.",
                      "Update task progress regularly.",
                      "Apply leave before next Friday.",
                      "Review sprint goals for this week."
                    ].map((tip) => (

                      <motion.div
                        key={tip}
                        whileHover={{ x: 5 }}
                        className="rounded-2xl border p-4 hover:bg-violet-50 transition"
                      >
                        💡 {tip}
                      </motion.div>

                    ))}

                  </div>

                </div>

              </div>

              {/* Quick AI Actions */}

              <div className="grid md:grid-cols-4 gap-6">

                {[
                  "Generate Weekly Report",
                  "Summarize Notifications",
                  "Check Leave Balance",
                  "Improve Productivity"
                ].map((action) => (

                  <motion.button
  key={action}
  whileHover={{
    scale: 1.03,
    y: -4,
  }}
  whileTap={{ scale: 0.98 }}
  onClick={() => handleQuickAction(action)}
  className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-3xl p-6 shadow-xl font-semibold"
>
  {action}
</motion.button>

                ))}

              </div>

            </motion.div>
          )}
            </div>
      </main>
    </div>
  );
}