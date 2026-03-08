import { GoogleGenerativeAI } from "@google/generative-ai";
import { ExtraktionsErgebnis } from "../types";
import { buildSystemPrompt } from "./prompts";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface ExtractionInput {
  text?: string;
  sourceUrl?: string;
  image?: { base64: string; mimeType: string };
}

export async function extractWithGemini(
  input: ExtractionInput
): Promise<ExtraktionsErgebnis> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.1,
    },
  });

  const systemPrompt = buildSystemPrompt();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parts: any[] = [];

  if (input.image) {
    parts.push({ text: systemPrompt });
    parts.push({
      inlineData: { data: input.image.base64, mimeType: input.image.mimeType },
    });
    parts.push({ text: "Extrahiere das Rezept aus diesem Bild." });
  } else if (input.text) {
    parts.push({
      text: `${systemPrompt}\n\nQuelle: ${input.sourceUrl ?? "unbekannt"}\n\nInhalt:\n${input.text.slice(0, 30000)}`,
    });
  }

  const result = await model.generateContent({
    contents: [{ role: "user", parts }],
  });

  const responseText = result.response.text();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = JSON.parse(responseText) as any;
  return normalizeResult(raw, input.sourceUrl);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeResult(raw: any, sourceUrl?: string): ExtraktionsErgebnis {
  return {
    titel: raw.titel ?? "Unbekanntes Rezept",
    quelle_url: raw.quelle_url ?? sourceUrl,
    kategorie: raw.kategorie ?? "Sonstiges",
    bild_url: raw.bild_url ?? undefined,
    bilder_urls: Array.isArray(raw.bilder_urls) ? [...new Set(raw.bilder_urls as string[])] : [],
    zutaten: Array.isArray(raw.zutaten)
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        raw.zutaten.map((z: any) => ({
          menge: z.menge ?? "nach Belieben",
          einheit: z.einheit ?? "Stück",
          zutat: z.zutat ?? "",
        }))
      : [],
    schritte: Array.isArray(raw.schritte) ? raw.schritte : [],
    vorbereitungszeit: raw.vorbereitungszeit ?? undefined,
    kochzeit: raw.kochzeit ?? undefined,
    portionen: raw.portionen ?? 4,
    naehrwerte: raw.naehrwerte ?? undefined,
  };
}
