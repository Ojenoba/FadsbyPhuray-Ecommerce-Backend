import sql from "@/app/api/utils/sql";

// Generate a unique referral code
function generateReferralCode() {
  return "REF" + Math.random().toString(36).substring(2, 10).toUpperCase();
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return Response.json({ error: "User ID required" }, { status: 400 });
    }

    // Get user's referral code
    let referral = await sql`
      SELECT * FROM referrals WHERE referrer_id = ${userId} LIMIT 1
    `;

    if (!referral || referral.length === 0) {
      // Create referral if doesn't exist
      const code = generateReferralCode();
      referral = await sql`
        INSERT INTO referrals (referrer_id, referral_code)
        VALUES (${userId}, ${code})
        RETURNING *
      `;
    }

    // Get all referrals made by this user
    const referrals = await sql`
      SELECT r.*, u.name as referred_user_name, u.email as referred_user_email
      FROM referrals r
      LEFT JOIN auth_users u ON r.referred_user_id = u.id
      WHERE r.referrer_id = ${userId}
      ORDER BY r.created_at DESC
    `;

    return Response.json({
      referralCode: referral[0]?.referral_code,
      referrals,
    });
  } catch (error) {
    console.error("GET /api/referrals error:", error);
    return Response.json(
      { error: "Failed to fetch referrals" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { user_id, referral_code } = body;

    if (!user_id || !referral_code) {
      return Response.json(
        { error: "User ID and referral code are required" },
        { status: 400 },
      );
    }

    // Find the referrer
    const referral = await sql`
      SELECT * FROM referrals WHERE referral_code = ${referral_code} LIMIT 1
    `;

    if (!referral || referral.length === 0) {
      return Response.json({ error: "Invalid referral code" }, { status: 404 });
    }

    // Update the referral to link the referred user
    const updated = await sql`
      UPDATE referrals 
      SET referred_user_id = ${user_id}
      WHERE referral_code = ${referral_code}
      RETURNING *
    `;

    return Response.json({ referral: updated[0] });
  } catch (error) {
    console.error("POST /api/referrals error:", error);
    return Response.json(
      { error: "Failed to apply referral" },
      { status: 500 },
    );
  }
}
