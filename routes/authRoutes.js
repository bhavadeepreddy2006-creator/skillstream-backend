import express from "express";
import { register, login, getMe, changePassword, deleteMyAccount } from "../controllers/authControllers.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.put("/change-password", protect, changePassword);
router.delete("/me", protect, deleteMyAccount);

export default router;
