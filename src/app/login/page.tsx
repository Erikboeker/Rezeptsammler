"use client";

// ====================================================
// Login-Seite – Anmeldung mit Google (bevorzugt) oder
// E-Mail + Passwort als Fallback. Konten entstehen beim
// ersten Google-Login; danach wird die Registrierung im
// Supabase-Dashboard deaktiviert.
// ====================================================

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChefHat, Loader2, LogIn } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

/** Google-"G" als Inline-SVG (lucide hat kein Markenlogo) */
function GoogleLogo() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [passwort, setPasswort] = useState("");
  const [fehler, setFehler] = useState<string | null>(null);
  const [laedt, setLaedt] = useState(false);
  const [googleLaedt, setGoogleLaedt] = useState(false);

  // Fehlermeldung aus dem OAuth-Callback (?fehler=google) anzeigen
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("fehler") === "google") {
      setFehler("Google-Anmeldung fehlgeschlagen. Bitte erneut versuchen.");
    }
  }, []);

  async function handleGoogleLogin() {
    setFehler(null);
    setGoogleLaedt(true);
    try {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        setFehler(error.message);
        setGoogleLaedt(false);
      }
      // Bei Erfolg leitet der Browser zu Google weiter
    } catch {
      setFehler("Google-Anmeldung fehlgeschlagen. Bitte später erneut versuchen.");
      setGoogleLaedt(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setFehler(null);
    setLaedt(true);

    try {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: passwort,
      });

      if (error) {
        setFehler(
          error.message === "Invalid login credentials"
            ? "E-Mail oder Passwort ist falsch."
            : error.message
        );
        setLaedt(false);
        return;
      }

      router.push("/bibliothek");
      router.refresh();
    } catch {
      setFehler("Anmeldung fehlgeschlagen. Bitte später erneut versuchen.");
      setLaedt(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-primary/10">
            <ChefHat className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Anmelden</h1>
          <p className="text-sm text-muted-foreground">
            Melde dich an, um deine Rezepte zu sehen.
          </p>
        </div>

        {/* Google-Login (bevorzugt) */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLaedt}
          className="w-full flex items-center justify-center gap-2.5 border-2 py-2.5 px-4 rounded-lg font-medium hover:bg-muted transition-colors disabled:opacity-50"
        >
          {googleLaedt ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <GoogleLogo />
          )}
          Mit Google anmelden
        </button>

        {fehler && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm text-destructive">
            {fehler}
          </div>
        )}

        {/* Trenner */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="h-px bg-border flex-1" />
          oder mit Passwort
          <div className="h-px bg-border flex-1" />
        </div>

        {/* Fallback: E-Mail + Passwort */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">E-Mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              disabled={laedt}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Passwort</label>
            <input
              type="password"
              value={passwort}
              onChange={(e) => setPasswort(e.target.value)}
              autoComplete="current-password"
              disabled={laedt}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={laedt || !email || !passwort}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 px-4 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {laedt ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogIn className="h-4 w-4" />
            )}
            Anmelden
          </button>
        </form>
      </div>
    </div>
  );
}
