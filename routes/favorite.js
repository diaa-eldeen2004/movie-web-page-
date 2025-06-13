import express from "express";
import auth from "../middleware/auth.js";
import {
  addToFavorites,
  removeFromFavorites,
  getFavoriteCasts
} from "../controllers/favorite.js";

const router = express.Router();

// Get favorite casts page
router.get("/", auth(), getFavoriteCasts);

// Add cast to favorites
router.post("/add/:castId", auth(), addToFavorites);

// Remove cast from favorites
router.delete("/remove/:castId", auth(), removeFromFavorites);

export default router; 