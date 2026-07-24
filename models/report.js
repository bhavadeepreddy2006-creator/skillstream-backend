import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
    {
        post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
        reporter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        reason: { type: String, required: true, trim: true, maxlength: 500 },
        status: { type: String, enum: ["pending", "resolved"], default: "pending" },
    },
    { timestamps: true }
);

reportSchema.index({ status: 1, createdAt: -1 });

const Report = mongoose.model("Report", reportSchema);
export default Report;
