import express from "express";

import {
    register,
    login,
    // logout,
    getMe,
    changePassword,
    // forgotPassword,
    // resetPassword,
    deleteMyAccount
} from "../controllers/authControllers.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Authentication Routes
|--------------------------------------------------------------------------
*/

// Register User
router.post("/register", register);

// Login User
router.post("/login", login);

// Logout User
// router.post("/logout", logout);

// Get Logged-in User
router.get(
    "/me",
    protect,
    getMe
);

// Forgot Password
// router.post(
//     "/forgot-password",
//     forgotPassword
// );

// Reset Password
// router.post(
//     "/reset-password/:token",
//     resetPassword
// );

// Change Password
router.patch(
    "/change-password",
    protect,
    changePassword
);

// Delete Account
router.delete(
    "/delete-account",
    protect,
    deleteMyAccount
);

export default router;