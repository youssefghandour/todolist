import { useState, useEffect } from "react";
import { apiRequest } from "../api/taskApi";

const DEFAULT_DASHBOARD = {
    tasksCount: 0,
    completed: 0,
    pending: 0,
    highTasks: 0,
};

export function useDashboard() {
    const [dashboard, setDashboard] = useState(DEFAULT_DASHBOARD);
    const [error, setError] = useState("");

    const fetchDashboard = async () => {
        try {
            const data = await apiRequest("/");
            setDashboard({
                tasksCount: data.tasksCount || 0,
                completed: data.completed || 0,
                pending: data.pending || 0,
                highTasks: data.highTasks || 0,
            });
            setError("");
        } catch (err) {
            setError(err.message || "Failed to load dashboard data.");
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
                        highTasks: data.highTasks || 0,
                    });
                    setError("");
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err.message || "Failed to load dashboard data.");
                }
            }
        }

        loadDashboard();
        return () => {
            cancelled = true;
        };
    }, []);

    return {
        dashboard,
        error,
        fetchDashboard,
    };
}
