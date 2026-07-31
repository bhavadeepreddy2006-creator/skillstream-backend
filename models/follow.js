import mongoose from "mongoose";

const followSchema = new mongoose.Schema(
    {
        follower: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        following: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Prevent duplicate follow relationships.
followSchema.index(
    {
        follower: 1,
        following: 1,
    },
    {
        unique: true,
    }
);

// Optimize queries for creator followers.
followSchema.index({
    following: 1,
});

// Optimize queries for a user's following list.
followSchema.index({
    follower: 1,
});

// Prevent users from following themselves.
followSchema.pre("validate", function (next) {
    if (this.follower.equals(this.following)) {
        return next(new Error("Users cannot follow themselves."));
    }

    next();
});

const Follow = mongoose.model("Follow", followSchema);

export default Follow;