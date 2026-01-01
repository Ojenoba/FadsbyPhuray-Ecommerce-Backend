// src/app/api/payments/verify/route.js
"use server";

import Flutterwave from "flutterwave-node-v3";
import dbConnect from "@/lib/dbConnect";       // your DB connection helper
import Order from "@/models/Order";            // your Order model

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const transactionId = searchParams.get("transaction_id");

    if (!transactionId) {
      return new Response(
        JSON.stringify({ status: "error", message: "Missing transaction_id" }),
        { status: 400 }
      );
    }

    // ✅ Initialize Flutterwave SDK
    const flw = new Flutterwave(
      process.env.FLUTTERWAVE_PUBLIC_KEY,
      process.env.FLUTTERWAVE_SECRET_KEY
    );

    // ✅ Verify transaction
    const response = await flw.Transaction.verify({ id: transactionId });

    if (response.status === "success" && response.data.status === "successful") {
      // ✅ Connect to DB
      await dbConnect();

      // ✅ Find and update order by tx_ref
      const order = await Order.findOneAndUpdate(
        { tx_ref: response.data.tx_ref },
        {
          status: "paid",
          paymentId: response.data.id,
          paymentData: response.data,
        },
        { new: true }
      );

      return new Response(
        JSON.stringify({
          status: "success",
          message: "Payment verified and order updated",
          order,
        }),
        { status: 200 }
      );
    } else {
      return new Response(
        JSON.stringify({
          status: "error",
          message: "Payment verification failed",
          data: response.data,
        }),
        { status: 400 }
      );
    }
  } catch (err) {
    console.error("Payment verification error:", err);
    return new Response(
      JSON.stringify({ status: "error", message: "Server error verifying payment" }),
      { status: 500 }
    );
  }
}