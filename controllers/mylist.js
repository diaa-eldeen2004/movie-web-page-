import User from "../models/user.js";
import Movie from "../models/movie.js";

export const addToWatchlist = async (req, res) => {
  const { movieId } = req.params;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ message: "User not found or not authenticated." });
    }

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ message: "Movie not found." });
    }

    if (!user.watchlist.includes(movieId)) {
      user.watchlist.push(movieId);
      await user.save();
      return res.status(200).json({ message: "Movie added to your watchlist." });
    }

    res.status(200).json({ message: "Movie is already in your watchlist." });
  } catch (error) {
    console.error("Error saving movie:", error);
    res.status(500).json({ error: "Failed to add movie to watchlist." });
  }
};

export const getWatchlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: "watchlist",
      select: "title posterURL _id genre releaseYear rating"
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.render("pages/mylist", { 
      user,
      watchlist: user.watchlist || []
    });
  } catch (err) {
    console.error("Error loading watchlist:", err);
    res.status(500).render("pages/error", { 
      message: "Error loading your watchlist. Please try again later." 
    });
  }
};

export const deleteFromWatchlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const movieId = req.params.movieId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.watchlist = user.watchlist.filter(id => id.toString() !== movieId);
    await user.save();

    res.status(200).json({ message: "Movie removed from watchlist" });
  } catch (error) {
    console.error('Error removing movie from watchlist:', error);
    res.status(500).json({ message: "Failed to remove movie from watchlist" });
  }
};