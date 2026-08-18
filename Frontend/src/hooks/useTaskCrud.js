import { useState } from "react";
import { apiRequest, uiFieldsToApiPayload } from "../api/taskApi";
import {
    DEFAULT_CATEGORY,
    DEFAULT_PRIORITY,
    DEFAULT_CATEGORY_SELECT,
    DEFAULT_PRIORITY_SELECT,
} from "../constants";
import { useApp } from "../context/AppContext";

export function useTaskCrud(onTasksChange) {
    const { addToast } = useApp();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState(null);
    const [taskName, setTaskName] = useState("");
    const [taskDesc, setTaskDesc] = useState("");
    const [taskDate, setTaskDate] = useState("");
    const [taskCategory, setTaskCategory] = useState(DEFAULT_CATEGORY_SELECT);
    const [taskPriority, setTaskPriority] = useState(DEFAULT_PRIORITY_SELECT);

    const closeModal = () => {
        setIsModalOpen(false);
        resetForm();
    };

    const resetForm = () => {
        setTaskName("");
        setTaskDesc("");
        setTaskDate("");
        setTaskCategory(DEFAULT_CATEGORY_SELECT);
        setTaskPriority(DEFAULT_PRIORITY_SELECT);
    };

    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!taskName.trim()) return;

        const payload = uiFieldsToApiPayload({
            title: taskName.trim(),
            desc: taskDesc.trim(),
            date: taskDate,
            category: taskCategory === DEFAULT_CATEGORY_SELECT ? DEFAULT_CATEGORY : taskCategory,
            priority: taskPriority === DEFAULT_PRIORITY_SELECT ? DEFAULT_PRIORITY : taskPriority,
            completed: false,
        });

        setIsSaving(true);
        try {
            await apiRequest("/tasks", {
                method: "POST",
                body: JSON.stringify(payload),
            });
            addToast("Task created successfully!", "success");
            closeModal();
            await onTasksChange();
        } catch (err) {
            addToast(err.message || "Failed to create task.", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdateTask = async (updatedFields) => {
        setIsSaving(true);
        try {
            const payload = uiFieldsToApiPayload(updatedFields);
            await apiRequest(`/tasks/${selectedTaskId}`, {
                method: "PUT",
                body: JSON.stringify(payload),
            });
            addToast("Task updated successfully!", "success");
            setSelectedTaskId(null);
            await onTasksChange();
        } catch (err) {
            addToast(err.message || "Failed to update task.", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const toggleTask = async (id, currentCompleted) => {
        const nextCompleted = !currentCompleted;
        const nextStatus = nextCompleted ? "completed" : "pending";

        try {
            await apiRequest(`/tasks/${id}`, {
                method: "PUT",
                body: JSON.stringify({ status: nextStatus }),
            });
            await onTasksChange();
        } catch (err) {
            addToast(err.message || "Failed to update task.", "error");
        }
    };

    const deleteTask = async (id) => {
        try {
            await apiRequest(`/tasks/${id}`, { method: "DELETE" });
            addToast("Task deleted successfully!", "success");
            setSelectedTaskId((currentId) => (currentId === id ? null : currentId));
            await onTasksChange();
        } catch (err) {
            addToast(err.message || "Failed to delete task.", "error");
        }
    };

    return {
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
        resetForm,
        handleAddTask,
        handleUpdateTask,
        toggleTask,
        deleteTask,
    };
}
