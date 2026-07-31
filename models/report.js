import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
    {
        post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
            required: true,
        },

        reporter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        reason: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500,
        },

        status: {
            type: String,
            enum: [
                "pending",
                "under_review",
                "resolved",
                "rejected",
            ],
            default: "pending",
        },

        adminRemarks: {
            type: String,
            trim: true,
            maxlength: 1000,
            default: "",
        },

        resolvedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// Admin moderation queue
reportSchema.index({
    status: 1,
    createdAt: -1,
});

// Prevent duplicate reports
reportSchema.index(
    {
        reporter: 1,
        post: 1,
    },
    {
        unique: true,
    }
);

// Lookup by reporter
reportSchema.index({
    reporter: 1,
});

// Lookup by post
reportSchema.index({
    post: 1,
});

const Report = mongoose.model("Report", reportSchema);

export default Report;