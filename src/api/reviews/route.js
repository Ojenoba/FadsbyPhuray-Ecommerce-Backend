import sql from "@/app/api/utils/sql";

// GET reviews
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return Response.json({ success: false, error: "Product ID required" }, { status: 400 });
    }

    const reviews = await sql`
      SELECT 
        pr.id,
        pr.rating,
        pr.review_text,
        pr.created_at,
        au.name,
        au.email
      FROM product_reviews pr
      JOIN auth_users au ON pr.user_id = au.id
      WHERE pr.product_id = ${productId}
      ORDER BY pr.created_at DESC
    `;

    return Response.json({ success: true, reviews });
  } catch (error) {
    console.error("GET /api/reviews error:", error);
    return Response.json({ success: false, error: "Failed to fetch reviews" }, { status: 500 });
  }
}

// POST review
export async function POST(request) {
  try {
    const body = await request.json();
    const { user_id, productId, rating, reviewText } = body;

    if (!user_id || !productId || !rating || rating < 1 || rating > 5) {
      return Response.json({ success: false, error: "Invalid review data" }, { status: 400 });
    }

    const review = await sql`
      INSERT INTO product_reviews (product_id, user_id, rating, review_text, created_at)
      VALUES (${productId}, ${user_id}, ${rating}, ${reviewText || null}, NOW())
      RETURNING *
    `;

    const stats = await sql`
      SELECT AVG(rating)::numeric(3,2) as avg_rating, COUNT(*) as count
      FROM product_reviews
      WHERE product_id = ${productId}
    `;

    await sql`
      UPDATE products
      SET average_rating = ${stats[0].avg_rating}, rating_count = ${stats[0].count}
      WHERE id = ${productId}
    `;

    return Response.json({ success: true, review: review[0] });
  } catch (error) {
    console.error("POST /api/reviews error:", error);
    return Response.json({ success: false, error: "Failed to create review" }, { status: 500 });
  }
}