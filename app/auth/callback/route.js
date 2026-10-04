import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Google / GitHub sign-in and email confirmation links land here.
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/resources";
  // only allow redirects to paths on this site
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/resources";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
