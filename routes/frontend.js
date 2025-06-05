import express from "express";
import UserModel from "../models/user.js";
import jwt from "jsonwebtoken";
import auth from "../middleware/auth.js";
import {
  getIndex,
  getcontact,
  getlogin,
  getmovies,
  getprofile,
  getseries,
  getsignup,
  getsettings,
  getAdmin,
  getfrogetpassword,
  getEditUser,
  getAddUser,
  get2fa,
  getAddMovie,
  getEditMovie,
  getAddCast, 
  getEditCast,
} from "../controllers/frontend.js";
import { getWatchlist } from "../controllers/mylist.js";
import { getMovieById } from "../controllers/movie.js";

const router = express.Router();

// Middleware to check for user authentication
router.use(async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      res.locals.user = null; // No user found
      return next();
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    res.locals.user = await UserModel.findById(decoded.id);
    next();
  } catch (error) {
    next();
  }
});

// Existing routes
router.get("/", getIndex);
router.get("/contact", getcontact);
router.get("/movies", getmovies);
router.get("/mylist", auth(), getWatchlist);
router.get("/series", getseries);
router.get("/settings", getsettings);
router.get("/login", getlogin);
router.get("/signup", getsignup);
router.get("/2fapage", get2fa);
router.get("/forgetpassword", getfrogetpassword);
router.get("/admin/:id", auth(["admin"]), getAdmin);
router.get("/addMovie", auth(["admin"]), getAddMovie);
router.get("/adduser", auth(["admin"]), getAddUser);
router.get("/profile/:id", auth(["admin", "user"]), getprofile);
router.get("/editmovie/:id", auth(["admin"]), getEditMovie);
router.get("/edituser/:id", auth(["admin", "user"]), getEditUser);
router.get("/movies/:id", getMovieById);
router.get("/addcast", auth(["admin"]), getAddCast);
router.get("/editcast/:id", auth(["admin"]), getEditCast);
export default router;