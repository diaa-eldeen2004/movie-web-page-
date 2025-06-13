import Movie from "../models/movie.js";
import Cast from "../models/cast.js";
import User from "../models/user.js";

export const searchMovies = async (req, res) => {
  const query = req.query.q || "";
  const regex = new RegExp(query, "i");
  const movies = await Movie.find({ title: regex });
  res.render("pages/search-movie", { movies, query });
};

export const searchCasts = async (req, res) => {
  const query = req.query.q || "";
  const regex = new RegExp(query, "i");
  const casts = await Cast.find({ name: regex });
  res.render("pages/search-cast", { casts, query });
};

export const searchHome = async (req, res) => {
  const query = req.query.q || "";
  const regex = new RegExp(query, "i");
  const [movies, casts] = await Promise.all([
    Movie.find({ title: regex }),
    Cast.find({ name: regex }),
  ]);
  res.render("pages/search-home", { movies, casts, query });
};

export const searchMyList = async (req, res) => {
  try {
    const query = req.query.q || "";
    const regex = new RegExp(query, "i");
    // Assume user is authenticated and user ID is in req.user._id
    const userId = req.user?._id || req.session?.user?._id;
    if (!userId) {
      return res.status(401).send("Unauthorized");
    }
    const user = await User.findById(userId).populate("watchlist");
    if (!user) {
      return res.status(404).send("User not found");
    }
    // Filter movies in watchlist by title
    const movies = user.watchlist.filter((movie) => regex.test(movie.title));
    res.render("pages/search-mylist", { movies, query });
  } catch (err) {
    res.status(500).send("Server error");
  }
};