import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

export default function Navbar({ onLogout }) {
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);

  const navItems = [
    { path: "/", label: "Dashboard" },
    { path: "/forecast", label: "Planning" },
    { path: "/employees", label: "Resources" },
    { path: "/analytics", label: "Reports" },
  ];

  const alerts = [
    {
      id: 1,
      type: "critical",
      title: "Marcus Chen Overloaded",
      desc: "Nearing 115% capacity limit. Work redistribution suggested.",
      time: "10m ago",
      icon: "warning",
      iconColor: "text-red-500 bg-red-50",
    },
    {
      id: 2,
      type: "deadline",
      title: "Cloud Migration Phase 2",
      desc: "Task deadline approaching tomorrow at 10:00 AM.",
      time: "1h ago",
      icon: "schedule",
      iconColor: "text-indigo-500 bg-indigo-50",
    },
    {
      id: 3,
      type: "available",
      title: "Elena R. Available",
      desc: "Current utilization is at 37.5%. Safe capacity available.",
      time: "2h ago",
      icon: "check_circle",
      iconColor: "text-emerald-500 bg-emerald-50",
    },
  ];

  // Close dropdown on clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const isLinkActive = (item) => {
    const path = location.pathname;
    if (item.label === "Dashboard") return path === "/";
    if (item.label === "Planning") return path === "/forecast" || path === "/tasks";
    if (item.label === "Resources") return path === "/employees";
    if (item.label === "Reports") return path === "/analytics";
    return false;
  };

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
      <div className="flex items-center gap-4 relative" ref={dropdownRef}>
        {/* Notification Bell Icon Button */}
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className={`p-2 rounded-full transition relative cursor-pointer ${
            showNotifications ? "bg-gray-100" : "hover:bg-gray-100"
          }`}
        >
          <span className="material-symbols-outlined text-gray-600 font-light text-[22px] flex items-center justify-center">
            notifications
          </span>
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[8px] font-black border-2 border-white shadow-sm">
            3
          </span>
        </button>

        {/* Notifications Dropdown Panel */}
        {showNotifications && (
          <div className="absolute right-0 top-12 w-80 bg-white border border-gray-100 shadow-xl rounded-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex justify-between items-center border-b border-gray-50 pb-2 mb-3">
              <span className="text-xs font-bold text-gray-800">Alerts & Notifications</span>
              <button
                onClick={() => setShowNotifications(false)}
                className="text-[10px] font-bold text-[#7c3aed] hover:underline cursor-pointer"
              >
                Mark as read
              </button>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start gap-3 p-2 rounded-xl hover:bg-gray-50 transition duration-150 text-left"
                >
                  <div className={`p-2 rounded-xl flex items-center justify-center ${alert.iconColor}`}>
                    <span className="material-symbols-outlined text-base font-light">{alert.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="text-xs font-bold text-gray-800 truncate">{alert.title}</h4>
                      <span className="text-[9px] font-medium text-gray-400 shrink-0">{alert.time}</span>
                    </div>
                    <p className="text-[10px] font-semibold text-gray-400 mt-0.5 leading-normal">
                      {alert.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Logout Button Avatar */}
        <button
          onClick={onLogout}
          title="Sign Out"
          className="w-9 h-9 rounded-full overflow-hidden border-2 border-gray-100 shadow-sm hover:border-[#7c3aed] transition cursor-pointer"
        >
          <img
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces"
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </button>
      </div>
    </nav>
  );
}