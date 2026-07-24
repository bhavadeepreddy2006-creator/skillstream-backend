import express from "express";

import {
    getMyProfile,
    getProfileByUserId,
    updateMyProfile,
    uploadMyProfilePhoto,
    uploadMyCoverPhoto,
} from "../controllers/creatorProfileController.js";

import { protect } from "../middleware/authMiddleware.js";

import {
    uploadProfilePhoto,
    uploadCoverPhoto,
} from "../middleware/upload.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Creator Profile Routes
|--------------------------------------------------------------------------
*/

// Get Logged-in User Profile
router.get(
    "/me",
    protect,
    getMyProfile
);

// Update Logged-in User Profile
router.put(
    "/me",
    protect,
    updateMyProfile
);

// Upload Profile Photo
router.patch(
    "/me/profile-photo",
    protect,
    uploadProfilePhoto.single("photo"),
    uploadMyProfilePhoto
);

// Upload Cover Photo
router.patch(
    "/me/cover-photo",
    protect,
    uploadCoverPhoto.single("photo"),
    uploadMyCoverPhoto
);

// Public Creator Profile
router.get(
    "/:userId",
    getProfileByUserId
);

export default router;