"use client";

// ====================================================
// DruckAnsicht – Druckoptimierte Rezeptdarstellung
// Sauberes Layout für Browser-Druck / PDF-Export / Teilen
// ====================================================

import { useEffect } from "react";
import { Rezept } from "@/lib/types";
import { Printer, Share2, ArrowLeft, Star } from "lucide-react";
import { toast } from "sonner";

interface Props {
  rezept: Rezept;
}

/**
 * Vollbildige Druckansicht eines Rezepts.
 * Bietet Drucken, PDF-Export und Teilen via Web Share API.
 */
export function DruckAnsicht({ rezept }: Props) {
  // Seitentitel für Browser-PDF-Export setzen
  useEffect(() => {
    document.title = `${rezept.titel} – Rezeptsammler`;
  }, [rezept.titel]);

  /** Öffnet den Browser-Druckdialog (kann auch als PDF gespeichert werden) */
  function handleDrucken() {
    window.print();
  }

  /** Teilt das Rezept über die Web Share API oder kopiert den Link */
  async function handleTeilen() {
    const url = window.location.origin + `/rezept/${rezept.id}`;

    // Web Share API (funktioniert auf Mobilgeräten nativ)
    if (navigator.share) {
      try {
        await navigator.share({
          title: rezept.titel,
          text: `Schau dir dieses Rezept an: ${rezept.titel}`,
          url,
        });
        return;
      } catch {
        // Nutzer hat abgebrochen – kein Fehler
      }
    }

    // Fallback: Link in Zwischenablage kopieren
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link kopiert! Füge ihn jetzt wo du möchtest ein.");
    } catch {
      toast.error("Link konnte nicht kopiert werden.");
    }
  }

  const gesamtzeit = (rezept.vorbereitungszeit ?? 0) + (rezept.kochzeit ?? 0);

  return (
    <>
      {/* Druckstile – nur beim Drucken aktiv */}
      <style>{`
        @media print {
          .keine-druckausgabe { display: none !important; }
          body { margin: 0; font-family: Georgia, serif; }
          .druckbereich { max-width: 100%; padding: 0; }
        }
        @page { margin: 1.5cm; }
      `}</style>

      {/* Aktionsleiste – wird beim Drucken ausgeblendet */}
      <div className="keine-druckausgabe sticky top-0 z-40 bg-white border-b shadow-sm px-4 py-3 flex items-center justify-between">
        <a
          href={`/rezept/${rezept.id}`}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Zurück zum Rezept
        </a>

        <div className="flex items-center gap-2">
          {/* Teilen-Button */}
          <button
            type="button"
            onClick={handleTeilen}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-muted text-sm font-medium transition-colors"
          >
            <Share2 className="h-4 w-4" />
            Teilen / Link kopieren
          </button>

          {/* Drucken/PDF-Button */}
          <button
            type="button"
            onClick={handleDrucken}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors"
          >
            <Printer className="h-4 w-4" />
            Drucken / Als PDF speichern
          </button>
        </div>
      </div>

      {/* Druckbarer Inhalt */}
      <div className="druckbereich max-w-3xl mx-auto px-6 py-10 space-y-8">

        {/* Bild */}
        {(rezept.bild_url || rezept.bilder_urls?.[0]) && (
          <div className="w-full aspect-[16/7] rounded-xl overflow-hidden bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={rezept.bild_url ?? rezept.bilder_urls?.[0]}
              alt={rezept.titel}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Kopf: Titel + Metadaten */}
        <div className="space-y-3 border-b pb-6">
          <h1 className="text-4xl font-bold leading-tight">{rezept.titel}</h1>

          {/* Tags */}
          {(rezept.tags ?? []).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {rezept.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-0.5 bg-primary/10 text-primary text-sm rounded-full font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Bewertung */}
          {rezept.bewertung && (
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`h-5 w-5 ${s <= rezept.bewertung! ? "fill-amber-400 text-amber-400" : "fill-transparent text-gray-200"}`}
                />
              ))}
              <span className="ml-1 text-sm text-muted-foreground">{rezept.bewertung}/5</span>
            </div>
          )}

          {/* Zeitinformationen */}
          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground pt-1">
            {rezept.vorbereitungszeit != null && (
              <span>⏱ Vorbereitung: <strong>{rezept.vorbereitungszeit} Min.</strong></span>
            )}
            {rezept.kochzeit != null && (
              <span>🍳 Kochzeit: <strong>{rezept.kochzeit} Min.</strong></span>
            )}
            {gesamtzeit > 0 && (
              <span>⏰ Gesamt: <strong>{gesamtzeit} Min.</strong></span>
            )}
            {rezept.portionen != null && (
              <span>🍽 Portionen: <strong>{rezept.portionen}</strong></span>
            )}
          </div>
        </div>

        {/* Zwei-Spalten-Layout: Zutaten + Nährwerte */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Zutaten */}
          <div className="sm:col-span-2">
            <h2 className="text-xl font-bold mb-4">Zutaten</h2>
            <ul className="space-y-2">
              {rezept.zutaten.map((z, i) => (
                <li key={i} className="flex items-baseline gap-3 py-1.5 border-b border-dashed border-gray-100 last:border-0">
                  <span className="font-medium text-sm min-w-[80px] shrink-0">
                    {z.menge} {z.einheit}
                  </span>
                  <span className="text-sm">{z.zutat}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Nährwerte */}
          {rezept.naehrwerte && (
            <div>
              <h2 className="text-xl font-bold mb-4">Nährwerte</h2>
              <div className="space-y-2 text-sm">
                {[
                  { label: "Kalorien", wert: rezept.naehrwerte.kalorien, einheit: "kcal" },
                  { label: "Protein", wert: rezept.naehrwerte.protein, einheit: "g" },
                  { label: "Kohlenhydrate", wert: rezept.naehrwerte.kohlenhydrate, einheit: "g" },
                  { label: "Fett", wert: rezept.naehrwerte.fett, einheit: "g" },
                ].map(({ label, wert, einheit }) => (
                  <div key={label} className="flex justify-between border-b border-dashed border-gray-100 pb-1">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium">{wert} {einheit}</span>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground pt-1">pro Portion</p>
              </div>
            </div>
          )}
        </div>

        {/* Zubereitungsschritte */}
        <div>
          <h2 className="text-xl font-bold mb-4">Zubereitung</h2>
          <ol className="space-y-4">
            {rezept.schritte.map((schritt, i) => (
              <li key={i} className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                  {i + 1}
                </span>
                <p className="text-sm leading-relaxed pt-1">{schritt.text}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* Fußzeile */}
        <div className="text-center text-xs text-muted-foreground pt-4 border-t">
          Erstellt mit Rezeptsammler
          {rezept.quelle_url && (
            <> · Quelle: <span className="text-primary">{rezept.quelle_url}</span></>
          )}
        </div>
      </div>
    </>
  );
}
