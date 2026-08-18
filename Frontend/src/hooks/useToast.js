import { useState, useCallback } from 'react';

// Toast notification types
export const TOAST_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error',
    INFO: 'info',
    WARNING: 'warning'
};

// Custom hook for toast notifications
export function useToast() {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = TOAST_TYPES.INFO, duration = 3000) => {
        const id = Date.now();
        const toast = { id, message, type };

        setToasts(prev => [...prev, toast]);

        // Auto-remove toast after duration
        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }

        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const success = useCallback((message, duration) =>
        addToast(message, TOAST_TYPES.SUCCESS, duration), [addToast]);

    const error = useCallback((message, duration) =>
        addToast(message, TOAST_TYPES.ERROR, duration), [addToast]);

    const info = useCallback((message, duration) =>
        addToast(message, TOAST_TYPES.INFO, duration), [addToast]);

    const warning = useCallback((message, duration) =>
        addToast(message, TOAST_TYPES.WARNING, duration), [addToast]);

    return {
        toasts,
        addToast,
        removeToast,
        success,
        error,
        info,
        warning
    };
}
