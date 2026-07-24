import CreatorProfile from "../models/creatorProfile.js";
import fs from "fs";
import path from "path";
import { handleControllerError } from "../utils/handleControllerError.js";

const EDITABLE_FIELDS = [
    "bio", "category", "industryRole", "experience", "skills",
    "technologies", "projects", "achievements", "certifications", "links",
];

function pickEditableFields(body) {
    const updates = {};
    for (const field of EDITABLE_FIELDS) {
        if (body[field] !== undefined) updates[field] = body[field];
    }
    return updates;
}

export async function getMyProfile(req, res) {
    try {
        const profile = await CreatorProfile.findOne({ user: req.user._id }).populate("user", "name email role");
        if (!profile) {
            return res.status(404).json({ success: false, message: "Profile not found" });
        }
        res.status(200).json({ success: true, profile });
    } catch (error) {
        handleControllerError(res, error, "Could not load your profile.");
    }
}

export async function getProfileByUserId(req, res) {
    try {
        const profile = await CreatorProfile.findOne({ user: req.params.userId }).populate("user", "name email role");
        if (!profile) {
            return res.status(404).json({ success: false, message: "Profile not found" });
        }
        res.status(200).json({ success: true, profile });
    } catch (error) {
        handleControllerError(res, error, "Could not load this profile.");
    }
}

export async function updateMyProfile(req, res) {
    try {
        const updates = pickEditableFields(req.body);
        const profile = await CreatorProfile.findOneAndUpdate({ user: req.user._id }, updates, {
            new: true,
            runValidators: true,
        }).populate("user", "name email role");

        if (!profile) {
            return res.status(404).json({ success: false, message: "Profile not found" });
        }
        res.status(200).json({ success: true, message: "Profile updated successfully", profile });
    } catch (error) {
        handleControllerError(res, error, "Could not update your profile.");
    }
}

async function replacePhoto(req, res, field) {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file was uploaded" });
        }

        const newPath = `/${req.file.path.replace(/\\/g, "/")}`;
        const existingProfile = await CreatorProfile.findOne({ user: req.user._id });
        if (!existingProfile) {
            return res.status(404).json({ success: false, message: "Profile not found" });
        }

        const oldPath = existingProfile[field];
        existingProfile[field] = newPath;
        await existingProfile.save();

        if (oldPath) {
            fs.unlink(path.join(process.cwd(), oldPath.replace(/^\//, "")), () => {});
        }

        res.status(200).json({ success: true, message: "Photo updated successfully", [field]: newPath });
    } catch (error) {
        handleControllerError(res, error, "Could not upload this photo.");
    }
}

export async function uploadMyProfilePhoto(req, res) {
    return replacePhoto(req, res, "profilePhoto");
}

export async function uploadMyCoverPhoto(req, res) {
    return replacePhoto(req, res, "coverPhoto");
}
