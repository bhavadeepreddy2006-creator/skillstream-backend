import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        type: {
            type: String,
            enum: [
                "follow",
                "like",
                "comment",
                "system",
            ],
            required: true,
        },

        post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
            default: null,
        },

        message: {
            type: String,
            required: true,
            trim: true,
            maxlength: 300,
        },

        actionUrl: {
            type: String,
            trim: true,
            maxlength: 500,
            default: "",
        },

        senderPhoto: {
            type: String,
            trim: true,
            default: "",
        },

        isRead: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// Latest notifications
notificationSchema.index({
    recipient: 1,
    createdAt: -1,
});

// Read / unread filter
notificationSchema.index({
    recipient: 1,
    isRead: 1,
});

// Optimized unread notification queries
notificationSchema.index({
    recipient: 1,
    isRead: 1,
    createdAt: -1,
});

// Filter by notification type
notificationSchema.index({
    type: 1,
});

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;