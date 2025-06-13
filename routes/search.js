import express from "express";
import {
  searchHome,
  searchMovies,
  searchCasts,
  searchMyList
} from "../controllers/search.js";   

const router = express.Router();
// Search from Home (both movies & casts)
router.get("/search",searchHome);

// Movies search only
router.get("/movies/search", searchMovies);

// Casts search only
router.get("/casts/search", searchCasts);

// My List (watchlist) search
router.get("/mylist/search", searchMyList);

export default router;

