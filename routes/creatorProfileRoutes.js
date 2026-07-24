import express from "express";
import {
    getMyProfile,
    getProfileByUserId,
    updateMyProfile,
    uploadMyProfilePhoto,
    uploadMyCoverPhoto,
} from "../controllers/creatorProfileControllers.js";
import { protect } from "../middleware/authMiddleware.js";
import { uploadProfilePhoto, uploadCoverPhoto } from "../middleware/upload.js";

const router = express.Router();

router.get("/me", protect, getMyProfile);
router.put("/me", protect, updateMyProfile);
router.post("/me/profile-photo", protect, uploadProfilePhoto.single("photo"), uploadMyProfilePhoto);
router.post("/me/cover-photo", protect, uploadCoverPhoto.single("photo"), uploadMyCoverPhoto);
router.get("/:userId", protect, getProfileByUserId); // must come after "/me" routes

export default router;
