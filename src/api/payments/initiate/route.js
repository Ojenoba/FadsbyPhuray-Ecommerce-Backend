// src/app/api/payments/initiate/route.js
"use server";

import Flutterwave from "flutterwave-node-v3";

export async function POST(req) {
  try {
    const body = await req.json();
    const { amount, email, name, items } = body;

    if (!amount || !email) {
      return new Response(
        JSON.stringify({ status: "error", message: "Missing required fields" }),
        { status: 400 }
      );
    }

    // ✅ Initialize Flutterwave SDK
    const flw = new Flutterwave(
      process.env.FLUTTERWAVE_PUBLIC_KEY,
      process.env.FLUTTERWAVE_SECRET_KEY
    );

    // ✅ Create payment
    const response = await flw.PaymentInitiation.create({
      tx_ref: `txn-${Date.now()}`, // unique reference
      amount,
      currency: "NGN",
      redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/callback`,
      customer: {
        email,
        name,
      },
      meta: {
        cartItems: items || [], // optional: send cart items for record
      },
      customizations: {
        title: "FADs by PHURAY",
        description: "Payment for items in cart",
        logo: `${process.env.NEXT_PUBLIC_BASE_URL}/logo.png`,
      },
    });

    // ✅ Return Flutterwave response to frontend
    return new Response(JSON.stringify(response), { status: 200 });
  } catch (err) {
    console.error("Flutterwave error:", err);
    return new Response(
      JSON.stringify({ status: "error", message: "Payment initiation failed" }),
      { status: 500 }
    );
  }
}