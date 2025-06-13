import User from "../models/user.js";
import Cast from "../models/cast.js";

// Add cast to favorites
export const addToFavorites = async (req, res) => {
  try {
    const { castId } = req.params;
    const userId = req.user.id;

    // Check if cast exists
    const cast = await Cast.findById(castId);
    if (!cast) {
      return res.status(404).json({ error: "Cast not found" });
    }

    // Add to favorites if not already there
    const user = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { favoriteCasts: castId } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "Cast added to favorites", isFavorite: true });
  } catch (err) {
    console.error("Error adding to favorites:", err);
    res.status(500).json({ error: "Failed to add to favorites" });
  }
};

// Remove cast from favorites
export const removeFromFavorites = async (req, res) => {
  try {
    const { castId } = req.params;
    const userId = req.user.id;

    // Remove from favorites
    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { favoriteCasts: castId } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "Cast removed from favorites", isFavorite: false });
  } catch (err) {
    console.error("Error removing from favorites:", err);
    res.status(500).json({ error: "Failed to remove from favorites" });
  }
};

// Get user's favorite casts
export const getFavoriteCasts = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).render("pages/login", {
        error: "Please login to view your favorites"
      });
    }

    const userId = req.user.id;
    const user = await User.findById(userId).populate({
      path: 'favoriteCasts',
      populate: {
        path: 'movies',
        select: 'title posterURL'
      }
    });

    if (!user) {
      return res.status(404).render("pages/404", {
        error: "User not found"
      });
    }

    // Initialize favoriteCasts as empty array if it doesn't exist
    const favoriteCasts = user.favoriteCasts || [];

    res.render("pages/favorites", {
      favoriteCasts,
      user: req.user,
      title: "My Favorite Casts"
    });
  } catch (err) {
    console.error("Error fetching favorite casts:", err);
    res.status(500).render("pages/error", {
      error: "Failed to load favorites",
      user: req.user
    });
  }
}; 