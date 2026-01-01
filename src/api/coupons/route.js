export async function POST(request) {
  try {
    const { couponCode } = await request.json();

    if (!couponCode) {
      return Response.json({
        valid: false,
        message: "Coupon code is required",
      });
    }

    // Simple coupon validation - you can customize this
    const validCoupons = {
      WELCOME10: { discount: 10, type: "percentage" },
      SAVE50: { discount: 50, type: "fixed" },
      SUMMER20: { discount: 20, type: "percentage" },
      FIRST: { discount: 15, type: "percentage" },
    };

    const coupon = validCoupons[couponCode.toUpperCase()];

    if (!coupon) {
      return Response.json({ valid: false, message: "Invalid coupon code" });
    }

    return Response.json({
      valid: true,
      message: "Coupon applied successfully",
      discount: coupon.discount,
      type: coupon.type,
    });
  } catch (error) {
    console.error("Error validating coupon:", error);
    return Response.json({ valid: false, message: "Error validating coupon" });
  }
}
