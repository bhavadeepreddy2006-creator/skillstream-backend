import express from "express";
import { submitContactMessage, getContactMessages } from "../controllers/contactControllers.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", submitContactMessage); // public — no auth required
router.get("/", protect, authorize("admin"), getContactMessages);

export default router;