const express = require("express");
const router = express.Router();
const { 
  addToFavorites, 
  getFavorites, 
  removeFromFavorites 
} = require("../controllers/favorites");
const { auth } = require("../middleware/auth");

// Protected routes
router.post("/add/:id", auth(["admin", "user"]), addToFavorites);
router.get("/", auth(["admin", "user"]), getFavorites);
router.delete("/:id", auth(["admin", "user"]), removeFromFavorites);

module.exports = router; 