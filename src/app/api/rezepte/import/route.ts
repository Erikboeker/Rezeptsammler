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

    // Eigene Rezepte laden (RLS begrenzt automatisch auf den eingeloggten
    // Nutzer). Dedupe sowohl über die ID als auch über den Titel – so
    // erzeugt auch der wiederholte Import einer fremden Export-Datei
    // (z.B. vom Partner geteilt, IDs gehören dann dem anderen Konto)
    // keine Duplikate im eigenen Bestand.
    const { data: eigene, error: eigeneError } = await supabase
      .from("rezepte")
      .select("id, titel");
    if (eigeneError) throw eigeneError;
    const vorhandeneIds = new Set((eigene ?? []).map((r: { id: string }) => r.id));
    const vorhandeneTitel = new Set(
      (eigene ?? []).map((r: { titel: string }) => r.titel.trim().toLowerCase())
    );

    let importiert = 0;
    let uebersprungen = 0;
    const fehler: string[] = [];

    for (const rezept of rezepte) {
      if (!rezept.titel) {
        fehler.push("Eintrag ohne Titel übersprungen");
        continue;
      }
      if (
        (rezept.id && vorhandeneIds.has(rezept.id)) ||
        vorhandeneTitel.has(rezept.titel.trim().toLowerCase())
      ) {
        uebersprungen++;
        continue;
      }

      try {
        // Nur bekannte Spalten übernehmen (schützt vor Fremdfeldern in der
        // Datei). user_id setzt die Datenbank per Default auf den
        // eingeloggten Nutzer.
        const stammdaten = {
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
        };

        let { data: neu, error: rezeptError } = await supabase
          .from("rezepte")
          .insert({ ...(rezept.id ? { id: rezept.id } : {}), ...stammdaten })
          .select("id")
          .single();

        // ID-Konflikt: Die ID existiert bereits, gehört aber (durch RLS
        // unsichtbar) einem anderen Konto → mit neuer ID importieren.
        if (rezeptError?.code === "23505" && rezept.id) {
          ({ data: neu, error: rezeptError } = await supabase
            .from("rezepte")
            .insert(stammdaten)
            .select("id")
            .single());
        }
        if (rezeptError) throw rezeptError;
        if (!neu) throw new Error("Kein Rezept-Datensatz zurückgegeben");

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

        vorhandeneIds.add(neu.id);
        vorhandeneTitel.add(rezept.titel.trim().toLowerCase());
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
