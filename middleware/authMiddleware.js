import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/user.js";

/**
 * --------------------------------------------------------------------------
 * Authenticate User
 * --------------------------------------------------------------------------
 */

export const protect = async (req, res, next) => {
    try {

        const authHeader = req.headers.authorization;

        if (
            !authHeader ||
            !authHeader.startsWith("Bearer ")
        ) {
            return res.status(401).json({
                success: false,
                message: "Authentication token is required.",
            });
        }

        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not configured.");
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        if (!decoded?.id) {
            return res.status(401).json({
                success: false,
                message: "Invalid authentication payload.",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(decoded.id)) {
            return res.status(401).json({
                success: false,
                message: "Invalid user identifier.",
            });
        }

        const user = await User.findById(decoded.id)
            .select("-password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User no longer exists.",
            });
        }

        if (user.isActive === false) {
            return res.status(403).json({
                success: false,
                message: "Your account has been disabled.",
            });
        }

        req.user = user;

        next();

    } catch (error) {

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Authentication token has expired.",
            });
        }

        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                success: false,
                message: "Invalid authentication token.",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Authentication failed.",
        });
    }
};

/**
 * --------------------------------------------------------------------------
 * Role-Based Authorization
 * --------------------------------------------------------------------------
 */

export const authorize = (...roles) => {

    return (req, res, next) => {

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required.",
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to access this resource.",
            });
        }

        next();
    };
};