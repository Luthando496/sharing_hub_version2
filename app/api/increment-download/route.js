import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request) {
  try {
    const { postId } = await request.json().catch(() => ({}));

    if (!postId || typeof postId !== "string" || !UUID.test(postId)) {
      return NextResponse.json({ error: "A valid post ID is required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { error } = await supabase.rpc("increment_download", {
      p_resource_id: postId,
    });
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error incrementing download count:", error);
    return NextResponse.json({ error: "Failed to increment download count" }, { status: 500 });
  }
}
