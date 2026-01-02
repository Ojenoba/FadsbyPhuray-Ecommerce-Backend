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
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, error: "Invalid credentials" });
  }

  const token = generateToken(user);
  setAuthCookie(res, token);

  res.status(200).json({ success: true, user });
});

// Logout
export const logoutUser = (req, res) => {
  clearAuthCookie(res);
  res.status(200).json({ success: true, message: "Logged out successfully" });
};