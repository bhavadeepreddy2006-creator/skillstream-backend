import mongoose from "mongoose";

const likeSchema = new mongoose.Schema(
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

// Prevent duplicate likes by the same user on the same post.
likeSchema.index(
    {
        user: 1,
        post: 1,
    },
    {
        unique: true,
    }
);

// Optimize queries for post likes.
likeSchema.index({
    post: 1,
});

// Optimize queries for user liked posts.
likeSchema.index({
    user: 1,
});

const Like = mongoose.model("Like", likeSchema);

export default Like;