import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
    {
        author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        title: { type: String, required: true, trim: true, maxlength: 150 },
        description: { type: String, trim: true, maxlength: 300 },
        content: { type: String, required: true },
        category: { type: String, trim: true, default: "" },
        technologies: { type: [String], default: [] },
        tags: { type: [String], default: [] },
        difficulty: { type: String, enum: ["Beginner", "Intermediate", "Advanced"], default: "Beginner" },
        thumbnail: { type: String, default: "" },
        status: { type: String, enum: ["draft", "published"], default: "draft" },
        views: { type: Number, default: 0 },
        likesCount: { type: Number, default: 0 },
    },
    { timestamps: true }
);

postSchema.index({ status: 1, createdAt: -1 });
postSchema.index({ status: 1, likesCount: -1 });
postSchema.index({ author: 1 });

const Post = mongoose.model("Post", postSchema);
export default Post;
