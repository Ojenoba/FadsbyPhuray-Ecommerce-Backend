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

  // ✅ Set JWT in cookie with Partitioned attribute
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  // Manually append Partitioned attribute
  res.append(
    "Set-Cookie",
    `token=${token}; Path=/; HttpOnly; Secure; SameSite=None; Partitioned; Max-Age=${7 * 24 * 60 * 60}`
  );

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
    path: "/",
  });

  // Also append Partitioned clear
  res.append(
    "Set-Cookie",
    "token=; Path=/; HttpOnly; Secure; SameSite=None; Partitioned; Max-Age=0"
  );

  res.status(200).json({ success: true, message: "Admin logged out successfully" });
};