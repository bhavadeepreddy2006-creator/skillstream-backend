import Notification from "../models/notification.js";

// Fire-and-forget: a failed notification write should never block or fail
// the action that triggered it.
export async function createNotification({ recipient, sender, type, post, message }) {
    try {
        if (recipient.toString() === sender.toString()) return;
        await Notification.create({ recipient, sender, type, post: post || null, message });
    } catch (error) {
        console.error("Failed to create notification:", error.message);
    }
}
