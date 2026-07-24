import express from "express";
import { getUsers, getUserById, UpdateUser, deleteUser, updateUserRole } from "../controllers/userControllers.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// NOTE: getUsers is open to any authenticated user, not admin-only — the
// member-directory page (/userdata) relies on it. Revisit if a fully
// public/private visibility model gets built later.
router.get("/", protect, getUsers);
router.get("/:id", protect, getUserById);
router.put("/:id", protect, UpdateUser);
router.put("/:id/role", protect, authorize("admin"), updateUserRole);
router.delete("/:id", protect, deleteUser);

export default router;
