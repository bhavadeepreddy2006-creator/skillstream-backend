import Notification from "../models/notification.js";
import { handleControllerError } from "../utils/handleControllerError.js";

export async function getMyNotifications(req, res) {
    try {
        const { page = 1, limit = 20 } = req.query;
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));

        const [notifications, total] = await Promise.all([
            Notification.find({ recipient: req.user._id })
                .populate("sender", "name")
                .sort({ createdAt: -1 })
                .skip((pageNum - 1) * limitNum)
                .limit(limitNum),
            Notification.countDocuments({ recipient: req.user._id }),
        ]);

        res.status(200).json({
            success: true,
            notifications,
            pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
        });
    } catch (error) {
        handleControllerError(res, error, "Could not load notifications.");
    }
}

export async function getUnreadCount(req, res) {
    try {
        const count = await Notification.countDocuments({ recipient: req.user._id, isRead: false });
        res.status(200).json({ success: true, count });
    } catch (error) {
        handleControllerError(res, error, "Could not load unread count.");
    }
}

export async function markAsRead(req, res) {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, recipient: req.user._id },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }

        res.status(200).json({ success: true, notification });
    } catch (error) {
        handleControllerError(res, error, "Could not update this notification.");
    }
}

export async function markAllAsRead(req, res) {
    try {
        await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
        res.status(200).json({ success: true, message: "All notifications marked as read" });
    } catch (error) {
        handleControllerError(res, error, "Could not update notifications.");
    }
}
