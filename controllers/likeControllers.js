import Like from "../models/like.js";
import Post from "../models/post.js";
import { createNotification } from "../utils/createNotification.js";
import { handleControllerError } from "../utils/handleControllerError.js";

export async function toggleLike(req, res) {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post || post.status !== "published") {
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        const existingLike = await Like.findOne({ user: req.user._id, post: post._id });

        if (existingLike) {
            await existingLike.deleteOne();
            post.likesCount = Math.max(0, post.likesCount - 1);
            await post.save();
            return res.status(200).json({ success: true, liked: false, likesCount: post.likesCount });
        }

        await Like.create({ user: req.user._id, post: post._id });
        post.likesCount += 1;
        await post.save();

        await createNotification({
            recipient: post.author,
            sender: req.user._id,
            type: "like",
            post: post._id,
            message: `${req.user.name} liked your post "${post.title}"`,
        });

        res.status(200).json({ success: true, liked: true, likesCount: post.likesCount });
    } catch (error) {
        handleControllerError(res, error, "Could not update like.");
    }
}

export async function getMyLikes(req, res) {
    try {
        const likes = await Like.find({ user: req.user._id }).select("post");
        res.status(200).json({ success: true, likedPostIds: likes.map((l) => l.post) });
    } catch (error) {
        handleControllerError(res, error, "Could not load your likes.");
    }
}
