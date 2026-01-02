// src/controllers/authController.js
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import { User } from "../models/User.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const isProd = process.env.NODE_ENV === "production";

// Utility: generate JWT
const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET must be defined in .env");
  }
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || "7d" }
  );
};

// Utility: set auth cookie
const setAuthCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: isProd,     // ✅ must be true in production
    sameSite: "none",   // ✅ allow cross-site cookies (Netlify → Render)
    path: "/",          // ✅ ensure cookie applies site-wide
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// 🔑 Admin login
export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const admin = await User.findOne({ email, role: "admin" }).select("+password");
  if (!admin) {
    return res.status(401).json({ success: false, error: "Invalid credentials" });
  }

  const isValid = await bcryptjs.compare(password, admin.password);
  if (!isValid) {
    return res.status(401).json({ success: false, error: "Invalid credentials" });
  }

  const token = generateToken(admin);
  setAuthCookie(res, token);

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

// 🔑 User registration
export const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  const existingUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existingUser) {
    return res.status(400).json({ success: false, error: "Username or email already exists" });
  }

  const user = new User({ username, email, password, role: "customer" });
  await user.save();

  const token = generateToken(user);
  setAuthCookie(res, token);

  res.status(201).json({
    success: true,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
  });
});

// 🔑 User login
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return res.status(401).json({ success: false, error: "Invalid credentials" });
  }

  const isValid = await user.comparePassword(password);
  if (!isValid) {
    return res.status(401).json({ success: false, error: "Invalid credentials" });
  }

  const token = generateToken(user);
  setAuthCookie(res, token);

  res.status(200).json({
    success: true,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
  });
});

// 🔓 Logout
export const logoutUser = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: isProd,
    sameSite: "none",
    path: "/", // ✅ clear cookie site-wide
  });
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

// 👤 Current user info
export const getMe = asyncHandler(async (req, res) => {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({ success: false, error: "No token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ success: false, error: "User not found" });
    }
    res.status(200).json({ success: true, user });
  } catch {
    return res.status(401).json({ success: false, error: "Invalid token" });
  }
});