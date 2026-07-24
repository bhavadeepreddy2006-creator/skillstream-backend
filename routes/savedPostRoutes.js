import express from "express";
import { toggleSavePost, getMySavedPosts, getMySavedPostIds } from "../controllers/savedPostControllers.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/mine", protect, getMySavedPosts);
router.get("/mine/ids", protect, getMySavedPostIds);
router.post("/post/:postId", protect, toggleSavePost);

export default router;
