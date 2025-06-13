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

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json()); //read the req.body
app.use(cookieParser()); // read the cookies
app.set("view engine", "ejs");
app.use(express.static("public"));

app.use(frontendRouter);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/slider", sliderRoutes);
app.use("/api/mylist", mylistRoutes);
app.use('/api/cast', castRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/favorites", favoriteRoutes);

app.use((req, res) => {
  res.render("pages/404");
});
// maijofnercpfo
connectDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
