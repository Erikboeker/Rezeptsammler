import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { RecipeHeader } from "@/components/rezept/RecipeHeader";
import { IngredientList } from "@/components/rezept/IngredientList";
import { StepList } from "@/components/rezept/StepList";
import { NutritionCard } from "@/components/rezept/NutritionCard";

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

export default async function RezeptPage({
  params,
}: {
  params: { id: string };
}) {
  const rezept = await getRezept(params.id);
  if (!rezept) notFound();

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <RecipeHeader rezept={rezept} />

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <IngredientList zutaten={rezept.zutaten} portionen={rezept.portionen} />
        </div>
        <div>
          {rezept.naehrwerte && <NutritionCard naehrwerte={rezept.naehrwerte} />}
        </div>
      </div>

      <div className="mt-8">
        <StepList schritte={rezept.schritte} />
      </div>
    </div>
  );
}
