import sql from "@/app/api/utils/sql";

export async function GET(request, { params: { id } }) {
  try {
    const product = await sql`SELECT category FROM products WHERE id = ${parseInt(id)}`;

    if (product.length === 0) {
      return Response.json({ success: true, products: [] });
    }

    const relatedProducts = await sql`
      SELECT id, name, price, image_url, category, average_rating, rating_count
      FROM products 
      WHERE category = ${product[0].category} AND id != ${parseInt(id)}
      ORDER BY created_at DESC
      LIMIT 6
    `;

    return Response.json({ success: true, products: relatedProducts || [] });
  } catch (error) {
    console.error("GET /api/products/related/:id error:", error);
    return Response.json({ success: false, products: [] }, { status: 500 });
  }
}