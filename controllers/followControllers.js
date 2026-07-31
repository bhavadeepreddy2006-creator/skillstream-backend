import mongoose from "mongoose";
import Follow from "../models/follow.js";
import User from "../models/user.js";
import { createNotification } from "../utils/createNotification.js";
import { handleControllerError } from "../utils/handleControllerError.js";

/* ============================================================
   Follow User
============================================================ */

export async function followUser(req, res) {
    try {
        const targetId = req.params.userId;

        if (!mongoose.Types.ObjectId.isValid(targetId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID",
            });
        }

        if (targetId === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: "You cannot follow yourself.",
            });
        }

        const targetUser = await User.findById(targetId);

        if (!targetUser) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        const alreadyFollowing = await Follow.findOne({
            follower: req.user._id,
            following: targetId,
        });

        if (alreadyFollowing) {
            return res.status(200).json({
                success: true,
                following: true,
                alreadyFollowing: true,
                userId: targetId,
            });
        }

        await Follow.create({
            follower: req.user._id,
            following: targetId,
        });

        if (targetId !== req.user._id.toString()) {
            await createNotification({
                recipient: targetId,
                sender: req.user._id,
                type: "follow",
                message: `${req.user.name} started following you.`,
            });
        }

        return res.status(201).json({
            success: true,
            following: true,
            userId: targetId,
            message: "User followed successfully.",
        });

    } catch (error) {
        handleControllerError(res, error, "Could not follow this user.");
    }
}

/* ============================================================
   Unfollow User
============================================================ */

export async function unfollowUser(req, res) {

    try {

        const targetId = req.params.userId;

        if (!mongoose.Types.ObjectId.isValid(targetId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID",
            });
        }

        const deleted = await Follow.findOneAndDelete({
            follower: req.user._id,
            following: targetId,
        });

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Follow relationship not found.",
            });
        }

        return res.status(200).json({
            success: true,
            following: false,
            userId: targetId,
            message: "User unfollowed successfully.",
        });

    } catch (error) {

        handleControllerError(res, error, "Could not unfollow this user.");

    }

}

/* ============================================================
   Get Follow Status
============================================================ */

export async function getFollowStatus(req, res) {

    try {

        const targetId = req.params.userId;

        if (!mongoose.Types.ObjectId.isValid(targetId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID",
            });
        }

        const [isFollowing, followersCount, followingCount] = await Promise.all([

            Follow.exists({
                follower: req.user._id,
                following: targetId,
            }),

            Follow.countDocuments({
                following: targetId,
            }),

            Follow.countDocuments({
                follower: targetId,
            }),

        ]);

        return res.status(200).json({

            success: true,

            isFollowing: Boolean(isFollowing),

            followersCount,

            followingCount,

        });

    } catch (error) {

        handleControllerError(res, error, "Could not load follow status.");

    }

}

/* ============================================================
   Get My Following
============================================================ */

export async function getMyFollowing(req, res) {

    try {

        const follows = await Follow.find({

            follower: req.user._id,

        })
            .select("following -_id")
            .lean();

        return res.status(200).json({

            success: true,

            followingIds: follows.map(item => item.following.toString()),

        });

    } catch (error) {

        handleControllerError(res, error, "Could not load your following list.");

    }

}

/* ============================================================
   Get Followers
============================================================ */

export async function getFollowers(req, res) {

    try {

        const targetId = req.params.userId;

        if (!mongoose.Types.ObjectId.isValid(targetId)) {

            return res.status(400).json({

                success: false,

                message: "Invalid user ID",

            });

        }

        const page = Math.max(

            1,

            parseInt(req.query.page, 10) || 1

        );

        const limit = Math.min(

            50,

            Math.max(1, parseInt(req.query.limit, 10) || 20)

        );

        const total = await Follow.countDocuments({

            following: targetId,

        });

        const follows = await Follow.find({

            following: targetId,

        })
            .populate("follower", "name role profilePhoto")
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        const followers = follows
            .filter(item => item.follower)
            .map(item => item.follower);

        return res.status(200).json({

            success: true,

            followers,

            pagination: {

                page,

                limit,

                total,

                totalPages: Math.ceil(total / limit),

            }

        });

    } catch (error) {

        handleControllerError(res, error, "Could not load followers.");

    }

}

/* ============================================================
   Top Contributors
============================================================ */

export async function getTopContributors(req, res) {

    try {

        const limit = Math.min(

            50,

            Math.max(

                1,

                parseInt(req.query.limit, 10) || 10

            )

        );

        const ranked = await Follow.aggregate([

            {

                $group: {

                    _id: "$following",

                    followersCount: {

                        $sum: 1,

                    }

                }

            },

            {

                $sort: {

                    followersCount: -1,

                }

            },

            {

                $limit: limit,

            }

        ]);

        const userIds = ranked.map(item => item._id);

        const users = await User.find({

            _id: {

                $in: userIds,

            }

        })
            .select("name role profilePhoto")
            .lean();

        const userMap = new Map(

            users.map(user => [

                user._id.toString(),

                user

            ])

        );

        const contributors = ranked
            .map(item => ({

                user: userMap.get(item._id.toString()),

                followersCount: item.followersCount,

            }))
            .filter(item => item.user);

        return res.status(200).json({

            success: true,

            contributors,

        });

    } catch (error) {

        handleControllerError(res, error, "Could not load top contributors.");

    }

}