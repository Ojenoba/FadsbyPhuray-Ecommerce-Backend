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

    const returns = await sql`
      SELECT 
        rr.id,
        rr.order_id,
        rr.order_item_id,
        rr.reason,
        rr.description,
        rr.status,
        rr.created_at,
        o.total_amount,
        oi.product_id,
        p.name as product_name,
        p.image_url
      FROM return_requests rr
      JOIN orders o ON rr.order_id = o.id
      JOIN order_items oi ON rr.order_item_id = oi.id
      JOIN products p ON oi.product_id = p.id
      WHERE o.user_id = ${userId}
      ORDER BY rr.created_at DESC
    `;

    return Response.json({ success: true, returns });
  } catch (error) {
    console.error("Get returns error:", error);
    return Response.json(
      { success: false, error: "Failed to fetch returns" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { user_id, order_id, order_item_id, reason, description } = body;

    if (!user_id || !order_id || !order_item_id || !reason) {
      return Response.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Verify order belongs to user
    const order =
      await sql`SELECT * FROM orders WHERE id = ${order_id} AND user_id = ${user_id}`;
    if (order.length === 0) {
      return Response.json(
        { success: false, error: "Order not found" },
        { status: 404 },
      );
    }

    const returnRequest = await sql`
      INSERT INTO return_requests (order_id, order_item_id, reason, description)
      VALUES (${order_id}, ${order_item_id}, ${reason}, ${description || null})
      RETURNING *
    `;

    return Response.json({ success: true, return: returnRequest[0] });
  } catch (error) {
    console.error("Create return error:", error);
    return Response.json(
      { success: false, error: "Failed to create return request" },
      { status: 500 },
    );
  }
}
