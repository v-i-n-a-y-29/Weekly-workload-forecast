import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Card from "../components/Card";
import { getEmployees, createEmployee } from "../services/employeeService";
import { getForecast } from "../services/forecastService";
import { createTask } from "../services/taskService";

const getMonday = (d = new Date()) => {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  const year = monday.getFullYear();
  const month = String(monday.getMonth() + 1).padStart(2, '0');
  const date = String(monday.getDate()).padStart(2, '0');
  return `${year}-${month}-${date}`;
};

export default function Forecast() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const weekStart = searchParams.get("weekStart") || getMonday();

  const [showModal, setShowModal] = useState(false);
  const [modalTab, setModalTab] = useState("existing"); // "existing" or "new"
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEmployeeDetails, setSelectedEmployeeDetails] = useState(null);

  // Form States for New Employee
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("Designer");
  const [capacity, setCapacity] = useState("40");
  const [email, setEmail] = useState("");

  // Form States for Assigning Task to Existing Employee
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [projectName, setProjectName] = useState("");
  const [taskHours, setTaskHours] = useState("");
  const [taskPriority, setTaskPriority] = useState("MEDIUM");
  const [taskDueDate, setTaskDueDate] = useState("");

  // Data States
  const [employees, setEmployees] = useState([]);
  const [employeesRaw, setEmployeesRaw] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchForecastData = async () => {
    try {
      setLoading(true);
      const [empRes, forecastRes] = await Promise.all([
        getEmployees(),
        getForecast(weekStart)
      ]);

      setEmployeesRaw(empRes.data);

      const forecastMap = {};
      forecastRes.data.forEach(item => {
        forecastMap[item.employeeId] = item;
      });

      const merged = empRes.data.map(emp => {
        const forecast = forecastMap[emp.id] || { plannedHours: 0, utilization: 0, warning: 'GREEN' };
        const plannedHours = forecast.plannedHours;
        const utilization = forecast.utilization;
        const cap = emp.weeklyCapacity;

        let status = "safe";
        let badge = "AVAILABLE";
        let badgeColor = "text-emerald-600 bg-emerald-50 border-emerald-100";
        let textColor = "text-emerald-500";
        let barColor = "bg-emerald-500";
        let borderColor = "border-emerald-200";
        let warningText = `${cap - plannedHours}h Remaining`;
        let warningIcon = "check_circle";
        let warningColor = "text-emerald-600 bg-[#ecfdf5]";

        if (utilization >= 100) {
          status = "critical";
          badge = "BURNOUT RISK";
          badgeColor = "text-red-600 bg-red-50 border-red-100";
          textColor = "text-red-500";
          barColor = "bg-red-500";
          borderColor = "border-red-200";
          warningText = `${(plannedHours - cap).toFixed(1)}h Over capacity`;
          warningIcon = "warning";
          warningColor = "text-red-500 bg-red-50/50";
        } else if (utilization >= 80) {
          status = "warning";
          badge = "AT CAPACITY";
          badgeColor = "text-amber-600 bg-amber-50 border-amber-100";
          textColor = "text-amber-500";
          barColor = "bg-amber-500";
          borderColor = "border-amber-200";
          warningText = `${(cap - plannedHours).toFixed(1)}h Remaining`;
          warningIcon = "info";
          warningColor = "text-amber-600 bg-amber-50/50";
        }

        const initials = emp.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);

        return {
          id: emp.id,
          name: emp.name,
          role: emp.role,
          capacity: cap,
          planned: plannedHours,
          utilization,
          status,
          badge,
          badgeColor,
          textColor,
          barColor,
          borderColor,
          warningText,
          warningIcon,
          warningColor,
          initials: initials || "EE"
        };
      });

      setEmployees(merged);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch forecast data:", err);
      setError("Failed to fetch weekly utilization forecast.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecastData();
  }, [weekStart]);

  const handleWeekChange = (e) => {
    const selected = e.target.value;
    if (!selected) return;

    // Normalize to starting Monday
    const dateObj = new Date(`${selected}T00:00:00.000Z`);
    const day = dateObj.getUTCDay();
    const diff = dateObj.getUTCDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(dateObj.setUTCDate(diff));
    const year = monday.getUTCFullYear();
    const month = String(monday.getUTCMonth() + 1).padStart(2, '0');
    const date = String(monday.getUTCDate()).padStart(2, '0');
    const formattedMonday = `${year}-${month}-${date}`;

    setSearchParams({ weekStart: formattedMonday });
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    if (!fullName || !email) return;

    try {
      const capNum = parseInt(capacity, 10) || 40;
      await createEmployee({
        name: fullName,
        role: role,
        weeklyCapacity: capNum
      });
      
      setFullName("");
      setRole("Designer");
      setCapacity("40");
      setEmail("");
      setShowModal(false);
      await fetchForecastData();
    } catch (err) {
      console.error("Failed to create employee:", err);
      alert(err.response?.data?.error || "Failed to create employee.");
    }
  };

  const handleAssignTask = async (e) => {
    e.preventDefault();
    if (!selectedEmployeeId || !taskTitle || !projectName || !taskHours || !taskDueDate) {
      alert("Please fill in all task fields.");
      return;
    }

    try {
      const titleWithProject = `[${projectName.trim()}] ${taskTitle.trim()}`;
      await createTask({
        title: titleWithProject,
        estimatedHours: parseFloat(taskHours),
        priority: taskPriority,
        status: "NOT_STARTED",
        dueDate: taskDueDate,
        assignedEmployeeId: selectedEmployeeId,
      });

      // Reset form
      setSelectedEmployeeId("");
      setTaskTitle("");
      setProjectName("");
      setTaskHours("");
      setTaskPriority("MEDIUM");
      setTaskDueDate("");
      setShowModal(false);

      await fetchForecastData();
    } catch (err) {
      console.error("Failed to assign task:", err);
      alert(err.response?.data?.error || "Failed to assign task.");
    }
  };

  // Calculations
  const totalEmployees = employees.length;
  const avgUtilization = totalEmployees > 0
    ? Math.round(employees.reduce((sum, e) => sum + e.utilization, 0) / totalEmployees)
    : 0;

  const totalAvailableHours = employees.reduce((sum, e) => {
    const diff = e.capacity - e.planned;
    return sum + (diff > 0 ? diff : 0);
  }, 0);

  const overloadedCount = employees.filter(e => e.utilization >= 100).length;

  const mondayDate = new Date(`${weekStart}T00:00:00.000Z`);
  const sundayDate = new Date(mondayDate);
  sundayDate.setUTCDate(mondayDate.getUTCDate() + 6);
  const options = { month: "short", day: "numeric" };
  const weekRangeStr = `${mondayDate.toLocaleDateString("en-US", options)} – ${sundayDate.toLocaleDateString("en-US", { ...options, year: "numeric" })}`;

  if (loading && employees.length === 0) {
    return <div className="p-8 text-center text-gray-500 font-bold">Loading weekly forecast...</div>;
  }

  return (
    <div className="flex flex-col gap-6 text-left relative">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-semibold">
          {error}
        </div>
      )}
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
            Visualizing team capacity for {weekRangeStr}. Identify burnout risks and optimize task distribution.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-100 rounded-full text-xs font-bold text-red-600 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span>{overloadedCount} Overloaded</span>
          </div>

          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">calendar_today</span>
            <input
              type="date"
              value={weekStart}
              onChange={handleWeekChange}
              className="pl-9 pr-3 py-2 bg-white border border-[#edeef3] rounded-xl text-xs font-bold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:border-[#7c3aed] cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Utilization Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <p className="text-gray-400 font-bold text-[10px] uppercase tracking-wider mb-2">
            Average Utilization
          </p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-4xl font-extrabold text-[#7c3aed]">{avgUtilization}%</h2>
            <span className="text-xs font-bold text-[#7c3aed] bg-[#7c3aed]/10 px-2 py-0.5 rounded-full">
              {avgUtilization > 100 ? "Overloaded" : avgUtilization >= 80 ? "Optimal" : "Available"}
            </span>
          </div>
          <div className="bg-gray-100 h-1.5 rounded-full w-full overflow-hidden mt-4">
            <div className="h-full rounded-full bg-[#7c3aed]" style={{ width: `${Math.min(avgUtilization, 100)}%` }} />
          </div>
        </Card>

        <Card>
          <p className="text-gray-400 font-bold text-[10px] uppercase tracking-wider mb-2">
            Available Hours
          </p>
          <div className="flex items-baseline gap-1">
            <h2 className="text-4xl font-extrabold text-gray-900">{totalAvailableHours.toFixed(1)}</h2>
            <span className="text-sm font-bold text-gray-500">Hrs Left</span>
          </div>
          <p className="text-gray-400 text-xs font-semibold mt-4 italic">
            Sum of remaining capacity across active resources
          </p>
        </Card>

        <Card className={overloadedCount > 0 ? "border-red-200" : ""}>
          <p className="text-gray-400 font-bold text-[10px] uppercase tracking-wider mb-2">
            Risk Assessment
          </p>
          <h2 className={`text-4xl font-extrabold ${overloadedCount > 0 ? "text-red-500" : "text-emerald-600"}`}>
            {overloadedCount > 0 ? "Critical" : "Optimal"}
          </h2>
          <p className="text-gray-400 text-xs font-semibold mt-4">
            {overloadedCount > 0 
              ? `${overloadedCount} overloaded resources this week.` 
              : "All resource allocations are within healthy bounds."}
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
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold bg-slate-200 text-slate-700 shadow-sm">
                  {employee.initials}
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
                <span>{employee.capacity}h Capacity</span>
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
                onClick={() => {
                  if (employee.status === "critical" || employee.status === "warning") {
                    setSelectedEmployeeId(employee.id);
                    setModalTab("existing");
                    setTaskDueDate(weekStart);
                    setShowModal(true);
                  } else {
                    setSelectedEmployeeDetails(employee);
                    setShowDetailsModal(true);
                  }
                }}
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
          onClick={() => {
            setModalTab("existing");
            setTaskDueDate(weekStart);
            setShowModal(true);
          }}
          className="border-2 border-dashed border-gray-200 rounded-2xl p-6 bg-gray-50/20 hover:bg-gray-50/80 transition-all cursor-pointer flex flex-col justify-center items-center h-76 shadow-sm group"
        >
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 group-hover:scale-105 transition-transform duration-200">
            <span className="material-symbols-outlined text-[24px]">group_add</span>
          </div>
          <button className="font-extrabold text-sm text-gray-700 mt-4 cursor-pointer">
            Add Employee / Assign Task
          </button>
          <p className="text-gray-400 text-xs font-semibold mt-1">
            Assign tasks to existing or new resources
          </p>
        </div>
      </div>

      {/* Add Employee/Task Dialog Popup */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex justify-center items-center z-50 transition-all duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-[480px] overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-[#f4f2fe] border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
                  Resource Action
                </h2>
                <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest mt-1">
                  Manage workload assignments
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-200/50 hover:text-gray-700 transition cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg font-bold">close</span>
              </button>
            </div>

            {/* Tab Selector */}
            <div className="flex border-b border-gray-100 bg-[#fbfaff]">
              <button
                type="button"
                onClick={() => setModalTab("existing")}
                className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all cursor-pointer ${
                  modalTab === "existing"
                    ? "border-[#7c3aed] text-[#7c3aed]"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                Assign Task to Existing Employee
              </button>
              <button
                type="button"
                onClick={() => setModalTab("new")}
                className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all cursor-pointer ${
                  modalTab === "new"
                    ? "border-[#7c3aed] text-[#7c3aed]"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                Create New Employee
              </button>
            </div>

            {/* Forms */}
            {modalTab === "new" ? (
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
            ) : (
              <form onSubmit={handleAssignTask} className="p-6 space-y-5">
                {/* Employee select */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Select Employee
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                      person
                    </span>
                    <select
                      required
                      value={selectedEmployeeId}
                      onChange={(e) => setSelectedEmployeeId(e.target.value)}
                      className="w-full pl-10 pr-8 py-3 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:border-[#7c3aed] bg-gray-50/50 appearance-none cursor-pointer"
                    >
                      <option value="">Choose employee...</option>
                      {employeesRaw.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name} ({emp.role})
                        </option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none">
                      expand_more
                    </span>
                  </div>
                </div>

                {/* Task Title */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Task Title
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                      edit
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Design Dashboard Prototypes"
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/20 transition-all bg-gray-50/50"
                    />
                  </div>
                </div>

                {/* Project Name */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Project Name
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                      folder
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Horizon-2024"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/20 transition-all bg-gray-50/50"
                    />
                  </div>
                </div>

                {/* Hours & Priority Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Estimated Hours
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                        schedule
                      </span>
                      <input
                        type="number"
                        required
                        step="0.5"
                        min="0.5"
                        placeholder="e.g. 15"
                        value={taskHours}
                        onChange={(e) => setTaskHours(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/20 transition-all bg-gray-50/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Priority
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                        warning
                      </span>
                      <select
                        value={taskPriority}
                        onChange={(e) => setTaskPriority(e.target.value)}
                        className="w-full pl-10 pr-8 py-3 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:border-[#7c3aed] bg-gray-50/50 appearance-none cursor-pointer"
                      >
                        <option value="HIGH">High</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="LOW">Low</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none">
                        expand_more
                      </span>
                    </div>
                  </div>
                </div>

                {/* Due Date Field */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Due Date
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                      calendar_today
                    </span>
                    <input
                      type="date"
                      required
                      value={taskDueDate}
                      onChange={(e) => setTaskDueDate(e.target.value)}
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
                    Assign Task & Update
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedEmployeeDetails && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex justify-center items-center z-50 transition-all duration-300 text-left">
          <div className="bg-white rounded-3xl shadow-2xl w-[520px] overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-[#f4f2fe] border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
                  Resource Details
                </h2>
                <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest mt-1">
                  Active Tasks for {selectedEmployeeDetails.name}
                </p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-200/50 hover:text-gray-700 transition cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg font-bold">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Employee Summary */}
              <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div>
                  <h4 className="font-bold text-gray-800">{selectedEmployeeDetails.name}</h4>
                  <p className="text-gray-400 text-xs font-semibold">{selectedEmployeeDetails.role}</p>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-black ${selectedEmployeeDetails.textColor}`}>
                    {selectedEmployeeDetails.utilization}% Utilization
                  </span>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">
                    {selectedEmployeeDetails.planned}h of {selectedEmployeeDetails.capacity}h
                  </p>
                </div>
              </div>

              {/* Tasks List */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Assigned Weekly Tasks
                </h4>
                
                <div className="space-y-3.5 max-h-60 overflow-y-auto pr-1">
                  {selectedEmployeeDetails.tasks && selectedEmployeeDetails.tasks.length > 0 ? (
                    selectedEmployeeDetails.tasks.map((t) => {
                      const isHigh = t.priority === "HIGH";
                      const isMedium = t.priority === "MEDIUM";
                      return (
                        <div key={t.id} className="flex justify-between items-center p-3 rounded-xl bg-white border border-gray-100 shadow-sm hover:border-gray-200 transition-all">
                          <div>
                            <h5 className="font-bold text-gray-800 text-xs">{t.title}</h5>
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wide mt-1.5 ${
                              isHigh ? "bg-red-50 text-red-600" : isMedium ? "bg-indigo-50 text-[#7c3aed]" : "bg-gray-100 text-gray-500"
                            }`}>
                              {t.priority}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-extrabold text-gray-700">{t.estimatedHours} hrs</span>
                            <p className="text-[9px] text-gray-400 font-bold mt-0.5">
                              {new Date(t.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-6 text-xs text-gray-400 font-bold bg-gray-50/50 rounded-2xl border border-dashed border-gray-100">
                      No active tasks scheduled for this week.
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-3 border-t border-gray-50">
                <button
                  type="button"
                  onClick={() => setShowDetailsModal(false)}
                  className="flex-1 bg-violet-50 text-[#7c3aed] py-3 rounded-xl text-xs font-extrabold hover:bg-violet-100 transition shadow-sm cursor-pointer text-center"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedEmployeeId(selectedEmployeeDetails.id);
                    setModalTab("existing");
                    setTaskDueDate(weekStart);
                    setShowModal(true);
                  }}
                  className="flex-1 bg-[#7c3aed] text-white py-3 rounded-xl text-xs font-extrabold hover:bg-[#6d28d9] transition shadow-md shadow-violet-200 cursor-pointer text-center"
                >
                  Assign Another Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}