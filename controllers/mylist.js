import User from "../models/user.js";
import Movie from "../models/movie.js";

export const addToWatchlist = async (req, res) => {
  const { movieId } = req.params;
  const userId = req.user?.id; // <-- FIXED: use id, not _id

  console.log("Movie ID:", movieId);
  console.log("User ID:", userId);

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ message: "User not found or not authenticated." });
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
    const user = await User.findById(req.user.id).populate("watchlist"); // FIX: use id not _id
    res.render("pages/mylist", { user });
  } catch (err) {
    res.status(500).send("Error loading your list.");
  }
};

export const deleteFromWatchlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const movieId = req.params.movieId;

    await User.findByIdAndUpdate(userId, {
      $pull: { watchlist: movieId }
    });

    res.sendStatus(200);
  } catch (error) {
    console.error('Error removing movie from watchlist:', error);
    res.sendStatus(500);
  }
};