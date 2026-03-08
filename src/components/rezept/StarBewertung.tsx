"use client";

// ====================================================
// StarBewertung – Interaktive Sterne-Bewertungskomponente
// Ermöglicht das Bewerten eines Rezepts mit 1–5 Sternen
// ====================================================

import { useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";

interface StarBewertungProps {
  /** ID des Rezepts in der Datenbank */
  rezeptId: string;
  /** Aktuelle Bewertung (1–5 oder null wenn noch nicht bewertet) */
  bewertung: number | null | undefined;
  /** Ob Sterne klickbar sind (Standard: true) */
  editierbar?: boolean;
  /** Größe der Sterne */
  groesse?: "sm" | "md" | "lg";
}

/**
 * Zeigt eine Sternebewertung an und erlaubt das Setzen/Ändern per Klick.
 * Speichert die Bewertung direkt via PATCH-API.
 */
export function StarBewertung({
  rezeptId,
  bewertung,
  editierbar = true,
  groesse = "md",
}: StarBewertungProps) {
  const [aktuellerWert, setAktuellerWert] = useState<number | null>(bewertung ?? null);
  const [hoverWert, setHoverWert] = useState<number | null>(null);
  const [laedtGerade, setLaedtGerade] = useState(false);

  // Größe der SVG-Icons bestimmen
  const groessenKlasse = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  }[groesse];

  /**
   * Speichert die neue Bewertung in der Datenbank.
   * Bei erneutem Klick auf denselben Stern wird die Bewertung zurückgesetzt.
   */
  async function handleKlick(sternNummer: number) {
    if (!editierbar || laedtGerade) return;

    // Gleicher Stern nochmal angeklickt → Bewertung aufheben
    const neuerWert = aktuellerWert === sternNummer ? null : sternNummer;

    setLaedtGerade(true);
    try {
      const antwort = await fetch(`/api/rezepte/${rezeptId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bewertung: neuerWert }),
      });

      if (!antwort.ok) throw new Error("Speichern fehlgeschlagen");

      setAktuellerWert(neuerWert);
      if (neuerWert !== null) {
        toast.success(`Bewertung: ${"★".repeat(neuerWert)}${"☆".repeat(5 - neuerWert)}`);
      } else {
        toast.info("Bewertung zurückgesetzt");
      }
    } catch {
      toast.error("Bewertung konnte nicht gespeichert werden");
    } finally {
      setLaedtGerade(false);
    }
  }

  // Welcher Wert soll gerade angezeigt werden (Hover hat Vorrang)
  const anzeigeWert = hoverWert ?? aktuellerWert ?? 0;

  return (
    <div className="space-y-1">
      <div
        className={`flex items-center gap-0.5 ${editierbar ? "cursor-pointer" : "cursor-default"}`}
        onMouseLeave={() => setHoverWert(null)}
        title={aktuellerWert ? `${aktuellerWert} von 5 Sternen` : "Noch nicht bewertet"}
      >
        {[1, 2, 3, 4, 5].map((sternNummer) => (
          <button
            key={sternNummer}
            type="button"
            disabled={!editierbar || laedtGerade}
            onClick={() => handleKlick(sternNummer)}
            onMouseEnter={() => editierbar && setHoverWert(sternNummer)}
            className="transition-transform hover:scale-110 disabled:pointer-events-none"
          >
            <Star
              className={`${groessenKlasse} transition-colors ${
                sternNummer <= anzeigeWert
                  ? "fill-amber-400 text-amber-400"
                  : "fill-transparent text-gray-300"
              }`}
            />
          </button>
        ))}

        {/* Textuelle Anzeige wenn bewertet */}
        {aktuellerWert !== null && aktuellerWert !== undefined && (
          <span className="ml-1 text-xs text-muted-foreground">
            ({aktuellerWert}/5)
          </span>
        )}
      </div>

      {/* Bewertung zurücksetzen – nur anzeigen wenn bereits bewertet */}
      {editierbar && aktuellerWert !== null && aktuellerWert !== undefined && (
        <button
          type="button"
          onClick={() => handleKlick(aktuellerWert)}
          disabled={laedtGerade}
          className="text-xs text-muted-foreground hover:text-destructive transition-colors"
        >
          Bewertung entfernen
        </button>
      )}
    </div>
  );
}
