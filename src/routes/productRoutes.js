import express from "express";
import multer from "multer";
import path from "path";
import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getRelatedProducts,
} from "../controllers/productController.js";
import Product from "../models/Product.js"; // ✅ import Product for slug route
import { asyncHandler } from "../middleware/errorHandler.js"; // ✅ import asyncHandler

const router = express.Router();

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(process.cwd(), "uploads")),
  filename: (req, file, cb) => {
    const safeName = `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;
    cb(null, safeName);
  },
});
const upload = multer({ storage });

/**
 * Product Routes
 * Base URL: /api/products
 */

// 🔎 Search products
router.get("/search/:term", searchProducts);

// 📦 Get all products
router.get("/", getProducts);

// ➕ Create a new product (accept image file field named `image`)
router.post("/", upload.single("image"), createProduct);

// 📄 Get single product by slug (specific route first to avoid conflict with :id)
router.get("/slug/:slug", asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug });
  if (!product) {
    return res.status(404).json({ success: false, error: "Product not found" });
  }
  res.json({ success: true, data: product });
}));

// 📄 Get single product by ID
router.get("/:id", getProduct);

// 🔗 Get related products
router.get("/:id/related", getRelatedProducts);

// ✏️ Update product (accept image file field named `image`)
router.put("/:id", upload.single("image"), updateProduct);

// ❌ Delete product
router.delete("/:id", deleteProduct);

export default router;