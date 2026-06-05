import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

export default function Navbar({ onLogout }) {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard" },
    { path: "/forecast", label: "Planning" },
    { path: "/employees", label: "Resources" },
    { path: "/analytics", label: "Reports" },
  ];

  const isLinkActive = (item) => {
    const path = location.pathname;
    if (item.label === "Dashboard") return path === "/";
    if (item.label === "Planning") return path === "/forecast" || path === "/tasks";
    if (item.label === "Resources") return path === "/employees";
    if (item.label === "Reports") return path === "/analytics";
    return false;
  };

  const email = localStorage.getItem("loginEmail") || "admin@company.com";
  const initials = email
    .split("@")[0]
    .split(".")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-10 h-16 bg-white border-b border-gray-100 shadow-sm">
      {/* Branded Logo */}
      <div className="flex items-center gap-2.5">
        <div className="bg-[#8b5cf6] text-white p-1.5 rounded-lg flex items-center justify-center shadow-sm">
          <span className="material-symbols-outlined text-[16px] font-bold">
            query_stats
          </span>
        </div>
        <span className="text-xs font-black text-gray-800 tracking-wider uppercase font-sans">
          Workload <span className="text-[#8b5cf6]">Engine</span>
        </span>
      </div>

      {/* Navigation */}
      <div className="hidden md:flex items-center gap-8">
        {navItems.map((item) => {
          const active = isLinkActive(item);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link pb-1 font-semibold text-sm transition-all duration-200 ${
                active
                  ? "nav-active border-b-2 border-[#6844c7] text-[#6844c7]"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        {/* Logout Button Avatar displaying initials */}
        <button
          onClick={onLogout}
          title={`Sign Out (${email})`}
          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold bg-[#7c3aed] text-white border-2 border-white shadow-md hover:bg-[#6d28d9] transition cursor-pointer"
        >
          {initials || "AD"}
        </button>
      </div>
    </nav>
  );
}