import mongoose from "mongoose";
import SavedPost from "../models/savedPost.js";
import Post from "../models/post.js";
import { handleControllerError } from "../utils/handleControllerError.js";

export async function toggleSavePost(req, res) {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.postId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid post ID",
            });
        }

        const post = await Post.findById(req.params.postId);

        if (!post || post.status !== "published") {
            return res.status(404).json({
                success: false,
                message: "Post not found",
            });
        }

        const existing = await SavedPost.findOne({
            user: req.user._id,
            post: post._id,
        });

        if (existing) {
            await existing.deleteOne();

            return res.status(200).json({
                success: true,
                saved: false,
                postId: post._id,
            });
        }

        await SavedPost.create({
            user: req.user._id,
            post: post._id,
        });

        res.status(200).json({
            success: true,
            saved: true,
            postId: post._id,
        });
    } catch (error) {
        handleControllerError(res, error, "Could not update saved status.");
    }
}

export async function getMySavedPosts(req, res) {
    try {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(20, Math.max(1, parseInt(req.query.limit, 10) || 10));

        const total = await SavedPost.countDocuments({
            user: req.user._id,
        });

        const saved = await SavedPost.find({
            user: req.user._id,
        })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate({
                path: "post",
                populate: {
                    path: "author",
                    select: "name role",
                },
            })
            .lean();

        const posts = saved
            .filter(
                (item) =>
                    item.post &&
                    item.post.status === "published"
            )
            .map((item) => item.post);

        res.status(200).json({
            success: true,
            posts,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        handleControllerError(res, error, "Could not load your saved posts.");
    }
}

export async function getMySavedPostIds(req, res) {
    try {
        const saved = await SavedPost.find({
            user: req.user._id,
        })
            .select("post -_id")
            .lean();

        res.status(200).json({
            success: true,
            savedPostIds: saved.map((item) => item.post.toString()),
        });
    } catch (error) {
        handleControllerError(res, error, "Could not load your saved posts.");
    }
}