import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

/**
 * General authentication middleware
 * Supports both cookies and Authorization headers
 */
export const authMiddleware = (req, res, next) => {
  // Check cookie first
  const cookieToken = req.cookies?.token;

  // Fallback to Authorization header
  const authHeader = req.headers.authorization;
  const headerToken =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

  const token = cookieToken || headerToken;

  if (!token) {
    return res
      .status(401)
      .json({ success: false, error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, error: "Invalid or expired token" });
  }
};

/**
 * Restrict access to admins only
 */
export const adminMiddleware = async (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res
      .status(403)
      .json({ success: false, error: "Admin access required" });
  }
  next();
};