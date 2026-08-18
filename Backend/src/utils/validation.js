// Validation constants
export const Status = ["pending", "completed"];
export const Priority = ["high", "medium", "low"];
export const Category = ["health", "work", "finance", "shopping", "personal", "other"];
export const SortOptions = ["newest", "oldest", "dueDate", "priority"];

// Sanitize string input (trim and prevent XSS)
export function sanitizeString(str) {
    if (typeof str !== "string") return "";
    return str.trim().substring(0, 500); // Limit to 500 chars
}

// Validate title
export function validateTitle(title) {
    const sanitized = sanitizeString(title);
    if (!sanitized || sanitized.length < 1) {
        return { valid: false, error: "Title is required and must be at least 1 character" };
    }
    if (sanitized.length > 200) {
        return { valid: false, error: "Title must not exceed 200 characters" };
    }
    return { valid: true, value: sanitized };
}

// Validate description
export function validateDescription(description) {
    if (!description) return { valid: true, value: undefined };
    const sanitized = sanitizeString(description);
    if (sanitized.length > 2000) {
        return { valid: false, error: "Description must not exceed 2000 characters" };
    }
    return { valid: true, value: sanitized || undefined };
}

// Validate status
export function validateStatus(status) {
    if (!status) return { valid: true, value: undefined };
    if (!Status.includes(status)) {
        return { valid: false, error: `Invalid status. Must be one of: ${Status.join(", ")}` };
    }
    return { valid: true, value: status };
}

// Validate priority
export function validatePriority(priority) {
    if (!priority) return { valid: true, value: undefined };
    if (!Priority.includes(priority)) {
        return { valid: false, error: `Invalid priority. Must be one of: ${Priority.join(", ")}` };
    }
    return { valid: true, value: priority };
}

// Validate category
export function validateCategory(category) {
    if (!category) return { valid: true, value: undefined };
    if (!Category.includes(category)) {
        return { valid: false, error: `Invalid category. Must be one of: ${Category.join(", ")}` };
    }
    return { valid: true, value: category };
}

// Validate due date
export function validateDueDate(dueDate) {
    if (!dueDate) return { valid: true, value: undefined };

    try {
        const date = new Date(dueDate);
        if (isNaN(date.getTime())) {
            return { valid: false, error: "Invalid date format" };
        }
        return { valid: true, value: date };
    } catch (e) {
        return { valid: false, error: "Invalid date format" };
    }
}

// Validate ID format (CUID)
export function validateId(id) {
    if (!id || typeof id !== "string") {
        return { valid: false, error: "Invalid ID format" };
    }
    // Basic CUID validation (starts with 'c' followed by alphanumeric chars)
    if (!/^[a-z0-9]+$/.test(id)) {
        return { valid: false, error: "Invalid ID format" };
    }
    return { valid: true, value: id };
}

// Validate task creation payload
export function validateCreateTaskPayload(body) {
    const errors = [];

    // Validate title (required)
    const titleValidation = validateTitle(body.title);
    if (!titleValidation.valid) errors.push(titleValidation.error);

    // Validate status
    const statusValidation = validateStatus(body.status);
    if (!statusValidation.valid) errors.push(statusValidation.error);

    // Validate priority
    const priorityValidation = validatePriority(body.priority);
    if (!priorityValidation.valid) errors.push(priorityValidation.error);

    // Validate category
    const categoryValidation = validateCategory(body.category);
    if (!categoryValidation.valid) errors.push(categoryValidation.error);

    // Validate description
    const descValidation = validateDescription(body.description);
    if (!descValidation.valid) errors.push(descValidation.error);

    // Validate due date
    const dueDateValidation = validateDueDate(body.dueDate);
    if (!dueDateValidation.valid) errors.push(dueDateValidation.error);

    if (errors.length > 0) {
        return { valid: false, errors };
    }

    return {
        valid: true,
        data: {
            title: titleValidation.value,
            status: statusValidation.value,
            priority: priorityValidation.value,
            category: categoryValidation.value,
            description: descValidation.value,
            dueDate: dueDateValidation.value
        }
    };
}

// Validate task update payload
export function validateUpdateTaskPayload(body) {
    const errors = [];
    const updates = {};

    // Validate title if provided
    if (body.title !== undefined) {
        const titleValidation = validateTitle(body.title);
        if (!titleValidation.valid) errors.push(titleValidation.error);
        else updates.title = titleValidation.value;
    }

    // Validate status if provided
    if (body.status !== undefined) {
        const statusValidation = validateStatus(body.status);
        if (!statusValidation.valid) errors.push(statusValidation.error);
        else updates.status = statusValidation.value;
    }

    // Validate priority if provided
    if (body.priority !== undefined) {
        const priorityValidation = validatePriority(body.priority);
        if (!priorityValidation.valid) errors.push(priorityValidation.error);
        else updates.priority = priorityValidation.value;
    }

    // Validate category if provided
    if (body.category !== undefined) {
        const categoryValidation = validateCategory(body.category);
        if (!categoryValidation.valid) errors.push(categoryValidation.error);
        else updates.category = categoryValidation.value;
    }

    // Validate description if provided
    if (body.description !== undefined) {
        const descValidation = validateDescription(body.description);
        if (!descValidation.valid) errors.push(descValidation.error);
        else updates.description = descValidation.value;
    }

    // Validate due date if provided
    if (body.dueDate !== undefined) {
        const dueDateValidation = validateDueDate(body.dueDate);
        if (!dueDateValidation.valid) errors.push(dueDateValidation.error);
        else updates.dueDate = dueDateValidation.value;
    }

    if (errors.length > 0) {
        return { valid: false, errors };
    }

    return { valid: true, data: updates };
}

// Validate query parameters
export function validateQueryParams(query) {
    const errors = [];
    const validated = {};

    // Validate search
    if (query.search) {
        validated.search = sanitizeString(query.search);
    }

    // Validate status
    if (query.status) {
        const statusValidation = validateStatus(query.status);
        if (!statusValidation.valid) errors.push(statusValidation.error);
        else validated.status = statusValidation.value;
    }

    // Validate priority
    if (query.priority) {
        const priorityValidation = validatePriority(query.priority);
        if (!priorityValidation.valid) errors.push(priorityValidation.error);
        else validated.priority = priorityValidation.value;
    }

    // Validate category
    if (query.category) {
        const categoryValidation = validateCategory(query.category);
        if (!categoryValidation.valid) errors.push(categoryValidation.error);
        else validated.category = categoryValidation.value;
    }

    // Validate sortBy
    if (query.sortBy) {
        if (!SortOptions.includes(query.sortBy)) {
            errors.push(`Invalid sortBy. Must be one of: ${SortOptions.join(", ")}`);
        } else {
            validated.sortBy = query.sortBy;
        }
    }

    // Validate pagination
    let limit = 50; // Default limit
    let offset = 0;

    if (query.limit) {
        const parsedLimit = parseInt(query.limit);
        if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
            errors.push("Limit must be a number between 1 and 100");
        } else {
            limit = parsedLimit;
        }
    }

    if (query.offset) {
        const parsedOffset = parseInt(query.offset);
        if (isNaN(parsedOffset) || parsedOffset < 0) {
            errors.push("Offset must be a non-negative number");
        } else {
            offset = parsedOffset;
        }
    }

    if (errors.length > 0) {
        return { valid: false, errors };
    }

    return { valid: true, data: { ...validated, limit, offset } };
}
