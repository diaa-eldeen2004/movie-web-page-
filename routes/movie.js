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

// Public routes
router.get("/", getMovies);
router.get("/recommend", getMovieRecommendations);
router.get("/:id", getMovieById);

// Protected routes - admin only
router.post("/", auth(["admin"]), createMovie);
router.put("/:id", auth(["admin"]), updateMovie);
router.delete("/:id", auth(["admin"]), deleteMovie);

export default router;
