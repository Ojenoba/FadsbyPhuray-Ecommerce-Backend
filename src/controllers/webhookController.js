// src/controllers/webhookController.js
import crypto from "crypto";

export const flutterwaveWebhook = async (req, res) => {
  try {
    const secretHash = process.env.FLUTTERWAVE_SECRET_HASH; // set in your dashboard
    const signature = req.headers["verif-hash"];

    // ✅ Verify request came from Flutterwave
    if (!signature || signature !== secretHash) {
      return res.status(401).json({ error: "Invalid signature" });
    }

    const payload = req.body;
    console.log("Webhook payload:", payload);

    if (payload.status === "successful") {
      const txRef = payload.tx_ref;
      const transactionId = payload.id;

      // ✅ Update order/payment in DB
      // Example:
      // await Order.findOneAndUpdate({ txRef }, { status: "paid", transactionId });

      console.log(`Payment verified via webhook: ${txRef}`);
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("Webhook error:", err);
    res.sendStatus(500);
  }
};