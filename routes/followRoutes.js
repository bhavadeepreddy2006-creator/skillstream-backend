import express from "express";
import {
    followUser,
    unfollowUser,
    getFollowStatus,
    getMyFollowing,
    getFollowers,
    getTopContributors,
} from "../controllers/followController.js";

import {
    protect,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Follow Routes
|--------------------------------------------------------------------------
*/

// Get the logged-in user's following list.
router.get(
    "/following",
    protect,
    getMyFollowing
);

// Get top contributors ranked by followers.
router.get(
    "/top-contributors",
    protect,
    getTopContributors
);

// Get follow status and follower statistics.
router.get(
    "/status/:userId",
    protect,
    getFollowStatus
);

// Get followers of a user.
router.get(
    "/followers/:userId",
    protect,
    getFollowers
);

// Follow a user.
router.post(
    "/:userId",
    protect,
    followUser
);

// Unfollow a user.
router.delete(
    "/:userId",
    protect,
    unfollowUser
);

export default router;