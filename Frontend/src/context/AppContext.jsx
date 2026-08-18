import { createContext, useContext, useReducer, useCallback } from 'react';

// Create context
const AppContext = createContext();

// Action types
export const ACTIONS = {
    // Toast actions
    ADD_TOAST: 'ADD_TOAST',
    REMOVE_TOAST: 'REMOVE_TOAST',

    // Modal actions
    OPEN_TASK_MODAL: 'OPEN_TASK_MODAL',
    CLOSE_TASK_MODAL: 'CLOSE_TASK_MODAL',
    OPEN_DETAIL_MODAL: 'OPEN_DETAIL_MODAL',
    CLOSE_DETAIL_MODAL: 'CLOSE_DETAIL_MODAL',

    // Loading states
    SET_LOADING: 'SET_LOADING',
    SET_SAVING: 'SET_SAVING',

    // UI state
    SET_DARK_MODE: 'SET_DARK_MODE',
    SET_SEARCH_QUERY: 'SET_SEARCH_QUERY',
};

// Initial state
const initialState = {
    toasts: [],
    isTaskModalOpen: false,
    isDetailModalOpen: false,
    selectedTaskId: null,
    isLoading: false,
    isSaving: false,
    isDarkMode: false,
    searchQuery: '',
};

// Reducer function
function appReducer(state, action) {
    switch (action.type) {
        // Toast actions
        case ACTIONS.ADD_TOAST:
            return {
                ...state,
                toasts: [...state.toasts, action.payload]
            };
        case ACTIONS.REMOVE_TOAST:
            return {
                ...state,
                toasts: state.toasts.filter(t => t.id !== action.payload)
            };

        // Modal actions
        case ACTIONS.OPEN_TASK_MODAL:
            return {
                ...state,
                isTaskModalOpen: true,
                selectedTaskId: action.payload || null
            };
        case ACTIONS.CLOSE_TASK_MODAL:
            return {
                ...state,
                isTaskModalOpen: false,
                selectedTaskId: null
            };
        case ACTIONS.OPEN_DETAIL_MODAL:
            return {
                ...state,
                isDetailModalOpen: true,
                selectedTaskId: action.payload
            };
        case ACTIONS.CLOSE_DETAIL_MODAL:
            return {
                ...state,
                isDetailModalOpen: false,
                selectedTaskId: null
            };

        // Loading states
        case ACTIONS.SET_LOADING:
            return {
                ...state,
                isLoading: action.payload
            };
        case ACTIONS.SET_SAVING:
            return {
                ...state,
                isSaving: action.payload
            };

        // UI state
        case ACTIONS.SET_DARK_MODE:
            return {
                ...state,
                isDarkMode: action.payload
            };
        case ACTIONS.SET_SEARCH_QUERY:
            return {
                ...state,
                searchQuery: action.payload
            };

        default:
            return state;
    }
}

// Context provider component
export function AppProvider({ children }) {
    const [state, dispatch] = useReducer(appReducer, initialState);

    // Toast actions
    const addToast = useCallback((message, type = 'info', duration = 3000) => {
        const id = Date.now();
        dispatch({ type: ACTIONS.ADD_TOAST, payload: { id, message, type } });

        if (duration > 0) {
            setTimeout(() => {
                dispatch({ type: ACTIONS.REMOVE_TOAST, payload: id });
            }, duration);
        }
    }, []);

    const removeToast = useCallback((id) => {
        dispatch({ type: ACTIONS.REMOVE_TOAST, payload: id });
    }, []);

    // Modal actions
    const openTaskModal = useCallback((taskId = null) => {
        dispatch({ type: ACTIONS.OPEN_TASK_MODAL, payload: taskId });
    }, []);

    const closeTaskModal = useCallback(() => {
        dispatch({ type: ACTIONS.CLOSE_TASK_MODAL });
    }, []);

    const openDetailModal = useCallback((taskId) => {
        dispatch({ type: ACTIONS.OPEN_DETAIL_MODAL, payload: taskId });
    }, []);

    const closeDetailModal = useCallback(() => {
        dispatch({ type: ACTIONS.CLOSE_DETAIL_MODAL });
    }, []);

    // Loading actions
    const setLoading = useCallback((loading) => {
        dispatch({ type: ACTIONS.SET_LOADING, payload: loading });
    }, []);

    const setSaving = useCallback((saving) => {
        dispatch({ type: ACTIONS.SET_SAVING, payload: saving });
    }, []);

    // UI actions
    const setDarkMode = useCallback((dark) => {
        dispatch({ type: ACTIONS.SET_DARK_MODE, payload: dark });
    }, []);

    const setSearchQuery = useCallback((query) => {
        dispatch({ type: ACTIONS.SET_SEARCH_QUERY, payload: query });
    }, []);

    const value = {
        // State
        ...state,
        // Toast actions
        addToast,
        removeToast,
        // Modal actions
        openTaskModal,
        closeTaskModal,
        openDetailModal,
        closeDetailModal,
        // Loading actions
        setLoading,
        setSaving,
        // UI actions
        setDarkMode,
        setSearchQuery
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
}

// Custom hook to use app context
export function useApp() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within AppProvider');
    }
    return context;
}
