// src/controllers/adminController.js
import { User } from "../models/User.js";
import jwt from "jsonwebtoken";

const isProd = process.env.NODE_ENV === "production";

export const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ success: false, error: "Admin access required" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // ✅ Set cookie so /me can read it
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProd,       // must be true in production
      sameSite: "none",     // allow cross-site cookies
      path: "/",            // ensure cookie is valid for all routes
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    return res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

export const logoutAdmin = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: isProd,
    sameSite: "none",
    path: "/", // clear cookie across all routes
  });
  res.status(200).json({ success: true, message: "Admin logged out successfully" });
};