import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import { getCart, addToCart } from "../controllers/cartController.js";

const router = express.Router();

router.get("/", authMiddleware, getCart);
router.post("/", authMiddleware, addToCart);

export default router;