import mongoose from "mongoose";
import Like from "../models/like.js";
import Post from "../models/post.js";
import { createNotification } from "../utils/createNotification.js";
import { handleControllerError } from "../utils/handleControllerError.js";

export async function toggleLike(req, res) {
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

        const existingLike = await Like.findOne({
            user: req.user._id,
            post: post._id,
        });

        if (existingLike) {
            await existingLike.deleteOne();

            const updatedPost = await Post.findByIdAndUpdate(
                post._id,
                {
                    $inc: {
                        likesCount: -1,
                    },
                },
                {
                    new: true,
                }
            );

            return res.status(200).json({
                success: true,
                liked: false,
                postId: post._id,
                likesCount: updatedPost.likesCount,
            });
        }

        await Like.create({
            user: req.user._id,
            post: post._id,
        });

        const updatedPost = await Post.findByIdAndUpdate(
            post._id,
            {
                $inc: {
                    likesCount: 1,
                },
            },
            {
                new: true,
            }
        );

        if (post.author.toString() !== req.user._id.toString()) {
            await createNotification({
                recipient: post.author,
                sender: req.user._id,
                type: "like",
                post: post._id,
                message: `${req.user.name} liked your post.`,
            });
        }

        res.status(200).json({
            success: true,
            liked: true,
            postId: post._id,
            likesCount: updatedPost.likesCount,
        });
    } catch (error) {
        handleControllerError(res, error, "Could not update like.");
    }
}

export async function getMyLikes(req, res) {
    try {
        const likes = await Like.find({
            user: req.user._id,
        })
            .select("post -_id")
            .lean();

        res.status(200).json({
            success: true,
            likedPostIds: likes.map((like) => like.post.toString()),
        });
    } catch (error) {
        handleControllerError(res, error, "Could not load your likes.");
    }
}