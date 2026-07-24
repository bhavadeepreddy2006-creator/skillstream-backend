import express from "express";
import {
    getPosts,
    getMyPosts,
    getAllPostsAdmin,
    getTrendingTechnologies,
    getPostById,
    createPost,
    updatePost,
    deletePost,
} from "../controllers/postControllers.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { uploadThumbnail } from "../middleware/upload.js";

const router = express.Router();

router.get("/", protect, getPosts);
router.get("/mine", protect, getMyPosts); // must come before "/:id"
router.get("/admin/all", protect, authorize("admin"), getAllPostsAdmin); // must come before "/:id"
router.get("/trending-technologies", protect, getTrendingTechnologies); // must come before "/:id"
router.get("/:id", protect, getPostById);
router.post("/", protect, uploadThumbnail.single("thumbnail"), createPost);
router.put("/:id", protect, uploadThumbnail.single("thumbnail"), updatePost);
router.delete("/:id", protect, deletePost);

export default router;
