import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return Response.json({ error: "User ID required" }, { status: 400 });
    }

    let wallet = await sql`
      SELECT * FROM user_wallets WHERE user_id = ${userId}
    `;

    if (!wallet || wallet.length === 0) {
      // Create wallet if doesn't exist
      wallet = await sql`
        INSERT INTO user_wallets (user_id, balance)
        VALUES (${userId}, 0)
        RETURNING *
      `;
    }

    return Response.json({ wallet: wallet[0] });
  } catch (error) {
    console.error("GET /api/wallet error:", error);
    return Response.json({ error: "Failed to fetch wallet" }, { status: 500 });
  }
}
