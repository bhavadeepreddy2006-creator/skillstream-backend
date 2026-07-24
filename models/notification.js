import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
        type: { type: String, enum: ["follow", "like", "comment", "system"], required: true },
        post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", default: null },
        message: { type: String, required: true },
        isRead: { type: Boolean, default: false },
    },
    { timestamps: true }
);

notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
