"use client";

// ====================================================
// RecipeGrid – Rezept-Raster mit Tag-Filter
// Zeigt alle Rezepte als Kacheln an, filterbar nach Tags und Suchbegriff
// ====================================================

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { ChefHat, Download, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
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

  // ── Export / Import ──
  const importInputRef = useRef<HTMLInputElement>(null);
  const [importiertGerade, setImportiertGerade] = useState(false);

  /** Liest die gewählte JSON-Datei ein und schickt sie an die Import-API */
  async function handleImportDatei(e: React.ChangeEvent<HTMLInputElement>) {
    const datei = e.target.files?.[0];
    e.target.value = ""; // gleiche Datei erneut wählbar machen
    if (!datei) return;

    setImportiertGerade(true);
    try {
      const text = await datei.text();
      let inhalt: unknown;
      try {
        inhalt = JSON.parse(text);
      } catch {
        throw new Error("Datei ist kein gültiges JSON");
      }

      const antwort = await fetch("/api/rezepte/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inhalt),
      });
      const daten = await antwort.json() as {
        importiert?: number;
        uebersprungen?: number;
        fehler?: string[];
        error?: string;
      };
      if (!antwort.ok) throw new Error(daten.error ?? "Import fehlgeschlagen");

      const teile = [`${daten.importiert} importiert`];
      if (daten.uebersprungen) teile.push(`${daten.uebersprungen} bereits vorhanden`);
      if (daten.fehler?.length) teile.push(`${daten.fehler.length} fehlgeschlagen`);
      toast.success(`Import abgeschlossen: ${teile.join(", ")}`);
      if (daten.fehler?.length) console.warn("Import-Fehler:", daten.fehler);

      // Liste neu laden
      const neu = await fetch("/api/rezepte");
      if (neu.ok) setAlleRezepte(await neu.json() as Rezept[]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import fehlgeschlagen");
    } finally {
      setImportiertGerade(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Meine Rezepte</h1>
          <p className="text-muted-foreground mt-1">
            {gefilterteRezepte.length} {gefilterteRezepte.length === 1 ? "Rezept" : "Rezepte"}
            {(aktiverTag || suche) && " gefunden"}
          </p>
        </div>

        {/* Export / Import */}
        <div className="flex items-center gap-2">
          <a
            href="/api/rezepte/export"
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium border rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Alle Rezepte als JSON-Datei herunterladen"
          >
            <Download className="h-4 w-4" />
            Export
          </a>
          <input
            ref={importInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleImportDatei}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => importInputRef.current?.click()}
            disabled={importiertGerade}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium border rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
            title="Rezepte aus einer Export-Datei importieren"
          >
            {importiertGerade ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            Import
          </button>
        </div>
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
