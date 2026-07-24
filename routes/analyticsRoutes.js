import express from "express";
import { getMyAnalytics } from "../controllers/analyticsControllers.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/overview", protect, getMyAnalytics);

export default router;
