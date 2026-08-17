import { useState, useEffect, useCallback } from "react";
import { apiRequest, apiTaskToUiTask } from "../api/taskApi";
import {
    STATUS_LABELS,
    PRIORITY_LABELS,
    CATEGORY_LABELS,
    SORT_LABELS,
    DEFAULT_STATUS_FILTER,
    DEFAULT_PRIORITY_FILTER,
    DEFAULT_CATEGORY_FILTER,
    DEFAULT_SORT_ORDER,
} from "../constants";

export function useTaskFilters() {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState(DEFAULT_STATUS_FILTER);
    const [priorityFilter, setPriorityFilter] = useState(DEFAULT_PRIORITY_FILTER);
    const [categoryFilter, setCategoryFilter] = useState(DEFAULT_CATEGORY_FILTER);
    const [sortOrder, setSortOrder] = useState(DEFAULT_SORT_ORDER);
    const [tasks, setTasks] = useState([]);
    const [rawTasksById, setRawTasksById] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState("");

    const buildQueryParams = useCallback(() => {
        const params = new URLSearchParams();

        if (searchQuery.trim()) params.set("search", searchQuery.trim());

        const apiStatus = STATUS_LABELS[statusFilter];
        const apiPriority = PRIORITY_LABELS[priorityFilter];
        const apiCategory = CATEGORY_LABELS[categoryFilter];

        if (apiStatus) params.set("status", apiStatus);
        if (apiPriority) params.set("priority", apiPriority);
        if (apiCategory) params.set("category", apiCategory);
        params.set("sortBy", SORT_LABELS[sortOrder]);

        return params;
    }, [searchQuery, statusFilter, priorityFilter, categoryFilter, sortOrder]);

    const fetchTasks = async () => {
        setIsLoading(true);
        setLoadError("");

        try {
            const params = buildQueryParams();
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

        async function loadTasks() {
            setIsLoading(true);
            setLoadError("");
            try {
                const params = buildQueryParams();
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
    }, [buildQueryParams]);

    return {
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
    };
}
