import express from "express";
import { toggleLike, getMyLikes } from "../controllers/likeControllers.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/mine", protect, getMyLikes);
router.post("/post/:postId", protect, toggleLike);

export default router;
