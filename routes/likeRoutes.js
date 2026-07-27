import express from "express";
import {
    toggleLike,
    getMyLikes,
} from "../controllers/likeController.js";

import {
    protect,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Like Routes
|--------------------------------------------------------------------------
*/

// Get all posts liked by the logged-in user.
router.get(
    "/mine",
    protect,
    getMyLikes
);

// Toggle like/unlike for a post.
router.post(
    "/:postId",
    protect,
    toggleLike
);

export default router;