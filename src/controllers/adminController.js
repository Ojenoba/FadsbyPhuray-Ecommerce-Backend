import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { generateToken } from "../utils/generateToken.js";
import { setAuthCookie, clearAuthCookie } from "../utils/setAuthCookie.js";

// 🔑 Admin login
export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find admin by email + role
  const admin = await User.findOne({ email, role: "admin" }).select("+password");
  if (!admin) {
    console.log("❌ Admin not found with email:", email);
    return res.status(401).json({ success: false, error: "Invalid credentials" });
  }

  // ✅ Use model's comparePassword method
  const isValid = await admin.comparePassword(password);
  if (!isValid) {
    console.log("❌ Invalid password for admin:", email);
    return res.status(401).json({ success: false, error: "Invalid credentials" });
  }

  // Generate JWT
  const token = generateToken(admin);

  // Set cookie with Partitioned attribute
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

// 🔓 Admin logout
export const logoutAdmin = (req, res) => {
  clearAuthCookie(res);
  res.status(200).json({ success: true, message: "Admin logged out successfully" });
};

// 👤 Current admin info
export const getAdminMe = asyncHandler(async (req, res) => {
  const token = req.cookies?.token;
  if (!token) {
    console.log("❌ No token found in cookies");
    return res.status(401).json({ success: false, error: "No token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Decoded payload:", decoded);

    const admin = await User.findById(decoded.id).select("-password");
    console.log("🔎 DB lookup result:", admin);

    if (!admin) {
      console.log("❌ Admin not found in DB");
      return res.status(401).json({ success: false, error: "User not found" });
    }

    if (admin.role !== "admin") {
      console.log("❌ Role mismatch:", admin.role);
      return res.status(403).json({ success: false, error: "Forbidden: not an admin" });
    }

    res.status(200).json({ success: true, user: admin });
  } catch (err) {
    console.error("❌ JWT verify failed:", err.message);
    return res.status(401).json({ success: false, error: "Invalid token" });
  }
});