import express from "express";

import {
    getMyNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
} from "../controllers/notificationControllers.js";

import {
    protect,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Notification Routes
|--------------------------------------------------------------------------
*/

// Get paginated notifications
router.get(
    "/",
    protect,
    getMyNotifications
);

// Get unread notification count
router.get(
    "/unread-count",
    protect,
    getUnreadCount
);

// Mark all notifications as read
router.patch(
    "/read-all",
    protect,
    markAllAsRead
);

// Mark a single notification as read
router.patch(
    "/:id/read",
    protect,
    markAsRead
);

// Delete a notification
router.delete(
    "/:id",
    protect,
    deleteNotification
);

export default router;