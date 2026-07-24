import CreatorProfile from "../models/creatorProfile.js";
import fs from "fs";
import path from "path";
import { handleControllerError } from "../utils/handleControllerError.js";

const EDITABLE_FIELDS = [
    "headline",
    "bio",
    "category",
    "industryRole",
    "experience",
    "skills",
    "technologies",
    "projects",
    "achievements",
    "certifications",
    "links"
];

function normalizeArray(value) {
    if (Array.isArray(value)) {
        return value.map(item => item.toString().trim()).filter(Boolean);
    }

    if (typeof value === "string") {
        return value
            .split(",")
            .map(item => item.trim())
            .filter(Boolean);
    }

    return [];
}

function pickEditableFields(body) {

    const updates = {};

    for (const field of EDITABLE_FIELDS) {

        if (body[field] !== undefined) {
            updates[field] = body[field];
        }

    }

    if (updates.skills) {
        updates.skills = normalizeArray(updates.skills);
    }

    if (updates.technologies) {
        updates.technologies = normalizeArray(updates.technologies);
    }

    if (updates.achievements) {
        updates.achievements = normalizeArray(updates.achievements);
    }

    return updates;
}

export async function getMyProfile(req, res) {

    try {

        let profile = await CreatorProfile.findOne({
            user: req.user._id
        }).populate("user", "name email role");

        if (!profile) {

            profile = await CreatorProfile.create({
                user: req.user._id
            });

            profile = await CreatorProfile.findById(profile._id)
                .populate("user", "name email role");
        }

        return res.status(200).json({
            success: true,
            data: profile
        });

    } catch (error) {

        handleControllerError(
            res,
            error,
            "Could not load your profile."
        );

    }

}

export async function getProfileByUserId(req, res) {

    try {

        const profile = await CreatorProfile.findOne({
            user: req.params.userId
        }).populate("user", "name email role");

        if (!profile) {

            return res.status(404).json({
                success: false,
                message: "Profile not found."
            });

        }

        return res.status(200).json({
            success: true,
            data: profile
        });

    } catch (error) {

        handleControllerError(
            res,
            error,
            "Could not load this profile."
        );

    }

}

export async function updateMyProfile(req, res) {

    try {

        const updates = pickEditableFields(req.body);

        if (updates.bio && updates.bio.length > 1000) {

            return res.status(400).json({
                success: false,
                message: "Bio exceeds maximum length."
            });

        }

        const profile = await CreatorProfile.findOne({
            user: req.user._id
        });

        if (!profile) {

            return res.status(404).json({
                success: false,
                message: "Profile not found."
            });

        }

        Object.assign(profile, updates);

        await profile.save();

        await profile.populate("user", "name email role");

        return res.status(200).json({

            success: true,

            message: "Profile updated successfully.",

            data: profile

        });

    } catch (error) {

        handleControllerError(
            res,
            error,
            "Could not update your profile."
        );

    }

}

async function replacePhoto(req, res, field) {

    try {

        if (!req.file) {

            return res.status(400).json({

                success: false,

                message: "No file uploaded."

            });

        }

        const profile = await CreatorProfile.findOne({
            user: req.user._id
        });

        if (!profile) {

            return res.status(404).json({

                success: false,

                message: "Profile not found."

            });

        }

        const newPath = "/" + req.file.path.replace(/\\/g, "/");

        const oldPath = profile[field];

        profile[field] = newPath;

        await profile.save();

        if (
            oldPath &&
            fs.existsSync(
                path.join(
                    process.cwd(),
                    oldPath.replace(/^\//, "")
                )
            )
        ) {

            fs.unlink(
                path.join(
                    process.cwd(),
                    oldPath.replace(/^\//, "")
                ),
                () => {}
            );

        }

        return res.status(200).json({

            success: true,

            message: "Photo updated successfully.",

            data: {

                [field]: newPath

            }

        });

    } catch (error) {

        handleControllerError(
            res,
            error,
            "Could not upload photo."
        );

    }

}

export async function uploadMyProfilePhoto(req, res) {
    return replacePhoto(req, res, "profilePhoto");
}

export async function uploadMyCoverPhoto(req, res) {
    return replacePhoto(req, res, "coverPhoto");
}