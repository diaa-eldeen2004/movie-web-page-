import express from "express";
import connectDB from "./config/db.js";
import frontendRouter from "./routes/frontend.js";
import { PORT } from "./config/secrets.js";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import movieRoutes from "./routes/movie.js";
import sliderRoutes from "./routes/slider.js";
import mylistRoutes from "./routes/mylist.js";
import castRoutes from './routes/cast.js';
import commentRoutes from "./routes/comment.js";
import favoriteRoutes from "./routes/favorite.js";
import profileRoutes from "./routes/profile.js";
import searchRoutes from "./routes/search.js";
import contactRoutes from "./routes/contact.js";

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); //read the req.body
app.use(cookieParser()); // read the cookies
app.set("view engine", "ejs");
app.use(express.static("public"));

// Connect to database
connectDB();

// Mount routes with proper prefixes
app.use("/search", searchRoutes);
app.use(frontendRouter);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/slider", sliderRoutes);
app.use("/api/mylist", mylistRoutes);
app.use('/api/cast', castRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/profile", profileRoutes);
app.use("/admin", contactRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (req.xhr || req.headers.accept.includes('application/json')) {
    res.status(500).json({ message: "❌ Server error occurred" });
  } else {
    res.status(404).render("pages/404");
  }
});

// 404 handler - must be last
app.use((req, res) => {
  if (req.xhr || req.headers.accept.includes('application/json')) {
    res.status(404).json({ message: "❌ Route not found" });
  } else {
    res.render("pages/404");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
