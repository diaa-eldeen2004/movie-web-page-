import CastModel from "../models/cast.js";

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
    const cast = await CastModel.findById(castId);
    if (!cast) {
      return res.status(404).json({ error: "Cast not found" });
    }

    // Check current slider count
    const sliderCasts = await CastModel.find({ isInSlider: true });
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
      await CastModel.updateMany(
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
    const cast = await CastModel.findById(castId);
    if (!cast || !cast.isInSlider) {
      return res.status(404).json({ error: "Cast not found in slider" });
    }

    const position = cast.sliderPosition;

    // Shift other casts above it down
    await CastModel.updateMany(
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

    const cast = await CastModel.findById(castId);
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
      await CastModel.updateMany(
        {
          isInSlider: true,
          sliderPosition: { $gte: position, $lt: oldPosition },
        },
        { $inc: { sliderPosition: 1 } }
      );
    } else {
      await CastModel.updateMany(
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