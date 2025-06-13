import express from "express";
import {
  getMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
  getMovieRecommendations
} from "../controllers/movie.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Get all movies
router.get("/", getMovies);

// Get movie recommendations
router.get("/recommend", getMovieRecommendations);

// Get movie by ID
router.get("/:id", getMovieById);

// Create a new movie (admin only)
router.post("/", auth, createMovie);

// Update a movie (admin only)
router.put("/:id", auth, updateMovie);

// Delete a movie (admin only)
router.delete("/:id", auth, deleteMovie);

export default router;
