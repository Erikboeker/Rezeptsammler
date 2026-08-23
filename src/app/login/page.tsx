"use client";

// ====================================================
// Login-Seite – Anmeldung mit E-Mail und Passwort
// Konten werden im Supabase-Dashboard angelegt,
// eine offene Registrierung gibt es bewusst nicht.
// ====================================================

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChefHat, Loader2, LogIn } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [passwort, setPasswort] = useState("");
  const [fehler, setFehler] = useState<string | null>(null);
  const [laedt, setLaedt] = useState(false);

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

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">E-Mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
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
              required
              disabled={laedt}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
            />
          </div>

          {fehler && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm text-destructive">
              {fehler}
            </div>
          )}

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
