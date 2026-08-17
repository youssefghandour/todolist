import { useState, useEffect } from "react";
import Header from "./components/Header";
import StatsRow from "./components/StatsRow";
import SearchBar from "./components/SearchBar";
import FilterBar from "./components/FilterBar";
import TaskList from "./components/TaskList";
import TaskModal from "./components/TaskModal";
import TaskDetailModal from "./components/TaskDetailModal";
import { apiRequest, apiTaskToUiTask, uiFieldsToApiPayload } from "./api/taskApi";

const mapStatusToApi = (statusFilter) => {
  if (statusFilter === "Pending") return "pending";
  if (statusFilter === "Completed") return "completed";
  return "";
};

const mapPriorityToApi = (priorityFilter) => {
  if (priorityFilter === "High") return "high";
  if (priorityFilter === "Medium") return "medium";
  if (priorityFilter === "Low") return "low";
  return "";
};

const mapCategoryToApi = (categoryFilter) => {
  if (categoryFilter === "Work") return "work";
  if (categoryFilter === "Personal") return "personal";
  if (categoryFilter === "Shopping") return "shopping";
  if (categoryFilter === "Finance") return "finance";
  if (categoryFilter === "Health") return "health";
  if (categoryFilter === "Other") return "other";
  return "";
};

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [taskDate, setTaskDate] = useState("");
  const [tasks, setTasks] = useState([]);
  const [rawTasksById, setRawTasksById] = useState({});
  const [taskName, setTaskName] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskCategory, setTaskCategory] = useState("Select a category");
  const [taskPriority, setTaskPriority] = useState("Select a priority");
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [priorityFilter, setPriorityFilter] = useState("All Priority");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [sortOrder, setSortOrder] = useState("Newest First");
  const [dashboard, setDashboard] = useState({
    tasksCount: 0,
    completed: 0,
    pending: 0,
    highTasks: 0
  });

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  const selectedTask = selectedTaskId ? rawTasksById[selectedTaskId] : null;

  useEffect(() => {
    document.body.classList.toggle("dark-mode", isDark);
  }, [isDark]);

  const fetchDashboard = async () => {
    const data = await apiRequest("/dashboard");
    setDashboard({
      tasksCount: data.tasksCount || 0,
      completed: data.completed || 0,
      pending: data.pending || 0,
      highTasks: data.highTasks || 0
    });
  };

  const fetchTasks = async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      const params = new URLSearchParams();

      if (searchQuery.trim()) params.set("search", searchQuery.trim());

      const apiStatus = mapStatusToApi(statusFilter);
      const apiPriority = mapPriorityToApi(priorityFilter);
      const apiCategory = mapCategoryToApi(categoryFilter);

      if (apiStatus) params.set("status", apiStatus);
      if (apiPriority) params.set("priority", apiPriority);
      if (apiCategory) params.set("category", apiCategory);
      params.set("sortBy", sortOrder === "Oldest First" ? "oldest" : "newest");

      const queryString = params.toString();
      const data = await apiRequest(`/tasks${queryString ? `?${queryString}` : ""}`);
      const rawList = data.tasks || [];
      setTasks(rawList.map(apiTaskToUiTask));
      setRawTasksById(Object.fromEntries(rawList.map((task) => [task.id, task])));
    } catch (err) {
      setLoadError(err.message || "Failed to load tasks.");
      setTasks([]);
      setRawTasksById({});
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        const data = await apiRequest("/");
        if (!cancelled) {
          setDashboard({
            tasksCount: data.tasksCount || 0,
            completed: data.completed || 0,
            pending: data.pending || 0,
            highTasks: data.highTasks || 0
          });
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err.message || "Failed to load dashboard data.");
        }
      }
    }

    loadDashboard();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadTasks() {
      setIsLoading(true);
      setLoadError("");
      try {
        const params = new URLSearchParams();
        if (searchQuery.trim()) params.set("search", searchQuery.trim());

        const apiStatus = mapStatusToApi(statusFilter);
        const apiPriority = mapPriorityToApi(priorityFilter);
        const apiCategory = mapCategoryToApi(categoryFilter);

        if (apiStatus) params.set("status", apiStatus);
        if (apiPriority) params.set("priority", apiPriority);
        if (apiCategory) params.set("category", apiCategory);
        params.set("sortBy", sortOrder === "Oldest First" ? "oldest" : "newest");

        const data = await apiRequest(`/tasks${params.toString() ? `?${params.toString()}` : ""}`);
        if (!cancelled) {
          const rawList = data.tasks || [];
          setTasks(rawList.map(apiTaskToUiTask));
          setRawTasksById(Object.fromEntries(rawList.map((task) => [task.id, task])));
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err.message || "Failed to load tasks.");
          setTasks([]);
          setRawTasksById({});
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadTasks();
    return () => {
      cancelled = true;
    };
  }, [searchQuery, statusFilter, priorityFilter, categoryFilter, sortOrder]);

  const closeModal = () => {
    setIsModalOpen(false);
    setTaskName("");
    setTaskDesc("");
    setTaskDate("");
    setTaskCategory("Select a category");
    setTaskPriority("Select a priority");
  };

  const refreshDashboardAndTasks = async () => {
    await Promise.all([fetchDashboard(), fetchTasks()]);
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!taskName.trim()) return;

    const payload = uiFieldsToApiPayload({
      title: taskName.trim(),
      desc: taskDesc.trim(),
      date: taskDate,
      category: taskCategory === "Select a category" ? "Personal" : taskCategory,
      priority: taskPriority === "Select a priority" ? "Low" : taskPriority,
      completed: false
    });

    setIsSaving(true);
    try {
      await apiRequest("/tasks", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      closeModal();
      await refreshDashboardAndTasks();
    } catch (err) {
      alert(err.message || "Failed to create task.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleTask = async (id) => {
    const target = tasks.find((task) => task.id === id);
    if (!target) return;

    const nextCompleted = !target.completed;
    const nextStatus = nextCompleted ? "completed" : "pending";

    try {
      await apiRequest(`/tasks/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status: nextStatus })
      });
      await refreshDashboardAndTasks();
    } catch (err) {
      alert(err.message || "Failed to update task.");
    }
  };

  const deleteTask = async (id) => {
    try {
      await apiRequest(`/tasks/${id}`, { method: "DELETE" });
      setSelectedTaskId((currentId) => (currentId === id ? null : currentId));
      await refreshDashboardAndTasks();
    } catch (err) {
      alert(err.message || "Failed to delete task.");
    }
  };

  const handleUpdateTask = async (updatedTask) => {
    const payload = {
      title: updatedTask.title,
      description: updatedTask.description,
      category: updatedTask.category,
      priority: updatedTask.priority,
      status: updatedTask.status
    };

    if (updatedTask.dueDate) {
      payload.dueDate = updatedTask.dueDate.length === 10
        ? new Date(`${updatedTask.dueDate}T00:00:00`).toISOString()
        : updatedTask.dueDate;
    }

    try {
      const data = await apiRequest(`/tasks/${updatedTask.id}`, {
        method: "PUT",
        body: JSON.stringify(payload)
      });

      const savedRaw = data.task || { ...rawTasksById[updatedTask.id], ...payload };
      setRawTasksById((prev) => ({ ...prev, [savedRaw.id]: savedRaw }));
      setTasks((prev) => prev.map((task) => (task.id === savedRaw.id ? apiTaskToUiTask(savedRaw) : task)));
      await fetchDashboard();
    } catch (err) {
      alert(err.message || "Failed to update task.");
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const parsed = new Date(`${dateStr}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return dateStr;
    return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const visibleTasks = tasks.filter((task) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = !query || task.title.toLowerCase().includes(query) || (task.desc || "").toLowerCase().includes(query);
    const matchesStatus = statusFilter === "All Status" || (statusFilter === "Completed" ? task.completed : !task.completed);
    const matchesPriority = priorityFilter === "All Priority" || task.priority === priorityFilter;
    const matchesCategory = categoryFilter === "All Categories" || task.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  if (sortOrder === "Oldest First") {
    visibleTasks.reverse();
  }

  return (
    <div>
      <Header
        currentDate={currentDate}
        isDark={isDark}
        onToggleDark={() => setIsDark((current) => !current)}
      />

      {loadError && (
        <div className="empty-state" style={{ color: "#dc2626", marginBottom: "1rem" }}>
          {loadError}
        </div>
      )}

      <StatsRow
        totalTasks={dashboard.tasksCount}
        completedTasks={dashboard.completed}
        pendingTasks={dashboard.pending}
        highPriorityTasks={dashboard.highTasks}
      />

      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddClick={() => setIsModalOpen(true)}
      />

      <FilterBar
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        priorityFilter={priorityFilter}
        onPriorityChange={setPriorityFilter}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        sortOrder={sortOrder}
        onSortChange={setSortOrder}
        visibleCount={visibleTasks.length}
      />

      <TaskList
        isLoading={isLoading}
        tasks={tasks}
        visibleTasks={visibleTasks}
        formatDate={formatDate}
        onToggle={toggleTask}
        onDelete={deleteTask}
        onSelect={setSelectedTaskId}
      />

      {isModalOpen && (
        <TaskModal
          taskName={taskName}
          onTaskNameChange={setTaskName}
          taskDesc={taskDesc}
          onTaskDescChange={setTaskDesc}
          taskDate={taskDate}
          onTaskDateChange={setTaskDate}
          taskCategory={taskCategory}
          onTaskCategoryChange={setTaskCategory}
          taskPriority={taskPriority}
          onTaskPriorityChange={setTaskPriority}
          isSaving={isSaving}
          onSubmit={handleAddTask}
          onClose={closeModal}
        />
      )}

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTaskId(null)}
          onUpdate={handleUpdateTask}
          onDelete={deleteTask}
        />
      )}
    </div>
  );
}

