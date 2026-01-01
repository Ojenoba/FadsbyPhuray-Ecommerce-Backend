// src/controllers/paymentController.js
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import axios from "axios";

// Initiate payment (Hosted Checkout)
export const initiatePayment = async (req, res) => {
  try {
    const { amount, email, name } = req.body;

    const response = await axios.post(
      "https://api.flutterwave.com/v3/payments",
      {
        tx_ref: Date.now().toString(),
        amount,
        currency: "NGN",
        redirect_url: `${process.env.APP_URL}/checkout/success`,
        customer: {
          email,
          name,
        },
        customizations: {
          title: "FADs by PHURAY",
          description: "Payment for items in cart",
          logo: `${process.env.APP_URL}/logo.png`,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // ✅ response.data will contain the checkout link
    res.json(response.data);
  } catch (err) {
    console.error("Flutterwave initiation error:", err.response?.data || err);
    res.status(500).json({ error: "Payment initiation failed" });
  }
};

// Verify payment after redirect
export const verifyPayment = async (req, res) => {
  try {
    const { transaction_id, tx_ref } = req.query; // Flutterwave sends these in redirect URL

    const response = await axios.get(
      `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        },
      }
    );

    if (response.data.status === "success" && response.data.data.status === "successful") {
      // ✅ Update order in DB here
      // Example: await Order.findOneAndUpdate({ txRef: tx_ref }, { status: "paid" });

      return res.json({
        success: true,
        message: "Payment verified successfully",
        data: response.data.data,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Payment not successful",
        data: response.data.data,
      });
    }
  } catch (err) {
    console.error("Flutterwave verification error:", err.response?.data || err);
    res.status(500).json({ success: false, message: "Verification failed" });
  }
};

// Webhook handler
export const flutterwaveWebhook = async (req, res) => {
  try {
    // ✅ Flutterwave sends events in req.body
    const payload = req.body;

    // 🔒 Verify the request came from Flutterwave
    const secretHash = process.env.FLUTTERWAVE_WEBHOOK_SECRET; // set in your dashboard
    const signature = req.headers["verif-hash"];

    if (!signature || signature !== secretHash) {
      return res.status(401).json({ success: false, message: "Invalid signature" });
    }

    // ✅ Handle event types
    if (payload.event === "charge.completed") {
      const txRef = payload.data.tx_ref;
      const status = payload.data.status;

      if (status === "successful") {
        // Update order in DB
        // Example: await Order.findOneAndUpdate({ txRef }, { status: "paid" });
        console.log(`✅ Payment successful for tx_ref: ${txRef}`);
      } else {
        console.log(`❌ Payment failed for tx_ref: ${txRef}`);
      }
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).json({ success: false });
  }
};