import jwt from "jsonwebtoken";
import User from "../models/user.js";

// Verifies the Authorization: Bearer <token> header, loads the user, and
// attaches it to req.user for downstream controllers.
export async function protect(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ success: false, message: "Not authorized, no token provided" });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ success: false, message: "Not authorized, user no longer exists" });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Not authorized, invalid or expired token" });
    }
}

// Restricts a route to specific roles, e.g. router.delete("/:id", protect, authorize("admin"), ...)
export function authorize(...roles) {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: "You do not have permission to perform this action" });
        }
        next();
    };
}

// Allows a request through only if the authenticated user is acting on
// their own record (req.params.id matches req.user._id) or is an admin.
export function selfOrAdmin(req, res, next) {
    const isSelf = req.user && req.user._id.toString() === req.params.id;
    const isAdmin = req.user && req.user.role === "admin";

    if (!isSelf && !isAdmin) {
        return res.status(403).json({ success: false, message: "You can only modify your own account" });
    }
    next();
}
