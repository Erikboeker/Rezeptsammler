import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

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
