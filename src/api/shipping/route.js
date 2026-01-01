import sql from "@/app/api/utils/sql";

export async function GET() {
  try {
    // Default shipping rates if none exist in database
    const defaultRates = [
      {
        id: 1,
        region: "Lagos Express",
        rate_name: "Lagos Express Delivery",
        cost: 8000,
        description: "1-2 Working Days",
        is_active: true,
      },
      {
        id: 2,
        region: "Lagos",
        rate_name: "Within Lagos Delivery",
        cost: 6500,
        description: "3-5 Working Days",
        is_active: true,
      },
      {
        id: 3,
        region: "Interstate Bus",
        rate_name: "Interstate Delivery (Bus Garages Pick-up)",
        cost: 5500,
        description: "4-7 Working Days",
        is_active: true,
      },
      {
        id: 4,
        region: "Interstate Door",
        rate_name: "Interstate Delivery (Doorstep Delivery)",
        cost: 9000,
        description: "4-7 Working Days",
        is_active: true,
      },
    ];

    try {
      // Try to get rates from database first
      const rates =
        await sql`SELECT * FROM shipping_rates WHERE is_active = true ORDER BY cost ASC`;

      if (rates.length > 0) {
        return Response.json({ success: true, rates });
      } else {
        // Return default rates if no custom rates in database
        return Response.json({ success: true, rates: defaultRates });
      }
    } catch (dbError) {
      console.log("Database shipping rates not available, using defaults");
      return Response.json({ success: true, rates: defaultRates });
    }
  } catch (error) {
    console.error("Error fetching shipping rates:", error);
    return Response.json(
      { error: "Failed to fetch shipping rates" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const { region, rate_name, cost, description } = await request.json();

    if (!region || !rate_name || !cost) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const result = await sql`
      INSERT INTO shipping_rates (region, rate_name, cost, description, is_active)
      VALUES (${region}, ${rate_name}, ${cost}, ${description || ""}, true)
      RETURNING *
    `;

    return Response.json({ success: true, rate: result[0] });
  } catch (error) {
    console.error("Error creating shipping rate:", error);
    return Response.json(
      { error: "Failed to create shipping rate" },
      { status: 500 },
    );
  }
}
