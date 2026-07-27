import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
    {
        post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
            required: true,
        },

        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        parentComment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment",
            default: null,
        },

        content: {
            type: String,
            required: true,
            trim: true,
            minlength: 1,
            maxlength: 1000,
        },

        isEdited: {
            type: Boolean,
            default: false,
        },

        isDeleted: {
            type: Boolean,
            default: false,
        },

        status: {
            type: String,
            enum: ["visible", "hidden"],
            default: "visible",
        },

        likesCount: {
            type: Number,
            default: 0,
        },

        reportsCount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

commentSchema.index({
    post: 1,
    createdAt: -1,
});

commentSchema.index({
    author: 1,
});

commentSchema.index({
    parentComment: 1,
});

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;