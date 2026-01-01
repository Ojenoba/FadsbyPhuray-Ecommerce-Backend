// src/app/api/announcements/route.js   ← FINAL BULLETPROOF VERSION
import sql from "@/app/api/utils/sql";

import sql from "@/app/api/utils/sql";

export async function GET() {
  try {
    const announcements = await sql`
      SELECT * FROM announcements 
      WHERE is_active = true 
      ORDER BY created_at DESC 
      LIMIT 5
    `;
    return new Response(JSON.stringify({ announcements: announcements || [] }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ announcements: [] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function POST(request) {
  try {
    const { title, content } = await request.json();

    if (!title || !content) {
      return new Response(JSON.stringify({ error: "Title and content required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const result = await sql`
      INSERT INTO announcements (title, content, is_active)
      VALUES (${title}, ${content}, true)
      RETURNING *
    `;

    return new Response(JSON.stringify({ announcement: result[0] }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("POST /api/announcements error:", error);
    return new Response(JSON.stringify({ error: "Failed to create announcement" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}