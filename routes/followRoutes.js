import express from "express";
import {
    followUser,
    unfollowUser,
    getFollowStatus,
    getMyFollowing,
    getFollowers,
    getTopContributors,
} from "../controllers/followControllers.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/following", protect, getMyFollowing);
router.get("/top-contributors", protect, getTopContributors);
router.get("/status/:userId", protect, getFollowStatus);
router.get("/followers/:userId", protect, getFollowers);
router.post("/:userId", protect, followUser);
router.delete("/:userId", protect, unfollowUser);

export default router;
