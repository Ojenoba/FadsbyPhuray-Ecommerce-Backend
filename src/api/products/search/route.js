import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("q") || "";
    const category = searchParams.get("category") || "";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const sort = searchParams.get("sort") || "name";

    let query = `SELECT * FROM products WHERE 1=1`;
    const params = [];
    let paramCount = 1;

    if (search) {
      query += ` AND (
        LOWER(name) LIKE LOWER($${paramCount}) OR 
        LOWER(description) LIKE LOWER($${paramCount})
      )`;
      params.push(`%${search}%`);
      paramCount++;
    }

    if (category) {
      query += ` AND LOWER(category) = LOWER($${paramCount})`;
      params.push(category);
      paramCount++;
    }

    if (minPrice) {
      query += ` AND price >= $${paramCount}`;
      params.push(parseFloat(minPrice));
      paramCount++;
    }

    if (maxPrice) {
      query += ` AND price <= $${paramCount}`;
      params.push(parseFloat(maxPrice));
      paramCount++;
    }

    if (sort === "price_asc") {
      query += ` ORDER BY price ASC`;
    } else if (sort === "price_desc") {
      query += ` ORDER BY price DESC`;
    } else if (sort === "rating") {
      query += ` ORDER BY average_rating DESC, rating_count DESC`;
    } else {
      query += ` ORDER BY name ASC`;
    }

    const products = await sql(query, params);

    return Response.json({
      success: true,
      products,
      count: products.length,
    });
  } catch (error) {
    console.error("Search error:", error);
    return Response.json(
      { success: false, error: "Failed to search products" },
      { status: 500 },
    );
  }
}
