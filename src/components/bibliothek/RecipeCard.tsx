"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Clock, Trash2, ExternalLink } from "lucide-react";
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
  onDelete: (id: string) => void;
}

export function RecipeCard({ rezept, onDelete }: Props) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const gesamtzeit = (rezept.vorbereitungszeit ?? 0) + (rezept.kochzeit ?? 0);
  const kategorieFarbe =
    KATEGORIE_FARBEN[rezept.kategorie] ?? KATEGORIE_FARBEN["Sonstiges"];

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!showConfirm) {
      setShowConfirm(true);
      setTimeout(() => setShowConfirm(false), 3000);
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/rezepte/${rezept.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Rezept gelöscht");
      onDelete(rezept.id);
    } catch {
      toast.error("Löschen fehlgeschlagen");
      setDeleting(false);
      setShowConfirm(false);
    }
  }

  return (
    <Link href={`/rezept/${rezept.id}`}>
      <div className="group relative bg-white border rounded-xl overflow-hidden hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer">
        {/* Farbstreifen oben */}
        <div className={`h-1.5 ${kategorieFarbe.split(" ")[0]}`} />

        <div className="p-4">
          {/* Kategorie + Löschen */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${kategorieFarbe}`}>
              {rezept.kategorie}
            </span>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className={`transition-opacity p-1 rounded hover:bg-muted ${
                showConfirm
                  ? "opacity-100 text-destructive"
                  : "opacity-0 group-hover:opacity-100 text-muted-foreground"
              }`}
            >
              {showConfirm ? (
                <span className="text-xs font-medium whitespace-nowrap">Sicher?</span>
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
            </button>
          </div>

          <h3 className="font-semibold text-sm line-clamp-2 mb-3 leading-snug">
            {rezept.titel}
          </h3>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            {gesamtzeit > 0 ? (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {gesamtzeit} Min.
              </span>
            ) : (
              <span />
            )}
            {rezept.quelle_url && <ExternalLink className="h-3 w-3" />}
          </div>

          {rezept.zutaten?.length > 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              {rezept.zutaten.length} Zutaten
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
