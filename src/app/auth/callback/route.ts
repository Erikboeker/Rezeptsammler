// ====================================================
// OAuth-Callback: /auth/callback
// Google leitet nach dem Login hierher zurück; der
// mitgelieferte Code wird gegen eine Session getauscht.
// ====================================================

import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}/bibliothek`);
    }
    console.error("OAuth-Callback fehlgeschlagen:", error.message);
  }

  return NextResponse.redirect(`${origin}/login?fehler=google`);
}
