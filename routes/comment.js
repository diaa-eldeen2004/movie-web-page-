import express from "express";
import auth from "../middleware/auth.js";
import {
  addComment,
  getMovieComments,
  getAllComments,
  deleteComment
} from "../controllers/comment.js";

const router = express.Router();

router.post("/:movieId", auth(["user", "admin"]), addComment);
router.get("/movie/:movieId", getMovieComments);
router.get("/", auth(["admin"]), getAllComments);
router.delete("/:id", auth(["admin"]), deleteComment);

export default router;
