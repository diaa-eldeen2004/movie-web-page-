import jwt from "jsonwebtoken";
import User from "../models/user.js";

const auth = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      const token = req.cookies?.jwt;

      if (!token) {
        return res.redirect("/login");
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      
      if (!user) {
        res.clearCookie("jwt");
        return res.redirect("/login");
      }

      req.user = user;
      res.locals.user = user;

      // If roles are defined, restrict access
      if (allowedRoles.length && !allowedRoles.includes(user.role)) {
        return res.status(403).json({ message: "Forbidden: Access denied" });
      }

      next();
    } catch (error) {
      res.clearCookie("jwt");
      res.redirect("/login");
    }
  };
};

export default auth;