import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ExtraktionsErgebnis } from "@/lib/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const kategorie = searchParams.get("kategorie");
    const suche = searchParams.get("suche");

    const supabase = createServerSupabaseClient();

    let query = supabase
      .from("rezepte")
      .select("*, zutaten(*), schritte(*), naehrwerte(*)")
      .order("erstellt_am", { ascending: false });

    if (kategorie && kategorie !== "Alle") {
      query = query.eq("kategorie", kategorie);
    }
    if (suche) {
      query = query.ilike("titel", `%${suche}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Sortierung der Unterlisten
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rezepte = data?.map((r: any) => ({
      ...r,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      zutaten: r.zutaten?.sort((a: any, b: any) => a.reihenfolge - b.reihenfolge) ?? [],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      schritte: r.schritte?.sort((a: any, b: any) => a.nummer - b.nummer) ?? [],
    }));

    return NextResponse.json(rezepte);
  } catch (error) {
    console.error("Fehler beim Abrufen:", error);
    return NextResponse.json({ error: "Datenbankfehler" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ExtraktionsErgebnis;
    const supabase = createServerSupabaseClient();

    // Rezept anlegen
    const { data: rezept, error: rezeptError } = await supabase
      .from("rezepte")
      .insert({
        titel: body.titel,
        quelle_url: body.quelle_url ?? null,
        kategorie: body.kategorie,
        vorbereitungszeit: body.vorbereitungszeit ?? null,
        kochzeit: body.kochzeit ?? null,
        portionen: body.portionen ?? 4,
      })
      .select()
      .single();

    if (rezeptError) throw rezeptError;

    // Zutaten einfügen
    if (body.zutaten?.length > 0) {
      const { error: zutatenError } = await supabase.from("zutaten").insert(
        body.zutaten.map((z, i) => ({
          rezept_id: rezept.id,
          menge: String(z.menge),
          einheit: z.einheit,
          zutat: z.zutat,
          reihenfolge: i,
        }))
      );
      if (zutatenError) throw zutatenError;
    }

    // Schritte einfügen
    if (body.schritte?.length > 0) {
      const { error: schritteError } = await supabase.from("schritte").insert(
        body.schritte.map((schritt, i) => ({
          rezept_id: rezept.id,
          nummer: i + 1,
          text: typeof schritt === "string" ? schritt : (schritt as { text: string }).text,
        }))
      );
      if (schritteError) throw schritteError;
    }

    // Nährwerte einfügen
    if (body.naehrwerte) {
      await supabase.from("naehrwerte").insert({
        rezept_id: rezept.id,
        ...body.naehrwerte,
      });
    }

    return NextResponse.json(rezept, { status: 201 });
  } catch (error) {
    console.error("Fehler beim Speichern:", error);
    return NextResponse.json({ error: "Speicherfehler" }, { status: 500 });
  }
}
