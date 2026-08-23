// ====================================================
// Middleware – Login-Schutz für die gesamte App
// Erneuert die Supabase-Session (Cookies) und leitet
// nicht eingeloggte Besucher auf /login um. API-Routen
// antworten stattdessen mit 401.
// ====================================================

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;

  const supabase = createServerClient(supabaseUrl, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Wichtig: getUser() validiert die Session gegen Supabase
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pfad = request.nextUrl.pathname;
  const istLoginSeite = pfad === "/login";
  const istApi = pfad.startsWith("/api");

  if (!user) {
    if (istApi) {
      return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
    }
    if (!istLoginSeite) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  } else if (istLoginSeite) {
    // Bereits eingeloggt → direkt zur Bibliothek
    const url = request.nextUrl.clone();
    url.pathname = "/bibliothek";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  // Alles außer statischen Dateien schützen
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
