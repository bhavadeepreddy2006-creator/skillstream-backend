import express from "express";
import {
    createReport,
    getReports,
    resolveReport,
} from "../controllers/reportControllers.js";

import {
    protect,
    authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Report Routes
|--------------------------------------------------------------------------
*/

// Create a report for a post
router.post(
    "/post/:postId",
    protect,
    createReport
);

// Get all reports (Admin only)
router.get(
    "/",
    protect,
    authorize("admin"),
    getReports
);

// Resolve a report (Admin only)
router.patch(
    "/:id/resolve",
    protect,
    authorize("admin"),
    resolveReport
);

export default router;