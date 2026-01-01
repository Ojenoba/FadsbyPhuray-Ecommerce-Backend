import sql from "@/app/api/utils/sql";

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { user_id } = body;

    if (!user_id) {
      return Response.json(
        { success: false, error: "User ID required" },
        { status: 400 },
      );
    }

    // Verify ownership
    const existing =
      await sql`SELECT * FROM wishlist WHERE id = ${id} AND user_id = ${user_id}`;
    if (existing.length === 0) {
      return Response.json(
        { success: false, error: "Not found" },
        { status: 404 },
      );
    }

    await sql`DELETE FROM wishlist WHERE id = ${id}`;

    return Response.json({ success: true, message: "Removed from wishlist" });
  } catch (error) {
    console.error("Delete wishlist item error:", error);
    return Response.json(
      { success: false, error: "Failed to remove from wishlist" },
      { status: 500 },
    );
  }
}
