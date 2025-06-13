import express from "express";
import {
  getMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
} from "../controllers/movie.js";

const router = express.Router();

router.get("/", getMovies);
router.post("/", createMovie);
router.put("/:id", updateMovie);
router.delete("/:id", deleteMovie);
router.get("/:id", getMovieById);



export default router;
