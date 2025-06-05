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
      return res.status(400).json({ error: "Missing required fields" });
    }

    
    const cast = new Cast({
      name,
      birthdate,
      nationality,
      description,
      profileImageURL,
      movies: movies || [], 
    });

    
    await cast.save();

    
    if (movies && Array.isArray(movies)) {
      await Movie.updateMany(
        { _id: { $in: movies } },
        { $addToSet: { cast: { name: cast.name } } }
      );
    }

    res.status(201).json(cast);
  } catch (err) {
    console.error("Error creating cast:", err);
    res.status(500).json({ error: "Failed to create cast", details: err.message });
  }
};


export const updateCast = async (req, res) => {
  try {
    const castId = req.params.id;
    const { name, birthdate, nationality, description, profileImageURL, movies } = req.body;

    const updatedCast = await CastModel.findByIdAndUpdate(
      castId,
      { name, birthdate, nationality, description, profileImageURL, movies },
      { new: true, runValidators: true }
    );

    if (!updatedCast) {
      return res.status(404).json({ error: "Cast member not found" });
    }

    res.status(200).json({ message: "Cast member updated successfully", cast: updatedCast });
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



export const getCastById = async (req, res) => {
  try {
    const cast = await Cast.findById(req.params.id).populate('movies');

    if (!cast) {
      return res.status(404).send('Cast member not found');
    }

    res.render('pages/cast', { cast });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};