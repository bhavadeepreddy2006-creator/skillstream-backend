import User from "../models/user.js";
import { cascadeDeleteUser } from "../utils/cascadeDeleteUser.js";
import { handleControllerError } from "../utils/handleControllerError.js";

export async function getUsers(req, res) {
    try {
        const users = await User.find();
        res.status(200).json({ success: true, users });
    } catch (error) {
        handleControllerError(res, error, "Could not load users.");
    }
}

export async function getUserById(req, res) {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.status(200).json({ success: true, user });
    } catch (error) {
        handleControllerError(res, error, "Could not load this user.");
    }
}

export async function UpdateUser(req, res) {
    try {
        const { password, role, ...safeUpdates } = req.body;
        const user = await User.findByIdAndUpdate(req.params.id, safeUpdates, { new: true, runValidators: true });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.status(200).json({ success: true, message: "User updated successfully", user });
    } catch (error) {
        handleControllerError(res, error, "Could not update this user.");
    }
}

export async function deleteUser(req, res) {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        await cascadeDeleteUser(req.params.id);
        res.status(200).json({ success: true, message: "User deleted successfully" });
    } catch (error) {
        handleControllerError(res, error, "Could not delete this user.");
    }
}

export async function updateUserRole(req, res) {
    try {
        const { role } = req.body;
        if (!["learner", "creator", "admin"].includes(role)) {
            return res.status(400).json({ success: false, message: "Role must be one of: learner, creator, admin" });
        }
        const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.status(200).json({ success: true, message: "User role updated successfully", user });
    } catch (error) {
        handleControllerError(res, error, "Could not update this user's role.");
    }
}
