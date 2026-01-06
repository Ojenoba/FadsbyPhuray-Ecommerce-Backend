import Product from "../models/Product.js";
import { asyncHandler } from "../middleware/errorHandler.js";

/**
 * CREATE a new product
 * POST /api/products
 */
export const createProduct = asyncHandler(async (req, res) => {
  // support multipart/form-data via multer: file available at req.file
  const productData = { ...(req.body || {}) };
  if (req.file) {
    const base = process.env.APP_URL || "";
    productData.image_url = `${base.replace(/\/$/, "")}/uploads/${req.file.filename}`;
  }
  if (productData.price) productData.price = Number(productData.price);
  if (productData.stock_quantity) productData.stock_quantity = Number(productData.stock_quantity);

  const product = new Product(productData);
  await product.save();

  res.status(201).json({ success: true, data: product });
});

/**
 * GET all products
 * GET /api/products
 */
export const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.status(200).json({
    success: true,
    data: products,
  });
});

/**
 * GET single product by ID or slug
 * GET /api/products/:idOrSlug
 */
export const getProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Try finding by ID first, then by slug
  let product = null;
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    product = await Product.findById(id);
  }
  if (!product) {
    product = await Product.findOne({ slug: id });
  }

  if (!product) {
    return res.status(404).json({
      success: false,
      error: "Product not found",
    });
  }

  res.status(200).json({
    success: true,
    data: product,
  });
});

/**
 * UPDATE product by ID
 * PUT /api/products/:id
 */
export const updateProduct = asyncHandler(async (req, res) => {
  const productData = { ...(req.body || {}) };
  if (req.file) {
    const base = process.env.APP_URL || "";
    productData.image_url = `${base.replace(/\/$/, "")}/uploads/${req.file.filename}`;
  }
  if (productData.price) productData.price = Number(productData.price);
  if (productData.stock_quantity) productData.stock_quantity = Number(productData.stock_quantity);

  const product = await Product.findByIdAndUpdate(req.params.id, productData, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    return res.status(404).json({
      success: false,
      error: "Product not found",
    });
  }

  res.status(200).json({
    success: true,
    data: product,
  });
});

/**
 * DELETE product by ID
 * DELETE /api/products/:id
 */
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      error: "Product not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Product deleted successfully",
  });
});

/**
 * SEARCH products by name or category
 * GET /api/products/search/:term
 */
export const searchProducts = asyncHandler(async (req, res) => {
  const regex = new RegExp(req.params.term, "i"); // case-insensitive
  const products = await Product.find({
    $or: [{ name: regex }, { category: regex }],
  });

  res.status(200).json({
    success: true,
    data: products,
  });
});

/**
 * GET related products (same category, excluding current product)
 * GET /api/products/:id/related
 */
export const getRelatedProducts = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Support both ID and slug
  let product = null;
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    product = await Product.findById(id);
  }
  if (!product) {
    product = await Product.findOne({ slug: id });
  }

  if (!product) {
    return res.status(404).json({
      success: false,
      error: "Product not found",
    });
  }

  const related = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
  }).limit(4);

  res.status(200).json({
    success: true,
    data: related,
  });
});