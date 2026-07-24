import Follow from "../models/follow.js";
import User from "../models/user.js";
import { createNotification } from "../utils/createNotification.js";
import { handleControllerError } from "../utils/handleControllerError.js";

export async function followUser(req, res) {
    try {
        const targetId = req.params.userId;

        if (targetId === req.user._id.toString()) {
            return res.status(400).json({ success: false, message: "You cannot follow yourself" });
        }

        const targetUser = await User.findById(targetId);
        if (!targetUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        try {
            await Follow.create({ follower: req.user._id, following: targetId });
            await createNotification({
                recipient: targetId,
                sender: req.user._id,
                type: "follow",
                message: `${req.user.name} started following you`,
            });
        } catch (error) {
            if (error.code !== 11000) throw error;
        }

        res.status(200).json({ success: true, message: "Now following this creator" });
    } catch (error) {
        handleControllerError(res, error, "Could not follow this creator.");
    }
}

export async function unfollowUser(req, res) {
    try {
        await Follow.deleteOne({ follower: req.user._id, following: req.params.userId });
        res.status(200).json({ success: true, message: "Unfollowed" });
    } catch (error) {
        handleControllerError(res, error, "Could not unfollow this creator.");
    }
}

export async function getFollowStatus(req, res) {
    try {
        const [isFollowing, followersCount, followingCount] = await Promise.all([
            Follow.exists({ follower: req.user._id, following: req.params.userId }),
            Follow.countDocuments({ following: req.params.userId }),
            Follow.countDocuments({ follower: req.params.userId }),
        ]);
        res.status(200).json({ success: true, isFollowing: Boolean(isFollowing), followersCount, followingCount });
    } catch (error) {
        handleControllerError(res, error, "Could not load follow status.");
    }
}

export async function getMyFollowing(req, res) {
    try {
        const follows = await Follow.find({ follower: req.user._id }).select("following");
        res.status(200).json({ success: true, followingIds: follows.map((f) => f.following) });
    } catch (error) {
        handleControllerError(res, error, "Could not load who you're following.");
    }
}

export async function getFollowers(req, res) {
    try {
        const follows = await Follow.find({ following: req.params.userId }).populate("follower", "name role");
        res.status(200).json({ success: true, followers: follows.map((f) => f.follower) });
    } catch (error) {
        handleControllerError(res, error, "Could not load followers.");
    }
}

export async function getTopContributors(req, res) {
    try {
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));

        const ranked = await Follow.aggregate([
            { $group: { _id: "$following", followersCount: { $sum: 1 } } },
            { $sort: { followersCount: -1 } },
            { $limit: limit },
        ]);

        const userIds = ranked.map((r) => r._id);
        const users = await User.find({ _id: { $in: userIds } }).select("name role");
        const userMap = new Map(users.map((u) => [u._id.toString(), u]));

        const contributors = ranked
            .map((r) => ({ user: userMap.get(r._id.toString()), followersCount: r.followersCount }))
            .filter((c) => c.user);

        res.status(200).json({ success: true, contributors });
    } catch (error) {
        handleControllerError(res, error, "Could not load top contributors.");
    }
}
