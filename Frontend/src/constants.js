// Status constants
export const STATUS = {
    PENDING: "pending",
    COMPLETED: "completed",
};

export const STATUS_LABELS = {
    "All Status": "",
    "Pending": STATUS.PENDING,
    "Completed": STATUS.COMPLETED,
};

// Priority constants
export const PRIORITY = {
    HIGH: "high",
    MEDIUM: "medium",
    LOW: "low",
};

export const PRIORITY_LABELS = {
    "All Priority": "",
    "High": PRIORITY.HIGH,
    "Medium": PRIORITY.MEDIUM,
    "Low": PRIORITY.LOW,
};

// Category constants
export const CATEGORY = {
    WORK: "work",
    PERSONAL: "personal",
    SHOPPING: "shopping",
    FINANCE: "finance",
    HEALTH: "health",
    OTHER: "other",
};

export const CATEGORY_LABELS = {
    "All Categories": "",
    "Work": CATEGORY.WORK,
    "Personal": CATEGORY.PERSONAL,
    "Shopping": CATEGORY.SHOPPING,
    "Finance": CATEGORY.FINANCE,
    "Health": CATEGORY.HEALTH,
    "Other": CATEGORY.OTHER,
};

// Sort constants
export const SORT_OPTIONS = {
    NEWEST: "newest",
    OLDEST: "oldest",
    DUE_DATE: "dueDate",
    PRIORITY: "priority",
};

export const SORT_LABELS = {
    "Newest First": SORT_OPTIONS.NEWEST,
    "Oldest First": SORT_OPTIONS.OLDEST,
    "Due Date": SORT_OPTIONS.DUE_DATE,
    "By Due Date": SORT_OPTIONS.DUE_DATE,
    "Priority": SORT_OPTIONS.PRIORITY,
    "By Priority": SORT_OPTIONS.PRIORITY,
};

// Default values
export const DEFAULT_CATEGORY = "Personal";
export const DEFAULT_PRIORITY = "Low";
export const DEFAULT_CATEGORY_SELECT = "Select a category";
export const DEFAULT_PRIORITY_SELECT = "Select a priority";
export const DEFAULT_STATUS_FILTER = "All Status";
export const DEFAULT_PRIORITY_FILTER = "All Priority";
export const DEFAULT_CATEGORY_FILTER = "All Categories";
export const DEFAULT_SORT_ORDER = "Newest First";
