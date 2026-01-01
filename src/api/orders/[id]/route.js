import sql from "@/app/api/utils/sql";

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return Response.json(
        { success: false, error: "User ID required" },
        { status: 400 },
      );
    }

    // Get order with items
    const order = await sql`
      SELECT 
        o.id,
        o.user_id,
        o.total_amount,
        o.status,
        o.order_status,
        o.payment_reference,
        o.created_at,
        o.updated_at,
        o.shipped_at,
        o.delivered_at,
        ua.full_name,
        ua.phone_number,
        ua.street_address,
        ua.city,
        ua.state,
        ua.postal_code
      FROM orders o
      LEFT JOIN user_addresses ua ON o.shipping_address_id = ua.id
      WHERE o.id = ${id} AND o.user_id = ${userId}
    `;

    if (order.length === 0) {
      return Response.json(
        { success: false, error: "Order not found" },
        { status: 404 },
      );
    }

    // Get order items
    const items = await sql`
      SELECT 
        oi.id,
        oi.product_id,
        oi.quantity,
        oi.price,
        p.name,
        p.image_url
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ${id}
    `;

    // Get status history
    const history = await sql`
      SELECT * FROM order_status_history
      WHERE order_id = ${id}
      ORDER BY changed_at DESC
    `;

    return Response.json({
      success: true,
      order: {
        ...order[0],
        items,
        status_history: history,
      },
    });
  } catch (error) {
    console.error("Get order error:", error);
    return Response.json(
      { success: false, error: "Failed to fetch order" },
      { status: 500 },
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { user_id, order_status } = body;

    if (!user_id) {
      return Response.json(
        { success: false, error: "User ID required" },
        { status: 400 },
      );
    }

    // Check if order exists and belongs to user
    const order =
      await sql`SELECT * FROM orders WHERE id = ${id} AND user_id = ${user_id}`;
    if (order.length === 0) {
      return Response.json(
        { success: false, error: "Order not found" },
        { status: 404 },
      );
    }

    const updatedOrder = await sql`
      UPDATE orders
      SET order_status = ${order_status}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;

    // Log status change
    await sql`
      INSERT INTO order_status_history (order_id, status)
      VALUES (${id}, ${order_status})
    `;

    return Response.json({ success: true, order: updatedOrder[0] });
  } catch (error) {
    console.error("Update order error:", error);
    return Response.json(
      { success: false, error: "Failed to update order" },
      { status: 500 },
    );
  }
}
