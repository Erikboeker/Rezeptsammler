// ====================================================
// Server-seitiger Supabase-Client (Cookie-Session)
// Läuft mit dem Anon-Key und der Session des eingeloggten
// Nutzers – Row Level Security sorgt dafür, dass jeder nur
// seine eigenen Rezepte sieht. Der Service-Role-Key wird
// bewusst NICHT mehr verwendet.
// ====================================================

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createServerSupabaseClient() {
  const cookieStore = cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;

  return createServerClient(supabaseUrl, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // In Server Components dürfen keine Cookies gesetzt werden –
          // das Session-Refresh übernimmt dort die Middleware.
        }
      },
    },
    global: {
      fetch: (url, init) => fetch(url, { ...init, cache: "no-store" }),
    },
  });
}
