import express from "express";
import Product from "../models/Product.js"; // ✅ Mongoose model

const router = express.Router();

/**
 * GET all products
 * /api/products
 */
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json({ success: true, data: products });
  } catch (error) {
    console.error("GET /api/products error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch products" });
  }
});

/**
 * GET product by ID
 * /api/products/:id
 */
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    console.error("GET /api/products/:id error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch product" });
  }
});

/**
 * SEARCH products by name or category
 * /api/products/search/:term
 */
router.get("/search/:term", async (req, res) => {
  try {
    const regex = new RegExp(req.params.term, "i"); // case-insensitive
    const products = await Product.find({
      $or: [{ name: regex }, { category: regex }],
    });
    res.json({ success: true, data: products });
  } catch (error) {
    console.error("GET /api/products/search error:", error);
    res.status(500).json({ success: false, error: "Search failed" });
  }
});

/**
 * GET related products (same category, excluding current product)
 * /api/products/:id/related
 */
router.get("/:id/related", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }

    const related = await Product.find({
      category: product.category,
      _id: { $ne: product._id }, // exclude current product
    }).limit(4);

    res.json({ success: true, data: related });
  } catch (error) {
    console.error("GET /api/products/:id/related error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch related products" });
  }
});

/**
 * CREATE a new product
 * /api/products
 */
router.post("/", async (req, res) => {
  try {
    const { name, description, price, image_url, category, stock_quantity } = req.body;

    if (!name || !price) {
      return res.status(400).json({ success: false, error: "Name and price are required" });
    }

    const product = new Product({
      name,
      description,
      price,
      image_url,
      category,
      stock_quantity,
    });

    const savedProduct = await product.save();
    res.status(201).json({ success: true, data: savedProduct });
  } catch (error) {
    console.error("POST /api/products error:", error);
    res.status(500).json({ success: false, error: "Failed to create product" });
  }
});

export default router;