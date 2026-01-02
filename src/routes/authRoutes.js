// src/routes/authRoutes.js
import express from "express";
import rateLimit from "express-rate-limit";
import {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
} from "../controllers/authController.js";
import { validate } from "../middleware/validate.js";
import { registerSchema, loginSchema } from "../validationSchemas.js";

const router = express.Router();

/**
 * Rate limiter for login endpoints
 * Limits each IP to 10 requests per 15 minutes
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
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

// 🔑 Normal user logout
router.post("/logout", logoutUser);

// 🔑 Current user info
router.get("/me", getMe);

export default router;