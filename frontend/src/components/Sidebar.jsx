import { useState } from "react";
import "./Sidebar.css";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");

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

  const handleForecastSubmit = (e) => {
    e.preventDefault();
    if (!selectedDate) return;
    
    // Normalize date to its starting Monday
    const dateObj = new Date(`${selectedDate}T00:00:00.000Z`);
    const day = dateObj.getUTCDay();
    const diff = dateObj.getUTCDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(dateObj.setUTCDate(diff));
    const year = monday.getUTCFullYear();
    const month = String(monday.getUTCMonth() + 1).padStart(2, '0');
    const date = String(monday.getUTCDate()).padStart(2, '0');
    const formattedMonday = `${year}-${month}-${date}`;

    setShowModal(false);
    setSelectedDate("");
    navigate(`/forecast?weekStart=${formattedMonday}`);
  };

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

      {/* Bottom Button */}
      <button
        onClick={() => setShowModal(true)}
        className="mt-auto mx-2 bg-[#7c3aed] text-white py-3 px-4 rounded-xl font-bold text-sm shadow-md shadow-violet-200 hover:bg-[#6d28d9] transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        <span className="material-symbols-outlined text-sm font-bold">
          add
        </span>
        <span>New Forecast</span>
      </button>

      {/* Date Picker Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex justify-center items-center z-50 text-left">
          <div className="bg-white rounded-3xl shadow-2xl w-[400px] overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 bg-[#f4f2fe] border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">
                  New Weekly Forecast
                </h2>
                <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest mt-1">
                  Select a starting week
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-200/50 hover:text-gray-700 transition cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg font-bold">close</span>
              </button>
            </div>

            <form onSubmit={handleForecastSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Choose Week Start Date (Monday)
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                    calendar_today
                  </span>
                  <input
                    type="date"
                    required
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/20 transition-all bg-gray-50/50"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-2">
                  * Selecting any date in the week will automatically use that week's Monday.
                </p>
              </div>

              <div className="flex gap-4 pt-3 border-t border-gray-50">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-violet-50 text-[#7c3aed] py-3 rounded-xl text-xs font-extrabold hover:bg-violet-100 transition shadow-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#7c3aed] text-white py-3 rounded-xl text-xs font-extrabold hover:bg-[#6d28d9] transition shadow-md shadow-violet-200 cursor-pointer"
                >
                  Open Forecast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
}