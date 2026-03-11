/**
 * Hilfsfunktionen für die Bildbearbeitung
 */

/**
 * Erstellt eine Bild-Instanz aus einer URL/DataURL
 */
export const erstelleBild = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous"); // Verhindert CORS-Probleme beim Canvas
    image.src = url;
  });

/**
 * Schneidet ein Bild basierend auf den Pixeldaten zu
 */
export async function holeZugschnittenesBild(
  bildSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number }
): Promise<string> {
  const bild = await erstelleBild(bildSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Kein 2D-Kontext verfügbar");
  }

  // Canvas-Größe auf die reale Pixelausgabe setzen
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Den gewählten Ausschnitt auf das Canvas zeichnen
  // Wir nutzen die naturalWidth/naturalHeight des Bildes für die Quelle
  ctx.drawImage(
    bild,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  // Als DataURL zurückgeben (JPEG für bessere Kompression)
  return canvas.toDataURL("image/jpeg", 0.9);
}
