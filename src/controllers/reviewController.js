import { Review } from "../models/Review.js";
import { asyncHandler } from "../middleware/errorHandler.js";

// GET reviews for a product
export const getReviews = asyncHandler(async (req, res) => {
  const { productId } = req.query;
  const reviews = await Review.find({ productId }).populate("userId", "username email");
  res.json({ success: true, reviews });
});

// POST a new review
export const addReview = asyncHandler(async (req, res) => {
  const { productId, rating, reviewText } = req.body;
  const userId = req.user.id; // comes from authMiddleware

  const review = new Review({ productId, userId, rating, review_text: reviewText });
  await review.save();

  res.status(201).json({ success: true, message: "Review submitted!", review });
});