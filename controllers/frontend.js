import UserModel from "../models/user.js";
import MovieModel from "../models/movie.js";
import CastModel from "../models/cast.js";

// Render the homepage with slider, trending, and new release movies
export const getIndex = async (req, res) => {
  try {
    const [sliderMovies, trendingMovies, newReleaseMovies] = await Promise.all([
      MovieModel.find({ isInSlider: true }).sort({ sliderPosition: 1 }).limit(3),
      MovieModel.find({ category: "trending" }),
      MovieModel.find({ category: "new release" }),
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
    const user = await UserModel.findById(userId);
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
export const getseries = (req, res) => {
  res.render("pages/series");
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
    const [users, allMovies, sliderMovies, allCast] = await Promise.all([
      UserModel.find(),
      MovieModel.find(),
      MovieModel.find({ isInSlider: true }).sort({ sliderPosition: 1 }),
      CastModel.find(), // Fetch all cast members
    ]);

    res.render("admin/admin", {
      arr: users,
      Movie: allMovies,
      sliderMovies,
      Cast: allCast, // Pass cast data to the template
    });
  } catch (err) {
    console.error("Error loading admin page:", err);
    res.status(500).send("Server Error");
  }
};

// Render the edit user page
export const getEditUser = async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id);
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
      MovieModel.findById(movieid),
      CastModel.find(),
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


export const getEditCast= async (req, res) => {
  try {
    const castid = req.params.id;
    const cast = await MovieModel.findById(castid);
    if (!cast) {
      return res.status(404).send("cast not found");
    }

    res.render("admin/editcast", { cast });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).send("Internal Server Error");
  }
};

