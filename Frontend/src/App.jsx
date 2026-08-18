import { useState, useEffect } from "react";
import Header from "./components/Header";
import StatsRow from "./components/StatsRow";
import SearchBar from "./components/SearchBar";
import FilterBar from "./components/FilterBar";
import TaskList from "./components/TaskList";
import TaskModal from "./components/TaskModal";
import TaskDetailModal from "./components/TaskDetailModal";
import { useTaskFilters } from "./hooks/useTaskFilters";
import { useTaskCrud } from "./hooks/useTaskCrud";
import { useDashboard } from "./hooks/useDashboard";

export default function App() {
  const [isDark, setIsDark] = useState(false);

  const {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    categoryFilter,
    setCategoryFilter,
    sortOrder,
    setSortOrder,
    tasks,
    rawTasksById,
    isLoading,
    loadError,
    fetchTasks,
  } = useTaskFilters();

  const { dashboard: dashboardData, fetchDashboard } = useDashboard();

  const {
    isModalOpen,
    setIsModalOpen,
    isSaving,
    selectedTaskId,
    setSelectedTaskId,
    taskName,
    setTaskName,
    taskDesc,
    setTaskDesc,
    taskDate,
    setTaskDate,
    taskCategory,
    setTaskCategory,
    taskPriority,
    setTaskPriority,
    closeModal,
    handleAddTask,
    handleUpdateTask,
    toggleTask,
    deleteTask,
  } = useTaskCrud(() => Promise.all([fetchTasks(), fetchDashboard()]));

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
        totalTasks={dashboardData.tasksCount}
        completedTasks={dashboardData.completed}
        pendingTasks={dashboardData.pending}
        highPriorityTasks={dashboardData.highTasks}
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

