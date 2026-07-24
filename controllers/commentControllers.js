import Comment from "../models/comment.js";
import Post from "../models/post.js";
import { createNotification } from "../utils/createNotification.js";
import { handleControllerError } from "../utils/handleControllerError.js";

export async function getCommentsForPost(req, res) {
    try {
        const comments = await Comment.find({ post: req.params.postId }).populate("author", "name").sort({ createdAt: -1 });
        res.status(200).json({ success: true, comments });
    } catch (error) {
        handleControllerError(res, error, "Could not load comments.");
    }
}

export async function addComment(req, res) {
    try {
        const { content } = req.body;
        if (!content || !content.trim()) {
            return res.status(400).json({ success: false, message: "Comment content is required" });
        }

        const post = await Post.findById(req.params.postId);
        if (!post || post.status !== "published") {
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        const comment = await Comment.create({ post: req.params.postId, author: req.user._id, content: content.trim() });
        await comment.populate("author", "name");

        await createNotification({
            recipient: post.author,
            sender: req.user._id,
            type: "comment",
            post: post._id,
            message: `${req.user.name} commented on your post "${post.title}"`,
        });

        res.status(201).json({ success: true, message: "Comment added successfully", comment });
    } catch (error) {
        handleControllerError(res, error, "Could not post this comment.");
    }
}

export async function deleteComment(req, res) {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ success: false, message: "Comment not found" });
        }

        const post = await Post.findById(comment.post);
        const isCommentAuthor = comment.author.toString() === req.user._id.toString();
        const isPostAuthor = post && post.author.toString() === req.user._id.toString();

        if (!isCommentAuthor && !isPostAuthor) {
            return res.status(403).json({ success: false, message: "You do not have permission to delete this comment" });
        }

        await comment.deleteOne();
        res.status(200).json({ success: true, message: "Comment deleted successfully" });
    } catch (error) {
        handleControllerError(res, error, "Could not delete this comment.");
    }
}
