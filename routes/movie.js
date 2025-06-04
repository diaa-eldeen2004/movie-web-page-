import express from "express";
import MovieModel from "../models/movie.js";

import {
  createMovie,
  updateMovie,
  deleteMovie,
  getMovieById,
} from "../controllers/movie.js";

const router = express.Router();

router.post("/addmovies", createMovie);
router.put("/:id", updateMovie);
router.delete("/:id", deleteMovie);
router.get("/:id", getMovieById);

export default router;
