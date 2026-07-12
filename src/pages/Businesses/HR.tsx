import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Bell,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
} from "lucide-react";

import {
  appliedCandidates,
  pendingCandidates,
  rejectedCandidates,
  employees,
  hrNotifications,
} from "../../data/hrData";

export default function HR() {
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [applicationTab, setApplicationTab] = useState("applied");

  return (
    <div className="min-h-screen bg-slate-100 flex">

      {/* Sidebar */}

      <aside className="w-72 bg-white shadow-lg border-r">

        <div className="p-6 border-b">

          <h1 className="text-2xl font-bold">
            Infosys
          </h1>

          <p className="text-slate-500 text-sm">
            HR Workspace
          </p>

        </div>

        <nav className="p-4 space-y-2">

          <button
            onClick={() => setActiveMenu("dashboard")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
              activeMenu === "dashboard"
                ? "bg-blue-600 text-white"
                : "hover:bg-slate-100"
            }`}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </button>

          <button
            onClick={() => setActiveMenu("applications")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
              activeMenu === "applications"
                ? "bg-blue-600 text-white"
                : "hover:bg-slate-100"
            }`}
          >
            <FileText size={20} />
            Applications
          </button>

          <button
            onClick={() => setActiveMenu("employees")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
              activeMenu === "employees"
                ? "bg-blue-600 text-white"
                : "hover:bg-slate-100"
            }`}
          >
            <Users size={20} />
            Employees
          </button>

          <button
            onClick={() => setActiveMenu("notifications")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
              activeMenu === "notifications"
                ? "bg-blue-600 text-white"
                : "hover:bg-slate-100"
            }`}
          >
            <Bell size={20} />
            Notifications
          </button>

        </nav>

      </aside>

      {/* Main */}

      <main className="flex-1 p-8">

        <h1 className="text-3xl font-bold mb-8">
          Human Resources
        </h1>
        {/* ================= Dashboard ================= */}

{activeMenu === "dashboard" && (
  <div className="bg-white rounded-2xl shadow p-8 min-h-[500px]">

  </div>
)}

{/* ================= Applications ================= */}

{activeMenu === "applications" && (
  <div className="bg-white rounded-2xl shadow p-6">

    <div className="flex gap-4 mb-8">

      <button
        onClick={() => setApplicationTab("applied")}
        className={`px-6 py-3 rounded-xl font-semibold transition ${
          applicationTab === "applied"
            ? "bg-green-600 text-white"
            : "bg-slate-100"
        }`}
      >
        Applied
      </button>

      <button
        onClick={() => setApplicationTab("pending")}
        className={`px-6 py-3 rounded-xl font-semibold transition ${
          applicationTab === "pending"
            ? "bg-yellow-500 text-white"
            : "bg-slate-100"
        }`}
      >
        Pending
      </button>

      <button
        onClick={() => setApplicationTab("rejected")}
        className={`px-6 py-3 rounded-xl font-semibold transition ${
          applicationTab === "rejected"
            ? "bg-red-600 text-white"
            : "bg-slate-100"
        }`}
      >
        Rejected
      </button>

    </div>

    {/* Applied */}

    {applicationTab === "applied" && (

      <div className="space-y-5">

        {appliedCandidates.map((candidate) => (

          <div
            key={candidate.id}
            className="border rounded-xl p-5 flex justify-between items-center"
          >

            <div>

              <h2 className="font-bold text-lg">
                {candidate.name}
              </h2>

              <p>{candidate.email}</p>

              <p>{candidate.position}</p>

              <p>{candidate.experience}</p>

              <p>{candidate.appliedDate}</p>

            </div>

            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg">
              <Eye size={18} />
              View Resume
            </button>

          </div>

        ))}

      </div>

    )}

    {/* Pending */}

    {applicationTab === "pending" && (

      <div className="space-y-5">

        {pendingCandidates.map((candidate) => (

          <div
            key={candidate.id}
            className="border rounded-xl p-5 flex justify-between items-center"
          >

            <div>

              <h2 className="font-bold text-lg">
                {candidate.name}
              </h2>

              <p>{candidate.email}</p>

              <p>{candidate.position}</p>

              <p>{candidate.experience}</p>

              <p>{candidate.appliedDate}</p>

            </div>

            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg">
              <Eye size={18} />
              View Resume
            </button>

          </div>

        ))}

      </div>

    )}

    {/* Rejected */}

    {applicationTab === "rejected" && (

      <div className="space-y-5">

        {rejectedCandidates.map((candidate) => (

          <div
            key={candidate.id}
            className="border rounded-xl p-5"
          >

            <h2 className="font-bold text-lg">
              {candidate.name}
            </h2>

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

          </tr>

        </thead>

        <tbody>

          {employees.map((employee) => (

            <tr
              key={employee.id}
              className="border-b hover:bg-slate-50"
            >

              <td className="p-4">{employee.id}</td>

              <td className="p-4 font-medium">
                {employee.name}
              </td>

              <td className="p-4">
                {employee.email}
              </td>

              <td className="p-4">
                {employee.department}
              </td>

              <td className="p-4">
                {employee.designation}
              </td>

              <td className="p-4">
                {employee.salary}
              </td>

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

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  </div>

)}

{/* ================= Notifications ================= */}

{activeMenu === "notifications" && (

  <div className="bg-white rounded-2xl shadow p-6 space-y-5">

    {hrNotifications.map((notification) => (

      <div
  key={notification.id}
  className="border border-yellow-200 rounded-xl p-5 transition-all duration-300 cursor-pointer hover:bg-yellow-100 hover:border-yellow-400 hover:shadow-lg"
>

        <h2 className="font-bold text-lg">
          {notification.title}
        </h2>

        <p className="text-slate-600 mt-2">
          {notification.message}
        </p>

        <p className="text-sm text-slate-400 mt-2">
          {notification.date}
        </p>

      </div>

    ))}

  </div>

)}

      </main>

    </div>

  );

}