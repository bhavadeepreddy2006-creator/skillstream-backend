import mongoose from "mongoose";

const savedPostSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Prevent duplicate saves.
savedPostSchema.index(
    {
        user: 1,
        post: 1,
    },
    {
        unique: true,
    }
);

// Optimize lookups by post.
savedPostSchema.index({
    post: 1,
});

const SavedPost = mongoose.model(
    "SavedPost",
    savedPostSchema
);

export default SavedPost;