import Movie from "../models/movie.js";
import Cast from "../models/cast.js";
import User from "../models/user.js";

export const searchMovies = async (req, res, next) => {
  try {
    const query = req.query.q?.trim() || "";
    if (!query) {
      return res.render("pages/search-movie", {
        movies: [],
        query: "",
        user: req.user || null,
        message: "Please enter a search term"
      });
    }

    const regex = new RegExp(query, "i");
    const movies = await Movie.find({ title: regex });
    res.render("pages/search-movie", {
      movies,
      query,
      user: req.user || null
    });
  } catch (error) {
    next(error);
  }
};

export const searchCasts = async (req, res, next) => {
  try {
    const query = req.query.q?.trim() || "";
    if (!query) {
      return res.render("pages/search-cast", {
        casts: [],
        query: "",
        user: req.user || null,
        message: "Please enter a search term"
      });
    }

    const regex = new RegExp(query, "i");
    const casts = await Cast.find({ name: regex });
    res.render("pages/search-cast", {
      casts,
      query,
      user: req.user || null
    });
  } catch (error) {
    next(error);
  }
};

export const searchHome = async (req, res, next) => {
  try {
    const query = req.query.q?.trim() || "";
    if (!query) {
      return res.render("pages/search-home", {
        movies: [],
        casts: [],
        query: "",
        user: req.user || null,
        message: "Please enter a search term"
      });
    }

    const regex = new RegExp(query, "i");
    const [movies, casts] = await Promise.all([
      Movie.find({ title: regex }),
      Cast.find({ name: regex })
    ]);

    res.render("pages/search-home", {
      movies,
      casts,
      query,
      user: req.user || null
    });
  } catch (error) {
    next(error);
  }
};

export const searchMyList = async (req, res, next) => {
  try {
    const query = req.query.q?.trim() || "";
    if (!query) {
      return res.render("pages/search-mylist", {
        movies: [],
        query: "",
        user: req.user || null,
        message: "Please enter a search term"
      });
    }

    const regex = new RegExp(query, "i");
    const user = await User.findById(req.user._id).populate("watchlist");
    
    if (!user) {
      return res.status(404).render("pages/error", {
        message: "User not found",
        user: req.user || null
      });
    }

    const movies = user.watchlist.filter((movie) => regex.test(movie.title));
    res.render("pages/search-mylist", {
      movies,
      query,
      user: req.user || null
    });
  } catch (error) {
    next(error);
  }
};