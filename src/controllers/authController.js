import jwt from "jsonwebtoken";               // ✅ add this
import { User } from "../models/User.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { generateToken } from "../utils/generateToken.js";
import { setAuthCookie, clearAuthCookie } from "../utils/setAuthCookie.js";

// User registration
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

  res.status(201).json({ success: true, user });
});

// User login
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  
  if (!user) {
    console.warn(`❌ Login failed: User not found for email: ${email}`);
    return res.status(401).json({ success: false, error: "Invalid credentials" });
  }
  
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    console.warn(`❌ Login failed: Invalid password for email: ${email}`);
    return res.status(401).json({ success: false, error: "Invalid credentials" });
  }

  const token = generateToken(user);
  setAuthCookie(res, token);

  console.log(`✅ Login successful for: ${email}`);
  res.status(200).json({ success: true, user: { id: user._id, username: user.username, email: user.email, role: user.role } });
});

// Logout
export const logoutUser = (req, res) => {
  clearAuthCookie(res);
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

// Current user info
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
  } catch (err){
    console.error("❌ JWT verify failed:", err.message);
    return res.status(401).json({ success: false, error: "Invalid token" });
  }
});