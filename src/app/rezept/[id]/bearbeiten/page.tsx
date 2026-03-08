// ====================================================
// Bearbeiten-Seite: /rezept/[id]/bearbeiten
// Lädt das bestehende Rezept und zeigt das Bearbeitungsformular
// ====================================================

import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { RezeptFormular } from "@/components/rezept/RezeptFormular";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

/**
 * Lädt ein einzelnes Rezept für das Bearbeitungsformular.
 */
async function getRezept(id: string) {
  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from("rezepte")
      .select("*, zutaten(*), schritte(*), naehrwerte(*)")
      .eq("id", id)
      .single();

    if (error || !data) return null;

    return {
      ...data,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      zutaten: data.zutaten?.sort((a: any, b: any) => a.reihenfolge - b.reihenfolge) ?? [],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      schritte: data.schritte?.sort((a: any, b: any) => a.nummer - b.nummer) ?? [],
    };
  } catch {
    return null;
  }
}

export default async function BearbeitenPage({
  params,
}: {
  params: { id: string };
}) {
  const rezept = await getRezept(params.id);
  if (!rezept) notFound();

  // Schritte für das Formular als Textarray aufbereiten
  const schritteAlsText = rezept.schritte.map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (s: any) => (typeof s === "string" ? s : s.text)
  );

  return (
    <div className="container max-w-3xl mx-auto px-4 py-8">
      {/* Navigation */}
      <Link
        href={`/rezept/${rezept.id}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        Zurück zum Rezept
      </Link>

      <h1 className="text-2xl font-bold mb-8">Rezept bearbeiten</h1>

      {/* Bearbeitungsformular mit vorausgefüllten Daten */}
      <RezeptFormular
        rezeptId={rezept.id}
        initialDaten={{
          titel: rezept.titel,
          quelle_url: rezept.quelle_url ?? "",
          tags: rezept.tags ?? [],
          vorbereitungszeit: rezept.vorbereitungszeit,
          kochzeit: rezept.kochzeit,
          portionen: rezept.portionen ?? 4,
          bild_url: rezept.bild_url ?? "",
          zutaten: rezept.zutaten,
          schritte: schritteAlsText,
          naehrwerte: rezept.naehrwerte,
        }}
      />
    </div>
  );
}
