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
    return res.status(401).json({ success: false, error: "Invalid credentials" });
  }

  // ✅ Use model's comparePassword method
  const isValid = await admin.comparePassword(password);
  if (!isValid) {
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