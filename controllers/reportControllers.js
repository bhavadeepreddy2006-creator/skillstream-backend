import Report from "../models/report.js";
import Post from "../models/post.js";
import { handleControllerError } from "../utils/handleControllerError.js";

export async function createReport(req, res) {
    try {
        const { reason } = req.body;
        if (!reason || !reason.trim()) {
            return res.status(400).json({ success: false, message: "A reason is required to submit a report" });
        }

        const post = await Post.findById(req.params.postId);
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        const report = await Report.create({ post: post._id, reporter: req.user._id, reason: reason.trim() });
        res.status(201).json({ success: true, message: "Report submitted. Our team will review it shortly.", report });
    } catch (error) {
        handleControllerError(res, error, "Could not submit this report.");
    }
}

export async function getReports(req, res) {
    try {
        const { status = "pending" } = req.query;
        const reports = await Report.find({ status })
            .populate("reporter", "name")
            .populate({ path: "post", select: "title author status", populate: { path: "author", select: "name" } })
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, reports });
    } catch (error) {
        handleControllerError(res, error, "Could not load reports.");
    }
}

export async function resolveReport(req, res) {
    try {
        const report = await Report.findByIdAndUpdate(req.params.id, { status: "resolved" }, { new: true });
        if (!report) {
            return res.status(404).json({ success: false, message: "Report not found" });
        }
        res.status(200).json({ success: true, message: "Report marked as resolved", report });
    } catch (error) {
        handleControllerError(res, error, "Could not update this report.");
    }
}
