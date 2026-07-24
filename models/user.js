import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Auth-only fields — identity, credentials, role. Bio, skills, portfolio
// links, followers, etc. belong to CreatorProfile, not here.
const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true, lowercase: true, unique: true },
        password: { type: String, required: true, minlength: 8, select: false },
        role: { type: String, enum: ["learner", "creator", "admin"], default: "learner" },
    },
    { timestamps: true }
);

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
