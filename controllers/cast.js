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
      movies,
    } = req.body;

    if (!name || !birthdate || !nationality || !description || !profileImageURL) {
      return res.status(400).json({ message: "❌ Missing required fields" });
    }

    let movieIds = [];

    if (movies && Array.isArray(movies)) {
      const matchedMovies = await Movie.find({
        title: { $in: movies.map((title) => new RegExp(`^${title}$`, "i")) },
      });

      movieIds = matchedMovies.map((movie) => movie._id);

      if (movieIds.length === 0 && movies.length > 0) {
        return res.status(404).json({ message: "❌ No matching movies found" });
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

    // Add cast to each movie's cast list
    if (movieIds.length > 0) {
      await Movie.updateMany(
        { _id: { $in: movieIds } },
        { $addToSet: { cast: cast._id } }
      );
    }

    res.status(201).json({ 
      message: "✅ Cast member created successfully",
      cast 
    });
  } catch (err) {
    console.error("Error creating cast:", err);
    res.status(500).json({ message: "❌ Failed to create cast", details: err.message });
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
      movies,
    } = req.body;

    if (!name || !birthdate || !nationality || !description || !profileImageURL) {
      return res.status(400).json({ message: "❌ Missing required fields" });
    }

    let movieIds = [];

    if (movies && Array.isArray(movies)) {
      const trimmedTitles = movies.map((title) => title.trim()).filter(Boolean);

      const foundMovies = await Movie.find({
        title: {
          $in: trimmedTitles.map((title) => new RegExp(`^${title}$`, "i")),
        },
      });

      const foundTitles = foundMovies.map((movie) => movie.title.toLowerCase());
      const notFoundTitles = trimmedTitles.filter(
        (inputTitle) => !foundTitles.includes(inputTitle.toLowerCase())
      );

      if (notFoundTitles.length > 0) {
        return res.status(400).json({
          message: `❌ The following movie(s) were not found: ${notFoundTitles.join(", ")}`
        });
      }

      movieIds = foundMovies.map((movie) => movie._id);
    }

    const cast = await Cast.findById(castId);
    if (!cast) {
      return res.status(404).json({ message: "❌ Cast member not found" });
    }

    // Remove cast from old movies
    if (cast.movies.length > 0) {
      await Movie.updateMany(
        { _id: { $in: cast.movies } },
        { $pull: { cast: castId } }
      );
    }

    // Update cast
    cast.name = name;
    cast.birthdate = birthdate;
    cast.nationality = nationality;
    cast.description = description;
    cast.profileImageURL = profileImageURL;
    cast.movies = movieIds;
    await cast.save();

    // Add cast to new movies
    if (movieIds.length > 0) {
      await Movie.updateMany(
        { _id: { $in: movieIds } },
        { $addToSet: { cast: castId } }
      );
    }

    res.status(200).json({
      message: "✅ Cast member updated successfully",
      cast
    });
  } catch (err) {
    console.error("Error updating cast member:", err);
    res.status(500).json({ message: "❌ Failed to update cast member", details: err.message });
  }
};

export const deleteCast = async (req, res) => {
  try {
    const castId = req.params.id;
    
    if (!castId) {
      return res.status(400).json({ message: "❌ Cast ID is required" });
    }

    // Find the cast first to get its movies
    const cast = await Cast.findById(castId);
    if (!cast) {
      return res.status(404).json({ message: "❌ Cast member not found" });
    }

    // Remove cast from all movies
    if (cast.movies && cast.movies.length > 0) {
      await Movie.updateMany(
        { _id: { $in: cast.movies } },
        { $pull: { cast: castId } }
      );
    }

    // Delete the cast
    await Cast.findByIdAndDelete(castId);

    res.status(200).json({ message: "✅ Cast member deleted successfully" });
  } catch (err) {
    console.error("Error deleting cast:", err);
    res.status(500).json({ message: "❌ Failed to delete cast", details: err.message });
  }
};

export const addCastToSlider = async (req, res) => {
  try {
    const { castId, position } = req.body;

    // Validate input
    if (!castId) {
      return res.status(400).json({ message: "❌ Cast ID is required" });
    }

    if (position && (isNaN(position) || position < 1 || position > 3)) {
      return res.status(400).json({ message: "❌ Position must be a number between 1 and 3" });
    }

    // Find the cast
    const cast = await Cast.findById(castId);
    if (!cast) {
      return res.status(404).json({ message: "❌ Cast not found" });
    }

    if (cast.isInSlider) {
      return res.status(409).json({
        message: `ℹ️ Cast is already in slider at position ${cast.sliderPosition}`,
        alreadyInSlider: true,
        currentPosition: cast.sliderPosition,
      });
    }

    // Check current slider count
    const sliderCasts = await Cast.find({ isInSlider: true });
    if (sliderCasts.length >= 3) {
      return res.status(400).json({ message: "❌ Slider is full (max 3 casts)" });
    }

    // Add to slider
    cast.isInSlider = true;
    cast.sliderPosition = position || (sliderCasts.length + 1);
    await cast.save();

    res.json({ 
      message: "✅ Cast added to slider successfully",
      cast 
    });
  } catch (error) {
    console.error("Error adding cast to slider:", error);
    res.status(500).json({ message: "❌ Server error occurred" });
  }
};

export const removeCastFromSlider = async (req, res) => {
  try {
    const { castId } = req.params;

    if (!castId) {
      return res.status(400).json({ message: "❌ Cast ID is required" });
    }

    // Find the cast
    const cast = await Cast.findById(castId);
    if (!cast) {
      return res.status(404).json({ message: "❌ Cast not found" });
    }

    if (!cast.isInSlider) {
      return res.status(400).json({ message: "❌ Cast is not in slider" });
    }

    const position = cast.sliderPosition;

    // Remove from slider
    cast.isInSlider = false;
    cast.sliderPosition = null;
    await cast.save();

    // Shift other casts above it down
    await Cast.updateMany(
      { isInSlider: true, sliderPosition: { $gt: position } },
      { $inc: { sliderPosition: -1 } }
    );

    res.json({ 
      message: "✅ Cast removed from slider successfully",
      cast 
    });
  } catch (error) {
    console.error("Error removing cast from slider:", error);
    res.status(500).json({ message: "❌ Server error occurred" });
  }
};

export const updateCastSliderPosition = async (req, res) => {
  try {
    const { castId, newPosition } = req.body;

    if (!castId || newPosition === undefined) {
      return res.status(400).json({ message: "❌ Cast ID and new position are required" });
    }

    if (isNaN(newPosition) || newPosition < 1 || newPosition > 3) {
      return res.status(400).json({ message: "❌ Position must be a number between 1 and 3" });
    }

    const cast = await Cast.findById(castId);
    if (!cast) {
      return res.status(404).json({ message: "❌ Cast not found" });
    }

    if (!cast.isInSlider) {
      return res.status(400).json({ message: "❌ Cast is not in slider" });
    }

    const oldPosition = cast.sliderPosition;
    const maxPosition = await Cast.countDocuments({ isInSlider: true });

    if (newPosition > maxPosition) {
      return res.status(400).json({ message: "❌ Invalid position" });
    }

    if (newPosition === oldPosition) {
      return res.status(400).json({ message: "❌ Cast is already at this position" });
    }

    // Update positions
    if (newPosition > oldPosition) {
      await Cast.updateMany(
        { 
          isInSlider: true, 
          sliderPosition: { $gt: oldPosition, $lte: newPosition } 
        },
        { $inc: { sliderPosition: -1 } }
      );
    } else {
      await Cast.updateMany(
        { 
          isInSlider: true, 
          sliderPosition: { $gte: newPosition, $lt: oldPosition } 
        },
        { $inc: { sliderPosition: 1 } }
      );
    }

    cast.sliderPosition = newPosition;
    await cast.save();

    res.json({ 
      message: "✅ Cast position updated successfully",
      cast 
    });
  } catch (error) {
    console.error("Error updating cast position:", error);
    res.status(500).json({ message: "❌ Server error occurred" });
  }
};

export const getCastDetail = async (req, res) => {
  try {
    const castId = req.params.id;
    const [cast, allCasts] = await Promise.all([
      Cast.findById(castId)
        .select('name photoURL profileImageURL birthdate nationality description movies')
        .populate('movies', 'title posterURL'), // Populate movies with title and posterURL
      Movie.find(), // Fetch all movies for potential related content
      Cast.find(), // Fetch all casts for related casts
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

    res.render("pages/singlecast", {
      cast, // Cast member data
      relatedCasts, // Related cast members for "You May Like"
    });
  } catch (err) {
    console.error("Error fetching cast detail:", err);
    res.status(500).send("Internal Server Error");
  }
};