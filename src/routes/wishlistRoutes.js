// src/routes/wishlistRoutes.js
import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import { getWishlist, addToWishlist, removeFromWishlist } from "../controllers/wishlistController.js";

const router = express.Router();

router.get("/", authMiddleware, getWishlist);
router.post("/", authMiddleware, addToWishlist);
router.delete("/:id", authMiddleware, removeFromWishlist);

export default router;   // <-- important: default export