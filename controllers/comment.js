import Comment from "../models/comment.js";

export const addComment = async (req, res) => {
  try {
    const { text, rating } = req.body;
    const comment = await Comment.create({
      user: req.user.id,
      movie: req.params.movieId,
      text,
      rating,
    });
    res.status(201).json({ message: "Comment added", comment });
  } catch (error) {
    res.status(500).json({ message: "Error adding comment", error: error.message });
  }
};

export const getMovieComments = async (req, res) => {
  try {
    // Populate both name and _id so frontend can check ownership
    const comments = await Comment.find({ movie: req.params.movieId }).populate("user", "name _id");
    console.log('DEBUG: Returning comments for movie', req.params.movieId, comments);
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching comments", error: error.message });
  }
};

export const getAllComments = async (req, res) => {
  try {
    const comments = await Comment.find().populate("user movie", "name title");
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching all comments", error: error.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    await Comment.findByIdAndDelete(req.params.id);
    res.json({ message: "Comment deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting comment", error: error.message });
  }
};

export const deleteuserComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found." });
    }

    // Only allow comment owner to delete
    if (comment.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Unauthorized." });
    }

    await Comment.findByIdAndDelete(comment._id); // Fix: use model method instead of comment.remove()
    res.json({ message: "Comment deleted successfully." });
  } catch (err) {
    console.error("Error in deleteuserComment:", err);
    res.status(500).json({ message: "Server error.", error: err.message, stack: err.stack });
  }
};