import { useState } from "react";
import { apiRequest, uiFieldsToApiPayload } from "../api/taskApi";
import {
    DEFAULT_CATEGORY,
    DEFAULT_PRIORITY,
    DEFAULT_CATEGORY_SELECT,
    DEFAULT_PRIORITY_SELECT,
} from "../constants";

export function useTaskCrud(onTasksChange) {
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
            closeModal();
            await onTasksChange();
        } catch (err) {
            alert(err.message || "Failed to create task.");
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
            setSelectedTaskId(null);
            await onTasksChange();
        } catch (err) {
            alert(err.message || "Failed to update task.");
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
            alert(err.message || "Failed to update task.");
        }
    };

    const deleteTask = async (id) => {
        try {
            await apiRequest(`/tasks/${id}`, { method: "DELETE" });
            setSelectedTaskId((currentId) => (currentId === id ? null : currentId));
            await onTasksChange();
        } catch (err) {
            alert(err.message || "Failed to delete task.");
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
