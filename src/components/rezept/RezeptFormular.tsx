"use client";

// ====================================================
// RezeptFormular – Gemeinsames Formular für Neu & Bearbeiten
// Wird sowohl für manuelles Erfassen als auch zum Bearbeiten genutzt
// ====================================================

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Save, Loader2, Plus, X } from "lucide-react";
import { Zutat, EINHEITEN, ALLE_TAGS } from "@/lib/types";
import { IngredientEditor } from "@/components/extraktion/IngredientEditor";
import { ImageUpload } from "./ImageUpload";

// Leerer Ausgangszustand für ein neues Rezept
const LEERES_REZEPT = {
  titel: "",
  quelle_url: "",
  tags: [] as string[],
  vorbereitungszeit: undefined as number | undefined,
  kochzeit: undefined as number | undefined,
  portionen: 4 as number,
  bild_url: "",
  zutaten: [{ menge: "", einheit: "g", zutat: "" }] as Zutat[],
  schritte: [""] as string[],
  bilder_urls: [] as string[],
  naehrwerte: undefined as { kalorien: number; protein: number; kohlenhydrate: number; fett: number } | undefined,
};

type FormDaten = typeof LEERES_REZEPT;

interface Props {
  /** ID des Rezepts – wenn gesetzt, wird PUT (Update) verwendet; sonst POST (Neu) */
  rezeptId?: string;
  /** Vorausgefüllte Daten für den Bearbeitungs-Modus */
  initialDaten?: Partial<FormDaten> & {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    schritte?: any[];
  };
}

/**
 * Vollständiges Rezept-Eingabeformular.
 * Unterstützt zwei Modi:
 * - Neu erstellen (kein rezeptId): POST an /api/rezepte
 * - Bearbeiten (rezeptId vorhanden): PUT an /api/rezepte/:id
 */
export function RezeptFormular({ rezeptId, initialDaten }: Props) {
  const router = useRouter();

  // Schritte aus dem Objekt-Format in reinen Text konvertieren
  const initialSchritte = (initialDaten?.schritte ?? [""]).map((s: any) =>
    typeof s === "string" ? s : s.text
  );

  // Formular-Zustand initialisieren
  const [daten, setDaten] = useState<FormDaten>({
    ...LEERES_REZEPT,
    ...initialDaten,
    schritte: initialSchritte.length > 0 ? initialSchritte : [""],
  });

  const [speichertGerade, setSpeichertGerade] = useState(false);
  const [zeigeTagAuswahl, setZeigeTagAuswahl] = useState(false);
  const [eigenerTag, setEigenerTag] = useState("");
  const [zeigeNaehrwerte, setZeigeNaehrwerte] = useState(!!initialDaten?.naehrwerte);

  // ── Schritte-Verwaltung ──

  function aktualisiereSchritt(index: number, wert: string) {
    const neu = [...daten.schritte];
    neu[index] = wert;
    setDaten({ ...daten, schritte: neu });
  }

  function fuegeSchrittHinzu() {
    setDaten({ ...daten, schritte: [...daten.schritte, ""] });
  }

  function entferneSchritt(index: number) {
    setDaten({ ...daten, schritte: daten.schritte.filter((_, i) => i !== index) });
  }

  // ── Tags-Verwaltung ──

  function toggleTag(tag: string) {
    const aktuell = daten.tags ?? [];
    const neu = aktuell.includes(tag)
      ? aktuell.filter((t) => t !== tag)
      : [...aktuell, tag];
    setDaten({ ...daten, tags: neu });
  }

  function fuegeEigenenTagHinzu(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      const bereinigt = eigenerTag.trim();
      if (bereinigt && !(daten.tags ?? []).includes(bereinigt)) {
        setDaten({ ...daten, tags: [...(daten.tags ?? []), bereinigt] });
      }
      setEigenerTag("");
    }
  }

  function entferneTag(tag: string) {
    setDaten({ ...daten, tags: (daten.tags ?? []).filter((t) => t !== tag) });
  }

  // ── Speichern ──

  async function handleSpeichern() {
    // Pflichtfeld prüfen
    if (!daten.titel.trim()) {
      toast.error("Bitte gib einen Titel ein.");
      return;
    }

    // Leere Schritte und Zutaten herausfiltern
    const bereinigteDaten = {
      ...daten,
      schritte: daten.schritte.filter((s) => s.trim()),
      zutaten: daten.zutaten.filter((z) => z.zutat.trim()),
      quelle_url: daten.quelle_url || null,
      bild_url: daten.bild_url || null,
      naehrwerte: zeigeNaehrwerte ? daten.naehrwerte : undefined,
    };

    setSpeichertGerade(true);
    try {
      const istNeu = !rezeptId;
      const url = istNeu ? "/api/rezepte" : `/api/rezepte/${rezeptId}`;
      const methode = istNeu ? "POST" : "PUT";

      const antwort = await fetch(url, {
        method: methode,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bereinigteDaten),
      });

      if (!antwort.ok) {
        const fehler = await antwort.json().catch(() => ({}));
        throw new Error(fehler.detail ?? fehler.error ?? "Speichern fehlgeschlagen");
      }

      toast.success(istNeu ? "Rezept gespeichert!" : "Rezept aktualisiert!");
      router.push("/bibliothek");
      router.refresh();
    } catch (fehler) {
      const meldung = fehler instanceof Error ? fehler.message : "Unbekannter Fehler";
      toast.error(`Fehler: ${meldung}`);
    } finally {
      setSpeichertGerade(false);
    }
  }

  // ── Hilfsstile ──
  const eingabeKlasse = "w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary";

  return (
    <div className="space-y-8 max-w-3xl mx-auto">

      {/* ── Basisdaten ── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">Grunddaten</h2>

        {/* Titel */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Titel <span className="text-destructive">*</span>
          </label>
          <input
            value={daten.titel}
            onChange={(e) => setDaten({ ...daten, titel: e.target.value })}
            placeholder="z. B. Spaghetti Carbonara"
            className={eingabeKlasse}
            required
          />
        </div>

        {/* Zeiten + Portionen */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Vorbereitungszeit (Min.)</label>
            <input
              type="number" min="0"
              value={daten.vorbereitungszeit ?? ""}
              onChange={(e) => setDaten({ ...daten, vorbereitungszeit: Number(e.target.value) || undefined })}
              className={eingabeKlasse}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Kochzeit (Min.)</label>
            <input
              type="number" min="0"
              value={daten.kochzeit ?? ""}
              onChange={(e) => setDaten({ ...daten, kochzeit: Number(e.target.value) || undefined })}
              className={eingabeKlasse}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Portionen</label>
            <input
              type="number" min="1"
              value={daten.portionen ?? 4}
              onChange={(e) => setDaten({ ...daten, portionen: Number(e.target.value) || 4 })}
              className={eingabeKlasse}
            />
          </div>
        </div>

        {/* Quell-URL */}
        <div>
          <label className="block text-sm font-medium mb-1">Quelle (URL, optional)</label>
          <input
            type="url"
            value={daten.quelle_url ?? ""}
            onChange={(e) => setDaten({ ...daten, quelle_url: e.target.value })}
            placeholder="https://..."
            className={eingabeKlasse}
          />
        </div>
      </section>

      {/* ── Tags ── */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold border-b pb-2">Tags</h2>

        {/* Aktive Tags */}
        <div className="flex flex-wrap gap-2">
          {(daten.tags ?? []).map((tag) => (
            <span key={tag} className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
              {tag}
              <button type="button" onClick={() => entferneTag(tag)} className="hover:text-destructive ml-0.5">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={() => setZeigeTagAuswahl(!zeigeTagAuswahl)}
            className="flex items-center gap-1 px-3 py-1 rounded-full border border-dashed text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Tag hinzufügen
          </button>
        </div>

        {/* Tag-Auswahl-Panel */}
        {zeigeTagAuswahl && (
          <div className="p-4 rounded-xl border bg-muted/30 space-y-3">
            <div className="flex flex-wrap gap-2">
              {ALLE_TAGS.filter((t) => !(daten.tags ?? []).includes(t)).map((tag) => (
                <button
                  key={tag} type="button"
                  onClick={() => toggleTag(tag)}
                  className="px-3 py-1 rounded-full text-sm bg-background border hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
            <input
              value={eigenerTag}
              onChange={(e) => setEigenerTag(e.target.value)}
              onKeyDown={fuegeEigenenTagHinzu}
              placeholder="Eigenen Tag eingeben und Enter drücken..."
              className={eingabeKlasse}
            />
          </div>
        )}
      </section>

      {/* ── Bilder ── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">Bilder</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Bild-Upload für jedes Bild oder neue hinzufügen */}
          {(daten.bilder_urls ?? []).map((url, i) => (
            <div key={i} className="relative aspect-[4/3] rounded-lg overflow-hidden border group bg-muted">
              {/* ImageUpload im Bearbeitungsmodus für vorhandene Bilder */}
              <ImageUpload 
                currentUrl={url}
                onUpload={(neueUrl) => {
                  const neu = [...(daten.bilder_urls ?? [])];
                  neu[i] = neueUrl;
                  setDaten({ ...daten, bilder_urls: neu });
                }}
              />
              <button
                type="button"
                onClick={() => {
                  const neu = (daten.bilder_urls ?? []).filter((_, index) => index !== i);
                  setDaten({ ...daten, bilder_urls: neu });
                }}
                className="absolute top-2 right-2 p-1.5 bg-destructive/90 text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                title="Bild entfernen"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          
          {/* Button zum Hinzufügen eines neuen Bildes */}
          <div className="aspect-[4/3]">
            <ImageUpload 
              onUpload={(url) => {
                const aktuell = daten.bilder_urls ?? [];
                setDaten({ ...daten, bilder_urls: [...aktuell, url] });
              }}
              label="Bild hinzufügen"
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground italic">
          Tipp: Alle Bilder werden beim Hochladen automatisch auf das 4:3 Format zugeschnitten.
        </p>
      </section>

      {/* ── Zutaten ── */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold border-b pb-2">Zutaten</h2>
        <IngredientEditor
          zutaten={daten.zutaten}
          onChange={(zutaten) => setDaten({ ...daten, zutaten })}
        />
      </section>

      {/* ── Zubereitungsschritte ── */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold border-b pb-2">Zubereitung</h2>
        <div className="space-y-3">
          {daten.schritte.map((schritt, i) => (
            <div key={i} className="flex gap-3 items-start">
              <span className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold mt-1.5">
                {i + 1}
              </span>
              <textarea
                value={schritt}
                onChange={(e) => aktualisiereSchritt(i, e.target.value)}
                placeholder={`Schritt ${i + 1} beschreiben...`}
                rows={2}
                className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
              {daten.schritte.length > 1 && (
                <button type="button" onClick={() => entferneSchritt(i)} className="mt-2 text-muted-foreground hover:text-destructive">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={fuegeSchrittHinzu} className="text-sm text-primary font-medium flex items-center gap-1">
            <Plus className="h-4 w-4" /> Schritt hinzufügen
          </button>
        </div>
      </section>

      {/* ── Nährwerte (optional) ── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between border-b pb-2">
          <h2 className="text-lg font-semibold">Nährwerte (optional)</h2>
          <button
            type="button"
            onClick={() => setZeigeNaehrwerte(!zeigeNaehrwerte)}
            className="text-sm text-primary"
          >
            {zeigeNaehrwerte ? "Ausblenden" : "Hinzufügen"}
          </button>
        </div>
        {zeigeNaehrwerte && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {([
              { schluessel: "kalorien", label: "Kalorien (kcal)" },
              { schluessel: "protein", label: "Protein (g)" },
              { schluessel: "kohlenhydrate", label: "Kohlenhydrate (g)" },
              { schluessel: "fett", label: "Fett (g)" },
            ] as const).map(({ schluessel, label }) => (
              <div key={schluessel}>
                <label className="block text-xs text-muted-foreground mb-1">{label}</label>
                <input
                  type="number" min="0"
                  value={daten.naehrwerte?.[schluessel] ?? ""}
                  onChange={(e) =>
                    setDaten({
                      ...daten,
                      naehrwerte: {
                        kalorien: 0, protein: 0, kohlenhydrate: 0, fett: 0,
                        ...daten.naehrwerte,
                        [schluessel]: Number(e.target.value),
                      },
                    })
                  }
                  className={eingabeKlasse}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Speichern-Button ── */}
      <button
        type="button"
        onClick={handleSpeichern}
        disabled={speichertGerade || !daten.titel.trim()}
        className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 px-4 rounded-xl font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors text-base"
      >
        {speichertGerade ? (
          <><Loader2 className="h-5 w-5 animate-spin" /> Wird gespeichert...</>
        ) : (
          <><Save className="h-5 w-5" /> {rezeptId ? "Änderungen speichern" : "Rezept speichern"}</>
        )}
      </button>
    </div>
  );
}
