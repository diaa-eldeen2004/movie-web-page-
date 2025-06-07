import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  movie: { type: mongoose.Schema.Types.ObjectId, ref: "Movie", required: true },
  text: { type: String, required: true },
  rating: { type: Number, min: 1, max: 10 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Comment", commentSchema);
