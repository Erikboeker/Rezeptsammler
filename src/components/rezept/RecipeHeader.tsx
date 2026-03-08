import Link from "next/link";
import { Clock, Users, ExternalLink, ChevronLeft } from "lucide-react";
import { Rezept } from "@/lib/types";

const KATEGORIE_FARBEN: Record<string, string> = {
  Frühstück: "bg-yellow-100 text-yellow-800",
  Hauptspeise: "bg-orange-100 text-orange-800",
  Dessert: "bg-pink-100 text-pink-800",
  Vorspeise: "bg-green-100 text-green-800",
  Snack: "bg-blue-100 text-blue-800",
  Suppe: "bg-red-100 text-red-800",
  Salat: "bg-emerald-100 text-emerald-800",
  Vegan: "bg-lime-100 text-lime-800",
  Vegetarisch: "bg-teal-100 text-teal-800",
  Sonstiges: "bg-gray-100 text-gray-800",
};

interface Props {
  rezept: Rezept;
}

export function RecipeHeader({ rezept }: Props) {
  const kategorieFarbe =
    KATEGORIE_FARBEN[rezept.kategorie] ?? KATEGORIE_FARBEN["Sonstiges"];
  const gesamtzeit =
    (rezept.vorbereitungszeit ?? 0) + (rezept.kochzeit ?? 0);

  return (
    <div>
      <Link
        href="/bibliothek"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ChevronLeft className="h-4 w-4" />
        Zur Bibliothek
      </Link>

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className={`text-sm px-3 py-1 rounded-full font-medium ${kategorieFarbe}`}>
          {rezept.kategorie}
        </span>
      </div>

      <h1 className="text-3xl font-bold mb-4">{rezept.titel}</h1>

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
    </div>
  );
}
