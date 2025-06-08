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




export const addCastToSlider = async (req, res) => {
  try {
    const { castId, position } = req.body;

    // Validate input
    if (!castId || position === undefined) {
      return res
        .status(400)
        .json({ error: "Cast ID and position are required" });
    }

    // Find the cast
    const cast = await Cast.findById(castId);
    if (!cast) {
      return res.status(404).json({ error: "Cast not found" });
    }

      if (cast.isInSlider) {
      return res.status(409).json({
        message: "This cast is already in the slider.",
        alreadyInSlider: true,
        currentPosition: cast.sliderPosition,
      });
    }

    // Check current slider count
    const sliderCasts = await Cast.find({ isInSlider: true });
    if (sliderCasts.length >= 3) {
      return res.status(400).json({ error: "Slider is full (max 3 casts)" });
    }

    if (cast.isInSlider) {
      return res.status(409).json({
        message: "This cast is already in the slider.",
        alreadyInSlider: true,
        currentPosition: cast.sliderPosition,
      });
    }

    // Shift positions if needed
    if (position !== null) {
      await Cast.updateMany(
        { isInSlider: true, sliderPosition: { $gte: position } },
        { $inc: { sliderPosition: 1 } }
      );
    }

    // Add to slider
    cast.isInSlider = true;
    cast.sliderPosition = position || (sliderCasts.length + 1);
    await cast.save();

    res.json({ message: "Cast added to slider successfully", cast });
  } catch (error) {
    console.error("Error adding cast to slider:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

  export const removeCastFromSlider = async (req, res) => {
  try {
    const { castId } = req.params;

    // Find the cast
    const cast = await Cast.findById(castId);
    if (!cast || !cast.isInSlider) {
      return res.status(404).json({ error: "Cast not found in slider" });
    }

    const position = cast.sliderPosition;

    // Shift other casts above it down
    await Cast.updateMany(
      { isInSlider: true, sliderPosition: { $gt: position } },
      { $inc: { sliderPosition: -1 } }
    );

    // Remove cast from slider
    cast.isInSlider = false;
    cast.sliderPosition = null;
    await cast.save();

    res.json({ message: "Cast removed from slider successfully" });
  } catch (error) {
    console.error("Error removing cast from slider:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateCastSliderPosition = async (req, res) => {
  try {
    const { castId, position } = req.body;

    if (!castId || position === undefined) {
      return res.status(400).json({ error: "Cast ID and new position are required" });
    }

    const cast = await Cast.findById(castId);
    if (!cast || !cast.isInSlider) {
      return res.status(404).json({ error: "Cast not found in slider" });
    }

    const oldPosition = cast.sliderPosition;

    // If position is unchanged, exit early
    if (oldPosition === position) {
      return res.json({ message: "Position already set to this value", cast });
    }

    // Shift positions
    if (position < oldPosition) {
      await Cast.updateMany(
        {
          isInSlider: true,
          sliderPosition: { $gte: position, $lt: oldPosition },
        },
        { $inc: { sliderPosition: 1 } }
      );
    } else {
      await Cast.updateMany(
        {
          isInSlider: true,
          sliderPosition: { $gt: oldPosition, $lte: position },
        },
        { $inc: { sliderPosition: -1 } }
      );
    }

    cast.sliderPosition = position;
    await cast.save();

    res.json({ message: "Slider position updated successfully", cast });
  } catch (error) {
    console.error("Error updating slider position:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


export const getCastDetail = async (req, res) => {
  try {
    const castId = req.params.id;
    const [cast, allCasts] = await Promise.all([
      CastModel.findById(castId).populate('movies', 'title posterURL'), // Populate movies with title and posterURL
      MovieModel.find(), // Fetch all movies for potential related content
      CastModel.find(), // Fetch all casts for related casts
    ]);

    if (!cast) {
      return res.status(404).send("Cast member not found");
    }

    // Find related casts (e.g., those who share movies with this cast member)
    const relatedMovieIds = cast.movies.map(movie => movie._id.toString());
    const relatedCasts = allCasts.filter(c => 
      c._id.toString() !== castId && // Exclude the current cast
      c.movies.some(movie => relatedMovieIds.includes(movie._id.toString()))
    ).slice(0, 8); // Limit to 8 related casts

    res.render("pages/cast", {
      cast, // Cast member data
      relatedCasts, // Related cast members for "You May Like"
    });
  } catch (err) {
    console.error("Error fetching cast detail:", err);
    res.status(500).send("Internal Server Error");
  }
};