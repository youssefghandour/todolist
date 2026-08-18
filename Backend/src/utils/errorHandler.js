// Custom error class
export class ApiError extends Error {
    constructor(statusCode, message, details = null) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
    }
}

// Error handler middleware
export function errorHandler(err, req, res, next) {
    console.error("Error:", err.message);

    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            ...(err.details && { details: err.details })
        });
    }

    // Handle Prisma errors
    if (err.code === "P2025") {
        return res.status(404).json({
            success: false,
            message: "Resource not found"
        });
    }

    if (err.code === "P2002") {
        return res.status(409).json({
            success: false,
            message: "A record with this value already exists"
        });
    }

    // Default error response
    res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === "production"
            ? "Internal server error"
            : err.message
    });
}

// Async handler wrapper to catch errors
export function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
