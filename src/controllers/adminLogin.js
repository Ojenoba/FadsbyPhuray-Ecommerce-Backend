// src/controllers/adminController.js
import bcryptjs from "bcryptjs";
import { User } from "../models/User.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { generateToken } from "../utils/generateToken.js";

export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find admin by email + role
  const admin = await User.findOne({ email, role: "admin" }).select("+password");
  if (!admin) {
    return res.status(401).json({ success: false, error: "Invalid credentials" });
  }

  // Compare password
  const isValid = await bcryptjs.compare(password, admin.password);
  if (!isValid) {
    return res.status(401).json({ success: false, error: "Invalid credentials" });
  }

  // Generate JWT
  const token = await generateToken(admin);

  // ✅ Set JWT in cookie so middleware can read it
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // only secure in prod
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    Path: "/",
  });

  // Return JSON for frontend context
  res.status(200).json({
    success: true,
    user: {
      id: admin._id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
    },
  });
});

// ✅ Logout clears cookie
export const logoutAdmin = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    path: "/", // clear cookie across all routes
  });
  res.status(200).json({ success: true, message: "Admin logged out successfully" });
};