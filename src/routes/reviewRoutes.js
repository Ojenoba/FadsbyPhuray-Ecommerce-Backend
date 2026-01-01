import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import { getReviews, addReview } from "../controllers/reviewController.js";

const router = express.Router();

router.get("/", getReviews);
router.post("/", authMiddleware, addReview);

export default router;