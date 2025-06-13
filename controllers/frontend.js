import User from "../models/user.js";
import Movie from "../models/movie.js";
import Cast from "../models/cast.js";
import Comment from "../models/comment.js";

// Render the homepage with slider, trending, and new release movies
export const getIndex = async (req, res) => {
  try {
    const [sliderMovies, trendingMovies, newReleaseMovies] = await Promise.all([
      Movie.find({ isInSlider: true }).sort({ sliderPosition: 1 }).limit(3),
      Movie.find({ category: "trending" }),
      Movie.find({ category: "new release" }),
    ]);

    res.render("pages/index", {
      sliderMovies,
      trendingMovies,
      newReleaseMovies,
    });
  } catch (err) {
    console.error("Failed to load homepage:", err);
    res.status(500).send("Server Error");
  }
};

// Render the contact page
export const getcontact = (req, res) => {
  res.render("pages/contact");
};

// Render the movies page
export const getmovies = (req, res) => {
  res.render("pages/movies");
};

// Render the mylist page
export const getmylist = (req, res) => {
  res.render("pages/mylist");
};

// Render the forget password page
export const getfrogetpassword = (req, res) => {
  res.render("pages/forgetpassword");
};

// Render the user profile page
export const getprofile = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }

    res.render("pages/profile", { user });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).send("Internal Server Error");
  }
};

// Render the series page
export const getALLCasts = async (req, res) => {
  try {
    const [sliderCasts, allCast] = await Promise.all([
      Cast.find({ isInSlider: true }).sort({ sliderPosition: 1 }).limit(3), // Fixed variable name from sliderCast to sliderCasts
      Cast.find(),
    ]);

    const trendingMovies = await Movie.find({ category: "trending" });

    // Get trending casts (cast members in trending movies)

     const trendingCastIds = trendingMovies.flatMap(movie => movie.cast || []); // Adjust based on your schema
     const trendingCasts = allCast.filter(cast => trendingCastIds.includes(cast._id.toString()));

    // // Filter born today (dynamic current date)
     const today = new Date();
     const bornToday = allCast.filter(cast => {
       const birthDate = new Date(cast.birthdate);
       return birthDate.getDate() === today.getDate() && birthDate.getMonth() === today.getMonth();
    });

    res.render("pages/casts", {
      sliderCasts, // Corrected variable name matches template expectation
      trendingCasts,
      allCast,
      bornToday,
    });
  } catch (err) {
    console.error("Failed to load cast page:", err);
    res.status(500).send("Server Error");
  }
};

// Render the signup page
export const getsignup = (req, res) => {
  res.render("pages/signup");
};

// Render the 2FA page
export const get2fa = (req, res) => {
  res.render("pages/2fapage");
};

// Render the login page
export const getlogin = (req, res) => {
  res.render("pages/login");
};

// Render the settings page
export const getsettings = (req, res) => {
  res.render("pages/settings");
};

// Render the admin dashboard
export const getAdmin = async (req, res) => {
  try {

    const [users, allMovies, sliderMovies, allCast, allComments, sliderCasts] = await Promise.all([
      User.find(),
      Movie.find(),
      Movie.find({ isInSlider: true }).sort({ sliderPosition: 1 }),
      Cast.find(),
      Comment.find().populate("user movie", "name title"),
      Cast.find({ isInSlider: true }).sort({ sliderPosition: 1 }).limit(3),

    ]);

    res.render("admin/admin", {
      arr: users,
      Movie: allMovies,
      sliderMovies,
      Cast: allCast,
      Comments: allComments,
      sliderCasts,

    });
  } catch (err) {
    console.error("Error loading admin page:", err);
    res.status(500).send("Server Error");
  }
};

// Render the edit user page
export const getEditUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send("User not found");

    res.render("admin/editUser", { user });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

// Render the add user page
export const getAddUser = (req, res) => {
  res.render("admin/adduser");
};

// Render the add movie page
export const getAddMovie = (req, res) => {
  res.render("admin/addMovie");
};

// Render the edit movie page with cast data
export const getEditMovie = async (req, res) => {
  try {
    const movieid = req.params.id;
    const [movie, castMembers] = await Promise.all([
      Movie.findById(movieid),
      Cast.find(),
    ]);

    if (!movie) {
      return res.status(404).send("Movie not found");
    }

    res.render("admin/editMovie", { 
      movie,
      castMembers
    });
  } catch (err) {
    console.error("Error fetching movie or cast:", err);
    res.status(500).send("Internal Server Error");
  }
};

// Render the add cast page
export const getAddCast = (req, res) => {
  res.render('admin/addcast');
};

// Render the edit cast page
export const getEditCast = async (req, res) => {
  try {
    const cast = await Cast.findById(req.params.id).populate("movies", "title"); // or "title" depending on your schema
    if (!cast) {
      return res.status(404).send("cast not found");
    }

    res.render("admin/editcast", { cast });
  } catch (err) {
    console.error("Error fetching cast:", err);
    res.status(500).send("Internal Server Error");
  }
};

// Get cast detail
export const getCastDetail = async (req, res) => {
  try {
    const castId = req.params.id;
    const [cast, allCasts] = await Promise.all([
      Cast.findById(castId).populate('movies', 'title posterURL'),
      Cast.find()
    ]);

    if (!cast) {
      return res.status(404).render("pages/404");
    }

    // Find related casts (those who share movies with this cast member)
    const relatedMovieIds = cast.movies.map(movie => movie._id.toString());
    const relatedCasts = allCasts.filter(c => 
      c._id.toString() !== castId && // Exclude the current cast
      c.movies.some(movie => relatedMovieIds.includes(movie._id.toString()))
    ).slice(0, 8); // Limit to 8 related casts

    // Get user with populated favoriteCasts
    const user = await User.findById(req.user.id).populate('favoriteCasts');
    
    // Check if cast is in user's favorites
    const isFavorite = user && user.favoriteCasts && user.favoriteCasts.some(favCast => favCast._id.toString() === castId);

    res.render("pages/singlecast", {
      cast,
      relatedCasts,
      isFavorite,
      user: req.user
    });
  } catch (err) {
    console.error("Error fetching cast detail:", err);
    res.status(500).send("Internal Server Error");
  }
};