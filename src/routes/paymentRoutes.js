// src/routes/paymentRoutes.js
import express from "express";
import { initiatePayment, verifyPayment } from "../controllers/paymentController.js";
import { flutterwaveWebhook } from "../controllers/webhookController.js";

const router = express.Router();

router.post("/initiate", initiatePayment);
router.get("/verify", verifyPayment);
router.post("/webhook/flutterwave", flutterwaveWebhook); // ✅ webhook route

export default router;