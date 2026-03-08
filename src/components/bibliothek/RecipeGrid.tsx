"use client";

// ====================================================
// RecipeGrid – Rezept-Raster mit Tag-Filter
// Zeigt alle Rezepte als Kacheln an, filterbar nach Tags und Suchbegriff
// ====================================================

import { useState, useCallback, useEffect, useMemo } from "react";
import { ChefHat } from "lucide-react";
import { Rezept } from "@/lib/types";
import { RecipeCard } from "./RecipeCard";
import { SearchFilter } from "./SearchFilter";

interface Props {
  /** Initiale Rezepte vom Server */
  initialRezepte: Rezept[];
}

/**
 * Raster-Ansicht aller Rezepte mit Tag-Filter und Suchfunktion.
 * Filtert clientseitig nach Tags (Array-Übereinstimmung).
 */
export function RecipeGrid({ initialRezepte }: Props) {
  const [alleRezepte, setAlleRezepte] = useState(initialRezepte);
  const [aktiverTag, setAktiverTag] = useState<string | undefined>(undefined);
  const [suche, setSuche] = useState<string | undefined>(undefined);
  const [laedtGerade, setLaedtGerade] = useState(false);

  // Wenn die initialen Rezepte sich ändern (z.B. nach Refresh), neu setzen
  useEffect(() => {
    setAlleRezepte(initialRezepte);
  }, [initialRezepte]);

  // Alle einzigartigen Tags aus sämtlichen Rezepten extrahieren und sortieren
  const verfuegbareTags = useMemo(() => {
    const tagMenge = new Set<string>();
    alleRezepte.forEach((rezept) => {
      (rezept.tags ?? []).forEach((tag) => tagMenge.add(tag));
    });
    return Array.from(tagMenge).sort();
  }, [alleRezepte]);

  // Rezepte nach aktivem Tag und Suchbegriff filtern (clientseitig)
  const gefilterteRezepte = useMemo(() => {
    return alleRezepte.filter((rezept) => {
      // Tag-Filter: Prüfen ob aktiver Tag in rezept.tags enthalten ist
      const tagPasst =
        !aktiverTag || (rezept.tags ?? []).includes(aktiverTag);

      // Such-Filter: Titelsuche (Groß-/Kleinschreibung ignorieren)
      const suchePasst =
        !suche || rezept.titel.toLowerCase().includes(suche.toLowerCase());

      return tagPasst && suchePasst;
    });
  }, [alleRezepte, aktiverTag, suche]);

  /**
   * Lädt Rezepte bei Suchbegriff-Änderung neu vom Server (für Server-seitige Suche).
   * Tag-Filterung erfolgt jedoch clientseitig.
   */
  const handleFilterAenderung = useCallback(
    async (tag?: string, suchbegriff?: string) => {
      setAktiverTag(tag);
      setSuche(suchbegriff);

      // Wenn Suchbegriff vorhanden → Server-Anfrage für Textsuche
      if (suchbegriff) {
        setLaedtGerade(true);
        const params = new URLSearchParams();
        params.set("suche", suchbegriff);

        try {
          const antwort = await fetch(`/api/rezepte?${params}`);
          if (antwort.ok) {
            const daten = await antwort.json() as Rezept[];
            setAlleRezepte(daten);
          }
        } finally {
          setLaedtGerade(false);
        }
      } else if (!suchbegriff && !tag) {
        // Alle Filter zurückgesetzt → vollständige Liste neu laden
        setLaedtGerade(true);
        try {
          const antwort = await fetch("/api/rezepte");
          if (antwort.ok) {
            const daten = await antwort.json() as Rezept[];
            setAlleRezepte(daten);
          }
        } finally {
          setLaedtGerade(false);
        }
      }
    },
    []
  );

  // Rezept aus der lokalen Liste entfernen (nach Löschen)
  function handleDelete(id: string) {
    setAlleRezepte((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Meine Rezepte</h1>
        <p className="text-muted-foreground mt-1">
          {gefilterteRezepte.length} {gefilterteRezepte.length === 1 ? "Rezept" : "Rezepte"}
          {(aktiverTag || suche) && " gefunden"}
        </p>
      </div>

      {/* Tag-Filter-Komponente */}
      <SearchFilter verfuegbareTags={verfuegbareTags} onChange={handleFilterAenderung} />

      {/* Lade-Zustand */}
      {laedtGerade ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-40 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      ) : gefilterteRezepte.length === 0 ? (
        // Leerer Zustand
        <div className="text-center py-16 text-muted-foreground">
          <ChefHat className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">Keine Rezepte gefunden</p>
          {aktiverTag && (
            <p className="text-sm mt-1">Kein Rezept mit Tag „{aktiverTag}"</p>
          )}
        </div>
      ) : (
        // Rezept-Kacheln
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {gefilterteRezepte.map((rezept) => (
            <RecipeCard key={rezept.id} rezept={rezept} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
