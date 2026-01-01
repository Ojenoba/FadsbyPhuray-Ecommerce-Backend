import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return Response.json(
        { success: false, error: "User ID required" },
        { status: 400 },
      );
    }

    const wishlist = await sql`
      SELECT 
        w.id,
        w.product_id,
        p.name,
        p.description,
        p.price,
        p.image_url,
        p.category,
        p.average_rating,
        p.rating_count,
        w.created_at
      FROM wishlist w
      JOIN products p ON w.product_id = p.id
      WHERE w.user_id = ${userId}
      ORDER BY w.created_at DESC
    `;

    return Response.json({ success: true, wishlist });
  } catch (error) {
    console.error("Get wishlist error:", error);
    return Response.json(
      { success: false, error: "Failed to fetch wishlist" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { user_id, product_id } = body;

    if (!user_id || !product_id) {
      return Response.json(
        { success: false, error: "User ID and Product ID required" },
        { status: 400 },
      );
    }

    const result = await sql`
      INSERT INTO wishlist (user_id, product_id)
      VALUES (${user_id}, ${product_id})
      ON CONFLICT (user_id, product_id) DO NOTHING
      RETURNING *
    `;

    return Response.json({
      success: true,
      item: result[0] || { user_id, product_id },
    });
  } catch (error) {
    console.error("Add to wishlist error:", error);
    return Response.json(
      { success: false, error: "Failed to add to wishlist" },
      { status: 500 },
    );
  }
}
