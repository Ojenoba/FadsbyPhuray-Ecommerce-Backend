import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return Response.json({ error: "User ID required" }, { status: 400 });
    }

    const withdrawals = await sql`
      SELECT * FROM withdrawal_requests
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;

    return Response.json({ withdrawals });
  } catch (error) {
    console.error("GET /api/withdrawals error:", error);
    return Response.json(
      { error: "Failed to fetch withdrawals" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      user_id,
      amount,
      bank_account_number,
      bank_code,
      bank_name,
      account_holder_name,
    } = body;

    if (
      !user_id ||
      !amount ||
      !bank_account_number ||
      !bank_code ||
      !bank_name ||
      !account_holder_name
    ) {
      return Response.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    // Check wallet balance
    const wallet = await sql`
      SELECT balance FROM user_wallets WHERE user_id = ${user_id}
    `;

    if (
      !wallet ||
      wallet.length === 0 ||
      wallet[0].balance < parseFloat(amount)
    ) {
      return Response.json(
        { error: "Insufficient wallet balance" },
        { status: 400 },
      );
    }

    // Create withdrawal request
    const withdrawal = await sql`
      INSERT INTO withdrawal_requests (
        user_id, amount, bank_account_number, bank_code, bank_name, account_holder_name
      )
      VALUES (
        ${user_id}, 
        ${parseFloat(amount)}, 
        ${bank_account_number},
        ${bank_code},
        ${bank_name},
        ${account_holder_name}
      )
      RETURNING *
    `;

    // Deduct from wallet immediately (with pending status)
    await sql`
      UPDATE user_wallets 
      SET balance = balance - ${parseFloat(amount)},
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ${user_id}
    `;

    // Record transaction
    await sql`
      INSERT INTO wallet_transactions (user_id, amount, transaction_type, reference_id, description)
      VALUES (${user_id}, ${parseFloat(amount)}, 'withdrawal_request', ${withdrawal[0].id}, 'Withdrawal request submitted')
    `;

    return Response.json({ withdrawal: withdrawal[0] }, { status: 201 });
  } catch (error) {
    console.error("POST /api/withdrawals error:", error);
    return Response.json(
      { error: "Failed to create withdrawal request" },
      { status: 500 },
    );
  }
}
