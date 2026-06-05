import "./Sidebar.css";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();


  const navItems = [
    {
      path: "/",
      label: "Dashboard",
      icon: "dashboard",
    },
    {
      path: "/employees",
      label: "Employees",
      icon: "group",
    },
    {
      path: "/tasks",
      label: "Tasks",
      icon: "assignment",
    },
    {
      path: "/forecast",
      label: "Forecast",
      icon: "query_stats",
    },
    {
      path: "/analytics",
      label: "Analytics",
      icon: "analytics",
    },
  ];



  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-64px)] w-64 flex flex-col p-4 bg-[#f4f2fe] border-r border-[#e5e4e7] shadow-sm">
      {/* Logo Section */}
      <div className="mb-8 px-3 py-4">
        <h2 className="text-2xl font-bold text-[#6844c7] font-sans tracking-tight">
          Workload Engine
        </h2>
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-1">
          Enterprise Planner
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1.5">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.label === "Dashboard" && location.pathname === "/");
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? "sidebar-active"
                  : "text-[#4b5563] hover:bg-violet-100/50 hover:text-[#1f2937]"
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] ${isActive ? "fill-icon" : "font-light"}`}>
                {item.icon}
              </span>
              <span className="font-semibold text-sm">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}