// ====================================================
// Drucken-Seite – saubere Druckansicht eines Rezepts
// Optimiert für Browser-Druck und PDF-Export
// ====================================================

import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { DruckAnsicht } from "@/components/rezept/DruckAnsicht";

/**
 * Lädt ein einzelnes Rezept aus der Datenbank.
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

export default async function DruckenPage({
  params,
}: {
  params: { id: string };
}) {
  const rezept = await getRezept(params.id);
  if (!rezept) notFound();

  return <DruckAnsicht rezept={rezept} />;
}
