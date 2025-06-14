import express from "express";
import { deleteUser, updateUser } from "../controllers/users.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Protected routes - admin only
router.delete("/:id", auth(["admin"]), deleteUser);
router.put("/:id", auth(["admin"]), updateUser);

export default router;