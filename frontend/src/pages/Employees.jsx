import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Card from "../components/Card";
import { getEmployees, createEmployee } from "../services/employeeService";
import { getForecast } from "../services/forecastService";

const getMonday = (d = new Date()) => {
  const day = d.getUTCDay();
  const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setUTCDate(diff));
  const year = monday.getUTCFullYear();
  const month = String(monday.getUTCMonth() + 1).padStart(2, '0');
  const date = String(monday.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${date}`;
};

export default function Employees() {
  const [searchParams, setSearchParams] = useSearchParams();
  const weekStart = searchParams.get("weekStart") || getMonday();

  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Form States
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("Designer");
  const [capacity, setCapacity] = useState("40");
  const [email, setEmail] = useState("");

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEmployeesData = async () => {
    try {
      setLoading(true);
      const [empRes, forecastRes] = await Promise.all([
        getEmployees(),
        getForecast(weekStart)
      ]);
      
      const forecastMap = {};
      forecastRes.data.forEach(item => {
        forecastMap[item.employeeId] = item;
      });

      const mergedEmployees = empRes.data.map(emp => {
        const forecast = forecastMap[emp.id] || { plannedHours: 0, utilization: 0, warning: 'GREEN' };
        
        let status = "Underloaded";
        if (forecast.utilization >= 100) {
          status = "Overloaded";
        } else if (forecast.utilization >= 80) {
          status = "Optimal";
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
          capacity: emp.weeklyCapacity,
          planned: forecast.plannedHours,
          utilization: forecast.utilization,
          status: status,
          avatarBg: forecast.utilization >= 100 
            ? "bg-red-100 text-red-700" 
            : forecast.utilization >= 80 
            ? "bg-indigo-100 text-indigo-700" 
            : "bg-slate-200 text-slate-700",
          avatarText: initials || "EE",
        };
      });

      setEmployees(mergedEmployees);
      setError(null);
    } catch (err) {
      console.error("Failed to load employees:", err);
      setError("Failed to fetch employees and workload data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeesData();
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
    const headers = ["Name", "Role", "Weekly Capacity", "Planned Hours", "Utilization %", "Status"];
    const rows = filteredEmployees.map(emp => [
      emp.name,
      emp.role,
      `${emp.capacity}h`,
      `${emp.planned}h`,
      `${emp.utilization}%`,
      emp.status
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Employee_Workloads_${weekStart}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName) return;

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
      await fetchEmployeesData();
    } catch (err) {
      console.error("Failed to create employee:", err);
      alert(err.response?.data?.error || "Failed to create employee record.");
    }
  };

  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalEmployeesCount = employees.length;
  const avgCapacity = totalEmployeesCount > 0 
    ? (employees.reduce((sum, e) => sum + e.capacity, 0) / totalEmployeesCount).toFixed(1) 
    : 0;
  const avgLoad = totalEmployeesCount > 0 
    ? Math.round(employees.reduce((sum, e) => sum + e.utilization, 0) / totalEmployeesCount) 
    : 0;
  const atRiskCount = employees.filter(e => e.utilization >= 100).length;

  const mondayDate = new Date(`${weekStart}T00:00:00.000Z`);
  const sundayDate = new Date(mondayDate);
  sundayDate.setUTCDate(mondayDate.getUTCDate() + 6);
  const options = { month: "short", day: "numeric" };
  const weekRangeStr = `${mondayDate.toLocaleDateString("en-US", options)} – ${sundayDate.toLocaleDateString("en-US", { ...options, year: "numeric" })}`;

  if (loading && employees.length === 0) {
    return <div className="p-8 text-center text-gray-500 font-bold">Loading employees and resource load...</div>;
  }

  return (
    <div className="flex flex-col gap-6 text-left relative">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-semibold">
          {error}
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="page-title text-3xl font-black text-[#1e1b4b] tracking-tight">
            Employee Management
          </h1>
          <p className="text-gray-400 text-sm font-semibold mt-1">
            Manage employee capacity and workload for {weekRangeStr}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
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
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#edeef3] rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-gray-500">download</span>
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="bg-[#7c3aed] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-violet-200 hover:bg-[#6d28d9] transition-all flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm font-bold">
              add
            </span>
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {/* Stats Row */}
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
                assignment_ind
              </span>
            </div>
          </div>
          <p className="text-gray-400 font-bold text-[11px] uppercase tracking-wider">
            Avg Capacity
          </p>
          <h2 className="text-3xl font-bold mt-1 text-gray-900">{avgCapacity}h</h2>
        </Card>

        <Card>
          <div className="flex justify-between items-start mb-4">
            <div className="bg-violet-50 text-[#7c3aed] p-2.5 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px] font-light">
                bolt
              </span>
            </div>
          </div>
          <p className="text-gray-400 font-bold text-[11px] uppercase tracking-wider">
            Current Load (Avg)
          </p>
          <h2 className="text-3xl font-bold mt-1 text-[#7c3aed]">{avgLoad}%</h2>
        </Card>

        <Card>
          <div className="flex justify-between items-start mb-4">
            <div className="bg-red-50 text-red-500 p-2.5 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px] font-light">
                warning
              </span>
            </div>
          </div>
          <p className="text-gray-400 font-bold text-[11px] uppercase tracking-wider">
            At Risk (100%+)
          </p>
          <h2 className="text-3xl font-bold mt-1 text-red-500">{atRiskCount}</h2>
        </Card>
      </div>

      {/* Table Section */}
      <Card>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h3 className="text-lg font-bold text-gray-900 font-sans">
            Employee List
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
                  Name
                </th>
                <th className="pb-3 text-[11px] font-bold uppercase tracking-wider">
                  Role
                </th>
                <th className="pb-3 text-[11px] font-bold uppercase tracking-wider">
                  Capacity
                </th>
                <th className="pb-3 text-[11px] font-bold uppercase tracking-wider">
                  Workload
                </th>
                <th className="pb-3 text-[11px] font-bold uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredEmployees.map((employee, index) => {
                const isOverloaded = employee.status === "Overloaded";
                const isOptimal = employee.status === "Optimal";
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
                      {employee.role}
                    </td>

                    <td className="py-4 text-gray-600 text-sm font-semibold">
                      {employee.capacity}h
                    </td>

                    <td className="py-4 w-48">
                      <div className="flex items-center gap-3">
                        <div className="bg-gray-100 rounded-full h-2 w-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isOverloaded ? "bg-red-500" : isOptimal ? "bg-[#7c3aed]" : "bg-blue-400"
                            }`}
                            style={{
                              width: `${Math.min(employee.utilization, 100)}%`,
                            }}
                          />
                        </div>
                        <span className="text-gray-500 text-xs font-bold min-w-[28px] text-right">
                          {employee.planned}h
                        </span>
                      </div>
                    </td>

                    <td className="py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                          isOverloaded
                            ? "bg-red-50 text-red-600"
                            : isOptimal
                            ? "bg-purple-50 text-[#7c3aed]"
                            : "bg-blue-50 text-blue-600"
                        }`}
                      >
                        {employee.status}
                      </span>
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
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
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