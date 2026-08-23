// ====================================================
// API-Route: /api/rezepte/export
// GET – Liefert alle Rezepte inkl. Zutaten, Schritten und
// Nährwerten als herunterladbare JSON-Datei (Backup).
// ====================================================

import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from("rezepte")
      .select("*, zutaten(*), schritte(*), naehrwerte(*)")
      .order("erstellt_am", { ascending: true });

    if (error) throw error;

    // Unterlisten deterministisch sortieren (wie in den übrigen Routen)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rezepte = (data ?? []).map((r: any) => ({
      ...r,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      zutaten: r.zutaten?.sort((a: any, b: any) => a.reihenfolge - b.reihenfolge) ?? [],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      schritte: r.schritte?.sort((a: any, b: any) => a.nummer - b.nummer) ?? [],
    }));

    const exportObjekt = {
      format: "rezeptsammler-export",
      version: 1,
      exportiert_am: new Date().toISOString(),
      anzahl: rezepte.length,
      rezepte,
    };

    const dateiname = `rezepte-export-${new Date().toISOString().slice(0, 10)}.json`;

    return new NextResponse(JSON.stringify(exportObjekt, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${dateiname}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Fehler beim Export:", error);
    return NextResponse.json({ error: "Export fehlgeschlagen" }, { status: 500 });
  }
}
