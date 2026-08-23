// ====================================================
// API-Route: /api/rezepte/import
// POST – Importiert Rezepte aus einer zuvor exportierten
// JSON-Datei. Bereits vorhandene Rezepte (gleiche ID)
// werden übersprungen, damit ein erneuter Import keine
// Duplikate erzeugt.
// ====================================================

import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Rezept } from "@/lib/types";

export const maxDuration = 60;

interface ImportPayload {
  format?: string;
  version?: number;
  rezepte?: Rezept[];
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ImportPayload | Rezept[];

    // Sowohl das Export-Format als auch ein nacktes Array akzeptieren
    const rezepte = Array.isArray(body) ? body : body.rezepte;
    if (!Array.isArray(rezepte) || rezepte.length === 0) {
      return NextResponse.json(
        { error: "Keine Rezepte in der Datei gefunden. Erwartet wird eine Export-Datei dieser App." },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Bereits vorhandene IDs in einer Abfrage ermitteln
    const mitId = rezepte.filter((r) => r.id);
    const { data: vorhandene, error: vorhandeneError } = mitId.length
      ? await supabase.from("rezepte").select("id").in("id", mitId.map((r) => r.id))
      : { data: [], error: null };
    if (vorhandeneError) throw vorhandeneError;
    const vorhandeneIds = new Set((vorhandene ?? []).map((r: { id: string }) => r.id));

    let importiert = 0;
    let uebersprungen = 0;
    const fehler: string[] = [];

    for (const rezept of rezepte) {
      if (!rezept.titel) {
        fehler.push("Eintrag ohne Titel übersprungen");
        continue;
      }
      if (rezept.id && vorhandeneIds.has(rezept.id)) {
        uebersprungen++;
        continue;
      }

      try {
        // Nur bekannte Spalten übernehmen (schützt vor Fremdfeldern in der Datei)
        const { data: neu, error: rezeptError } = await supabase
          .from("rezepte")
          .insert({
            ...(rezept.id ? { id: rezept.id } : {}),
            titel: rezept.titel,
            quelle_url: rezept.quelle_url ?? null,
            kategorie: rezept.kategorie ?? rezept.tags?.[0] ?? "Sonstiges",
            tags: rezept.tags ?? [],
            bewertung: rezept.bewertung ?? null,
            bild_url: rezept.bild_url ?? null,
            bilder_urls: rezept.bilder_urls ?? null,
            vorbereitungszeit: rezept.vorbereitungszeit ?? null,
            kochzeit: rezept.kochzeit ?? null,
            portionen: rezept.portionen ?? 4,
            ...(rezept.erstellt_am ? { erstellt_am: rezept.erstellt_am } : {}),
          })
          .select("id")
          .single();
        if (rezeptError) throw rezeptError;

        if (rezept.zutaten?.length) {
          const { error: zutatenError } = await supabase.from("zutaten").insert(
            rezept.zutaten.map((z, i) => ({
              rezept_id: neu.id,
              menge: z.menge != null ? String(z.menge) : null,
              einheit: z.einheit ?? null,
              zutat: z.zutat ?? "",
              reihenfolge: z.reihenfolge ?? i,
            }))
          );
          if (zutatenError) throw zutatenError;
        }

        if (rezept.schritte?.length) {
          const { error: schritteError } = await supabase.from("schritte").insert(
            rezept.schritte.map((s, i) => ({
              rezept_id: neu.id,
              nummer: typeof s === "string" ? i + 1 : s.nummer ?? i + 1,
              text: typeof s === "string" ? s : s.text,
            }))
          );
          if (schritteError) throw schritteError;
        }

        if (rezept.naehrwerte) {
          const { kalorien, protein, kohlenhydrate, fett } = rezept.naehrwerte;
          await supabase.from("naehrwerte").insert({
            rezept_id: neu.id,
            kalorien: kalorien ?? null,
            protein: protein ?? null,
            kohlenhydrate: kohlenhydrate ?? null,
            fett: fett ?? null,
          });
        }

        importiert++;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        fehler.push(`„${rezept.titel}": ${msg}`);
      }
    }

    return NextResponse.json({ importiert, uebersprungen, fehler });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Fehler beim Import:", msg);
    return NextResponse.json({ error: "Import fehlgeschlagen", detail: msg }, { status: 500 });
  }
}
