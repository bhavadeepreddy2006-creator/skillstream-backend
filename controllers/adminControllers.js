import User from "../models/user.js";
import Post from "../models/post.js";
import Comment from "../models/comment.js";
import Like from "../models/like.js";
import Follow from "../models/follow.js";
import Report from "../models/report.js";
import { handleControllerError } from "../utils/handleControllerError.js";

export async function getAdminOverview(req, res) {
    try {
        const [totalUsers, totalPublishedPosts, totalDraftPosts, totalComments, totalLikes, totalFollows, pendingReports] =
            await Promise.all([
                User.countDocuments(),
                Post.countDocuments({ status: "published" }),
                Post.countDocuments({ status: "draft" }),
                Comment.countDocuments(),
                Like.countDocuments(),
                Follow.countDocuments(),
                Report.countDocuments({ status: "pending" }),
            ]);

        res.status(200).json({
            success: true,
            overview: { totalUsers, totalPublishedPosts, totalDraftPosts, totalComments, totalLikes, totalFollows, pendingReports },
        });
    } catch (error) {
        handleControllerError(res, error, "Could not load admin overview.");
    }
}
