import express from "express";
import rateLimit from "express-rate-limit";
import {
  registerUser,
  loginUser,
  logoutUser,
  adminLogin,
  getMe, // 👈 new controller we added
} from "../controllers/authController.js";
import { validate } from "../middleware/validate.js";
import { registerSchema, loginSchema } from "../validationSchemas.js";

const router = express.Router();

/**
 * Rate limiter for login endpoints
 * Limits each IP to 10 requests per 15 minutes
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    success: false,
    error: "Too many login attempts, please try again later.",
  },
});

// 🔑 Normal user signup
router.post("/signup", validate(registerSchema), registerUser);

// 🔑 Normal user login
router.post("/login", loginLimiter, validate(loginSchema), loginUser);

// 🔑 Admin login
router.post("/admin/login", loginLimiter, validate(loginSchema), adminLogin);

// 🔑 Normal user logout
router.post("/logout", logoutUser);

// 🔑 Current user info (reads JWT cookie, verifies, returns user)
router.get("/me", getMe);

export default router;