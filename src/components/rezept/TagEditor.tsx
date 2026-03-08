"use client";

// ====================================================
// TagEditor – Tags auf der Rezept-Detailseite verwalten
// Erlaubt Hinzufügen und Entfernen von Tags direkt im Rezept
// ====================================================

import { useState } from "react";
import { Plus, X, Tag } from "lucide-react";
import { toast } from "sonner";
import { ALLE_TAGS } from "@/lib/types";

interface TagEditorProps {
  /** ID des Rezepts */
  rezeptId: string;
  /** Aktuelle Tags des Rezepts */
  initialTags: string[];
}

/**
 * Interaktiver Tag-Editor für die Rezept-Detailseite.
 * Speichert Änderungen sofort via PATCH-API.
 */
export function TagEditor({ rezeptId, initialTags }: TagEditorProps) {
  const [tags, setTags] = useState<string[]>(initialTags ?? []);
  const [zeigeAuswahl, setZeigeAuswahl] = useState(false);
  const [eigenerTag, setEigenerTag] = useState("");
  const [speichertGerade, setSpeichertGerade] = useState(false);

  /**
   * Speichert das übergebene Tag-Array via PATCH-API.
   */
  async function speichereTags(neueTags: string[]) {
    setSpeichertGerade(true);
    try {
      const antwort = await fetch(`/api/rezepte/${rezeptId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tags: neueTags }),
      });
      if (!antwort.ok) throw new Error();
      setTags(neueTags);
    } catch {
      toast.error("Tags konnten nicht gespeichert werden");
    } finally {
      setSpeichertGerade(false);
    }
  }

  /** Entfernt einen bestimmten Tag aus der Liste */
  function entferneTag(tagZumEntfernen: string) {
    const neueTags = tags.filter((t) => t !== tagZumEntfernen);
    speichereTags(neueTags);
    toast.success(`Tag „${tagZumEntfernen}" entfernt`);
  }

  /** Fügt einen neuen Tag hinzu (wenn noch nicht vorhanden) */
  function fuegeTagHinzu(neuerTag: string) {
    const bereinigt = neuerTag.trim();
    if (!bereinigt || tags.includes(bereinigt)) return;
    const neueTags = [...tags, bereinigt];
    speichereTags(neueTags);
    toast.success(`Tag „${bereinigt}" hinzugefügt`);
  }

  /** Eigenen Tag per Enter-Taste hinzufügen */
  function handleEingabe(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      fuegeTagHinzu(eigenerTag);
      setEigenerTag("");
    }
  }

  // Vordefinierte Tags die noch nicht gesetzt sind
  const verfuegbareTags = ALLE_TAGS.filter((t) => !tags.includes(t));

  return (
    <div className="space-y-3">
      {/* Aktive Tags mit X-Button zum Entfernen */}
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary"
          >
            {tag}
            <button
              type="button"
              onClick={() => entferneTag(tag)}
              disabled={speichertGerade}
              className="ml-0.5 hover:text-destructive transition-colors disabled:opacity-40"
              title={`Tag „${tag}" entfernen`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}

        {/* Button zum Öffnen der Tag-Auswahl */}
        <button
          type="button"
          onClick={() => setZeigeAuswahl(!zeigeAuswahl)}
          disabled={speichertGerade}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border border-dashed border-primary/40 text-primary hover:bg-primary/10 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Tag hinzufügen
        </button>
      </div>

      {/* Tag-Auswahl-Panel */}
      {zeigeAuswahl && (
        <div className="p-4 rounded-xl border bg-muted/30 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Tag className="h-4 w-4" />
            Tag auswählen oder eingeben
          </div>

          {/* Vordefinierte Tags */}
          <div className="flex flex-wrap gap-2">
            {verfuegbareTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  fuegeTagHinzu(tag);
                }}
                className="px-3 py-1 rounded-full text-sm bg-background border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Eigenen Tag eintippen */}
          <div className="flex gap-2">
            <input
              value={eigenerTag}
              onChange={(e) => setEigenerTag(e.target.value)}
              onKeyDown={handleEingabe}
              placeholder="Eigenen Tag eingeben und Enter drücken..."
              className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background"
            />
            <button
              type="button"
              onClick={() => {
                fuegeTagHinzu(eigenerTag);
                setEigenerTag("");
              }}
              disabled={!eigenerTag.trim()}
              className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm disabled:opacity-40"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* Panel schließen */}
          <button
            type="button"
            onClick={() => setZeigeAuswahl(false)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Schließen
          </button>
        </div>
      )}

      {tags.length === 0 && (
        <p className="text-sm text-muted-foreground">Noch keine Tags vergeben.</p>
      )}
    </div>
  );
}
