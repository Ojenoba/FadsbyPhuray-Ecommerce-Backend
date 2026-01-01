import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return Response.json({ error: "User ID required" }, { status: 400 });
    }

    const orders = await sql`
      SELECT o.*, 
        (SELECT json_agg(json_build_object(
          'id', oi.id,
          'product_id', oi.product_id,
          'quantity', oi.quantity,
          'price', oi.price,
          'product_name', p.name
        )) FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = o.id) as items
      FROM orders o
      WHERE o.user_id = ${userId}
      ORDER BY o.created_at DESC
    `;

    return Response.json({ orders });
  } catch (error) {
    console.error("GET /api/orders error:", error);
    return Response.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { user_id, total_amount, wallet_amount_used } = body;

    if (!user_id || !total_amount || total_amount <= 0) {
      return Response.json(
        { error: "Invalid user_id or total amount" },
        { status: 400 },
      );
    }

    // Get user's cart
    const cartItems = await sql`
      SELECT ci.product_id, ci.quantity, p.price
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ${user_id}
    `;

    if (!cartItems || cartItems.length === 0) {
      return Response.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Create order
    const order = await sql`
      INSERT INTO orders (user_id, total_amount, status)
      VALUES (${user_id}, ${parseFloat(total_amount)}, 'pending')
      RETURNING *
    `;

    // Add order items
    for (const item of cartItems) {
      await sql`
        INSERT INTO order_items (order_id, product_id, quantity, price)
        VALUES (${order[0].id}, ${item.product_id}, ${item.quantity}, ${item.price})
      `;
    }

    // Clear cart
    await sql`DELETE FROM cart_items WHERE user_id = ${user_id}`;

    // Update wallet if used
    if (wallet_amount_used && wallet_amount_used > 0) {
      await sql`
        UPDATE user_wallets 
        SET balance = balance - ${parseFloat(wallet_amount_used)},
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ${user_id}
      `;

      await sql`
        INSERT INTO wallet_transactions (user_id, amount, transaction_type, reference_id, description)
        VALUES (${user_id}, ${parseFloat(wallet_amount_used)}, 'purchase_discount', ${order[0].id}, 'Discount applied to purchase')
      `;
    }

    return Response.json({ order: order[0] }, { status: 201 });
  } catch (error) {
    console.error("POST /api/orders error:", error);
    return Response.json({ error: "Failed to create order" }, { status: 500 });
  }
}
