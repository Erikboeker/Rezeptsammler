// ====================================================
// RecipeHeader – Kopfbereich der Rezept-Detailseite
// Zeigt Titel, Tags, Bewertungs-Widget, Zeiten und Bildkarussell
// ====================================================

import Link from "next/link";
import { Clock, Users, ExternalLink, ChevronLeft } from "lucide-react";
import { Rezept } from "@/lib/types";
import { ImageCarousel } from "./ImageCarousel";
import { StarBewertung } from "./StarBewertung";

interface Props {
  rezept: Rezept;
}

/**
 * Kopfbereich der Rezept-Detailseite.
 * Enthält Navigation, Metadaten, Tags, Sternebewertung und Bildkarussell.
 */
export function RecipeHeader({ rezept }: Props) {
  // Gesamtzeit berechnen
  const gesamtzeit = (rezept.vorbereitungszeit ?? 0) + (rezept.kochzeit ?? 0);

  return (
    <div>
      {/* Zurück-Navigation */}
      <Link
        href="/bibliothek"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ChevronLeft className="h-4 w-4" />
        Zur Bibliothek
      </Link>

      {/* Tags-Zeile */}
      {rezept.tags && rezept.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {rezept.tags.map((tag) => (
            <span
              key={tag}
              className="text-sm px-3 py-1 rounded-full font-medium bg-primary/10 text-primary"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Titel */}
      <h1 className="text-3xl font-bold mb-3">{rezept.titel}</h1>

      {/* Sternebewertung – klickbar zum Bewerten */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground mb-1">
          {rezept.bewertung ? "Meine Bewertung:" : "Noch nicht bewertet – klicke zum Bewerten:"}
        </p>
        <StarBewertung
          rezeptId={rezept.id}
          bewertung={rezept.bewertung}
          groesse="lg"
          editierbar={true}
        />
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
      <div className="mt-8 max-w-2xl mx-auto">
        <ImageCarousel rezept={rezept} />
      </div>
    </div>
  );
}
