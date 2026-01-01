import { Wishlist } from "../models/Wishlist.js";
import { asyncHandler } from "../middleware/errorHandler.js";

// GET wishlist items
export const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.find({ userId: req.user.id }).populate("productId");
  res.json({ success: true, wishlist });
});

// POST add product to wishlist
export const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const userId = req.user.id;

  const item = new Wishlist({ userId, productId });
  await item.save();

  res.status(201).json({ success: true, message: "Added to wishlist!", item });
});

// DELETE remove product from wishlist
export const removeFromWishlist = asyncHandler(async (req, res) => {
  await Wishlist.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Removed from wishlist!" });
});