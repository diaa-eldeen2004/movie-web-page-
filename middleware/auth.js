import jwt from "jsonwebtoken";
import User from "../models/user.js";

const auth = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      const token = req.cookies?.jwt;

      if (!token) {
        if (req.path.startsWith('/api/')) {
          return res.status(401).json({ message: "❌ Authentication required" });
        }
        return res.redirect("/login");
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      
      if (!user) {
        res.clearCookie("jwt");
        if (req.path.startsWith('/api/')) {
          return res.status(401).json({ message: "❌ User not found" });
        }
        return res.redirect("/login");
      }

      req.user = user;
      res.locals.user = user;

      // If roles are defined, restrict access
      if (allowedRoles.length && !allowedRoles.includes(user.role)) {
        if (req.path.startsWith('/api/')) {
          return res.status(403).json({ message: "❌ Forbidden: Access denied" });
        }
        return res.status(403).send("Forbidden: Access denied");
      }

      next();
    } catch (error) {
      res.clearCookie("jwt");
      if (req.path.startsWith('/api/')) {
        return res.status(401).json({ message: "❌ Invalid or expired token" });
      }
      return res.redirect("/login");
    }
  };
};

// Create isAuthenticated middleware (no role restrictions)
export const isAuthenticated = auth();

export default auth;