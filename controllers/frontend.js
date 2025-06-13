import User from "../models/user.js";
import Movie from "../models/movie.js";
import Cast from "../models/cast.js";
import Comment from "../models/comment.js";

// Render the homepage with slider, trending, and new release movies
export const getIndex = async (req, res) => {
  try {
    const [sliderMovies, trendingMovies, newReleaseMovies, casts] = await Promise.all([
      Movie.find({ isInSlider: true }).sort({ sliderPosition: 1 }).limit(3),
      Movie.find({ category: "trending" }),
      Movie.find({ category: "new release" }),
      Cast.find().limit(8) // Limit to 8 popular casts
    ]);

    res.render("pages/index", {
      sliderMovies,
      trendingMovies,
      newReleaseMovies,
      casts,
      user: req.user
    });
  } catch (err) {
    console.error("Failed to load homepage:", err);
    res.status(500).send("Server Error");
  }
};

// Render the contact page
export const getContact = (req, res) => {
  res.render("pages/contact", { user: req.user });
};

// Render the movies page
export const getmovies = async (req, res) => {
  try {
    const allMovies = await Movie.find().sort({ releasedate: -1 });
    res.render("pages/movies", { 
      movies: allMovies,
      user: req.user
    });
  } catch (err) {
    console.error("Failed to load movies page:", err);
    res.status(500).send("Server Error");
  }
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
      Cast.find({ isInSlider: true }).sort({ sliderPosition: 1 }).limit(3),
      Cast.find(),
    ]);

    // Get trending movies
    const trendingMovies = await Movie.find({ category: "trending" });

    // Get trending casts (cast members in trending movies)
    const trendingCastIds = trendingMovies.flatMap(movie => movie.cast || []);
    const trendingCasts = await Cast.find({
      _id: { $in: trendingCastIds }
    });

    // Filter born today (dynamic current date)
    const today = new Date();
    const bornToday = allCast.filter(cast => {
      const birthDate = new Date(cast.birthdate);
      return birthDate.getDate() === today.getDate() && birthDate.getMonth() === today.getMonth();
    });

    res.render("pages/casts", {
      sliderCasts,
      trendingCasts,
      allCast,
      bornToday,
      user: req.user
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
      Cast.findById(castId).populate({
        path: 'movies',
        select: 'title posterURL duration rating genre'
      }),
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

    let isFavorite = false;
    // Only check favorites if user is logged in
    if (req.user) {
      const user = await User.findById(req.user.id).populate('favoriteCasts');
      isFavorite = user && user.favoriteCasts && user.favoriteCasts.some(favCast => favCast._id.toString() === castId);
    }

    res.render("pages/singlecast", {
      cast,
      relatedCasts,
      isFavorite,
      user: req.user || null
    });
  } catch (err) {
    console.error("Error fetching cast detail:", err);
    res.status(500).send("Internal Server Error");
  }
};

export const getMovieDetail = async (req, res) => {
  try {
    const movieId = req.params.id;
    const [movie, allMovies, comments] = await Promise.all([
      Movie.findById(movieId).populate('cast'),
      Movie.find(),
      Comment.find({ movie: movieId }).populate('user', 'name')
    ]);

    if (!movie) {
      return res.status(404).render("pages/404");
    }

    // Find related movies (same genre or cast)
    const relatedMovies = allMovies.filter(m => 
      m._id.toString() !== movieId && 
      (m.genre === movie.genre || m.cast.some(c => movie.cast.includes(c)))
    ).slice(0, 8); // Limit to 8 related movies

    let isFavorite = false;
    // Only check favorites if user is logged in
    if (req.user) {
      const user = await User.findById(req.user.id).populate('favorites');
      isFavorite = user && user.favorites && user.favorites.some(favMovie => favMovie._id.toString() === movieId);
    }

    res.render("pages/movie", {
      movie,
      relatedMovies,
      comments,
      isFavorite,
      user: req.user || null
    });
  } catch (err) {
    console.error("Error fetching movie detail:", err);
    res.status(500).send("Internal Server Error");
  }
};

export const getMyList = async (req, res) => {
  try {
    if (!req.user) {
      return res.redirect('/login');
    }

    const user = await User.findById(req.user.id)
      .populate('watchlist')
      .populate('favorites');

    if (!user) {
      return res.status(404).send("User not found");
    }

    res.render("pages/mylist", {
      watchlist: user.watchlist || [],
      favorites: user.favorites || [],
      user: req.user
    });
  } catch (err) {
    console.error("Error fetching user's list:", err);
    res.status(500).send("Internal Server Error");
  }
};

export const getProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.redirect('/login');
    }

    const user = await User.findById(req.user.id)
      .populate('watchlist')
      .populate('favorites')
      .populate('favoriteCasts');

    if (!user) {
      return res.status(404).send("User not found");
    }

    // Get user's comments
    const comments = await Comment.find({ user: user._id })
      .populate('movie', 'title posterURL')
      .sort({ createdAt: -1 });

    res.render("pages/profile", {
      user,
      watchlist: user.watchlist || [],
      favorites: user.favorites || [],
      favoriteCasts: user.favoriteCasts || [],
      comments,
      isOwnProfile: true
    });
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).send("Internal Server Error");
  }
};