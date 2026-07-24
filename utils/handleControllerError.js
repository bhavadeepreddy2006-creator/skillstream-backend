// Single place that decides "was this the client's fault (400) or ours
// (500)?" Every controller catch block calls this instead of guessing.
// Usage: catch (error) { return handleControllerError(res, error); }
export function handleControllerError(res, error, fallbackMessage = "Something went wrong. Please try again.") {
    if (error.name === "ValidationError") {
        return res.status(400).json({ success: false, message: error.message });
    }

    if (error.code === 11000) {
        const field = Object.keys(error.keyPattern || {})[0] || "value";
        return res.status(400).json({ success: false, message: `This ${field} is already in use.` });
    }

    if (error.name === "CastError") {
        return res.status(400).json({ success: false, message: "Invalid ID format." });
    }

    // Anything else is unexpected — log full detail server-side, never
    // leak raw internals to the client.
    console.error(error);
    return res.status(500).json({ success: false, message: fallbackMessage });
}
