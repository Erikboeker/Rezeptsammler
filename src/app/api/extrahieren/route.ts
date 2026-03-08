import { NextResponse } from "next/server";
import { extractWithGemini } from "@/lib/gemini/extractor";
import { fetchUrlContent } from "@/lib/extractors";

export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const body = await request.json() as { type: string; url?: string; base64?: string; mimeType?: string };

    if (body.type === "url") {
      if (!body.url) {
        return NextResponse.json({ error: "URL fehlt" }, { status: 400 });
      }
      const content = await fetchUrlContent(body.url);
      const result = await extractWithGemini({
        text: content,
        sourceUrl: body.url,
      });
      return NextResponse.json(result);
    }

    if (body.type === "bild") {
      if (!body.base64 || !body.mimeType) {
        return NextResponse.json({ error: "Bilddaten fehlen" }, { status: 400 });
      }
      const result = await extractWithGemini({
        image: { base64: body.base64, mimeType: body.mimeType },
      });
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Ungültiger Typ" }, { status: 400 });
  } catch (error) {
    console.error("Extraktionsfehler:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unbekannter Fehler" },
      { status: 500 }
    );
  }
}
