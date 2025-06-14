import express from "express";
import auth from "../middleware/auth.js";
import { addToWatchlist, getWatchlist,deleteFromWatchlist } from "../controllers/mylist.js";

const router = express.Router();

router.post("/:movieId", auth(), addToWatchlist); 
router.get("/", auth(), getWatchlist);
router.delete('/:movieId', auth(), deleteFromWatchlist);


export default router;
