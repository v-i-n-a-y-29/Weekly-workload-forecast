import { useState } from "react";
import Card from "../components/Card";

export default function Forecast() {
  const [showModal, setShowModal] = useState(false);

  // Form States
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("Designer");
  const [capacity, setCapacity] = useState("40");
  const [email, setEmail] = useState("");

  const [employees, setEmployees] = useState([
    {
      name: "Marcus Chen",
      role: "Senior Product Designer",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces",
      capacity: 40,
      planned: 46,
      utilization: 115,
      status: "critical",
      badge: "BURNOUT RISK",
      badgeColor: "text-red-600 bg-red-50 border-red-100",
      textColor: "text-red-500",
      barColor: "bg-red-500",
      borderColor: "border-red-200",
      warningText: "6h Over capacity",
      warningIcon: "warning",
      warningColor: "text-red-500 bg-red-50/50",
    },
    {
      name: "Sarah Jenkins",
      role: "Lead Developer",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces",
      capacity: 40,
      planned: 37,
      utilization: 92,
      status: "warning",
      badge: "AT CAPACITY",
      badgeColor: "text-amber-600 bg-amber-50 border-amber-100",
      textColor: "text-amber-500",
      barColor: "bg-amber-500",
      borderColor: "border-amber-200",
      warningText: "3h Remaining",
      warningIcon: "info",
      warningColor: "text-amber-600 bg-amber-50/50",
    },
    {
      name: "Alex Rivera",
      role: "Project Coordinator",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces",
      capacity: 40,
      planned: 26,
      utilization: 65,
      status: "safe",
      badge: "AVAILABLE",
      badgeColor: "text-emerald-600 bg-emerald-50 border-emerald-100",
      textColor: "text-emerald-500",
      barColor: "bg-emerald-500",
      borderColor: "border-emerald-200",
      warningText: "14h Remaining",
      warningIcon: "check_circle",
      warningColor: "text-emerald-600 bg-emerald-50/50",
    },
    {
      name: "Emily Thorne",
      role: "Systems Analyst",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces",
      capacity: 40,
      planned: 43.2,
      utilization: 108,
      status: "critical",
      badge: "BURNOUT RISK",
      badgeColor: "text-red-600 bg-red-50 border-red-100",
      textColor: "text-red-500",
      barColor: "bg-red-500",
      borderColor: "border-red-200",
      warningText: "3.2h Over capacity",
      warningIcon: "warning",
      warningColor: "text-red-500 bg-red-50/50",
    },
    {
      name: "Jordan Smyth",
      role: "UI Developer",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces",
      capacity: 40,
      planned: 18,
      utilization: 45,
      status: "safe",
      badge: "AVAILABLE",
      badgeColor: "text-emerald-600 bg-emerald-50 border-emerald-100",
      textColor: "text-emerald-500",
      barColor: "bg-emerald-500",
      borderColor: "border-emerald-200",
      warningText: "22h Remaining",
      warningIcon: "check_circle",
      warningColor: "text-emerald-600 bg-emerald-50/50",
    },
  ]);

  const handleCreateEmployee = (e) => {
    e.preventDefault();
    if (!fullName || !email) return;

    const capNum = parseFloat(capacity) || 40;
    const newEmployee = {
      name: fullName,
      role: role,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces",
      capacity: capNum,
      planned: 0,
      utilization: 0,
      status: "safe",
      badge: "AVAILABLE",
      badgeColor: "text-emerald-600 bg-emerald-50 border-emerald-100",
      textColor: "text-emerald-500",
      barColor: "bg-emerald-500",
      borderColor: "border-emerald-200",
      warningText: `${capNum}h Remaining`,
      warningIcon: "check_circle",
      warningColor: "text-emerald-600 bg-emerald-50/50",
    };

    setEmployees([...employees, newEmployee]);
    setFullName("");
    setRole("Designer");
    setCapacity("40");
    setEmail("");
    setShowModal(false);
  };

  return (
    <div className="flex flex-col gap-6 text-left relative">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <span>Planning</span>
            <span className="material-symbols-outlined text-[10px] font-bold">chevron_right</span>
            <span className="text-[#7c3aed]">Utilization View</span>
          </div>

          <h1 className="page-title text-3xl font-black text-[#1e1b4b] tracking-tight mt-2">
            Weekly Utilization
          </h1>
          <p className="text-gray-400 text-sm font-semibold mt-1">
            Visualizing team capacity for Nov 13 – Nov 19. Identify burnout risks and optimize task distribution.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-100 rounded-full text-xs font-bold text-red-600 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span>3 Overloaded</span>
          </div>

          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#edeef3] rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors shadow-sm cursor-pointer">
            <span className="material-symbols-outlined text-[18px] font-medium text-gray-500">
              filter_list
            </span>
            <span>Filter Teams</span>
          </button>
        </div>
      </div>

      {/* Utilization Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <p className="text-gray-400 font-bold text-[10px] uppercase tracking-wider mb-2">
            Average Utilization
          </p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-4xl font-extrabold text-[#7c3aed]">78%</h2>
            <span className="text-xs font-bold text-[#7c3aed] bg-[#7c3aed]/10 px-2 py-0.5 rounded-full">Optimal</span>
          </div>
          <div className="bg-gray-100 h-1.5 rounded-full w-full overflow-hidden mt-4">
            <div className="h-full rounded-full bg-[#7c3aed]" style={{ width: "78%" }} />
          </div>
        </Card>

        <Card>
          <p className="text-gray-400 font-bold text-[10px] uppercase tracking-wider mb-2">
            Available Hours
          </p>
          <div className="flex items-baseline gap-1">
            <h2 className="text-4xl font-extrabold text-gray-900">142</h2>
            <span className="text-sm font-bold text-gray-500">Hrs Left</span>
          </div>
          <p className="text-gray-400 text-xs font-semibold mt-4 italic">
            Based on 40hr/week standard
          </p>
        </Card>

        <Card className="border-red-200">
          <p className="text-gray-400 font-bold text-[10px] uppercase tracking-wider mb-2">
            Risk Assessment
          </p>
          <h2 className="text-4xl font-extrabold text-red-500">Critical</h2>
          <p className="text-gray-400 text-xs font-semibold mt-4">
            Design Team hitting 110% average capacity.
          </p>
        </Card>
      </div>

      {/* Grid Header */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 font-sans">
          Employee Resource Cards
        </h3>
      </div>

      {/* Employee Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map((employee, index) => (
          <Card key={index} className={`border ${employee.borderColor} flex flex-col justify-between h-76`}>
            {/* Top row */}
            <div className="flex justify-between items-start gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 shadow-sm">
                  <img src={employee.avatar} alt={employee.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-sm">{employee.name}</h4>
                  <p className="text-gray-400 text-[11px] font-semibold">{employee.role}</p>
                </div>
              </div>

              <span className={`text-[8px] font-extrabold tracking-wide uppercase px-2 py-0.5 border rounded-md ${employee.badgeColor}`}>
                {employee.badge}
              </span>
            </div>

            {/* Middle row: Utilization meter */}
            <div className="mt-4">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Utilization</span>
                <span className={`text-2xl font-black ${employee.textColor}`}>{employee.utilization}%</span>
              </div>
              <div className="bg-gray-100 h-2.5 rounded-full w-full overflow-hidden">
                <div className={`h-full rounded-full ${employee.barColor}`} style={{ width: `${Math.min(employee.utilization, 100)}%` }} />
              </div>
              <div className="flex justify-between items-center text-[11px] text-gray-500 font-bold mt-2.5">
                <span>40h Capacity</span>
                <span className={employee.textColor}>{employee.planned}h Planned</span>
              </div>
            </div>

            {/* Warning bar */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold mt-4 ${employee.warningColor}`}>
              <span className="material-symbols-outlined text-[16px]">{employee.warningIcon}</span>
              <span>{employee.warningText}</span>
            </div>

            {/* Footer Row */}
            <div className="flex gap-2 mt-4 pt-3 border-t border-gray-50">
              <button
                className={`flex-1 py-2 rounded-xl text-xs font-extrabold shadow-sm transition-all cursor-pointer ${
                  employee.status === "critical"
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : employee.status === "warning"
                    ? "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    : "bg-[#7c3aed] text-white hover:bg-[#6d28d9]"
                }`}
              >
                {employee.status === "critical" || employee.status === "warning"
                  ? "Reassign Task"
                  : "View Details"}
              </button>
              <button className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 cursor-pointer">
                <span className="material-symbols-outlined text-lg">more_vert</span>
              </button>
            </div>
          </Card>
        ))}

        {/* Add Employee Dashed Card */}
        <div
          onClick={() => setShowModal(true)}
          className="border-2 border-dashed border-gray-200 rounded-2xl p-6 bg-gray-50/20 hover:bg-gray-50/80 transition-all cursor-pointer flex flex-col justify-center items-center h-76 shadow-sm group"
        >
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 group-hover:scale-105 transition-transform duration-200">
            <span className="material-symbols-outlined text-[24px]">group_add</span>
          </div>
          <button className="font-extrabold text-sm text-gray-700 mt-4 cursor-pointer">
            Add Employee
          </button>
          <p className="text-gray-400 text-xs font-semibold mt-1">
            Integrate another resource
          </p>
        </div>
      </div>

      {/* Add Employee Dialog Popup */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex justify-center items-center z-50 transition-all duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-[480px] overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-[#f4f2fe] border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
                  Add New Employee
                </h2>
                <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest mt-1">
                  Expand your resource pool
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-200/50 hover:text-gray-700 transition cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg font-bold">close</span>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateEmployee} className="p-6 space-y-5">
              {/* Name Field */}
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Employee Full Name
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                    person
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. David Tennant"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/20 transition-all bg-gray-50/50"
                  />
                </div>
              </div>

              {/* Role & Capacity Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Organizational Role
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                      work
                    </span>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full pl-10 pr-8 py-3 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:border-[#7c3aed] bg-gray-50/50 appearance-none cursor-pointer"
                    >
                      <option value="Designer">Designer</option>
                      <option value="Developer">Developer</option>
                      <option value="Project Manager">Project Manager</option>
                      <option value="QA Engineer">QA Engineer</option>
                      <option value="Systems Analyst">Systems Analyst</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none">
                      expand_more
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Weekly Capacity (hrs)
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                      schedule
                    </span>
                    <input
                      type="number"
                      required
                      min="1"
                      max="100"
                      value={capacity}
                      onChange={(e) => setCapacity(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/20 transition-all bg-gray-50/50"
                    />
                  </div>
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                    mail
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/20 transition-all bg-gray-50/50"
                  />
                </div>
              </div>

              {/* Action Buttons */}
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
                  Create Employee Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}