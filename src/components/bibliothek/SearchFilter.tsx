"use client";

// ====================================================
// SearchFilter – Suchleiste und Tag-Filter
// Ersetzt die alten Kategorie-Chips durch dynamische Tag-Chips
// ====================================================

import { useState, useCallback } from "react";
import { Search, X, Star } from "lucide-react";

interface Props {
  /** Verfügbare Tags aus allen Rezepten */
  verfuegbareTags: string[];
  /** Callback wenn sich Suche, aktiver Tag oder Sterne-Filter ändert */
  onChange: (tag?: string, suche?: string, minSterne?: number) => void;
}

/**
 * Filtert die Rezept-Bibliothek nach Tags, Suchbegriff und Bewertung.
 * Tags werden dynamisch aus den vorhandenen Rezepten generiert.
 */
export function SearchFilter({ verfuegbareTags, onChange }: Props) {
  const [suche, setSuche] = useState("");
  const [aktiverTag, setAktiverTag] = useState("Alle");
  /** Mindestbewertung (undefined = egal) */
  const [minSterne, setMinSterne] = useState<number | undefined>(undefined);

  // Kombinierter Update-Handler für Tag, Suche und Bewertung
  const aktualisiereFilter = useCallback(
    (neuerTag: string, neueSuche: string, neueSterne?: number) => {
      onChange(
        neuerTag !== "Alle" ? neuerTag : undefined,
        neueSuche || undefined,
        neueSterne
      );
    },
    [onChange]
  );

  function handleSuche(wert: string) {
    setSuche(wert);
    aktualisiereFilter(aktiverTag, wert, minSterne);
  }

  function handleTag(tag: string) {
    setAktiverTag(tag);
    aktualisiereFilter(tag, suche, minSterne);
  }

  /** Klick auf denselben Stern hebt den Filter wieder auf */
  function handleSterne(stern: number) {
    const neu = minSterne === stern ? undefined : stern;
    setMinSterne(neu);
    aktualisiereFilter(aktiverTag, suche, neu);
  }

  return (
    <div className="space-y-3">
      {/* Suchfeld */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={suche}
          onChange={(e) => handleSuche(e.target.value)}
          placeholder="Rezepte suchen..."
          className="w-full pl-9 pr-9 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {suche && (
          <button
            type="button"
            onClick={() => handleSuche("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Tag-Chips – scrollbar horizontal */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {["Alle", ...verfuegbareTags].map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => handleTag(tag)}
            className={`flex-shrink-0 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              aktiverTag === tag
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80 text-muted-foreground"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Sterne-Filter: zeigt Rezepte ab der gewählten Bewertung */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-muted-foreground">Bewertung:</span>
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((stern) => (
            <button
              key={stern}
              type="button"
              onClick={() => handleSterne(stern)}
              title={`Ab ${stern} ${stern === 1 ? "Stern" : "Sternen"}`}
              aria-label={`Ab ${stern} ${stern === 1 ? "Stern" : "Sternen"}`}
              aria-pressed={minSterne === stern}
              className="p-0.5 rounded hover:scale-110 transition-transform"
            >
              <Star
                className={`h-5 w-5 ${
                  minSterne != null && stern <= minSterne
                    ? "fill-amber-400 text-amber-400"
                    : "fill-transparent text-gray-300 hover:text-amber-400"
                }`}
              />
            </button>
          ))}
        </div>
        {minSterne != null && (
          <button
            type="button"
            onClick={() => handleSterne(minSterne)}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
            {minSterne === 5 ? "nur 5 Sterne" : `ab ${minSterne} Sternen`}
          </button>
        )}
      </div>
    </div>
  );
}
