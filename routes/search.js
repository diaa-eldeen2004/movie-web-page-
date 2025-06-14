import express from "express";
import {
  searchHome,
  searchMovies,
  searchCasts,
  searchMyList
} from "../controllers/search.js";   
import auth from "../middleware/auth.js";

const router = express.Router();

// Search from Home (both movies & casts)
router.get("/", searchHome);

// Movies search only
router.get("/movies", searchMovies);

// Casts search only
router.get("/casts", searchCasts);

// My List (watchlist) search - requires authentication
router.get("/mylist", auth(), searchMyList);

// Error handling middleware for search routes
router.use((err, req, res, next) => {
  console.error('Search error:', err);
  res.status(500).render('pages/error', {
    message: 'An error occurred while searching',
    user: req.user || null
  });
});

export default router;