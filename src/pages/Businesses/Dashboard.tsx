import { Link, useLocation } from "react-router-dom";

export default function Dashboard() {

  const location = useLocation();

  const company = location.state?.company;


  const modules = [
    {
      name: "HR",
      icon: "🧑‍💼",
      path: "hr",
      description: "Candidates & hiring management",
    },
    {
      name: "Employees",
      icon: "👥",
      path: "employees",
      description: "Employee records",
    },
    {
      name: "Applications",
      icon: "📋",
      path: "applications",
      description: "Track applications",
    },
    {
      name: "Resume Manager",
      icon: "📄",
      path: "resumes",
      description: "Candidate resumes",
    },
    {
      name: "Orders",
      icon: "🛒",
      path: "orders",
      description: "Manage orders",
    },
    {
      name: "Products",
      icon: "📦",
      path: "products",
      description: "Inventory",
    },
    {
      name: "Analytics",
      icon: "📊",
      path: "analytics",
      description: "Business analytics",
    },
    {
      name: "AI Insights",
      icon: "🤖",
      path: "insights",
      description: "AI recommendations",
    },
    {
      name: "Notifications",
      icon: "🔔",
      path: "notifications",
      description: "Alerts",
    },
    {
      name: "Settings",
      icon: "⚙️",
      path: "settings",
      description: "Workspace settings",
    },
  ];


  return (
    <div className="min-h-screen bg-slate-950 text-white p-10">

      <h1 className="text-4xl font-black">
        {company?.name || "Business"} 
      </h1>

      <p className="text-slate-400 mt-2 text-lg">
        AI Business Workspace
      </p>


      <div className="grid md:grid-cols-3 gap-6 mt-10">

        {modules.map((item)=>(
          
          <Link
            key={item.name}
            to={`/businesses/${company?.workspace}/${item.path}`}
          >

            <div
              className="
              bg-slate-900
              border border-slate-800
              rounded-2xl
              p-6
              hover:border-blue-500
              transition
              "
            >

              <div className="text-4xl">
                {item.icon}
              </div>

              <h2 className="text-xl font-bold mt-4">
                {item.name}
              </h2>

              <p className="text-slate-400 mt-2">
                {item.description}
              </p>

            </div>

          </Link>

        ))}

      </div>

    </div>
  );
}