import express from "express";
import {
    toggleSavePost,
    getMySavedPosts,
    getMySavedPostIds,
} from "../controllers/savedPostController.js";

import {
    protect,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Saved Post Routes
|--------------------------------------------------------------------------
*/

// Get all saved posts for the logged-in user.
router.get(
    "/mine",
    protect,
    getMySavedPosts
);

// Get IDs of all saved posts.
router.get(
    "/mine/ids",
    protect,
    getMySavedPostIds
);

// Save or unsave a post.
router.post(
    "/:postId",
    protect,
    toggleSavePost
);

export default router;