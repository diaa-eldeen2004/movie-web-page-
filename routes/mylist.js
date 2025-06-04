import express from "express";
import auth from "../middleware/auth.js";
import { addToWatchlist, getWatchlist } from "../controllers/mylist.js";

const router = express.Router();

router.post("/:movieId", auth(), addToWatchlist); // no roles required
router.get("/", auth(), getWatchlist);

export default router;
