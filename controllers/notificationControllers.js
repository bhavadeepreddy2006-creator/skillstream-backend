import mongoose from "mongoose";
import Notification from "../models/notification.js";
import { handleControllerError } from "../utils/handleControllerError.js";

/* ============================================================
   Get My Notifications
============================================================ */

export async function getMyNotifications(req, res) {
    try {

        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));

        const [notifications, total, unread] = await Promise.all([

            Notification.find({
                recipient: req.user._id,
            })
                .populate("sender", "name role profilePhoto")
                .populate("post", "title")
                .sort({
                    createdAt: -1,
                })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),

            Notification.countDocuments({
                recipient: req.user._id,
            }),

            Notification.countDocuments({
                recipient: req.user._id,
                isRead: false,
            }),

        ]);

        return res.status(200).json({

            success: true,

            unread,

            notifications,

            pagination: {

                page,

                limit,

                total,

                totalPages: Math.ceil(total / limit),

            },

        });

    } catch (error) {

        handleControllerError(
            res,
            error,
            "Could not load notifications."
        );

    }
}

/* ============================================================
   Get Unread Count
============================================================ */

export async function getUnreadCount(req, res) {

    try {

        const count = await Notification.countDocuments({

            recipient: req.user._id,

            isRead: false,

        });

        return res.status(200).json({

            success: true,

            count,

        });

    } catch (error) {

        handleControllerError(
            res,
            error,
            "Could not load unread count."
        );

    }

}

/* ============================================================
   Mark Notification As Read
============================================================ */

export async function markAsRead(req, res) {

    try {

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {

            return res.status(400).json({

                success: false,

                message: "Invalid notification ID",

            });

        }

        const notification = await Notification.findOneAndUpdate(

            {

                _id: req.params.id,

                recipient: req.user._id,

            },

            {

                isRead: true,

            },

            {

                new: true,

            }

        );

        if (!notification) {

            return res.status(404).json({

                success: false,

                message: "Notification not found.",

            });

        }

        return res.status(200).json({

            success: true,

            notification,

        });

    } catch (error) {

        handleControllerError(
            res,
            error,
            "Could not update notification."
        );

    }

}

/* ============================================================
   Mark All Notifications As Read
============================================================ */

export async function markAllAsRead(req, res) {

    try {

        const result = await Notification.updateMany(

            {

                recipient: req.user._id,

                isRead: false,

            },

            {

                isRead: true,

            }

        );

        return res.status(200).json({

            success: true,

            modifiedCount: result.modifiedCount,

            message: "All notifications marked as read.",

        });

    } catch (error) {

        handleControllerError(
            res,
            error,
            "Could not update notifications."
        );

    }

}

/* ============================================================
   Delete Notification
============================================================ */

export async function deleteNotification(req, res) {

    try {

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {

            return res.status(400).json({

                success: false,

                message: "Invalid notification ID",

            });

        }

        const notification = await Notification.findOneAndDelete({

            _id: req.params.id,

            recipient: req.user._id,

        });

        if (!notification) {

            return res.status(404).json({

                success: false,

                message: "Notification not found.",

            });

        }

        return res.status(200).json({

            success: true,

            message: "Notification deleted successfully.",

        });

    } catch (error) {

        handleControllerError(
            res,
            error,
            "Could not delete notification."
        );

    }

}