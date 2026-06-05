import { useState, useEffect } from "react";
import Card from "../components/Card";
import { getTasks, createTask } from "../services/taskService";
import { getEmployees } from "../services/employeeService";

export default function Tasks() {
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("All Tasks");
  
  // Filter States
  const [priorityFilter, setPriorityFilter] = useState("All Priorities");
  const [statusFilter, setStatusFilter] = useState("All Statuses");

  // Form States
  const [taskTitle, setTaskTitle] = useState("");
  const [projectName, setProjectName] = useState("");
  const [estHours, setEstHours] = useState("");
  const [taskPriority, setTaskPriority] = useState("MEDIUM");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [assignedEmployee, setAssignedEmployee] = useState("");

  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksRes, empsRes] = await Promise.all([
        getTasks(),
        getEmployees()
      ]);

      // Map tasks to frontend format
      const mappedTasks = tasksRes.data.map(task => {
        // Parse project name and title
        const match = task.title.match(/^\[([^\]]+)\]\s*(.*)$/);
        const project = match ? match[1] : "General";
        const title = match ? match[2] : task.title;

        // Map status
        let status = "Pending";
        if (task.status === "IN_PROGRESS") {
          status = "In Progress";
        } else if (task.status === "COMPLETED") {
          status = "Completed";
        }

        // Map employee details
        const assignedName = task.employee ? task.employee.name : "Unassigned";
        
        // Generate initials avatar text
        const initials = assignedName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);

        // Date format from ISO to short display
        const dateObj = new Date(task.dueDate);
        const formattedDate = isNaN(dateObj.getTime()) 
          ? "Nov 05, 2024"
          : dateObj.toLocaleDateString("en-US", {
              month: "short",
              day: "2-digit",
              year: "numeric",
            });

        return {
          id: task.id,
          title: title,
          project: project,
          assignedId: task.assignedEmployeeId,
          assignedName: assignedName,
          assignedImg: null, // If we don't have images in DB, we'll use fallback initials
          initials: initials || "UN",
          hours: Number(task.estimatedHours),
          priority: task.priority,
          dueDate: formattedDate,
          status: status,
        };
      });

      setTasks(mappedTasks);
      setEmployees(empsRes.data);
      setError(null);
    } catch (err) {
      console.error("Failed to load tasks and employees:", err);
      setError("Failed to fetch task and employee data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskTitle || !projectName || !estHours) return;

    try {
      const titleWithProject = `[${projectName.trim()}] ${taskTitle.trim()}`;
      if (!taskDueDate) {
        alert("Please select a due date.");
        return;
      }

      await createTask({
        title: titleWithProject,
        estimatedHours: parseFloat(estHours),
        priority: taskPriority,
        status: "NOT_STARTED",
        dueDate: taskDueDate,
        assignedEmployeeId: assignedEmployee || null,
      });

      setTaskTitle("");
      setProjectName("");
      setEstHours("");
      setTaskPriority("MEDIUM");
      setTaskDueDate("");
      setAssignedEmployee("");
      setShowModal(false);
      await fetchData();
    } catch (err) {
      console.error("Failed to create task:", err);
      alert(err.response?.data?.error || "Failed to create task.");
    }
  };

  const filteredTasks = tasks.filter((task) => {
    // Priority Filter
    if (priorityFilter !== "All Priorities" && task.priority !== priorityFilter) {
      return false;
    }
    // Status Filter
    if (statusFilter !== "All Statuses" && task.status !== statusFilter) {
      return false;
    }
    // Tab Filter
    if (activeTab === "Completed" && task.status !== "Completed") {
      return false;
    }
    if (activeTab === "High Priority" && task.priority !== "HIGH") {
      return false;
    }
    if (activeTab === "Medium Priority" && task.priority !== "MEDIUM") {
      return false;
    }
    if (activeTab === "Low Priority" && task.priority !== "LOW") {
      return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-6 text-left relative">
      {/* Header Row */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="page-title text-3xl font-black text-[#1e1b4b] tracking-tight">
            Task Management
          </h1>
          <p className="text-gray-400 text-sm font-semibold mt-1">
            Maintain organizational velocity with refined workload distribution.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Toggle Pills */}
          <div className="flex bg-gray-100 p-1 rounded-xl">
            {["All Tasks", "Completed", "High Priority", "Medium Priority", "Low Priority"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                  activeTab === tab
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#edeef3] rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors shadow-sm cursor-pointer">
            <span className="material-symbols-outlined text-[18px] font-medium text-gray-500">
              filter_list
            </span>
            <span>Filters</span>
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="bg-[#7c3aed] text-white px-5 py-2 rounded-xl font-bold text-sm shadow-md shadow-violet-200 hover:bg-[#6d28d9] transition-all flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm font-bold">
              add
            </span>
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Filter Row Selector Card */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-8">
            {/* Priority Selector */}
            <div>
              <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1.5">
                Priority
              </label>
              <div className="relative">
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="bg-transparent text-sm font-bold text-gray-800 focus:outline-none pr-6 cursor-pointer appearance-none"
                >
                  <option>All Priorities</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
                <span className="material-symbols-outlined absolute right-0 top-1/2 -translate-y-1/2 text-gray-500 text-lg pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>

            {/* Status Selector */}
            <div>
              <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1.5">
                Status
              </label>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent text-sm font-bold text-gray-800 focus:outline-none pr-6 cursor-pointer appearance-none"
                >
                  <option>All Statuses</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Pending">Pending</option>
                  <option value="Delayed">Delayed</option>
                  <option value="Queued">Queued</option>
                  <option value="Completed">Completed</option>
                </select>
                <span className="material-symbols-outlined absolute right-0 top-1/2 -translate-y-1/2 text-gray-500 text-lg pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>

            {/* Due Date Filter display */}
            <div>
              <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1.5">
                Due Date
              </label>
              <div className="flex items-center gap-1 text-sm font-bold text-gray-800">
                <span>Next 7 Days</span>
                <span className="material-symbols-outlined text-gray-500 text-lg">
                  calendar_today
                </span>
              </div>
            </div>
          </div>

          <div className="text-gray-400 text-xs font-bold tracking-tight">
            Showing <span className="text-gray-700">{filteredTasks.length}</span> active tasks
          </div>
        </div>
      </Card>

      {/* Task List Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-100 pb-3">
                <th className="pb-3 text-[11px] font-bold uppercase tracking-wider">
                  Title
                </th>
                <th className="pb-3 text-[11px] font-bold uppercase tracking-wider">
                  Assigned Employee
                </th>
                <th className="pb-3 text-[11px] font-bold uppercase tracking-wider">
                  Est. Hours
                </th>
                <th className="pb-3 text-[11px] font-bold uppercase tracking-wider">
                  Priority
                </th>
                <th className="pb-3 text-[11px] font-bold uppercase tracking-wider">
                  Due Date
                </th>
                <th className="pb-3 text-[11px] font-bold uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredTasks.map((task, index) => {
                const isHigh = task.priority === "HIGH";
                const isMedium = task.priority === "MEDIUM";
                const isRedBar = isHigh && task.hours > 20;
                
                return (
                  <tr key={index} className="border-b border-gray-50 last:border-none">
                    {/* Title & Project */}
                    <td className="py-4">
                      <h4 className="font-bold text-gray-800 text-sm">
                        {task.title}
                      </h4>
                      <span className="text-[11px] font-bold text-gray-400 tracking-tight mt-0.5 block">
                        Project: {task.project}
                      </span>
                    </td>

                    {/* Assigned Employee */}
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        {task.assignedImg ? (
                          <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200">
                            <img
                              src={task.assignedImg}
                              alt={task.assignedName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-slate-200 text-slate-700`}>
                            {task.initials}
                          </div>
                        )}
                        <span className="font-bold text-gray-700 text-xs">
                          {task.assignedName}
                        </span>
                      </div>
                    </td>

                    {/* Hours Progress Bar */}
                    <td className="py-4">
                      <div className="flex items-center gap-3 w-32">
                        <span className="text-gray-700 font-bold text-xs">
                          {task.hours.toFixed(1)}
                        </span>
                        <div className="bg-gray-100 rounded-full h-1.5 flex-1 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isRedBar ? "bg-red-500" : "bg-[#7c3aed]"
                            }`}
                            style={{
                              width: `${Math.min((task.hours / 40) * 100, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Priority Badge */}
                    <td className="py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wide ${
                          isHigh
                            ? "bg-red-50 text-red-600"
                            : isMedium
                            ? "bg-indigo-50 text-[#7c3aed]"
                            : "bg-gray-50 text-gray-500"
                        }`}
                      >
                        {task.priority}
                      </span>
                    </td>

                    {/* Due Date */}
                    <td className="py-4 text-gray-500 text-xs font-bold">
                      {task.dueDate}
                    </td>

                    {/* Status */}
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full inline-block ${
                            task.status === "In Progress"
                              ? "bg-[#7c3aed]"
                              : task.status === "Delayed"
                              ? "bg-red-500"
                              : "bg-gray-400"
                          }`}
                        />
                        <span
                          className={`text-xs font-bold ${
                            task.status === "In Progress"
                              ? "text-[#7c3aed]"
                              : task.status === "Delayed"
                              ? "text-red-500"
                              : "text-gray-500"
                          }`}
                        >
                          {task.status}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredTasks.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-400 text-sm">
                    No tasks found matching current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center border-t border-gray-50 pt-4 mt-4">
          <div className="text-gray-400 text-xs font-bold">
            Showing 1 to {filteredTasks.length} of {tasks.length} tasks
          </div>
          <div className="flex items-center gap-1.5">
            <button className="w-7 h-7 border border-gray-200 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-50 cursor-pointer">
              <span className="material-symbols-outlined text-sm font-bold">chevron_left</span>
            </button>
            <button className="w-7 h-7 bg-purple-50 border border-[#7c3aed]/20 rounded-lg flex items-center justify-center text-[#7c3aed] text-xs font-extrabold cursor-pointer">
              1
            </button>
            <button className="w-7 h-7 border border-gray-200 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-50 text-xs font-bold cursor-pointer">
              2
            </button>
            <button className="w-7 h-7 border border-gray-200 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-50 text-xs font-bold cursor-pointer">
              3
            </button>
            <button className="w-7 h-7 border border-gray-200 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-50 cursor-pointer">
              <span className="material-symbols-outlined text-sm font-bold">chevron_right</span>
            </button>
          </div>
        </div>
      </Card>

      {/* Create Task Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-[480px] overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-[#f4f2fe] border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
                  Create New Task
                </h2>
                <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest mt-1">
                  Queue workload assignments
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-200/50 hover:text-gray-700 transition cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg font-bold">close</span>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateTask} className="p-6 space-y-5">
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
                    placeholder="e.g. Develop Landing Page"
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
                      placeholder="e.g. 18.5"
                      value={estHours}
                      onChange={(e) => setEstHours(e.target.value)}
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

              {/* Assignee & Due Date Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Assignee
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                      person
                    </span>
                    <select
                      value={assignedEmployee}
                      onChange={(e) => setAssignedEmployee(e.target.value)}
                      className="w-full pl-10 pr-8 py-3 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:border-[#7c3aed] bg-gray-50/50 appearance-none cursor-pointer"
                    >
                      <option value="">Select Assignee</option>
                      {employees.map((emp) => (
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
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}