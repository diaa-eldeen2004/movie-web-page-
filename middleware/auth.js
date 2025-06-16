import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const auth = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      // Check if user is logged in
      if (!req.user) {
        if (req.path.startsWith('/api/')) {
          return res.status(401).json({ message: "❌ Unauthorized: Please login" });
        }
        return res.redirect('/login');
      }

      // Get user from database to ensure role is current
      const user = await User.findById(req.user._id);
      if (!user) {
        if (req.path.startsWith('/api/')) {
          return res.status(401).json({ message: "❌ Unauthorized: User not found" });
        }
        return res.redirect('/login');
      }

      // If roles are defined, restrict access
      if (allowedRoles.length && !allowedRoles.includes(user.role)) {
        if (req.path.startsWith('/api/')) {
          return res.status(403).json({ message: "❌ Forbidden: Access denied" });
        }
        return res.status(404).render('pages/404');
      }

      // Add user to request object
      req.user = user;
      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      if (req.path.startsWith('/api/')) {
        return res.status(500).json({ message: "❌ Server error" });
      }
      return res.status(404).render('pages/404');
    }
  };
};

// Create isAuthenticated middleware (no role restrictions)
export const isAuthenticated = auth();

export default auth;