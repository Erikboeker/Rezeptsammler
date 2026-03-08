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

  // Bild URLs holen bevor etwas gelöscht wird
  const ogImages = root.querySelectorAll('meta[property="og:image"]').map(meta => meta.getAttribute("content")).filter(Boolean) as string[];
  const twitterImages = root.querySelectorAll('meta[name="twitter:image"]').map(meta => meta.getAttribute("content")).filter(Boolean) as string[];
  const articleImages = root.querySelectorAll('img').map(img => img.getAttribute("src")).filter(Boolean) as string[];
  
  const allImages = [...new Set([...ogImages, ...twitterImages, ...articleImages])];
  const absoluteImages = allImages.map(src => {
    if (src.startsWith("/")) {
      try {
        return new URL(src, url).toString();
      } catch {
        return src;
      }
    }
    return src;
  });

  const uniqueAbsoluteImages = [...new Set(absoluteImages)];
  const bildUrl = uniqueAbsoluteImages[0] || undefined;
  const bilderUrls = uniqueAbsoluteImages.slice(0, 10); // Max 10 Bilder

  // Strukturierte Daten zuerst (zuverlässigste Methode für Rezeptseiten)
  const structuredDataScripts = root.querySelectorAll(
    'script[type="application/ld+json"]'
  );
  for (const script of structuredDataScripts) {
    try {
      const data = JSON.parse(script.text);
      const recipe = findRecipeInStructuredData(data);
      if (recipe) {
        // Falls LD+JSON eigene Bilder hat, diese bevorzugen
        let ldImages: string[] = [];
        if (recipe.image) {
          if (Array.isArray(recipe.image)) {
            ldImages = recipe.image.map((img: any) => typeof img === 'string' ? img : img.url);
          } else {
            ldImages = [typeof recipe.image === 'string' ? recipe.image : recipe.image.url];
          }
        }
        
        const finalBilder = Array.from(new Set(ldImages.length > 0 ? ldImages : bilderUrls));
        return JSON.stringify({ 
          ...recipe, 
          "bild_url": finalBilder[0], 
          "bilder_urls": finalBilder 
        });
      }
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
    .slice(0, 30000);

  const imageInfo = bilderUrls.length > 0 
    ? `\n\nBilder-Liste: ${bilderUrls.join(", ")}` 
    : "";

  return `${text}${imageInfo}`;
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
