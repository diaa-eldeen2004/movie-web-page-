import express from "express";
import UserModel from "../models/user.js";
import jwt from "jsonwebtoken";
import auth from "../middleware/auth.js";
import {
  getIndex,
  getmovies,
  getALLCasts,
  getCastDetail,
  getMovieDetail,
  getMyList,
  getProfile,
  getContact,
  getlogin,
  getsignup,
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
      req.user = null;
      res.locals.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserModel.findById(decoded.id);
    
    if (user) {
      req.user = user;
      res.locals.user = user;
    } else {
      req.user = null;
      res.locals.user = null;
    }
    
    next();
  } catch (error) {
    req.user = null;
    res.locals.user = null;
    next();
  }
});

// Public routes
router.get("/", getIndex);
router.get("/movies", getmovies);
router.get("/casts", getALLCasts);
router.get("/cast/:id", getCastDetail);
router.get("/movie/:id", getMovieDetail);
router.get("/mylist", auth(), getMyList);
router.get("/profile", auth(), getProfile);
router.get("/contact", getContact);
router.get("/login", getlogin);
router.get("/signup", getsignup);
router.get("/forgetpassword", getfrogetpassword);
router.get("/2fa", get2fa);

// Protected routes
router.get("/admin/:id", auth(["admin"]), getAdmin);
router.get("/edituser/:id", auth(["admin"]), getEditUser);
router.get("/adduser", auth(["admin"]), getAddUser);
router.get("/addmovie", auth(["admin"]), getAddMovie);
router.get("/editmovie/:id", auth(["admin"]), getEditMovie);
router.get("/addcast", auth(["admin"]), getAddCast);
router.get("/editcast/:id", auth(["admin"]), getEditCast);

export default router;