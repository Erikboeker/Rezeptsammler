"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Save, RotateCcw, Loader2 } from "lucide-react";
import { ExtraktionsErgebnis, KATEGORIEN } from "@/lib/types";
import { IngredientEditor } from "./IngredientEditor";

interface Props {
  initialData: ExtraktionsErgebnis;
  onReset: () => void;
}

export function RecipePreview({ initialData, onReset }: Props) {
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/rezepte", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Speichern fehlgeschlagen");
      toast.success("Rezept gespeichert!");
      window.location.href = "/bibliothek";
    } catch {
      toast.error("Fehler beim Speichern");
      setSaving(false);
    }
  }

  function updateSchritt(index: number, value: string) {
    const schritte = [...data.schritte];
    schritte[index] = value;
    setData({ ...data, schritte });
  }

  function addSchritt() {
    setData({ ...data, schritte: [...data.schritte, ""] });
  }

  function removeSchritt(index: number) {
    setData({ ...data, schritte: data.schritte.filter((_, i) => i !== index) });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Rezept überprüfen &amp; speichern</h2>
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="h-4 w-4" />
          Neu starten
        </button>
      </div>

      {/* Bildvorschau */}
      {(data.bilder_urls?.[0] || data.bild_url) && (
        <div className="relative h-48 sm:h-64 w-full rounded-xl overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.bilder_urls?.[0] || data.bild_url}
            alt="Rezeptvorschau"
            className="object-cover w-full h-full"
          />
        </div>
      )}

      {/* Metadaten */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Titel</label>
          <input
            value={data.titel}
            onChange={(e) => setData({ ...data, titel: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Kategorie</label>
          <select
            value={data.kategorie}
            onChange={(e) => setData({ ...data, kategorie: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
          >
            {KATEGORIEN.map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Vorbereitungszeit (Min.)</label>
          <input
            type="number"
            min="0"
            value={data.vorbereitungszeit ?? ""}
            onChange={(e) =>
              setData({ ...data, vorbereitungszeit: Number(e.target.value) || undefined })
            }
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Kochzeit (Min.)</label>
          <input
            type="number"
            min="0"
            value={data.kochzeit ?? ""}
            onChange={(e) =>
              setData({ ...data, kochzeit: Number(e.target.value) || undefined })
            }
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Portionen</label>
          <input
            type="number"
            min="1"
            value={data.portionen ?? 4}
            onChange={(e) =>
              setData({ ...data, portionen: Number(e.target.value) || 4 })
            }
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Zutaten */}
      <div>
        <h3 className="font-semibold mb-3">Zutaten</h3>
        <IngredientEditor
          zutaten={data.zutaten}
          onChange={(zutaten) => setData({ ...data, zutaten })}
        />
      </div>

      {/* Schritte */}
      <div>
        <h3 className="font-semibold mb-3">Zubereitung</h3>
        <div className="space-y-2">
          {data.schritte.map((schritt, i) => (
            <div key={i} className="flex gap-2">
              <span className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold mt-1.5">
                {i + 1}
              </span>
              <textarea
                value={typeof schritt === "string" ? schritt : (schritt as { text: string }).text}
                onChange={(e) => updateSchritt(i, e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                rows={2}
              />
              <button
                type="button"
                onClick={() => removeSchritt(i)}
                className="flex-shrink-0 text-muted-foreground hover:text-destructive text-sm mt-2"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addSchritt}
            className="text-sm text-primary hover:text-primary/80 font-medium"
          >
            + Schritt hinzufügen
          </button>
        </div>
      </div>

      {/* Nährwerte */}
      {data.naehrwerte && (
        <div>
          <h3 className="font-semibold mb-3">Nährwerte (pro Portion)</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {(
              [
                { key: "kalorien", label: "Kalorien (kcal)" },
                { key: "protein", label: "Protein (g)" },
                { key: "kohlenhydrate", label: "Kohlenhydrate (g)" },
                { key: "fett", label: "Fett (g)" },
              ] as const
            ).map(({ key, label }) => (
              <div key={key}>
                <label className="block text-xs text-muted-foreground mb-1">{label}</label>
                <input
                  type="number"
                  min="0"
                  value={data.naehrwerte?.[key] ?? ""}
                  onChange={(e) =>
                    setData({
                      ...data,
                      naehrwerte: { ...data.naehrwerte!, [key]: Number(e.target.value) },
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Speichern */}
      <button
        type="button"
        onClick={handleSave}
        disabled={saving || !data.titel.trim()}
        className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 px-4 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        {saving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Speichern...
          </>
        ) : (
          <>
            <Save className="h-4 w-4" /> Rezept speichern
          </>
        )}
      </button>
    </div>
  );
}
