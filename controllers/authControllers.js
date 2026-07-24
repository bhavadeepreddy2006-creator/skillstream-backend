import User from "../models/user.js";
import CreatorProfile from "../models/creatorProfile.js";
import generateToken from "../utils/generateToken.js";
import { cascadeDeleteUser } from "../utils/cascadeDeleteUser.js";
import { handleControllerError } from "../utils/handleControllerError.js";

const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

export async function register(req, res) {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "name, email and password are all required" });
        }

        if (!PASSWORD_PATTERN.test(password)) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character",
            });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "An account with this email already exists" });
        }

        const user = await User.create({ name, email, password });
        await CreatorProfile.create({ user: user._id });

        const token = generateToken(user);

        res.status(201).json({
            success: true,
            message: "Account created successfully",
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
        });
    } catch (error) {
        handleControllerError(res, error, "Could not create the account. Please try again.");
    }
}

export async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "email and password are both required" });
        }

        const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        const token = generateToken(user);

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
        });
    } catch (error) {
        handleControllerError(res, error, "Could not log in. Please try again.");
    }
}

export async function getMe(req, res) {
    try {
        res.status(200).json({
            success: true,
            user: { id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role },
        });
    } catch (error) {
        handleControllerError(res, error);
    }
}

export async function changePassword(req, res) {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: "Current password and new password are both required" });
        }

        if (!PASSWORD_PATTERN.test(newPassword)) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 8 characters and include uppercase, lowercase, a number, and a special character",
            });
        }

        const user = await User.findById(req.user._id).select("+password");
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Current password is incorrect" });
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({ success: true, message: "Password updated successfully" });
    } catch (error) {
        handleControllerError(res, error, "Could not update the password. Please try again.");
    }
}

export async function deleteMyAccount(req, res) {
    try {
        await cascadeDeleteUser(req.user._id);
        res.status(200).json({ success: true, message: "Account deleted successfully" });
    } catch (error) {
        handleControllerError(res, error, "Could not delete the account. Please try again.");
    }
}
