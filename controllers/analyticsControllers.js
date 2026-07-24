import Post from "../models/post.js";
import Comment from "../models/comment.js";
import Like from "../models/like.js";
import Follow from "../models/follow.js";
import { handleControllerError } from "../utils/handleControllerError.js";

const GROWTH_WINDOW_DAYS = 30;

function fillGrowthSeries(aggregateResults) {
    const countsByDate = new Map(aggregateResults.map((r) => [r._id, r.count]));
    const series = [];
    for (let i = GROWTH_WINDOW_DAYS - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const key = date.toISOString().slice(0, 10);
        series.push({ date: key, count: countsByDate.get(key) || 0 });
    }
    return series;
}

function dailyGrowthPipeline(matchStage) {
    const windowStart = new Date();
    windowStart.setDate(windowStart.getDate() - GROWTH_WINDOW_DAYS);
    return [
        { $match: { ...matchStage, createdAt: { $gte: windowStart } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
    ];
}

export async function getMyAnalytics(req, res) {
    try {
        const userId = req.user._id;
        const myPosts = await Post.find({ author: userId }).select("title status views likesCount createdAt");
        const postIds = myPosts.map((p) => p._id);

        const [
            commentCountsByPost,
            totalCommentsOnMyPosts,
            followersCount,
            followingCount,
            likeGrowthRaw,
            commentGrowthRaw,
            followerGrowthRaw,
        ] = await Promise.all([
            Comment.aggregate([{ $match: { post: { $in: postIds } } }, { $group: { _id: "$post", count: { $sum: 1 } } }]),
            Comment.countDocuments({ post: { $in: postIds } }),
            Follow.countDocuments({ following: userId }),
            Follow.countDocuments({ follower: userId }),
            Like.aggregate(dailyGrowthPipeline({ post: { $in: postIds } })),
            Comment.aggregate(dailyGrowthPipeline({ post: { $in: postIds } })),
            Follow.aggregate(dailyGrowthPipeline({ following: userId })),
        ]);

        const commentCountMap = new Map(commentCountsByPost.map((c) => [c._id.toString(), c.count]));

        const totals = myPosts.reduce(
            (acc, post) => {
                acc.totalViews += post.views;
                acc.totalLikes += post.likesCount;
                if (post.status === "published") acc.publishedPosts += 1;
                else acc.draftPosts += 1;
                return acc;
            },
            { totalViews: 0, totalLikes: 0, publishedPosts: 0, draftPosts: 0 }
        );

        const postsBreakdown = myPosts
            .map((post) => ({
                id: post._id,
                title: post.title,
                status: post.status,
                views: post.views,
                likesCount: post.likesCount,
                commentsCount: commentCountMap.get(post._id.toString()) || 0,
                createdAt: post.createdAt,
            }))
            .sort((a, b) => b.views - a.views);

        res.status(200).json({
            success: true,
            totals: {
                totalPosts: myPosts.length,
                publishedPosts: totals.publishedPosts,
                draftPosts: totals.draftPosts,
                totalViews: totals.totalViews,
                totalLikes: totals.totalLikes,
                totalComments: totalCommentsOnMyPosts,
                followersCount,
                followingCount,
            },
            postsBreakdown,
            growth: {
                likes: fillGrowthSeries(likeGrowthRaw),
                comments: fillGrowthSeries(commentGrowthRaw),
                followers: fillGrowthSeries(followerGrowthRaw),
            },
        });
    } catch (error) {
        handleControllerError(res, error, "Could not load analytics.");
    }
}
