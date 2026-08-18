import { useState, useEffect } from "react";
import TaskCard from "./TaskCard";
import { useDragAndDrop } from "../hooks/useDragAndDrop";

export default function TaskList({ isLoading, tasks, visibleTasks, formatDate, onToggle, onDelete, onSelect }) {
  const [displayedTasks, setDisplayedTasks] = useState(visibleTasks);

  // Update displayedTasks when visibleTasks changes (e.g., due to filters)
  useEffect(() => {
    setDisplayedTasks(visibleTasks);
  }, [visibleTasks]);

  const {
    draggedItem,
    dragOverItem,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd
  } = useDragAndDrop(displayedTasks, (reorderedTasks) => {
    setDisplayedTasks(reorderedTasks);
  });

  const tasksToDisplay = displayedTasks.length > 0 ? displayedTasks : visibleTasks;

  return (
    <div className="task-list">
      {isLoading ? (
        <div className="empty-state">Loading tasks...</div>
      ) : tasksToDisplay.length === 0 ? (
        <div className="empty-state">
          {tasks.length === 0 ? "No tasks yet — add one to get started." : "No tasks match your filters."}
        </div>
      ) : (
        tasksToDisplay.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            formatDate={formatDate}
            onToggle={onToggle}
            onDelete={onDelete}
            onSelect={onSelect}
            isDragging={draggedItem?.id === task.id}
            isDragOver={dragOverItem?.id === task.id}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
          />
        ))
      )}
    </div>
  );
}
