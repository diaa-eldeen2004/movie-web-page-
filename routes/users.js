import express from "express";
import { deleteUser ,updateUser } from "../controllers/users.js";

const router = express.Router();

router.delete("/:id", deleteUser);
router.put("/:id", updateUser);  
router.put("/:id", updateUser);  



export default router;