import { parse } from "node-html-parser";

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36";

export async function fetchWebPage(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": BROWSER_UA },
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status} beim Abrufen von ${url}`);

  const html = await res.text();
  const root = parse(html);

  // Strukturierte Daten zuerst (zuverlässigste Methode für Rezeptseiten)
  const structuredDataScripts = root.querySelectorAll(
    'script[type="application/ld+json"]'
  );
  for (const script of structuredDataScripts) {
    try {
      const data = JSON.parse(script.text);
      const recipe = findRecipeInStructuredData(data);
      if (recipe) return JSON.stringify(recipe);
    } catch {
      // weiter versuchen
    }
  }

  // Fallback: Hauptinhalt extrahieren
  ["script", "style", "nav", "footer", "header", "aside"].forEach((tag) => {
    root.querySelectorAll(tag).forEach((el) => el.remove());
  });

  const mainContent = root.querySelector("article, main, [role='main']");
  const text = (mainContent ?? root).text
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 20000);

  return text;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function findRecipeInStructuredData(data: any): any {
  if (!data) return null;
  if (Array.isArray(data)) {
    for (const item of data) {
      const found = findRecipeInStructuredData(item);
      if (found) return found;
    }
    return null;
  }
  if (data["@type"] === "Recipe") return data;
  if (data["@graph"]) return findRecipeInStructuredData(data["@graph"]);
  return null;
}
