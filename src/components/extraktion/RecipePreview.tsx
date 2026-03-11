"use client";

// ====================================================
// RecipePreview – Vorschau und Bearbeitung nach der KI-Extraktion
// Unterstützt nun vollständiges Bild-Management:
// Bilder hinzufügen, löschen und zuschneiden
// ====================================================

import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Save, RotateCcw, Loader2, Crop, Plus, Trash2, ImageIcon } from "lucide-react";
import { ExtraktionsErgebnis, ALLE_TAGS } from "@/lib/types";
import { IngredientEditor } from "./IngredientEditor";
import { FotoZuschneidenModal } from "../rezept/FotoZuschneidenModal";

interface Props {
  initialData: ExtraktionsErgebnis;
  onReset: () => void;
}

export function RecipePreview({ initialData, onReset }: Props) {
  const [data, setData] = useState(initialData);
  const [saving, setSaving] = useState(false);

  // Zustand für das Zuschneiden
  const [bildZumZuschneiden, setBildZumZuschneiden] = useState<string | null>(null);
  // Index des Bildes, das bearbeitet wird (null = neues Bild wird hinzugefügt)
  const [bearbeiteteBildIndex, setBearbeiteteBildIndex] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Paste-Listener: Bild aus Zwischenablage einfügen (Strg+V) ──
  const handlePaste = useCallback((e: ClipboardEvent) => {
    // Nichts tun, wenn das Zuschneiden-Modal bereits offen ist
    if (bildZumZuschneiden) return;
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/")) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          const reader = new FileReader();
          reader.onload = () => {
            setBildZumZuschneiden(reader.result as string);
            setBearbeiteteBildIndex(null);
          };
          reader.readAsDataURL(file);
          break;
        }
      }
    }
  }, [bildZumZuschneiden]);

  useEffect(() => {
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [handlePaste]);

  // ── Hilfsfunktion: aktuelle Bilder-Liste ──
  function holeBilder(): string[] {
    if (data.bilder_urls && data.bilder_urls.length > 0) return data.bilder_urls;
    if (data.bild_url) return [data.bild_url];
    return [];
  }

  // ── Bilder aktualisieren ──
  function setzeBilder(neueUrls: string[]) {
    setData({
      ...data,
      bilder_urls: neueUrls,
      bild_url: neueUrls[0] ?? "",
    });
  }

  // ── Bild-Upload: Datei einlesen und Zuschneiden öffnen ──
  function handleImageAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setBildZumZuschneiden(reader.result as string);
      setBearbeiteteBildIndex(null); // null = neues Bild
    };
    reader.readAsDataURL(file);
    // Input zurücksetzen, damit dieselbe Datei nochmals gewählt werden kann
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // ── Bestehendes Bild zuschneiden ──
  function oeffneZuschneiden(index: number) {
    setBildZumZuschneiden(holeBilder()[index]);
    setBearbeiteteBildIndex(index);
  }

  // ── Zuschneiden bestätigt ──
  function handleZuschneidenSpeichern(neueBildUrl: string) {
    setBildZumZuschneiden(null);
    const aktuelle = holeBilder();

    if (bearbeiteteBildIndex !== null) {
      // Bestehendes Bild ersetzen
      const neueUrls = [...aktuelle];
      neueUrls[bearbeiteteBildIndex] = neueBildUrl;
      setzeBilder(neueUrls);
    } else {
      // Neues Bild hinzufügen
      setzeBilder([...aktuelle, neueBildUrl]);
    }

    setBearbeiteteBildIndex(null);
  }

  // ── Bild löschen ──
  function entferneBild(index: number) {
    setzeBilder(holeBilder().filter((_, i) => i !== index));
  }

  // ── Schritte-Verwaltung ──
  function updateSchritt(index: number, value: string) {
    const schritte = [...data.schritte];
    schritte[index] = value;
    setData({ ...data, schritte });
  }
  function addSchritt() { setData({ ...data, schritte: [...data.schritte, ""] }); }
  function removeSchritt(index: number) { setData({ ...data, schritte: data.schritte.filter((_, i) => i !== index) }); }

  // ── Speichern ──
  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/rezepte", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        let errMsg = `HTTP ${res.status}`;
        try { const errData = await res.json(); errMsg = errData?.error ?? errMsg; } catch { /* ignore */ }
        throw new Error(errMsg);
      }
      toast.success("Rezept gespeichert!");
      window.location.href = "/bibliothek";
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unbekannter Fehler";
      toast.error(`Fehler beim Speichern: ${msg}`);
      setSaving(false);
    }
  }

  const bilder = holeBilder();

  return (
    <div className="space-y-6">
      {/* Zuschneiden-Modal */}
      {bildZumZuschneiden && (
        <FotoZuschneidenModal
          bildUrl={bildZumZuschneiden}
          onAbbruch={() => { setBildZumZuschneiden(null); setBearbeiteteBildIndex(null); }}
          onSpeichern={handleZuschneidenSpeichern}
        />
      )}

      {/* Header */}
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

      {/* ── Bild-Verwaltung ── */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm flex items-center gap-2 text-muted-foreground uppercase tracking-wide">
          <ImageIcon className="h-4 w-4" /> Bilder
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {/* Vorhandene Bilder */}
          {bilder.map((url, i) => (
            <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-muted group border shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Bild ${i + 1}`} className="w-full h-full object-cover" />

              {/* Hover-Overlay mit Aktions-Buttons */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {/* Zuschneiden */}
                <button
                  type="button"
                  onClick={() => oeffneZuschneiden(i)}
                  title="Zuschneiden"
                  className="p-2 rounded-lg bg-white/20 hover:bg-white/40 text-white backdrop-blur-sm transition-colors"
                >
                  <Crop className="h-4 w-4" />
                </button>
                {/* Löschen */}
                <button
                  type="button"
                  onClick={() => entferneBild(i)}
                  title="Löschen"
                  className="p-2 rounded-lg bg-red-500/80 hover:bg-red-600 text-white backdrop-blur-sm transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* "Hauptbild"-Badge */}
              {i === 0 && (
                <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-primary text-[10px] font-bold text-white shadow">
                  Hauptbild
                </span>
              )}
            </div>
          ))}

          {/* Button zum Hinzufügen weiterer Bilder */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary hover:border-primary hover:bg-primary/5 transition-all"
          >
            <Plus className="h-6 w-6" />
            <span className="text-xs font-medium">Bild hinzufügen</span>
          </button>
        </div>

        {/* Verstecktes File-Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageAdd}
          className="hidden"
        />
      </div>

      {/* ── Metadaten ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Titel</label>
          <input
            value={data.titel}
            onChange={(e) => setData({ ...data, titel: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium mb-2">Tags</label>
          {/* Vordefinierte Tags */}
          <div className="flex flex-wrap gap-2 mb-2">
            {ALLE_TAGS.map((tag) => {
              const IstAktiv = (data.tags ?? []).includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    const aktuelleTags = data.tags ?? [];
                    const neueTags = IstAktiv
                      ? aktuelleTags.filter((t) => t !== tag)
                      : [...aktuelleTags, tag];
                    setData({ ...data, tags: neueTags });
                  }}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    IstAktiv
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
          {/* Eigener Tag */}
          <input
            placeholder="Eigenen Tag eingeben und Enter drücken..."
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const eingabe = e.currentTarget.value.trim();
                if (eingabe && !(data.tags ?? []).includes(eingabe)) {
                  setData({ ...data, tags: [...(data.tags ?? []), eingabe] });
                }
                e.currentTarget.value = "";
              }
            }}
          />
          {/* Aktive Tags */}
          {(data.tags ?? []).length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {(data.tags ?? []).map((tag) => (
                <span key={tag} className="flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs">
                  {tag}
                  <button
                    type="button"
                    onClick={() => setData({ ...data, tags: (data.tags ?? []).filter((t) => t !== tag) })}
                    className="hover:text-destructive ml-0.5"
                  >✕</button>
                </span>
              ))}
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Vorbereitungszeit (Min.)</label>
          <input
            type="number" min="0"
            value={data.vorbereitungszeit ?? ""}
            onChange={(e) => setData({ ...data, vorbereitungszeit: Number(e.target.value) || undefined })}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Kochzeit (Min.)</label>
          <input
            type="number" min="0"
            value={data.kochzeit ?? ""}
            onChange={(e) => setData({ ...data, kochzeit: Number(e.target.value) || undefined })}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Portionen</label>
          <input
            type="number" min="1"
            value={data.portionen ?? 4}
            onChange={(e) => setData({ ...data, portionen: Number(e.target.value) || 4 })}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* ── Zutaten ── */}
      <div>
        <h3 className="font-semibold mb-3">Zutaten</h3>
        <IngredientEditor
          zutaten={data.zutaten}
          onChange={(zutaten) => setData({ ...data, zutaten })}
        />
      </div>

      {/* ── Schritte ── */}
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
              >✕</button>
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

      {/* ── Nährwerte ── */}
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
                  type="number" min="0"
                  value={data.naehrwerte?.[key] ?? ""}
                  onChange={(e) =>
                    setData({ ...data, naehrwerte: { ...data.naehrwerte!, [key]: Number(e.target.value) } })
                  }
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Speichern ── */}
      <button
        type="button"
        onClick={handleSave}
        disabled={saving || !data.titel.trim()}
        className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 px-4 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        {saving ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Speichern...</>
        ) : (
          <><Save className="h-4 w-4" /> Rezept speichern</>
        )}
      </button>
    </div>
  );
}
