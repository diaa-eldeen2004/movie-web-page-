import Movie from "../models/movie.js";
import Cast from "../models/cast.js";

export const searchMovies = async (req, res) => {
  const query = req.query.q || "";
  const regex = new RegExp(query, "i");
  const movies = await Movie.find({ title: regex });
  res.render("pages/search-movies", { movies, query });
};

export const searchCasts = async (req, res) => {
  const query = req.query.q || "";
  const regex = new RegExp(query, "i");
  const casts = await Cast.find({ name: regex });
  res.render("pages/search-casts", { casts, query });
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