// ====================================================
// RecipeHeader – Kopfbereich der Rezept-Detailseite
// Zeigt Titel, editierbare Tags, Bewertungs-Widget,
// Zeiten, Bildkarussell und Löschen-Button
// ====================================================

import Link from "next/link";
import { Clock, Users, ExternalLink, ChevronLeft, Printer, Pencil } from "lucide-react";
import { Rezept } from "@/lib/types";
import { ImageCarousel } from "./ImageCarousel";
import { StarBewertung } from "./StarBewertung";
import { TagEditor } from "./TagEditor";
import { RezeptLoeschen } from "./RezeptLoeschen";

interface Props {
  rezept: Rezept;
}

/**
 * Kopfbereich der Rezept-Detailseite.
 * Enthält Navigation, editierbare Tags, Sternebewertung,
 * Metadaten, Bildkarussell und Löschen-Funktion.
 */
export function RecipeHeader({ rezept }: Props) {
  // Gesamtzeit aus Vorbereitungs- und Kochzeit berechnen
  const gesamtzeit = (rezept.vorbereitungszeit ?? 0) + (rezept.kochzeit ?? 0);

  return (
    <div className="space-y-6">
      {/* Zurück-Navigation + Aktions-Buttons */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Link
          href="/bibliothek"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Zur Bibliothek
        </Link>

        <div className="flex items-center gap-2">
          {/* Bearbeiten-Button */}
          <Link
            href={`/rezept/${rezept.id}/bearbeiten`}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium hover:bg-muted transition-colors"
          >
            <Pencil className="h-4 w-4" />
            Bearbeiten
          </Link>

          {/* Drucken / PDF / Teilen */}
          <Link
            href={`/rezept/${rezept.id}/drucken`}
            target="_blank"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium hover:bg-muted transition-colors"
          >
            <Printer className="h-4 w-4" />
            PDF / Teilen
          </Link>

          {/* Löschen-Button (Client-Komponente) */}
          <RezeptLoeschen rezeptId={rezept.id} rezeptTitel={rezept.titel} />
        </div>
      </div>

      {/* Titel */}
      <h1 className="text-3xl font-bold">{rezept.titel}</h1>

      {/* Sternebewertung – klickbar zum Bewerten */}
      <div>
        <p className="text-sm text-muted-foreground mb-1">
          {rezept.bewertung
            ? `Meine Bewertung: ${rezept.bewertung}/5`
            : "Noch nicht bewertet – klicke zum Bewerten:"}
        </p>
        <StarBewertung
          rezeptId={rezept.id}
          bewertung={rezept.bewertung}
          groesse="lg"
          editierbar={true}
        />
      </div>

      {/* Editierbare Tags (Client-Komponente) */}
      <div>
        <p className="text-sm font-medium mb-2">Tags:</p>
        <TagEditor rezeptId={rezept.id} initialTags={rezept.tags ?? []} />
      </div>

      {/* Zeit- und Portionsangaben */}
      <div className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
        {rezept.vorbereitungszeit != null && (
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            Vorbereitung: {rezept.vorbereitungszeit} Min.
          </span>
        )}
        {rezept.kochzeit != null && (
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            Kochzeit: {rezept.kochzeit} Min.
          </span>
        )}
        {gesamtzeit > 0 && (
          <span className="flex items-center gap-1.5 font-medium text-foreground">
            Gesamt: {gesamtzeit} Min.
          </span>
        )}
        {rezept.portionen != null && (
          <span className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            {rezept.portionen} Portionen
          </span>
        )}
        {rezept.quelle_url && (
          <a
            href={rezept.quelle_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-primary hover:underline"
          >
            <ExternalLink className="h-4 w-4" />
            Originalrezept
          </a>
        )}
      </div>

      {/* Bildkarussell */}
      <div className="max-w-2xl mx-auto">
        <ImageCarousel rezept={rezept} />
      </div>
    </div>
  );
}
