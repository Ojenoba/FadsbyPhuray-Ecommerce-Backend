import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import { User } from "../models/User.js";
import { asyncHandler } from "../middleware/errorHandler.js";

// Utility: generate JWT
const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET must be defined in .env");
  }
  return jwt.sign(
    { id: user._id, role: user.role }, // payload matches authMiddleware
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || "7d" }
  );
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

  res.status(200).json({
    success: true,
    token,
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

  res.status(201).json({
    success: true,
    token,
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

  res.status(200).json({
    success: true,
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
  });
});

// src/controllers/authController.js
export const logoutUser = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.status(200).json({ success: true, message: "Logged out successfully" });
};