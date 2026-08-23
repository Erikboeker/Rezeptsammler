// ====================================================
// Browser-seitiger Supabase-Client (Cookie-Session)
// Wird für Login/Logout in Client-Komponenten genutzt.
// ====================================================

import { createBrowserClient } from "@supabase/ssr";

export function createBrowserSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;
  return createBrowserClient(supabaseUrl, key);
}
