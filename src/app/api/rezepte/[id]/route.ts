// ====================================================
// API-Route: /api/rezepte/[id]
// GET, DELETE, PATCH (Felder-Update), PUT (vollständiges Update)
// ====================================================

import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// ── GET: Einzelnes Rezept mit allen verknüpften Daten laden ──
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from("rezepte")
      .select("*, zutaten(*), schritte(*), naehrwerte(*)")
      .eq("id", params.id)
      .single();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });

    return NextResponse.json({
      ...data,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      zutaten: data.zutaten?.sort((a: any, b: any) => a.reihenfolge - b.reihenfolge) ?? [],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      schritte: data.schritte?.sort((a: any, b: any) => a.nummer - b.nummer) ?? [],
    });
  } catch (error) {
    console.error("Fehler:", error);
    return NextResponse.json({ error: "Datenbankfehler" }, { status: 500 });
  }
}

// ── DELETE: Rezept vollständig löschen ──
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient();
    const { error } = await supabase
      .from("rezepte")
      .delete()
      .eq("id", params.id);

    if (error) throw error;
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Löschfehler:", error);
    return NextResponse.json({ error: "Löschfehler" }, { status: 500 });
  }
}

// ── PATCH: Einzelne Felder aktualisieren (z.B. Tags, Bewertung, Bilder) ──
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient();
    const body = await request.json();
    const { error } = await supabase
      .from("rezepte")
      .update(body)
      .eq("id", params.id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Updatefehler:", error);
    return NextResponse.json({ error: "Updatefehler" }, { status: 500 });
  }
}

// ── PUT: Vollständiges Rezept-Update (inkl. Zutaten, Schritte, Nährwerte) ──
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient();
    const body = await request.json();
    const { id } = params;

    // 1. Rezept-Kopfdaten aktualisieren
    const { error: rezeptFehler } = await supabase
      .from("rezepte")
      .update({
        titel: body.titel,
        quelle_url: body.quelle_url ?? null,
        tags: body.tags ?? [],
        kategorie: body.tags?.[0] ?? "Sonstiges",
        bild_url: body.bild_url ?? body.bilder_urls?.[0] ?? null,
        bilder_urls: body.bilder_urls ?? null,
        vorbereitungszeit: body.vorbereitungszeit ?? null,
        kochzeit: body.kochzeit ?? null,
        portionen: body.portionen ?? 4,
      })
      .eq("id", id);

    if (rezeptFehler) throw rezeptFehler;

    // 2. Alte Zutaten löschen und neu einfügen
    await supabase.from("zutaten").delete().eq("rezept_id", id);
    if (body.zutaten?.length > 0) {
      const { error: zutatenFehler } = await supabase.from("zutaten").insert(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        body.zutaten.map((z: any, i: number) => ({
          rezept_id: id,
          menge: String(z.menge),
          einheit: z.einheit,
          zutat: z.zutat,
          reihenfolge: i,
        }))
      );
      if (zutatenFehler) throw zutatenFehler;
    }

    // 3. Alte Schritte löschen und neu einfügen
    await supabase.from("schritte").delete().eq("rezept_id", id);
    if (body.schritte?.length > 0) {
      const { error: schritteFehler } = await supabase.from("schritte").insert(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        body.schritte.map((schritt: any, i: number) => ({
          rezept_id: id,
          nummer: i + 1,
          text: typeof schritt === "string" ? schritt : schritt.text,
        }))
      );
      if (schritteFehler) throw schritteFehler;
    }

    // 4. Nährwerte aktualisieren (Upsert: löschen + neu anlegen)
    await supabase.from("naehrwerte").delete().eq("rezept_id", id);
    if (body.naehrwerte) {
      await supabase.from("naehrwerte").insert({
        rezept_id: id,
        ...body.naehrwerte,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const meldung = error instanceof Error ? error.message : String(error);
    console.error("Vollständiger Update-Fehler:", meldung);
    return NextResponse.json({ error: "Updatefehler", detail: meldung }, { status: 500 });
  }
}
