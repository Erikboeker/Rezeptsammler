import { createServerSupabaseClient } from "@/lib/supabase/server";
import { RecipeGrid } from "@/components/bibliothek/RecipeGrid";
import { Rezept } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Meine Rezepte – Rezeptsammler",
};

async function getRezepte(): Promise<Rezept[]> {
  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from("rezepte")
      .select("*, zutaten(*), schritte(*), naehrwerte(*)")
      .order("erstellt_am", { ascending: false });

    if (error) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data ?? []).map((r: any) => ({
      ...r,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      zutaten: r.zutaten?.sort((a: any, b: any) => a.reihenfolge - b.reihenfolge) ?? [],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      schritte: r.schritte?.sort((a: any, b: any) => a.nummer - b.nummer) ?? [],
    }));
  } catch {
    return [];
  }
}

export default async function BibliothekPage() {
  const rezepte = await getRezepte();

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <RecipeGrid initialRezepte={rezepte} />
    </div>
  );
}
