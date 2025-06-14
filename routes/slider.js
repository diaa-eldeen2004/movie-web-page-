import express from "express";
import Movie from "../models/movie.js";
import auth from "../middleware/auth.js";

import {
  addMovieToSlider,
  removeMovieFromSlider,
  updateSliderPosition,
} from "../controllers/slider.js";

const router = express.Router();

// Add movie to slider
router.post("/add", auth(["admin"]), addMovieToSlider);

router.delete("/:movieId", auth(["admin"]), removeMovieFromSlider); // ✅ new route

router.put("/position", auth(["admin"]), updateSliderPosition);


export default router;
