import express from "express";
import { validate } from "../middleware/validate.js";
import { orderSchema } from "../validationSchemas.js";

import {
  getOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  markOrderShipped,
  cancelOrder,
} from "../controllers/orderController.js";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";

const router = express.Router();

// Customer routes
router.post("/", authMiddleware, validate(orderSchema), createOrder); // require login to place order

// Admin-only routes
router.get("/", authMiddleware, adminMiddleware, getOrders);
router.get("/:id", authMiddleware, adminMiddleware, getOrder);
router.patch("/:id/status", authMiddleware, adminMiddleware, updateOrderStatus);
router.patch("/:id/ship", authMiddleware, adminMiddleware, markOrderShipped);
router.patch("/:id/cancel", authMiddleware, adminMiddleware, cancelOrder);

export default router;