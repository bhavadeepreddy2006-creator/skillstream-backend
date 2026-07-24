import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        link: { type: String, trim: true },
    },
    { _id: false }
);

const creatorProfileSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
        profilePhoto: { type: String, default: "" },
        coverPhoto: { type: String, default: "" },
        bio: { type: String, trim: true, maxlength: 500, default: "" },
        category: { type: String, trim: true, default: "" },
        industryRole: { type: String, trim: true, default: "" },
        experience: { type: String, trim: true, default: "" },
        skills: { type: [String], default: [] },
        technologies: { type: [String], default: [] },
        projects: { type: [projectSchema], default: [] },
        achievements: { type: [String], default: [] },
        certifications: { type: [String], default: [] },
        links: {
            portfolio: { type: String, trim: true, default: "" },
            resume: { type: String, trim: true, default: "" },
            linkedin: { type: String, trim: true, default: "" },
            github: { type: String, trim: true, default: "" },
            website: { type: String, trim: true, default: "" },
        },
    },
    { timestamps: true }
);

const CreatorProfile = mongoose.model("CreatorProfile", creatorProfileSchema);
export default CreatorProfile;
