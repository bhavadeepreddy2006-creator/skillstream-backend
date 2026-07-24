// Last-resort safety net only. Every controller in this project catches
// and responds to its own errors directly (see utils/handleControllerError.js) —
// nothing in normal operation calls next(err). This only fires for a
// genuinely unexpected failure that occurred before a controller's own
// try/catch could run, or for unmatched routes.

export function notFound(req, res, next) {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
}

export function errorHandler(err, req, res, next) {
    console.error(err.stack);
    const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal server error",
    });
}
