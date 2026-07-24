import express from "express";
import { getCommentsForPost, addComment, deleteComment } from "../controllers/commentControllers.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/post/:postId", protect, getCommentsForPost);
router.post("/post/:postId", protect, addComment);
router.delete("/:id", protect, deleteComment);

export default router;
