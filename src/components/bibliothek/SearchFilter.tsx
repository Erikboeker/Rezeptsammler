"use client";

import { useState, useCallback } from "react";
import { Search, X } from "lucide-react";
import { KATEGORIEN } from "@/lib/types";

interface Props {
  onChange: (kategorie?: string, suche?: string) => void;
}

export function SearchFilter({ onChange }: Props) {
  const [suche, setSuche] = useState("");
  const [aktiveKategorie, setAktiveKategorie] = useState("Alle");

  const update = useCallback(
    (newKategorie: string, newSuche: string) => {
      onChange(
        newKategorie !== "Alle" ? newKategorie : undefined,
        newSuche || undefined
      );
    },
    [onChange]
  );

  function handleSuche(value: string) {
    setSuche(value);
    update(aktiveKategorie, value);
  }

  function handleKategorie(kategorie: string) {
    setAktiveKategorie(kategorie);
    update(kategorie, suche);
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

      {/* Kategorie-Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {["Alle", ...KATEGORIEN].map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => handleKategorie(k)}
            className={`flex-shrink-0 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              aktiveKategorie === k
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80 text-muted-foreground"
            }`}
          >
            {k}
          </button>
        ))}
      </div>
    </div>
  );
}
