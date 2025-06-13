import Movie from "../models/movie.js";
import Cast from "../models/cast.js";
import User from "../models/user.js";

// Create a new movie
export const createMovie = async (req, res) => {
  try {
    const {
      title,
      releasedate,
      duration,
      rating,
      genre,
      cast, // array of { name: "Actor Name" }
      description,
      posterURL,
      trailerURL,
      category,
    } = req.body;

    if (!title || !releasedate || !duration || !rating || !genre || !cast || !description || !posterURL || !trailerURL || !category) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!Array.isArray(cast) || cast.some(actor => !actor.name)) {
      return res.status(400).json({ error: "Cast must be an array of objects with a 'name' field." });
    }

    const castIds = await Promise.all(
      cast.map(async (actor) => {
        let existing = await Cast.findOne({ name: actor.name });
        if (!existing) {
          existing = new Cast({
            name: actor.name,
            birthdate: new Date(), // Placeholder
            nationality: "Unknown",
            description: "No description provided.",
            profileImageURL: "https://default-profile.com/image.jpg",
          });
          await existing.save();
        }
        return existing._id;
      })
    );

    const movie = new Movie({
      title,
      releasedate,
      duration,
      rating,
      genre,
      cast: castIds,
      description,
      posterURL,
      trailerURL,
      category,
    });

    await movie.save();
    res.status(201).json(movie);
  } catch (err) {
    console.error("Error creating movie:", err);
    res.status(500).json({ error: "Failed to create movie", details: err.message });
  }
};

// Update a movie
export const updateMovie = async (req, res) => {
  try {
    const {
      title,
      releasedate,
      duration,
      rating,
      genre,
      cast,
      description,
      posterURL,
      trailerURL,
      category,
    } = req.body;

    if (!title || !releasedate || !duration || !rating || !genre || !cast || !description || !posterURL || !trailerURL || !category) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    if (!Array.isArray(genre)) {
      return res.status(400).json({ message: "Genre must be an array." });
    }

    if (!Array.isArray(cast) || cast.some(actor => !actor.name)) {
      return res.status(400).json({ message: "Cast must be an array of objects with a 'name' field." });
    }

    const castIds = await Promise.all(
      cast.map(async (actor) => {
        let existing = await Cast.findOne({ name: actor.name });
        if (!existing) {
          existing = new Cast({
            name: actor.name,
            birthdate: new Date(),
            nationality: "Unknown",
            description: "No description provided.",
            profileImageURL: "https://default-profile.com/image.jpg",
          });
          await existing.save();
        }
        return existing._id;
      })
    );

    const updatedMovie = await Movie.findByIdAndUpdate(
      req.params.id,
      {
        title,
        releasedate,
        duration,
        rating,
        genre,
        cast: castIds,
        description,
        posterURL,
        trailerURL,
        category,
      },
      { new: true, runValidators: true }
    );

    if (!updatedMovie) {
      return res.status(404).json({ message: "Movie not found." });
    }

    res.status(200).json(updatedMovie);
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Failed to update movie.", details: err.message });
  }
};

// Delete a movie
export const deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) return res.status(404).json({ error: "Movie not found" });
    res.json({ message: "Movie deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete movie" });
  }
};

// Get movie by ID (with populated cast and related movies)
export const getMovieById = async (req, res) => {
  try {
    // Find movie and populate cast details
    const movie = await Movie.findById(req.params.id).populate("cast");

    if (!movie) {
      return res.status(404).send("Movie not found");
    }

    // Find related movies by shared genre
    const relatedMovies = await Movie.find({
      _id: { $ne: movie._id },
      genre: { $in: movie.genre },
    }).limit(6);

    // Check if movie is in user's watchlist
    let inList = false;
    if (req.user) {
      const user = await User.findById(req.user.id);
      inList = user.watchlist.includes(movie._id);
    }

    // Render movie page with movie and related movies

    res.render("pages/movie", { movie, relatedMovies, user: res.locals.user });

    res.render("pages/movie", { movie, relatedMovies, inList });

  } catch (err) {
    console.error("Error fetching movie:", err);
    res.status(500).send("Server Error");
  }
};

