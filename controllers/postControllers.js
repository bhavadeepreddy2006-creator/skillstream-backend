import fs from "fs";
import path from "path";
import Post from "../models/post.js";
import Comment from "../models/comment.js";
import Follow from "../models/follow.js";
import Like from "../models/like.js";
import SavedPost from "../models/savedPost.js";
import Report from "../models/report.js";
import { handleControllerError } from "../utils/handleControllerError.js";

export async function getPosts(req, res) {
    try {
        const { page = 1, limit = 10, category, technology, tag, search, sort = "latest", filter } = req.query;

        const query = { status: "published" };
        if (category) query.category = category;
        if (technology) query.technologies = technology;
        if (tag) query.tags = tag;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ];
        }

        if (filter === "following") {
            const follows = await Follow.find({ follower: req.user._id }).select("following");
            query.author = { $in: follows.map((f) => f.following) };
        }

        const sortOption = sort === "trending" ? { likesCount: -1, createdAt: -1 } : { createdAt: -1 };
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));

        const [posts, total] = await Promise.all([
            Post.find(query).populate("author", "name role").sort(sortOption).skip((pageNum - 1) * limitNum).limit(limitNum),
            Post.countDocuments(query),
        ]);

        res.status(200).json({
            success: true,
            posts,
            pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
        });
    } catch (error) {
        handleControllerError(res, error, "Could not load the feed.");
    }
}

export async function getMyPosts(req, res) {
    try {
        const posts = await Post.find({ author: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, posts });
    } catch (error) {
        handleControllerError(res, error, "Could not load your posts.");
    }
}

export async function getAllPostsAdmin(req, res) {
    try {
        const { page = 1, limit = 20 } = req.query;
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

        const [posts, total] = await Promise.all([
            Post.find().populate("author", "name role").sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
            Post.countDocuments(),
        ]);

        res.status(200).json({
            success: true,
            posts,
            pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
        });
    } catch (error) {
        handleControllerError(res, error, "Could not load posts.");
    }
}

export async function getTrendingTechnologies(req, res) {
    try {
        const limit = Math.min(20, Math.max(1, parseInt(req.query.limit, 10) || 8));
        const results = await Post.aggregate([
            { $match: { status: "published" } },
            { $unwind: "$technologies" },
            { $group: { _id: "$technologies", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: limit },
        ]);
        res.status(200).json({ success: true, technologies: results.map((r) => ({ name: r._id, count: r.count })) });
    } catch (error) {
        handleControllerError(res, error, "Could not load trending technologies.");
    }
}

export async function getPostById(req, res) {
    try {
        const post = await Post.findById(req.params.id).populate("author", "name role");
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        const isOwner = req.user && post.author._id.toString() === req.user._id.toString();
        if (post.status === "draft" && !isOwner) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        if (post.status === "published") {
            post.views += 1;
            await post.save();
        }

        res.status(200).json({ success: true, post });
    } catch (error) {
        handleControllerError(res, error, "Could not load this post.");
    }
}

export async function createPost(req, res) {
    try {
        const { title, description, content, category, technologies, tags, difficulty, status } = req.body;

        if (!title || !content) {
            return res.status(400).json({ success: false, message: "Title and content are required" });
        }

        const post = await Post.create({
            author: req.user._id,
            title,
            description,
            content,
            category,
            technologies: technologies ? JSON.parse(technologies) : [],
            tags: tags ? JSON.parse(tags) : [],
            difficulty,
            status: status === "published" ? "published" : "draft",
            thumbnail: req.file ? `/${req.file.path.replace(/\\/g, "/")}` : "",
        });

        res.status(201).json({ success: true, message: "Post created successfully", post });
    } catch (error) {
        handleControllerError(res, error, "Could not create this post.");
    }
}

export async function updatePost(req, res) {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }
        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "You can only edit your own posts" });
        }

        const { title, description, content, category, technologies, tags, difficulty, status } = req.body;

        if (title !== undefined) post.title = title;
        if (description !== undefined) post.description = description;
        if (content !== undefined) post.content = content;
        if (category !== undefined) post.category = category;
        if (technologies !== undefined) post.technologies = JSON.parse(technologies);
        if (tags !== undefined) post.tags = JSON.parse(tags);
        if (difficulty !== undefined) post.difficulty = difficulty;
        if (status !== undefined) post.status = status;

        if (req.file) {
            const oldThumbnail = post.thumbnail;
            post.thumbnail = `/${req.file.path.replace(/\\/g, "/")}`;
            if (oldThumbnail) {
                fs.unlink(path.join(process.cwd(), oldThumbnail.replace(/^\//, "")), () => {});
            }
        }

        await post.save();
        res.status(200).json({ success: true, message: "Post updated successfully", post });
    } catch (error) {
        handleControllerError(res, error, "Could not update this post.");
    }
}

export async function deletePost(req, res) {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }
        if (post.author.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return res.status(403).json({ success: false, message: "You can only delete your own posts" });
        }

        await Promise.all([
            Comment.deleteMany({ post: post._id }),
            Like.deleteMany({ post: post._id }),
            SavedPost.deleteMany({ post: post._id }),
            Report.deleteMany({ post: post._id }),
        ]);

        if (post.thumbnail) {
            fs.unlink(path.join(process.cwd(), post.thumbnail.replace(/^\//, "")), () => {});
        }

        await post.deleteOne();
        res.status(200).json({ success: true, message: "Post deleted successfully" });
    } catch (error) {
        handleControllerError(res, error, "Could not delete this post.");
    }
}
