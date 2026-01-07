import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
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

// Setup multer storage to save uploaded files to /uploads
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.resolve(__dirname, "..", "..", "uploads");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const safe = `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;
    cb(null, safe);
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

// ➕ Create a new product (supports image uploads)
router.post("/", upload.array("images", 8), createProduct);

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

// ✏️ Update product (supports image uploads)
router.put("/:id", upload.array("images", 8), updateProduct);

// ❌ Delete product
router.delete("/:id", deleteProduct);

export default router;