import User from "../models/user.js";
import Post from "../models/post.js";
import Comment from "../models/comment.js";
import Like from "../models/like.js";
import Follow from "../models/follow.js";
import Report from "../models/report.js";
import { handleControllerError } from "../utils/handleControllerError.js";

export async function getAdminOverview(req, res) {
    try {

        const [
            totalUsers,
            totalCreators,
            totalLearners,
            totalAdmins,
            totalPublishedPosts,
            totalDraftPosts,
            totalComments,
            totalLikes,
            totalFollows,
            pendingReports,
            resolvedReports,
        ] = await Promise.all([

            User.countDocuments(),

            User.countDocuments({
                role: "creator",
            }),

            User.countDocuments({
                role: "learner",
            }),

            User.countDocuments({
                role: "admin",
            }),

            Post.countDocuments({
                status: "published",
            }),

            Post.countDocuments({
                status: "draft",
            }),

            Comment.countDocuments(),

            Like.countDocuments(),

            Follow.countDocuments(),

            Report.countDocuments({
                status: "pending",
            }),

            Report.countDocuments({
                status: "resolved",
            }),

        ]);

        const recentUsers = await User.find()
            .select("name email role createdAt")
            .sort({
                createdAt: -1,
            })
            .limit(5);

        const recentPosts = await Post.find()
            .populate("author", "name")
            .sort({
                createdAt: -1,
            })
            .limit(5);

        const monthlyPosts = await Post.aggregate([
            {
                $group: {
                    _id: {
                        year: {
                            $year: "$createdAt",
                        },
                        month: {
                            $month: "$createdAt",
                        },
                    },
                    count: {
                        $sum: 1,
                    },
                },
            },
            {
                $sort: {
                    "_id.year": 1,
                    "_id.month": 1,
                },
            },
        ]);

        res.status(200).json({

            success: true,

            overview: {

                totalUsers,

                totalCreators,

                totalLearners,

                totalAdmins,

                totalPublishedPosts,

                totalDraftPosts,

                totalComments,

                totalLikes,

                totalFollows,

            },

            reports: {

                pendingReports,

                resolvedReports,

            },

            recentUsers,

            recentPosts,

            analytics: {

                monthlyPosts,

            },

        });

    } catch (error) {

        handleControllerError(
            res,
            error,
            "Could not load admin overview."
        );

    }
}