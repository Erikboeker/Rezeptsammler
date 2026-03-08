// ====================================================
// Image-Utils – Hilfsfunktionen für die Bildverarbeitung
// Berechnet das zugeschnittene Bild basierend auf den Crop-Koordinaten
// ====================================================

import { Area } from "react-easy-crop";

/**
 * Erstellt ein HTML-Image-Element aus einer URL
 */
export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous"); // Verhindert CORS-Fehler bei Canvas
    image.src = url;
  });

/**
 * Berechnet das zugeschnittene Bild und gibt es als Blob/File zurück
 */
export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area
): Promise<Blob | null> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) return null;

  // Canvas-Größe auf die Zuschnitt-Größe setzen
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Das Bild im Canvas zeichnen (nur den Ausschnitt)
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  // Als Blob zurückgeben
  return new Promise((resolve) => {
    canvas.toBlob((file) => {
      resolve(file);
    }, "image/jpeg", 0.9);
  });
}
