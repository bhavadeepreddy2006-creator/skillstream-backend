import express from "express";
import { createReport, getReports, resolveReport } from "../controllers/reportControllers.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/post/:postId", protect, createReport);
router.get("/", protect, authorize("admin"), getReports);
router.put("/:id/resolve", protect, authorize("admin"), resolveReport);

export default router;
