import { useState, useEffect } from "react";
import Card from "../components/Card";
import { getEmployees } from "../services/employeeService";
import { getForecast } from "../services/forecastService";
import "./Analytics.css";

const getTodayStr = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const date = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${date}`;
};

export default function Analytics() {
  const [reportType, setReportType] = useState("Team Performance Summary");
  const [format, setFormat] = useState("PDF");
  const [reportDate, setReportDate] = useState(getTodayStr());
  const [hoveredTrendDay, setHoveredTrendDay] = useState(null);

  // Live Database States
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      // Normalize reportDate to its starting Monday
      const dateObj = new Date(`${reportDate}T00:00:00.000Z`);
      const day = dateObj.getUTCDay();
      const diff = dateObj.getUTCDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(dateObj.setUTCDate(diff));
      const year = monday.getUTCFullYear();
      const month = String(monday.getUTCMonth() + 1).padStart(2, '0');
      const date = String(monday.getUTCDate()).padStart(2, '0');
      const normalizedMonday = `${year}-${month}-${date}`;

      const [empRes, forecastRes] = await Promise.all([
        getEmployees(),
        getForecast(normalizedMonday)
      ]);

      const forecastMap = {};
      forecastRes.data.forEach(item => {
        forecastMap[item.employeeId] = item;
      });

      const merged = empRes.data.map(emp => {
        const forecast = forecastMap[emp.id] || { plannedHours: 0, utilization: 0, warning: 'GREEN', tasks: [] };
        
        // Filter tasks due on this exact reportDate and not completed
        const dailyTasks = (forecast.tasks || []).filter(t => {
          const taskDateStr = new Date(t.dueDate).toISOString().slice(0, 10);
          return taskDateStr === reportDate && t.status !== "COMPLETED";
        });

        const dailyPlanned = dailyTasks.reduce((sum, t) => sum + Number(t.estimatedHours), 0);
        const dailyCapacity = emp.weeklyCapacity / 5; // daily capacity (e.g. 8h)
        const dailyUtilization = dailyCapacity > 0 
          ? Math.round((dailyPlanned / dailyCapacity) * 100) 
          : 0;

        return {
          id: emp.id,
          name: emp.name,
          role: emp.role,
          capacity: emp.weeklyCapacity,
          weeklyPlanned: forecast.plannedHours,
          weeklyUtilization: forecast.utilization,
          dailyPlanned,
          dailyCapacity,
          dailyUtilization,
          dailyTasks
        };
      });

      setEmployees(merged);
      setError(null);
    } catch (err) {
      console.error("Failed to load analytics data:", err);
      setError("Failed to fetch analytics data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [reportDate]);

  const handleGenerateReport = () => {
    if (format === "CSV") {
      let headers, rows;
      if (reportType === "Employee Utilization") {
        headers = ["Employee Name", "Role", "Daily Planned Hours", "Daily Capacity", "Daily Utilization %", "Tasks"];
        rows = employees.map(emp => [
          emp.name, 
          emp.role, 
          emp.dailyPlanned, 
          emp.dailyCapacity, 
          `${emp.dailyUtilization}%`,
          emp.dailyTasks.map(t => `${t.title} (${t.estimatedHours}h)`).join("; ")
        ]);
      } else if (reportType === "Capacity Planning") {
        headers = ["Employee Name", "Daily Capacity", "Load Status"];
        rows = employees.map(emp => [
          emp.name, 
          `${emp.dailyCapacity}h`, 
          emp.dailyUtilization >= 100 ? "Overloaded" : emp.dailyUtilization >= 80 ? "Optimal" : "Available"
        ]);
      } else { // Team Performance Summary
        headers = ["Metric", "Value"];
        rows = [
          ["Report Date", reportDate],
          ["Total Employees", employees.length],
          ["Total Daily Planned Hours", totalPlannedHours],
          ["Average Daily Utilization", `${averageUtilization}%`],
          ["Overloaded Daily Resources", employees.filter(e => e.dailyUtilization >= 100).length]
        ];
      }
      
      const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${reportType.replace(/\s+/g, '_')}_Daily_${reportDate}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      window.print();
    }
  };

  const trendData = [
    { day: "Mon", planned: 80, actual: 85 },
    { day: "Tue", planned: 75, actual: 70 },
    { day: "Wed", planned: 90, actual: 95 },
    { day: "Thu", planned: 70, actual: 65 },
    { day: "Fri", planned: 45, actual: 40 },
  ];

  const distributionData = [
    { name: "Core Product Development", value: 45 },
    { name: "Maintenance & Support", value: 25 },
    { name: "Strategic Research", value: 18 },
    { name: "Internal Meetings", value: 12 },
  ];

  // Dynamic calculations
  const totalPlannedHours = employees.reduce((sum, e) => sum + e.dailyPlanned, 0).toFixed(1);
  const averageUtilization = employees.length > 0
    ? Math.round(employees.reduce((sum, e) => sum + e.dailyUtilization, 0) / employees.length)
    : 0;
  const overloadedCount = employees.filter(e => e.dailyUtilization >= 100).length;
  const overloadPct = employees.length > 0
    ? Math.round((overloadedCount / employees.length) * 100)
    : 0;

  const dateObj = new Date(`${reportDate}T00:00:00.000Z`);
  const formattedReportDate = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  if (loading && employees.length === 0) {
    return <div className="p-8 text-center text-gray-500 font-bold">Loading report engine...</div>;
  }

  return (
    <div className="flex flex-col gap-6 text-left relative">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-semibold no-print">
          {error}
        </div>
      )}
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
        <div>
          <h1 className="page-title text-3xl font-black text-[#1e1b4b] tracking-tight">
            Analytics Review
          </h1>
          <p className="text-gray-400 text-sm font-semibold mt-1">
            Comprehensive performance and capacity audit for {formattedReportDate}.
          </p>
        </div>

        <button className="flex items-center gap-2.5 px-4 py-2 bg-white border border-[#edeef3] rounded-xl text-xs font-bold text-gray-700 shadow-sm hover:bg-gray-50 transition cursor-pointer">
          <span className="material-symbols-outlined text-[18px] text-gray-500 font-light">calendar_today</span>
          <span>{formattedReportDate}</span>
        </button>
      </div>

      {/* Top Row Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 no-print">
        {/* Team Utilization Trend Card */}
        <div className="lg:col-span-8">
          <Card className="flex flex-col h-full justify-between">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-base font-bold text-gray-900 font-sans">
                  Team Utilization Trend
                </h3>
                <div className="h-4 mt-0.5">
                  {hoveredTrendDay !== null && (
                    <span className="text-[10px] font-extrabold text-[#7c3aed] bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100 animate-in fade-in duration-150">
                      {trendData[hoveredTrendDay].day}: Planned: {trendData[hoveredTrendDay].planned}% | Actual: {trendData[hoveredTrendDay].actual}%
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs font-bold">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-indigo-100" />
                  <span className="text-gray-400">Planned</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-[#7c3aed]" />
                  <span className="text-gray-700">Actual</span>
                </div>
              </div>
            </div>

            {/* Simulated Grid Chart */}
            <div className="relative h-60 flex items-end justify-between gap-6 px-4 border-b border-gray-100">
              {/* Grid Horizontal Lines */}
              <div className="absolute inset-x-0 top-0 border-t border-dashed border-gray-100" />
              <div className="absolute inset-x-0 top-1/4 border-t border-dashed border-gray-100" />
              <div className="absolute inset-x-0 top-2/4 border-t border-dashed border-gray-100" />
              <div className="absolute inset-x-0 top-3/4 border-t border-dashed border-gray-100" />

              {trendData.map((data, index) => (
                <div
                  key={index}
                  onMouseEnter={() => setHoveredTrendDay(index)}
                  onMouseLeave={() => setHoveredTrendDay(null)}
                  className="flex-1 flex flex-col items-center gap-3 relative z-10 h-full justify-end cursor-pointer group"
                >
                  <div className="flex items-end gap-1.5 w-full justify-center transition-transform duration-200 group-hover:scale-y-105 origin-bottom h-40">
                    {/* Planned Bar */}
                    <div
                      className="w-5 bg-indigo-100/60 rounded-t-sm transition-all duration-300 group-hover:opacity-80"
                      style={{ height: `${data.planned}%` }}
                    />
                    {/* Actual Bar */}
                    <div
                      className="w-5 bg-[#7c3aed] rounded-t-sm transition-all duration-300 group-hover:opacity-95"
                      style={{ height: `${data.actual}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider group-hover:text-gray-700 transition-colors">
                    {data.day}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Capacity vs Planned Card */}
        <div className="lg:col-span-4">
          <Card className="flex flex-col items-center justify-between h-full">
            <h3 className="text-base font-bold text-gray-900 font-sans self-start mb-4">
              Capacity vs Planned
            </h3>

            {/* SVG Donut Chart */}
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="36"
                  stroke="#f3f4f6"
                  strokeWidth="10"
                  fill="transparent"
                />
                {/* Active Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="36"
                  stroke="#7c3aed"
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray="226"
                  strokeDashoffset={226 - (226 * Math.min(averageUtilization, 100)) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-3xl font-black text-gray-900 font-sans tracking-tight">{averageUtilization}%</span>
                <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest mt-0.5">Allocated</p>
              </div>
            </div>

            {/* Data breakdown */}
            <div className="w-full space-y-3 mt-6 pt-4 border-t border-gray-50">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-gray-400">Total Capacity (Daily)</span>
                <span className="text-gray-800">
                  {employees.reduce((sum, e) => sum + e.dailyCapacity, 0)} hrs
                </span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-gray-400">Planned Load (Daily)</span>
                <span className="text-[#7c3aed]">{totalPlannedHours} hrs</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Middle Row Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 no-print">
        {/* Overloaded Talent */}
        <Card className="flex flex-col justify-between">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-base font-bold text-gray-900 font-sans">
              Overloaded Talent (Daily)
            </h3>
            <span className={`text-[9px] font-extrabold tracking-wide uppercase px-2.5 py-0.5 rounded-md border ${
              overloadedCount > 0 ? "bg-red-50 text-red-600 border-red-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
            }`}>
              {overloadedCount} Risks
            </span>
          </div>

          <div className="space-y-4 mb-4">
            {employees.filter(e => e.dailyUtilization >= 100).slice(0, 3).map((emp) => (
              <div key={emp.id} className="flex items-center justify-between gap-4 border-b border-gray-50 last:border-none pb-4 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                    {emp.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm">{emp.name}</h4>
                    <p className="text-gray-400 text-[10px] font-semibold">{emp.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 w-40">
                  <div className="bg-gray-100 h-1.5 flex-1 rounded-full overflow-hidden">
                    <div className="bg-red-500 h-full rounded-full" style={{ width: "100%" }} />
                  </div>
                  <span className="text-red-500 font-extrabold text-sm min-w-[32px] text-right">{emp.dailyUtilization}%</span>
                </div>
              </div>
            ))}
            {overloadedCount === 0 && (
              <div className="text-center py-8 text-xs text-gray-400 font-bold bg-gray-50/50 rounded-2xl border border-dashed border-gray-100">
                All resources are within daily capacity limit.
              </div>
            )}
          </div>
        </Card>

        {/* Workload Distribution */}
        <Card className="flex flex-col justify-between">
          <h3 className="text-base font-bold text-gray-900 font-sans mb-5">
            Workload Distribution
          </h3>

          <div className="space-y-4">
            {distributionData.map((dist, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-gray-600">{dist.name}</span>
                  <span className="text-gray-900">{dist.value}%</span>
                </div>
                <div className="bg-gray-100 h-1.5 rounded-full w-full overflow-hidden">
                  <div className="bg-[#7c3aed] h-full rounded-full" style={{ width: `${dist.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Title separator */}
      <div className="flex items-center gap-2 pt-4 border-t border-gray-100 no-print">
        <span className="material-symbols-outlined text-gray-700 text-xl font-bold">download</span>
        <h2 className="text-xl font-extrabold text-gray-900 tracking-tight font-sans">
          Report Engine
        </h2>
      </div>

      {/* Bottom Report Engine Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Export Controls */}
        <div className="lg:col-span-4 flex flex-col gap-6 no-print">
          <Card>
            <h3 className="text-base font-bold text-gray-900 font-sans mb-4">
              Export Parameters
            </h3>

            <div className="space-y-4">
              {/* Report Date */}
              <div>
                <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-2">
                  Report Date
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                    calendar_today
                  </span>
                  <input
                    type="date"
                    value={reportDate}
                    onChange={(e) => setReportDate(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#7c3aed] bg-gray-50/50 cursor-pointer"
                  />
                </div>
              </div>

              {/* Type Select */}
              <div>
                <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-2">
                  Report Type
                </label>
                <div className="relative">
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold focus:outline-none focus:border-[#7c3aed] bg-gray-50/50 appearance-none cursor-pointer"
                  >
                    <option value="Team Performance Summary">Team Performance Summary</option>
                    <option value="Employee Utilization">Employee Utilization</option>
                    <option value="Capacity Planning">Capacity Planning</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Format pills */}
              <div>
                <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-2">
                  Format
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormat("PDF")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl border text-xs font-bold transition-all duration-200 cursor-pointer ${
                      format === "PDF"
                        ? "bg-white border-[#7c3aed] text-[#7c3aed] ring-1 ring-[#7c3aed]/20 shadow-sm"
                        : "bg-white border-gray-200 text-gray-400 hover:text-gray-700"
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">picture_as_pdf</span>
                    <span>PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormat("CSV")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl border text-xs font-bold transition-all duration-200 cursor-pointer ${
                      format === "CSV"
                        ? "bg-white border-[#7c3aed] text-[#7c3aed] ring-1 ring-[#7c3aed]/20 shadow-sm"
                        : "bg-white border-gray-200 text-gray-400 hover:text-gray-700"
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">grid_on</span>
                    <span>CSV</span>
                  </button>
                </div>
              </div>

              {/* Generate button */}
              <button
                onClick={handleGenerateReport}
                className="w-full bg-[#7c3aed] text-white py-3 rounded-xl text-xs font-bold hover:bg-[#6d28d9] transition shadow-md shadow-violet-200 flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                <span className="material-symbols-outlined text-sm font-bold">bolt</span>
                <span>Generate Report</span>
              </button>
            </div>
          </Card>

          {/* Recent Exports list */}
          <Card>
            <h3 className="text-base font-bold text-gray-900 font-sans mb-4">
              Recent Exports
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100/50 transition duration-200">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[#7c3aed] text-lg">description</span>
                  <span className="text-xs font-bold text-gray-700">Team_Performance_Summary.csv</span>
                </div>
                <span className="text-[10px] font-semibold text-gray-400">Just now</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100/50 transition duration-200">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-gray-400 text-lg">description</span>
                  <span className="text-xs font-bold text-gray-700">Employee_Utilization.csv</span>
                </div>
                <span className="text-[10px] font-semibold text-gray-400">1h ago</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Preview Pane */}
        <div className="lg:col-span-8">
          <Card className="bg-gray-100/60 p-6 flex flex-col items-center justify-center border border-gray-200/50 relative overflow-hidden h-[440px] preview-card-wrapper">
            {/* Top Preview Controls bar */}
            <div className="w-[420px] max-w-full bg-white/70 backdrop-blur-sm px-4 py-2 border border-gray-200 rounded-t-xl flex justify-between items-center absolute top-0 z-10 no-print">
              <div className="flex items-center gap-3">
                <button className="text-gray-400 hover:text-gray-700">
                  <span className="material-symbols-outlined text-sm font-bold">chevron_left</span>
                </button>
                <span className="text-[10px] font-bold text-gray-500">Page 1 of 1</span>
                <button className="text-gray-400 hover:text-gray-700">
                  <span className="material-symbols-outlined text-sm font-bold">chevron_right</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button className="text-gray-400 hover:text-gray-700">
                  <span className="material-symbols-outlined text-sm">zoom_in</span>
                </button>
                <span className="text-[10px] font-bold text-gray-500">100%</span>
                <button className="text-gray-400 hover:text-gray-700">
                  <span className="material-symbols-outlined text-sm">zoom_out</span>
                </button>
              </div>

              <button className="flex items-center gap-1 text-[10px] font-bold text-[#7c3aed] hover:underline cursor-pointer">
                <span className="material-symbols-outlined text-sm font-bold">print</span>
                <span>Print Preview</span>
              </button>
            </div>

            {/* Document sheet */}
            <div className="w-[420px] max-w-full bg-white border border-gray-200 shadow-md p-6 flex flex-col justify-between relative h-[340px] mt-8 select-none report-print-area">
              {/* Rotated CONFIDENTIAL watermark background */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
                <span className="text-4xl font-black tracking-widest uppercase transform -rotate-45 text-red-600 scale-150">
                  CONFIDENTIAL
                </span>
              </div>

              {/* Watermark header */}
              <div className="flex justify-between items-start border-b border-gray-100 pb-3 z-10">
                <div>
                  <h4 className="text-xs font-black text-gray-800 uppercase tracking-tight">{reportType}</h4>
                  <p className="text-[7px] font-bold text-gray-400 uppercase mt-0.5">Report ID: DR-{reportDate}</p>
                </div>
                <div className="text-right">
                  <h4 className="text-[9px] font-extrabold text-[#7c3aed] tracking-tight">Workload Engine</h4>
                  <p className="text-[6px] font-bold text-gray-400 uppercase mt-0.5">Enterprise Solutions</p>
                </div>
              </div>

              {/* Metadata details row */}
              <div className="grid grid-cols-3 gap-2 my-4 z-10 text-left">
                <div className="p-2 bg-gray-50 border border-gray-100 rounded">
                  <p className="text-[6px] font-extrabold text-gray-400 uppercase tracking-wider">Total Hours</p>
                  <p className="text-xs font-black text-gray-800 mt-0.5">{totalPlannedHours}h</p>
                </div>
                <div className="p-2 bg-gray-50 border border-gray-100 rounded">
                  <p className="text-[6px] font-extrabold text-gray-400 uppercase tracking-wider">Utilization</p>
                  <p className="text-xs font-black text-[#7c3aed] mt-0.5">{averageUtilization}%</p>
                </div>
                <div className="p-2 bg-gray-50 border border-gray-100 rounded">
                  <p className="text-[6px] font-extrabold text-gray-400 uppercase tracking-wider">Overload Risk</p>
                  <p className="text-xs font-black text-red-500 mt-0.5">{overloadPct}%</p>
                </div>
              </div>

              {/* Real Database Employees workloads */}
              <div className="space-y-2.5 my-2 flex-1 z-10 overflow-y-auto max-h-32 text-left pr-1 report-employees-list">
                {employees.map((emp) => (
                  <div key={emp.id} className="flex flex-col text-[9px] font-bold text-gray-600 border-b border-gray-50 pb-1.5 mb-1.5 last:border-none">
                    <div className="flex justify-between items-center">
                      <span>{emp.name} ({emp.role})</span>
                      <span>{emp.dailyPlanned}h / {emp.dailyCapacity}h ({emp.dailyUtilization}%)</span>
                    </div>
                    {emp.dailyTasks.length > 0 && (
                      <div className="text-[8px] text-gray-400 font-semibold mt-0.5 pl-2">
                        Tasks: {emp.dailyTasks.map(t => `${t.title} (${t.estimatedHours}h)`).join(", ")}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Report Footer */}
              <div className="border-t border-gray-100 pt-3 text-center text-[5px] font-bold text-gray-400 z-10">
                © 2026 Weekly Workload Forecast. Confidential document for internal use only.
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}