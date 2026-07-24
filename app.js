import express from "express";
import cors from "cors";
import helmet from "helmet";
import multer from "multer";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import creatorProfileRoutes from "./routes/creatorProfileRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import followRoutes from "./routes/followRoutes.js";
import likeRoutes from "./routes/likeRoutes.js";
import savedPostRoutes from "./routes/savedPostRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

// This file exports the configured Express app WITHOUT starting a server
// or connecting to a database — that's deliberate, so Supertest can
// import `app` directly in tests without binding a port or requiring a
// real MongoDB connection to exist first. server.js is the thin wrapper
// that actually connects the DB and calls app.listen().
const app = express();

// Security middleware. crossOriginResourcePolicy is relaxed from helmet's
// default ("same-origin") because the frontend runs on a different
// origin/port and needs to load uploaded profile/cover/thumbnail images
// directly via <img src>.
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        credentials: true,
    })
);

app.use(express.json());

// Serves uploaded profile/cover/thumbnail photos (see middleware/upload.js).
app.use("/uploads", express.static("uploads"));

app.get("/health", (req, res) => {
    res.status(200).json({ success: true, message: "SkillStream API is running" });
});

app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/creator-profile", creatorProfileRoutes);
app.use("/post", postRoutes);
app.use("/comment", commentRoutes);
app.use("/follow", followRoutes);
app.use("/like", likeRoutes);
app.use("/savedpost", savedPostRoutes);
app.use("/notification", notificationRoutes);
app.use("/analytics", analyticsRoutes);
app.use("/report", reportRoutes);
app.use("/admin", adminRoutes);

// Multer throws its own error type (file too large, wrong extension, etc.)
// before it ever reaches a controller — catch it here and turn it into the
// same JSON error shape as everything else, instead of a generic 500.
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError || err?.message?.includes("image files are allowed")) {
        return res.status(400).json({ success: false, message: err.message });
    }
    next(err);
});

// Must be mounted after all routes: catches unmatched routes, then any
// error passed via next(err) — which, per this project's standard, should
// only ever reach here from something genuinely unexpected (a thrown
// error before a controller's own try/catch could run), never from normal
// controller error handling. Every controller catches and responds to its
// own errors directly; this is a last-resort safety net, not the primary
// error-handling path.
app.use(notFound);
app.use(errorHandler);

export default app;
