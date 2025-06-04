import Movie from "../models/movie.js";

export const createMovie = async (req, res) => {
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

    if (!title || !releasedate || !duration || !rating || !genre || !cast || !description || !posterURL || !trailerURL ||!category) {
      return res.status(400).json({ error: "Missing required fields" });
    }



    // Create a new movie document
    const movie = new Movie({
      title,
      releasedate,
      duration,
      rating,
      genre ,
      cast,
      description,
      posterURL,
      trailerURL,
      category,  // Corrected the typo here
    });

    // Save the movie to the database
    await movie.save();
    res.status(201).json(movie); // Respond with the created movie
  } catch (err) {
    console.error("Error creating movie:", err);
    res.status(500).json({ error: "Failed to create movie", details: err.message });
  }
};

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

    // Validate required fields
    if (
      !title ||
      !releasedate ||
      !duration ||
      !rating ||
      !genre ||
      !description||
      !posterURL||
      !trailerURL||
      !category
    ) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // Ensure genre is an array
    if (!Array.isArray(genre)) {
      return res.status(400).json({ message: "Genre must be an array." });
    }

    // Ensure cast is an array of objects with 'name'
    if (!Array.isArray(cast) || cast.some((actor) => !actor.name)) {
      return res
        .status(400)
        .json({ message: "Cast must be an array of objects with a 'name' field." });
    }

    const updatedData = {
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
    };

    const movie = await Movie.findByIdAndUpdate(req.params.id, updatedData, {
      new: true,
      runValidators: true,
    });

    if (!movie) {
      return res.status(404).json({ message: "Movie not found." });
    }

    res.status(200).json(movie);
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Failed to update movie.", details: err });
  }
};




// DELETE /movies/:id
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

export const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).send('Movie not found');
    }

    // Get related movies (same genre, exclude current)
    const relatedMovies = await Movie.find({
      _id: { $ne: movie._id }, // exclude current movie
      genre: { $in: movie.genre } // same genre
    }).limit(6); // limit for display

    res.render('pages/movie', { movie, relatedMovies });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
  
};