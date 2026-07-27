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
} from "../controllers/postController.js";

import {
    protect,
    authorize,
} from "../middleware/authMiddleware.js";

import {
    uploadThumbnail,
} from "../middleware/upload.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

router.get("/", getPosts);

router.get(
    "/trending-technologies",
    getTrendingTechnologies
);

router.get("/:id", getPostById);

/*
|--------------------------------------------------------------------------
| Protected Routes
|--------------------------------------------------------------------------
*/

router.get(
    "/mine",
    protect,
    getMyPosts
);

router.post(
    "/",
    protect,
    uploadThumbnail.single("thumbnail"),
    createPost
);

router.put(
    "/:id",
    protect,
    uploadThumbnail.single("thumbnail"),
    updatePost
);

router.delete(
    "/:id",
    protect,
    deletePost
);

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
*/

router.get(
    "/admin/all",
    protect,
    authorize("admin"),
    getAllPostsAdmin
);

export default router;