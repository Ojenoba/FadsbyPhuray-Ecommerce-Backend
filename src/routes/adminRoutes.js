import express from "express";
import rateLimit from "express-rate-limit";
import { adminLogin, logoutAdmin, getAdminMe } from "../controllers/adminController.js";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";

const router = express.Router();

/**
 * Rate limiter for admin login
 * Limits each IP to 10 requests per 15 minutes
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    success: false,
    error: "Too many admin login attempts, please try again later.",
  },
});

// 🔑 Admin login
router.post("/login", loginLimiter, adminLogin);

// 🔑 Admin logout
router.post("/logout", logoutAdmin);

// 👤 Current admin info (protected by middleware)
router.get("/me", authMiddleware, adminMiddleware, getAdminMe);

export default router;