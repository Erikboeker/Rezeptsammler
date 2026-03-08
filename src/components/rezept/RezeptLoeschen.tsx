"use client";

// ====================================================
// RezeptLoeschen – Löschen-Button für die Detailseite
// Zweistufige Bestätigung, dann Weiterleitung zur Bibliothek
// ====================================================

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, AlertTriangle, X, Check } from "lucide-react";
import { toast } from "sonner";

interface Props {
  /** ID des zu löschenden Rezepts */
  rezeptId: string;
  /** Titel des Rezepts (für die Bestätigungsanzeige) */
  rezeptTitel: string;
}

/**
 * Löschen-Button mit zweistufiger Bestätigung.
 * Nach erfolgreichem Löschen wird zur Bibliothek weitergeleitet.
 */
export function RezeptLoeschen({ rezeptId, rezeptTitel }: Props) {
  const router = useRouter();
  const [zeigeBestaetigung, setZeigeBestaetigung] = useState(false);
  const [loeschtGerade, setLoeschtGerade] = useState(false);

  /**
   * Löscht das Rezept über die DELETE-API und leitet zur Bibliothek weiter.
   */
  async function handleLoeschen() {
    setLoeschtGerade(true);
    try {
      const antwort = await fetch(`/api/rezepte/${rezeptId}`, {
        method: "DELETE",
      });

      if (!antwort.ok) throw new Error("Löschen fehlgeschlagen");

      toast.success(`„${rezeptTitel}" wurde gelöscht`);
      // Zur Bibliothek weiterleiten
      router.push("/bibliothek");
      router.refresh();
    } catch {
      toast.error("Rezept konnte nicht gelöscht werden");
      setLoeschtGerade(false);
      setZeigeBestaetigung(false);
    }
  }

  // Bestätigungs-Panel anzeigen
  if (zeigeBestaetigung) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-800">
        <AlertTriangle className="h-5 w-5 shrink-0" />
        <span className="text-sm font-medium flex-1">
          Rezept wirklich löschen?
        </span>
        <button
          type="button"
          onClick={handleLoeschen}
          disabled={loeschtGerade}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors disabled:opacity-40"
        >
          <Check className="h-4 w-4" />
          {loeschtGerade ? "Wird gelöscht..." : "Ja, löschen"}
        </button>
        <button
          type="button"
          onClick={() => setZeigeBestaetigung(false)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-300 hover:bg-red-100 text-sm font-medium transition-colors"
        >
          <X className="h-4 w-4" />
          Abbrechen
        </button>
      </div>
    );
  }

  // Standard Löschen-Button
  return (
    <button
      type="button"
      onClick={() => setZeigeBestaetigung(true)}
      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-400 text-sm font-medium transition-colors"
    >
      <Trash2 className="h-4 w-4" />
      Rezept löschen
    </button>
  );
}
