import Movie from "../models/movie.js";
import Cast from "../models/cast.js";
import User from "../models/user.js";
import Comment from "../models/comment.js";

// Get all movies
export const getMovies = async (req, res) => {
  try {
    const movies = await Movie.find().sort({ releasedate: -1 });
    res.json(movies);
  } catch (err) {
    console.error("Error fetching movies:", err);
    res.status(500).json({ error: "Failed to fetch movies" });
  }
};

// Create a new movie
export const createMovie = async (req, res) => {
  try {
    const {
      title,
      releasedate,
      duration,
      rating,
      genre,
      cast, // array of cast names
      description,
      posterURL,
      trailerURL,
      category,
    } = req.body;

    if (!title || !releasedate || !duration || !rating || !genre || !cast || !description || !posterURL || !trailerURL || !category) {
      return res.status(400).json({ message: "❌ Missing required fields" });
    }

    if (!Array.isArray(cast)) {
      return res.status(400).json({ message: "❌ Cast must be an array of names" });
    }

    // Process cast members
    const castIds = await Promise.all(
      cast.map(async (actorName) => {
        let existing = await Cast.findOne({ name: actorName });
        if (!existing) {
          existing = new Cast({
            name: actorName,
            birthdate: new Date(), // Placeholder
            nationality: "Unknown",
            description: "No description provided.",
            photoURL: '/images/default-cast.jpg',
            profileImageURL: '/images/default-cast.jpg'
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
    res.status(201).json({ message: "✅ Movie created successfully", movie });
  } catch (err) {
    console.error("Error creating movie:", err);
    res.status(500).json({ message: "❌ Failed to create movie", details: err.message });
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
      return res.status(400).json({ message: "❌ Missing required fields" });
    }

    if (!Array.isArray(genre)) {
      return res.status(400).json({ message: "❌ Genre must be an array" });
    }

    if (!Array.isArray(cast) || cast.some(actor => !actor.name)) {
      return res.status(400).json({ message: "❌ Cast must be an array of objects with a 'name' field" });
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
      return res.status(404).json({ message: "❌ Movie not found" });
    }

    res.status(200).json({ message: "✅ Movie updated successfully", movie: updatedMovie });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "❌ Failed to update movie", details: err.message });
  }
};

// Delete a movie
export const deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) return res.status(404).json({ message: "❌ Movie not found" });
    res.json({ message: "✅ Movie deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "❌ Failed to delete movie" });
  }
};

// Get movie by ID (with populated cast and related movies)
export const getMovieById = async (req, res) => {
  try {
    // Find movie and populate cast details with all necessary fields
    const movie = await Movie.findById(req.params.id).populate({
      path: "cast",
      select: "name photoURL profileImageURL birthdate nationality description _id",
      options: { lean: true } // Use lean() for better performance
    });

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

    // Fetch comments for the movie
    const comments = await Comment.find({ movie: movie._id })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    // Render movie page with movie, related movies, and comments
    res.render("pages/movie", { 
      movie, 
      relatedMovies, 
      inList,
      comments,
      user: res.locals.user // Use res.locals.user for EJS templates
    });
  } catch (err) {
    console.error("Error fetching movie:", err);
    res.status(500).send("Server Error");
  }
};

// Get movie recommendations based on genre and time period
export const getMovieRecommendations = async (req, res) => {
  try {
    const { genre, time } = req.query;

    if (!genre || !time) {
      return res.status(400).json({ message: 'Genre and time period are required' });
    }

    // Define date ranges based on time period
    let dateRange = {};
    const currentYear = new Date().getFullYear();

    switch (time) {
      case 'recent':
        dateRange = {
          $gte: new Date(2020, 0, 1),
          $lte: new Date(currentYear, 11, 31)
        };
        break;
      case '2010s':
        dateRange = {
          $gte: new Date(2010, 0, 1),
          $lt: new Date(2020, 0, 1)
        };
        break;
      case 'classic':
        dateRange = {
          $lt: new Date(2010, 0, 1)
        };
        break;
      default:
        return res.status(400).json({ message: 'Invalid time period' });
    }

    // Find movies that match the genre and time period
    const movies = await Movie.find({
      genre: { $regex: new RegExp(genre, 'i') },
      releasedate: dateRange
    })
    .select('title posterURL rating releasedate genre _id');

    if (movies.length === 0) {
      return res.json(null); // Return null if no movies found
    }

    // Use a more random selection method
    const randomIndex = Math.floor(Math.random() * movies.length);
    const randomMovie = movies[randomIndex];
    
    res.json(randomMovie);
  } catch (error) {
    console.error('Error getting movie recommendations:', error);
    res.status(500).json({ message: 'Error getting movie recommendations' });
  }
};

