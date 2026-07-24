import ContactMessage from "../models/contactMessage.js";
import { handleControllerError } from "../utils/handleControllerError.js";

// POST /contact — deliberately public (no `protect` middleware). A
// visitor reaching out through the Contact page may not have an account
// at all, so this cannot require authentication.
export async function submitContactMessage(req, res) {
    try {
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: "name, email and message are all required",
            });
        }

        const contactMessage = await ContactMessage.create({ name, email, message });

        res.status(201).json({
            success: true,
            message: "Thanks for reaching out! We'll get back to you soon.",
            contactMessage,
        });
    } catch (error) {
        handleControllerError(res, error, "Could not submit your message. Please try again.");
    }
}

// GET /contact  (protected — admin only)
export async function getContactMessages(req, res) {
    try {
        const messages = await ContactMessage.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, messages });
    } catch (error) {
        handleControllerError(res, error, "Could not load messages.");
    }
}