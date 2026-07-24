import express from "express";
import { getAdminOverview } from "../controllers/adminControllers.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/overview", protect, authorize("admin"), getAdminOverview);

export default router;
