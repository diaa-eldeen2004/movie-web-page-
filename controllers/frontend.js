import UserModel from "../models/user.js";
import MovieModel from "../models/movie.js";

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


export const getcontact = (req, res) => {
  res.render("pages/contact");
};
export const getmovies = (req, res) => {
  res.render("pages/movies");
};
export const getmylist = (req, res) => {
  res.render("pages/mylist");
};

export const getfrogetpassword = (req, res) => {
  res.render("pages/forgetpassword");
};

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
export const getseries = (req, res) => {
  res.render("pages/series");
};
export const getsignup = (req, res) => {
  res.render("pages/signup");
};

export const get2fa = (req, res) => {
  res.render("pages/2fapage");
};

export const getlogin = (req, res) => {
  res.render("pages/login");
};

export const getsettings = (req, res) => {
  res.render("pages/settings");
};
export const getAdmin = async (req, res) => {
  try {
    const [users, allMovies, sliderMovies] = await Promise.all([
      UserModel.find(),
      MovieModel.find(),
      MovieModel.find({ isInSlider: true }).sort({ sliderPosition: 1 }),
    ]);

    res.render("admin/admin", {
      arr: users,
      Movie: allMovies,
      sliderMovies,
    });
  } catch (err) {
    console.error("Error loading admin page:", err);
    res.status(500).send("Server Error");
  }
};


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

export const getAddUser = (req, res) => {
  res.render("admin/adduser");
};
export const getAddMovie = (req, res) => {
  res.render("admin/addMovie");
};

export const getEditMovie = async (req, res) => {
  try {
    const movieid = req.params.id;
    const movie = await MovieModel.findById(movieid);
    if (!movie) {
      return res.status(404).send("movie not found");
    }

    res.render("admin/editMovie", { movie });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).send("Internal Server Error");
  }
};

