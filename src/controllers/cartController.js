import { Cart } from "../models/Cart.js";
import { asyncHandler } from "../middleware/errorHandler.js";

// GET cart items for logged-in user
export const getCart = asyncHandler(async (req, res) => {
  const cartItems = await Cart.find({ userId: req.user.id }).populate("productId");
  res.json({ success: true, cartItems });
});

// POST add product to cart
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user.id;

  const cartItem = new Cart({ userId, productId, quantity });
  await cartItem.save();

  res.status(201).json({ success: true, message: "Added to cart!", cartItem });
});