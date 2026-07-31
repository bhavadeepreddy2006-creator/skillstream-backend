import mongoose from "mongoose";
import Report from "../models/report.js";
import Post from "../models/post.js";
import { handleControllerError } from "../utils/handleControllerError.js";

/*
|--------------------------------------------------------------------------
| Create Report
|--------------------------------------------------------------------------
*/

export async function createReport(req, res) {
    try {
        const { reason } = req.body;

        if (!mongoose.Types.ObjectId.isValid(req.params.postId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid post ID",
            });
        }

        if (!reason || !reason.trim()) {
            return res.status(400).json({
                success: false,
                message: "A reason is required to submit a report.",
            });
        }

        const post = await Post.findById(req.params.postId);

        if (!post || post.status !== "published") {
            return res.status(404).json({
                success: false,
                message: "Post not found.",
            });
        }

        const existingReport = await Report.findOne({
            reporter: req.user._id,
            post: post._id,
        });

        if (existingReport) {
            return res.status(409).json({
                success: false,
                message: "You have already reported this post.",
            });
        }

        const report = await Report.create({
            reporter: req.user._id,
            post: post._id,
            reason: reason.trim(),
        });

        res.status(201).json({
            success: true,
            message: "Report submitted successfully. Our moderation team will review it shortly.",
            report,
        });

    } catch (error) {
        handleControllerError(
            res,
            error,
            "Could not submit this report."
        );
    }
}

/*
|--------------------------------------------------------------------------
| Get Reports (Admin)
|--------------------------------------------------------------------------
*/

export async function getReports(req, res) {
    try {

        const {
            page = 1,
            limit = 20,
            status = "pending",
        } = req.query;

        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

        const filter = {};

        if (status !== "all") {
            filter.status = status;
        }

        const [reports, total] = await Promise.all([

            Report.find(filter)
                .populate(
                    "reporter",
                    "name email profilePhoto"
                )
                .populate({
                    path: "post",
                    select: "title status thumbnail author",
                    populate: {
                        path: "author",
                        select: "name profilePhoto",
                    },
                })
                .sort({
                    createdAt: -1,
                })
                .skip((pageNum - 1) * limitNum)
                .limit(limitNum),

            Report.countDocuments(filter),

        ]);

        res.status(200).json({
            success: true,
            reports,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            },
        });

    } catch (error) {
        handleControllerError(
            res,
            error,
            "Could not load reports."
        );
    }
}

/*
|--------------------------------------------------------------------------
| Resolve Report (Admin)
|--------------------------------------------------------------------------
*/

export async function resolveReport(req, res) {
    try {

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid report ID",
            });
        }

        const { adminRemarks = "" } = req.body;

        const report = await Report.findByIdAndUpdate(
            req.params.id,
            {
                status: "resolved",
                resolvedAt: new Date(),
                adminRemarks: adminRemarks.trim(),
            },
            {
                new: true,
                runValidators: true,
            }
        )
            .populate("reporter", "name email")
            .populate({
                path: "post",
                select: "title",
            });

        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Report not found.",
            });
        }

        res.status(200).json({
            success: true,
            message: "Report resolved successfully.",
            report,
        });

    } catch (error) {
        handleControllerError(
            res,
            error,
            "Could not resolve this report."
        );
    }
}