import { useState } from "react";
import "./Dashboard.css";
import Card from "../components/Card";

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState("");

  const employees = [
    {
      name: "Sarah K.",
      capacity: "40h",
      planned: "38h",
      utilization: 95,
      status: "green",
      avatarText: "SK",
      avatarBg: "bg-indigo-100 text-indigo-700",
    },
    {
      name: "Marcus V.",
      capacity: "40h",
      planned: "44h",
      utilization: 110,
      status: "red",
      avatarImg: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces",
    },
    {
      name: "Jessica L.",
      capacity: "35h",
      planned: "28h",
      utilization: 80,
      status: "green",
      avatarText: "JL",
      avatarBg: "bg-slate-200 text-slate-700",
    },
    {
      name: "David H.",
      capacity: "40h",
      planned: "40h",
      utilization: 100,
      status: "yellow",
      avatarText: "DH",
      avatarBg: "bg-slate-200 text-slate-700",
    },
    {
      name: "Elena R.",
      capacity: "40h",
      planned: "15h",
      utilization: 37.5,
      status: "blue",
      avatarText: "EL",
      avatarBg: "bg-purple-100 text-purple-700",
    },
  ];

  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [hoveredHealthBar, setHoveredHealthBar] = useState(null);

  const healthBars = [
    { height: "30%", color: "bg-[#7c3aed]/30", value: 30 },
    { height: "50%", color: "bg-[#7c3aed]/40", value: 50 },
    { height: "75%", color: "bg-[#7c3aed]/60", value: 75 },
    { height: "60%", color: "bg-[#7c3aed]/50", value: 60 },
    { height: "85%", color: "bg-[#7c3aed]", value: 85 },
    { height: "40%", color: "bg-[#7c3aed]/30", value: 40 },
    { height: "65%", color: "bg-[#7c3aed]/50", value: 65 },
  ];

  return (
    <div className="flex flex-col gap-6 text-left">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="page-title text-3xl font-black text-[#1e1b4b] tracking-tight">
            Executive Overview
          </h1>
          <p className="text-gray-400 text-sm font-semibold mt-1">
            Week of Oct 23 - Oct 29, 2023
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#edeef3] rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors shadow-sm cursor-pointer">
            <span className="material-symbols-outlined text-[18px] font-medium text-gray-500">
              filter_list
            </span>
            <span>Filters</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#edeef3] rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors shadow-sm cursor-pointer">
            <span className="material-symbols-outlined text-[18px] font-medium text-gray-500">
              download
            </span>
            <span>Export</span>
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
            <span className="text-[#22c55e] bg-[#22c55e]/10 px-2 py-0.5 rounded-full text-xs font-extrabold tracking-wide">
              +2 new
            </span>
          </div>
          <p className="text-gray-400 font-bold text-[11px] uppercase tracking-wider">
            Total Employees
          </p>
          <h2 className="text-3xl font-bold mt-1 text-gray-900">124</h2>
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
          <h2 className="text-3xl font-bold mt-1 text-gray-900">842</h2>
        </Card>

        <Card>
          <div className="flex justify-between items-start mb-4">
            <div className="bg-violet-50 text-[#7c3aed] p-2.5 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px] font-light">
                bolt
              </span>
            </div>
            <span className="text-[#7c3aed] bg-[#7c3aed]/10 px-2 py-0.5 rounded-full text-xs font-extrabold tracking-wide">
              Optimal
            </span>
          </div>
          <p className="text-gray-400 font-bold text-[11px] uppercase tracking-wider">
            Team Capacity
          </p>
          <h2 className="text-3xl font-bold mt-1 text-gray-900">88.4%</h2>
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
          <h2 className="text-3xl font-bold mt-1 text-gray-900">4,960</h2>
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
                    const isOverloaded = employee.utilization > 100;
                    return (
                      <tr key={index} className="border-b border-gray-50 last:border-none">
                        <td className="py-4 flex items-center gap-3">
                          {employee.avatarImg ? (
                            <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200">
                              <img
                                src={employee.avatarImg}
                                alt={employee.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${employee.avatarBg}`}>
                              {employee.avatarText}
                            </div>
                          )}
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
                  12
                </span>
              </div>

              <div className="flex justify-between items-center border-b border-gray-50 pb-4">
                <span className="text-gray-500 text-sm font-semibold">
                  Under-capacity
                </span>
                <span className="font-extrabold text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">
                  8
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
              <div className="flex border border-gray-100 rounded-xl overflow-hidden shadow-sm bg-white hover:border-gray-200 transition-all">
                <div className="w-1.5 bg-red-500" />
                <div className="p-3 flex-1">
                  <h4 className="font-bold text-gray-800 text-sm">
                    Cloud Migration Phase 2
                  </h4>
                  <p className="text-gray-400 text-xs mt-0.5 font-semibold">
                    Due tomorrow, 10:00 AM
                  </p>
                </div>
              </div>

              <div className="flex border border-gray-100 rounded-xl overflow-hidden shadow-sm bg-white hover:border-gray-200 transition-all">
                <div className="w-1.5 bg-[#7c3aed]" />
                <div className="p-3 flex-1">
                  <h4 className="font-bold text-gray-800 text-sm">
                    Client QBR Prep
                  </h4>
                  <p className="text-gray-400 text-xs mt-0.5 font-semibold">
                    Due Oct 27, 2023
                  </p>
                </div>
              </div>

              <div className="flex border border-gray-100 rounded-xl overflow-hidden shadow-sm bg-white hover:border-gray-200 transition-all">
                <div className="w-1.5 bg-gray-500" />
                <div className="p-3 flex-1">
                  <h4 className="font-bold text-gray-800 text-sm">
                    Resource Audit Report
                  </h4>
                  <p className="text-gray-400 text-xs mt-0.5 font-semibold">
                    Due Oct 30, 2023
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 text-center">
              <a href="#" className="text-[#7c3aed] text-xs font-bold hover:underline">
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