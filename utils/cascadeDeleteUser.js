import fs from "fs";
import path from "path";
import User from "../models/user.js";
import CreatorProfile from "../models/creatorProfile.js";
import Post from "../models/post.js";
import Comment from "../models/comment.js";
import Like from "../models/like.js";
import SavedPost from "../models/savedPost.js";
import Follow from "../models/follow.js";
import Notification from "../models/notification.js";
import Report from "../models/report.js";

// Permanently deletes a user and everything that references them — used
// by both self-service deletion (/auth/me) and admin/self deletion
// (/user/:id) so there's exactly one place this logic lives.
export async function cascadeDeleteUser(userId) {
    const [profile, myPosts] = await Promise.all([
        CreatorProfile.findOne({ user: userId }),
        Post.find({ author: userId }).select("_id thumbnail"),
    ]);

    const myPostIds = myPosts.map((p) => p._id);

    await Promise.all([
        Comment.deleteMany({ post: { $in: myPostIds } }),
        Like.deleteMany({ post: { $in: myPostIds } }),
        SavedPost.deleteMany({ post: { $in: myPostIds } }),
        Comment.deleteMany({ author: userId }),
        Like.deleteMany({ user: userId }),
        SavedPost.deleteMany({ user: userId }),
        Follow.deleteMany({ $or: [{ follower: userId }, { following: userId }] }),
        Notification.deleteMany({ $or: [{ recipient: userId }, { sender: userId }] }),
        Report.deleteMany({ $or: [{ reporter: userId }, { post: { $in: myPostIds } }] }),
    ]);

    await Post.deleteMany({ author: userId });

    myPosts.forEach((post) => {
        if (post.thumbnail) {
            fs.unlink(path.join(process.cwd(), post.thumbnail.replace(/^\//, "")), () => {});
        }
    });

    if (profile) {
        if (profile.profilePhoto) {
            fs.unlink(path.join(process.cwd(), profile.profilePhoto.replace(/^\//, "")), () => {});
        }
        if (profile.coverPhoto) {
            fs.unlink(path.join(process.cwd(), profile.coverPhoto.replace(/^\//, "")), () => {});
        }
        await profile.deleteOne();
    }

    await User.findByIdAndDelete(userId);
}
