// src/server.js
import dotenv from "dotenv";
dotenv.config({ path: "./.env" }); // load env first

import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import helmet from "helmet"; // extra security headers
import morgan from "morgan"; // logging
import cookieParser from "cookie-parser";

import { connectDB } from "./config/database.js";
import { errorHandler } from "./middleware/errorHandler.js";

// Routes
import announcementRoutes from "./routes/announcementRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import categoriesRouter from "./routes/categories.js";
import reviewRoutes from "./routes/reviewRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Parse multiple CORS origins from environment
const corsOrigins = (process.env.FRONTEND_URL || "http://localhost:3000")
  .split(",")
  .map((url) => url.trim());

console.log("🔒 CORS Origins:", corsOrigins); // Debug logging
console.log("🔒 NODE_ENV:", process.env.NODE_ENV);

app.set("trust proxy", 1);

// ✅ Allow multiple origins
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin || corsOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`⚠️ CORS rejected origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"],
  })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet()); // secure HTTP headers
app.use(morgan("dev")); // request logging
app.use(cookieParser());

// Serve uploaded files from /uploads
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.resolve(__dirname, "..", "..", "uploads");
try {
  fs.mkdirSync(uploadsDir, { recursive: true });
} catch (err) {
  console.error("Failed to create uploads directory:", err);
}
app.use("/uploads", express.static(uploadsDir));

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "Server is running" });
});

// ✅ API Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/categories", categoriesRouter);
app.use("/api/admin", adminRoutes);

// API index route
app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to the E-commerce API 🚀",
    endpoints: {
      auth: "/api/auth",
      products: "/api/products",
      orders: "/api/orders",
      wishlist: "/api/wishlist",
      cart: "/api/cart",
      reviews: "/api/reviews",
      health: "/api/health",
    },
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

// Global error handler
app.use(errorHandler);

// Server startup
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`\n🚀 Server running on port ${PORT}`);
      console.log(`📍 API: http://localhost:${PORT}/api`);
      console.log(
        `💻 Frontend: ${process.env.FRONTEND_URL || "http://localhost:3000"}`
      );
    });
  } catch (error) {
    console.error("❌ Server startup failed:", error);
    process.exit(1);
  }
};

startServer();

export default app;