import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import "./Dashboard.css";
import Card from "../components/Card";
import { getEmployees } from "../services/employeeService";
import { getForecast } from "../services/forecastService";
import { getTasks } from "../services/taskService";

const getMonday = (d = new Date()) => {
  const day = d.getUTCDay();
  const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setUTCDate(diff));
  const year = monday.getUTCFullYear();
  const month = String(monday.getUTCMonth() + 1).padStart(2, '0');
  const date = String(monday.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${date}`;
};

export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const weekStart = searchParams.get("weekStart") || getMonday();

  const [searchTerm, setSearchTerm] = useState("");
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredHealthBar, setHoveredHealthBar] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [empRes, forecastRes, tasksRes] = await Promise.all([
        getEmployees(),
        getForecast(weekStart),
        getTasks()
      ]);

      const forecastMap = {};
      forecastRes.data.forEach(item => {
        forecastMap[item.employeeId] = item;
      });

      const mergedEmployees = empRes.data.map(emp => {
        const forecast = forecastMap[emp.id] || { plannedHours: 0, utilization: 0, warning: 'GREEN' };
        
        let status = "green"; // <= 80%
        if (forecast.utilization >= 100) {
          status = "red";
        } else if (forecast.utilization >= 80) {
          status = "yellow";
        } else if (forecast.utilization < 50) {
          status = "blue";
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
          capacity: `${emp.weeklyCapacity}h`,
          planned: `${forecast.plannedHours}h`,
          utilization: forecast.utilization,
          status: status,
          avatarText: initials || "EE",
          avatarBg: forecast.utilization >= 100 
            ? "bg-red-100 text-red-700" 
            : forecast.utilization >= 80 
            ? "bg-indigo-100 text-indigo-700" 
            : "bg-slate-200 text-slate-700",
        };
      });

      // Filter non-completed tasks sorted by due date
      const upcomingTasks = tasksRes.data
        .filter(t => t.status !== "COMPLETED")
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

      setEmployees(mergedEmployees);
      setTasks(upcomingTasks);
      setError(null);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      setError("Failed to fetch dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [weekStart]);

  const handleWeekChange = (e) => {
    const selected = e.target.value;
    if (!selected) return;

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

  const handleExportCSV = () => {
    const headers = ["Employee Name", "Capacity", "Planned Hours", "Utilization %", "Status"];
    const rows = filteredEmployees.map(emp => [
      emp.name,
      emp.capacity,
      emp.planned,
      `${emp.utilization}%`,
      emp.status
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Resource_Utilization_${weekStart}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats calculation
  const totalEmployeesCount = employees.length;
  const totalTasksCount = tasks.length;
  const averageUtilization = totalEmployeesCount > 0
    ? (employees.reduce((sum, e) => sum + e.utilization, 0) / totalEmployeesCount).toFixed(1)
    : "0.0";

  const totalPlannedHours = employees.reduce((sum, e) => {
    const hours = parseFloat(e.planned) || 0;
    return sum + hours;
  }, 0);

  const overloadedCount = employees.filter(e => e.utilization >= 100).length;
  const underCapacityCount = employees.filter(e => e.utilization < 50).length;

  const healthBars = [
    { height: "30%", color: "bg-[#7c3aed]/30", value: 30 },
    { height: "50%", color: "bg-[#7c3aed]/40", value: 50 },
    { height: "75%", color: "bg-[#7c3aed]/60", value: 75 },
    { height: "60%", color: "bg-[#7c3aed]/50", value: 60 },
    { height: "85%", color: "bg-[#7c3aed]", value: 85 },
    { height: "40%", color: "bg-[#7c3aed]/30", value: 40 },
    { height: "65%", color: "bg-[#7c3aed]/50", value: 65 },
  ];

  const mondayDate = new Date(`${weekStart}T00:00:00.000Z`);
  const sundayDate = new Date(mondayDate);
  sundayDate.setUTCDate(mondayDate.getUTCDate() + 6);
  const options = { month: "short", day: "numeric" };
  const weekRangeStr = `Week of ${mondayDate.toLocaleDateString("en-US", options)} - ${sundayDate.toLocaleDateString("en-US", { ...options, year: "numeric" })}`;

  if (loading && employees.length === 0) {
    return <div className="p-8 text-center text-gray-500 font-bold">Loading dashboard metrics...</div>;
  }

  return (
    <div className="flex flex-col gap-6 text-left">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-semibold">
          {error}
        </div>
      )}
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="page-title text-3xl font-black text-[#1e1b4b] tracking-tight">
            Executive Overview
          </h1>
          <p className="text-gray-400 text-sm font-semibold mt-1">
            {weekRangeStr}
          </p>
        </div>
        
        <div className="flex gap-3 items-center">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">calendar_today</span>
            <input
              type="date"
              value={weekStart}
              onChange={handleWeekChange}
              className="pl-9 pr-3 py-2 bg-white border border-[#edeef3] rounded-xl text-xs font-bold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:border-[#7c3aed] cursor-pointer"
            />
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-[#edeef3] rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] font-medium text-gray-500">
              download
            </span>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex justify-between items-start mb-4">
            <div className="bg-indigo-50 text-[#7c3aed] p-2.5 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px] font-light">
                group
              </span>
            </div>
          </div>
          <p className="text-gray-400 font-bold text-[11px] uppercase tracking-wider">
            Total Employees
          </p>
          <h2 className="text-3xl font-bold mt-1 text-gray-900">{totalEmployeesCount}</h2>
        </Card>

        <Card>
          <div className="flex justify-between items-start mb-4">
            <div className="bg-blue-50 text-blue-500 p-2.5 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px] font-light">
                assignment
              </span>
            </div>
          </div>
          <p className="text-gray-400 font-bold text-[11px] uppercase tracking-wider">
            Total Tasks
          </p>
          <h2 className="text-3xl font-bold mt-1 text-gray-900">{totalTasksCount}</h2>
        </Card>

        <Card>
          <div className="flex justify-between items-start mb-4">
            <div className="bg-violet-50 text-[#7c3aed] p-2.5 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px] font-light">
                bolt
              </span>
            </div>
            <span className="text-[#7c3aed] bg-[#7c3aed]/10 px-2 py-0.5 rounded-full text-xs font-extrabold tracking-wide">
              {parseFloat(averageUtilization) > 100 ? "Overloaded" : parseFloat(averageUtilization) >= 80 ? "Optimal" : "Available"}
            </span>
          </div>
          <p className="text-gray-400 font-bold text-[11px] uppercase tracking-wider">
            Avg Team Capacity
          </p>
          <h2 className="text-3xl font-bold mt-1 text-gray-900">{averageUtilization}%</h2>
        </Card>

        <Card>
          <div className="flex justify-between items-start mb-4">
            <div className="bg-gray-100 text-gray-500 p-2.5 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px] font-light">
                schedule
              </span>
            </div>
          </div>
          <p className="text-gray-400 font-bold text-[11px] uppercase tracking-wider">
            Planned Hours
          </p>
          <h2 className="text-3xl font-bold mt-1 text-gray-900">{totalPlannedHours}h</h2>
        </Card>
      </div>

      {/* TABLE + SIDE BAR */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Resource Utilization Table */}
        <div className="lg:col-span-8">
          <Card className="h-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h3 className="text-lg font-bold text-gray-900 font-sans">
                Resource Utilization
              </h3>
              <div className="relative w-full sm:w-64">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-full text-xs font-semibold focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/20 transition-all bg-gray-50/50"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-100">
                    <th className="pb-3 text-[11px] font-bold uppercase tracking-wider">
                      Employee Name
                    </th>
                    <th className="pb-3 text-[11px] font-bold uppercase tracking-wider">
                      Capacity
                    </th>
                    <th className="pb-3 text-[11px] font-bold uppercase tracking-wider">
                      Planned
                    </th>
                    <th className="pb-3 text-[11px] font-bold uppercase tracking-wider">
                      Utilization
                    </th>
                    <th className="pb-3 text-[11px] font-bold uppercase tracking-wider text-center">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredEmployees.map((employee, index) => {
                    const isOverloaded = employee.utilization >= 100;
                    return (
                      <tr key={index} className="border-b border-gray-50 last:border-none">
                        <td className="py-4 flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${employee.avatarBg}`}>
                            {employee.avatarText}
                          </div>
                          <span className="font-bold text-gray-800 text-sm">
                            {employee.name}
                          </span>
                        </td>

                        <td className="py-4 text-gray-600 text-sm font-semibold">
                          {employee.capacity}
                        </td>

                        <td className="py-4 text-gray-600 text-sm font-semibold">
                          {employee.planned}
                        </td>

                        <td className="py-4 w-48">
                          <div className="flex items-center gap-2">
                            <div className="bg-gray-100 rounded-full h-2 w-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  isOverloaded ? "bg-red-500" : "bg-[#7c3aed]"
                                }`}
                                style={{
                                  width: `${Math.min(employee.utilization, 100)}%`,
                                }}
                              />
                            </div>
                            <span className="text-xs font-bold text-gray-500 w-8 text-right">{employee.utilization}%</span>
                          </div>
                        </td>

                        <td className="py-4 text-center">
                          <span
                            className={`w-2.5 h-2.5 rounded-full inline-block ${
                              employee.status === "green"
                                ? "bg-[#22c55e]"
                                : employee.status === "yellow"
                                ? "bg-[#facc15]"
                                : employee.status === "blue"
                                ? "bg-[#3b82f6]"
                                : "bg-red-500"
                            }`}
                          />
                        </td>
                      </tr>
                    );
                  })}
                  {filteredEmployees.length === 0 && (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-gray-400 text-sm">
                        No employees found matching search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right Widgets Column */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Workload Summary */}
          <Card>
            <h3 className="text-lg font-bold text-gray-900 mb-4 font-sans">
              Workload Summary
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm font-semibold">
                  Overloaded Resources
                </span>
                <span className="font-extrabold text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-lg">
                  {overloadedCount}
                </span>
              </div>

              <div className="flex justify-between items-center border-b border-gray-50 pb-4">
                <span className="text-gray-500 text-sm font-semibold">
                  Under-capacity
                </span>
                <span className="font-extrabold text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">
                  {underCapacityCount}
                </span>
              </div>

              <div>
                <span className="text-gray-400 font-bold text-[10px] uppercase tracking-wider">
                  Team Sentiment Score
                </span>
                <div className="flex gap-1 mt-2">
                  <div className="bg-[#22c55e] h-1.5 flex-1 rounded-full" />
                  <div className="bg-[#22c55e] h-1.5 flex-1 rounded-full" />
                  <div className="bg-[#22c55e] h-1.5 flex-1 rounded-full" />
                  <div className="bg-[#facc15] h-1.5 flex-1 rounded-full" />
                  <div className="bg-gray-100 h-1.5 flex-1 rounded-full" />
                </div>
              </div>
            </div>
          </Card>

          {/* Upcoming Deadlines */}
          <Card>
            <h3 className="text-lg font-bold text-gray-900 mb-4 font-sans">
              Upcoming Deadlines
            </h3>

            <div className="space-y-3">
              {tasks.slice(0, 3).map((task) => {
                const dateObj = new Date(task.dueDate);
                const isToday = new Date().toDateString() === dateObj.toDateString();
                const dueText = isToday 
                  ? "Due Today" 
                  : `Due ${dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
                  
                const isHigh = task.priority === "HIGH";
                const isMedium = task.priority === "MEDIUM";
                
                return (
                  <div key={task.id} className="flex border border-gray-100 rounded-xl overflow-hidden shadow-sm bg-white hover:border-gray-200 transition-all">
                    <div className={`w-1.5 ${isHigh ? "bg-red-500" : isMedium ? "bg-[#7c3aed]" : "bg-gray-500"}`} />
                    <div className="p-3 flex-1">
                      <h4 className="font-bold text-gray-800 text-sm">
                        {task.title}
                      </h4>
                      <p className="text-gray-400 text-xs mt-0.5 font-semibold">
                        {dueText}
                      </p>
                    </div>
                  </div>
                );
              })}
              {tasks.length === 0 && (
                <div className="text-center py-6 text-sm text-gray-400 font-medium">
                  No upcoming deadlines
                </div>
              )}
            </div>

            <div className="mt-4 text-center">
              <a href="/tasks" className="text-[#7c3aed] text-xs font-bold hover:underline">
                View All Tasks
              </a>
            </div>
          </Card>

          {/* Health Index */}
          <Card className="relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-gray-900 font-sans">
                  Health Index
                </h3>
                <p className="text-gray-400 text-xs font-semibold mt-0.5">
                  Global performance is steady.
                </p>
              </div>
              <div className="h-6 text-right">
                {hoveredHealthBar !== null && (
                  <span className="text-[10px] font-extrabold text-[#7c3aed] bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100 animate-in fade-in duration-200">
                    Day {hoveredHealthBar + 1}: {healthBars[hoveredHealthBar].value}%
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-end justify-between gap-2.5 h-24 mt-4 px-2">
              {healthBars.map((bar, idx) => (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredHealthBar(idx)}
                  onMouseLeave={() => setHoveredHealthBar(null)}
                  className={`w-full ${bar.color} rounded-t-lg transition-all duration-200 hover:scale-y-105 origin-bottom cursor-pointer`}
                  style={{ height: bar.height }}
                />
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}