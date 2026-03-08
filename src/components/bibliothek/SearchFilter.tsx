"use client";

// ====================================================
// SearchFilter – Suchleiste und Tag-Filter
// Ersetzt die alten Kategorie-Chips durch dynamische Tag-Chips
// ====================================================

import { useState, useCallback } from "react";
import { Search, X } from "lucide-react";

interface Props {
  /** Verfügbare Tags aus allen Rezepten */
  verfuegbareTags: string[];
  /** Callback wenn sich Suche oder aktiver Tag ändert */
  onChange: (tag?: string, suche?: string) => void;
}

/**
 * Filtert die Rezept-Bibliothek nach Tags und Suchbegriff.
 * Tags werden dynamisch aus den vorhandenen Rezepten generiert.
 */
export function SearchFilter({ verfuegbareTags, onChange }: Props) {
  const [suche, setSuche] = useState("");
  const [aktiverTag, setAktiverTag] = useState("Alle");

  // Kombinierter Update-Handler für Tag und Suche
  const aktualisiereFilter = useCallback(
    (neuerTag: string, neueSuche: string) => {
      onChange(
        neuerTag !== "Alle" ? neuerTag : undefined,
        neueSuche || undefined
      );
    },
    [onChange]
  );

  function handleSuche(wert: string) {
    setSuche(wert);
    aktualisiereFilter(aktiverTag, wert);
  }

  function handleTag(tag: string) {
    setAktiverTag(tag);
    aktualisiereFilter(tag, suche);
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
    </div>
  );
}
