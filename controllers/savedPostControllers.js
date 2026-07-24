import SavedPost from "../models/savedPost.js";
import Post from "../models/post.js";
import { handleControllerError } from "../utils/handleControllerError.js";

export async function toggleSavePost(req, res) {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post || post.status !== "published") {
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        const existing = await SavedPost.findOne({ user: req.user._id, post: post._id });

        if (existing) {
            await existing.deleteOne();
            return res.status(200).json({ success: true, saved: false });
        }

        await SavedPost.create({ user: req.user._id, post: post._id });
        res.status(200).json({ success: true, saved: true });
    } catch (error) {
        handleControllerError(res, error, "Could not update saved status.");
    }
}

export async function getMySavedPosts(req, res) {
    try {
        const saved = await SavedPost.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .populate({ path: "post", populate: { path: "author", select: "name role" } });

        const posts = saved.filter((s) => s.post).map((s) => s.post);
        res.status(200).json({ success: true, posts });
    } catch (error) {
        handleControllerError(res, error, "Could not load your saved posts.");
    }
}

export async function getMySavedPostIds(req, res) {
    try {
        const saved = await SavedPost.find({ user: req.user._id }).select("post");
        res.status(200).json({ success: true, savedPostIds: saved.map((s) => s.post) });
    } catch (error) {
        handleControllerError(res, error, "Could not load your saved posts.");
    }
}
