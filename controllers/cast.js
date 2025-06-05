import Cast from "../models/cast.js";
import Movie from "../models/movie.js";

export const createCast = async (req, res) => {
  try {
    const {
      name,
      birthdate,
      nationality,
      description,
      profileImageURL,
      movies, // movie names now
    } = req.body;

    if (
      !name ||
      !birthdate ||
      !nationality ||
      !description ||
      !profileImageURL
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    let movieIds = [];

    if (movies && Array.isArray(movies)) {
      const matchedMovies = await Movie.find({
        title: { $in: movies.map((title) => new RegExp(`^${title}$`, "i")) }, // case-insensitive exact match
      });

      movieIds = matchedMovies.map((movie) => movie._id);

      if (movieIds.length === 0) {
        return res.status(404).json({ error: "No matching movies found" });
      }
    }

    const cast = new Cast({
      name,
      birthdate,
      nationality,
      description,
      profileImageURL,
      movies: movieIds,
    });

    await cast.save();

    // Add cast name to each movie's cast list
    if (movieIds.length > 0) {
      await Movie.updateMany(
        { _id: { $in: movieIds } },
        { $addToSet: { cast: { name: cast.name } } }
      );
    }

    res.status(201).json(cast);
  } catch (err) {
    console.error("Error creating cast:", err);
    res
      .status(500)
      .json({ error: "Failed to create cast", details: err.message });
  }
};

export const updateCast = async (req, res) => {
  try {
    const castId = req.params.id;
    const {
      name,
      birthdate,
      nationality,
      description,
      profileImageURL,
      movies, // array of movie names from frontend
    } = req.body;

    // Validate required fields
    if (
      !name ||
      !birthdate ||
      !nationality ||
      !description ||
      !profileImageURL
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    let movieIds = [];

    if (movies && Array.isArray(movies)) {
      const trimmedTitles = movies.map((title) => title.trim()).filter(Boolean);

      // Search for movies with those titles (case-insensitive)
      const foundMovies = await Movie.find({
        title: {
          $in: trimmedTitles.map((title) => new RegExp(`^${title}$`, "i")),
        },
      });

      // Extract found titles for comparison
      const foundTitles = foundMovies.map((movie) => movie.title.toLowerCase());

      // Find which input titles weren't matched
      const notFoundTitles = trimmedTitles.filter(
        (inputTitle) => !foundTitles.includes(inputTitle.toLowerCase())
      );

      if (notFoundTitles.length > 0) {
        return res.status(400).json({
          error: `The following movie(s) were not found: ${notFoundTitles.join(
            ", "
          )}`,
        });
      }

      movieIds = foundMovies.map((movie) => movie._id);
    }

    const updatedCast = await Cast.findByIdAndUpdate(
      castId,
      {
        name,
        birthdate,
        nationality,
        description,
        profileImageURL,
        movies: movieIds,
      },
      { new: true, runValidators: true }
    );

    if (!updatedCast) {
      return res.status(404).json({ error: "Cast member not found" });
    }

    res.status(200).json({
      message: "Cast member updated successfully",
      cast: updatedCast,
    });
  } catch (err) {
    console.error("Error updating cast member:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const deleteCast = async (req, res) => {
  try {
    const cast = await Cast.findByIdAndDelete(req.params.id);
    if (!cast) {
      return res.status(404).json({ error: "Cast member not found" });
    }

    await Movie.updateMany(
      { "cast.name": cast.name },
      { $pull: { cast: { name: cast.name } } }
    );

    res.json({ message: "Cast member deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete cast" });
  }
};
