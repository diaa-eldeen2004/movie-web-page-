import Movie from "../models/movie.js";

export const addMovieToSlider = async (req, res) => {
  try {
    const { movieId, position } = req.body;

    // Validate input
    if (!movieId || position === undefined) {
      return res
        .status(400)
        .json({ error: "Movie ID and position are required" });
    }

    // Find the movie
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ error: "Movie not found" });
    }

    if (movie.isInSlider) {
      return res.status(409).json({
        message: "This movie is already in the slider.",
        alreadyInSlider: true,
        currentPosition: movie.sliderPosition,
      });
    }

    // Shift positions if needed
    if (position !== null) {
      await Movie.updateMany(
        { isInSlider: true, sliderPosition: { $gte: position } },
        { $inc: { sliderPosition: 1 } }
      );
    }

    // Add to slider
    movie.isInSlider = true;
    movie.sliderPosition = position;
    await movie.save();

    res.json({ message: "Movie added to slider successfully", movie });
  } catch (error) {
    console.error("Error adding movie to slider:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const removeMovieFromSlider = async (req, res) => {
  try {
    const { movieId } = req.params;

    // Find the movie
    const movie = await Movie.findById(movieId);
    if (!movie || !movie.isInSlider) {
      return res.status(404).json({ error: "Movie not found in slider" });
    }

    const position = movie.sliderPosition;

    // Shift other movies above it down
    await Movie.updateMany(
      { isInSlider: true, sliderPosition: { $gt: position } },
      { $inc: { sliderPosition: -1 } }
    );

    // Remove movie from slider
    movie.isInSlider = false;
    movie.sliderPosition = null;
    await movie.save();

    res.json({ message: "Movie removed from slider successfully" });
  } catch (error) {
    console.error("Error removing movie from slider:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


export const updateSliderPosition = async (req, res) => {
    try {
      const { movieId, position } = req.body;
  
      if (!movieId || position === undefined) {
        return res.status(400).json({ error: "Movie ID and new position are required" });
      }
  
      const movie = await Movie.findById(movieId);
      if (!movie || !movie.isInSlider) {
        return res.status(404).json({ error: "Movie not found in slider" });
      }
  
      const oldPosition = movie.sliderPosition;
  
      // If position is unchanged, exit early
      if (oldPosition === position) {
        return res.json({ message: "Position already set to this value", movie });
      }
  
      // Shift positions
      if (position < oldPosition) {
        await Movie.updateMany(
          {
            isInSlider: true,
            sliderPosition: { $gte: position, $lt: oldPosition },
          },
          { $inc: { sliderPosition: 1 } }
        );
      } else {
        await Movie.updateMany(
          {
            isInSlider: true,
            sliderPosition: { $gt: oldPosition, $lte: position },
          },
          { $inc: { sliderPosition: -1 } }
        );
      }
  
      movie.sliderPosition = position;
      await movie.save();
  
      res.json({ message: "Slider position updated successfully", movie });
  
    } catch (error) {
      console.error("Error updating slider position:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };