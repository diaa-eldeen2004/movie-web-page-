import express from "express";
import auth from "../middleware/auth.js";
import {
  addComment,
  getMovieComments,
  getAllComments,
  deleteComment,
  deleteuserComment
} from "../controllers/comment.js";

const router = express.Router();

router.post("/:movieId", auth(["user", "admin"]), addComment);
router.get("/movie/:movieId", getMovieComments);
router.get("/", auth(["admin"]), getAllComments);
router.delete("/admin/:id", auth(["admin"]), deleteComment);
router.delete('/:commentId', auth(), deleteuserComment);
export default router;
