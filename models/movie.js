import mongoose from "mongoose";

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  genre: {
    type: [String],
    required: true,
  },
  releasedate: {
    type: Date,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
    min: 1, // Duration in minutes
  },
  cast: [
    {
      name: {
        type: String,
        required: true,
      },
    },
  ],
  rating: {
    type: Number,
    min: 0,
    max: 10,
    default: 0,
  },
  posterURL: {
    type: String,
    required: true,
  },
  trailerURL: {
    type: String,
    required: true,
  },
  isInSlider: {
    type: Boolean,
    default: false,
  },
  sliderPosition: {
    type: Number,
    default: null,
  },
  category: {
    type: String,
    enum: ["trending", "new release"], // optional enum for validation
    default: "none",
  },
});

const Movie = mongoose.models.Movie || mongoose.model("Movie", movieSchema);
export default Movie;
