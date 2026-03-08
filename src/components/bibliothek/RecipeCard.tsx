"use client";

// ====================================================
// RecipeCard – Rezept-Kachel für die Bibliothek
// Zeigt Bild, Titel, Tags, Bewertung und Kochzeit an
// ====================================================

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Clock, Trash2, ExternalLink, Star } from "lucide-react";
import { Rezept } from "@/lib/types";

interface Props {
  rezept: Rezept;
  onDelete: (id: string) => void;
}

/**
 * Einzelne Rezept-Kachel für die Bibliothek.
 * Zeigt Vorschaubild, Tags farblich, Sternebewertung und Zeitinformationen.
 */
export function RecipeCard({ rezept, onDelete }: Props) {
  const [zeigeBestaetigung, setZeigeBestaetigung] = useState(false);
  const [loeschtGerade, setLoeschtGerade] = useState(false);

  // Gesamtzeit aus Vorbereitungs- und Kochzeit berechnen
  const gesamtzeit = (rezept.vorbereitungszeit ?? 0) + (rezept.kochzeit ?? 0);

  // Ersten Tag als Akzentfarbe für den Farbstreifen nutzen
  const ersterTag = rezept.tags?.[0];

  /**
   * Löscht das Rezept nach zweifachem Klick (Sicherheitsabfrage).
   */
  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    // Erster Klick: Bestätigung anzeigen, nach 3s automatisch ausblenden
    if (!zeigeBestaetigung) {
      setZeigeBestaetigung(true);
      setTimeout(() => setZeigeBestaetigung(false), 3000);
      return;
    }

    setLoeschtGerade(true);
    try {
      const antwort = await fetch(`/api/rezepte/${rezept.id}`, { method: "DELETE" });
      if (!antwort.ok) throw new Error();
      toast.success("Rezept gelöscht");
      onDelete(rezept.id);
    } catch {
      toast.error("Löschen fehlgeschlagen");
      setLoeschtGerade(false);
      setZeigeBestaetigung(false);
    }
  }

  return (
    <Link href={`/rezept/${rezept.id}`}>
      <div className="group relative bg-white border rounded-xl overflow-hidden hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer flex flex-col h-full">
        {/* Farbstreifen oben basierend auf erstem Tag */}
        <div className={`h-1.5 shrink-0 ${ersterTag ? "bg-primary" : "bg-gray-200"}`} />

        {/* Vorschaubild */}
        {(rezept.bild_url || (rezept.bilder_urls && rezept.bilder_urls.length > 0)) && (
          <div className="aspect-[4/3] w-full shrink-0 overflow-hidden bg-muted">
            <img
              src={rezept.bild_url || rezept.bilder_urls?.[0]}
              alt={rezept.titel}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          </div>
        )}

        <div className="p-4 flex flex-col flex-1">
          {/* Tags + Löschen-Button */}
          <div className="flex items-start justify-between gap-2 mb-2">
            {/* Tag-Chips (max. 2 anzeigen + Zähler) */}
            <div className="flex flex-wrap gap-1 flex-1 min-w-0">
              {(rezept.tags ?? []).slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded-full font-medium bg-primary/10 text-primary truncate max-w-[120px]"
                >
                  {tag}
                </span>
              ))}
              {(rezept.tags ?? []).length > 2 && (
                <span className="text-xs text-muted-foreground">
                  +{rezept.tags.length - 2}
                </span>
              )}
            </div>

            {/* Löschen-Button */}
            <button
              type="button"
              onClick={handleDelete}
              disabled={loeschtGerade}
              className={`shrink-0 transition-opacity p-1 rounded hover:bg-muted ${
                zeigeBestaetigung
                  ? "opacity-100 text-destructive"
                  : "opacity-0 group-hover:opacity-100 text-muted-foreground"
              }`}
            >
              {zeigeBestaetigung ? (
                <span className="text-xs font-medium whitespace-nowrap">Sicher?</span>
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
            </button>
          </div>

          {/* Titel */}
          <h3 className="font-semibold text-sm line-clamp-2 mb-2 leading-snug">
            {rezept.titel}
          </h3>

          {/* Sternebewertung (nur Anzeige, nicht klickbar auf der Karte) */}
          {rezept.bewertung != null && (
            <div className="flex items-center gap-0.5 mb-2">
              {[1, 2, 3, 4, 5].map((stern) => (
                <Star
                  key={stern}
                  className={`h-3.5 w-3.5 ${
                    stern <= (rezept.bewertung ?? 0)
                      ? "fill-amber-400 text-amber-400"
                      : "fill-transparent text-gray-300"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Fußzeile: Kochzeit + Quell-Icon */}
          <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto pt-2">
            {gesamtzeit > 0 ? (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {gesamtzeit} Min.
              </span>
            ) : (
              <span />
            )}
            {rezept.quelle_url && <ExternalLink className="h-3 w-3" />}
          </div>
        </div>
      </div>
    </Link>
  );
}
