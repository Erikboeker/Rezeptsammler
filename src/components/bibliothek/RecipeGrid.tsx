"use client";

import { useState, useCallback, useEffect } from "react";
import { ChefHat } from "lucide-react";
import { Rezept } from "@/lib/types";
import { RecipeCard } from "./RecipeCard";
import { SearchFilter } from "./SearchFilter";

interface Props {
  initialRezepte: Rezept[];
}

export function RecipeGrid({ initialRezepte }: Props) {
  const [rezepte, setRezepte] = useState(initialRezepte);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setRezepte(initialRezepte);
  }, [initialRezepte]);

  const fetchRezepte = useCallback(
    async (kategorie?: string, suche?: string) => {
      setLoading(true);
      const params = new URLSearchParams();
      if (kategorie) params.set("kategorie", kategorie);
      if (suche) params.set("suche", suche);

      try {
        const res = await fetch(`/api/rezepte?${params}`);
        if (res.ok) {
          const data = await res.json() as Rezept[];
          setRezepte(data);
        }
      } finally {
        setLoading(false);
      }
    },
    []
  );

  function handleDelete(id: string) {
    setRezepte((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Meine Rezepte</h1>
        <p className="text-muted-foreground mt-1">
          {rezepte.length} {rezepte.length === 1 ? "Rezept" : "Rezepte"} gespeichert
        </p>
      </div>

      <SearchFilter onChange={fetchRezepte} />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-40 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      ) : rezepte.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <ChefHat className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">Keine Rezepte gefunden</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {rezepte.map((rezept) => (
            <RecipeCard key={rezept.id} rezept={rezept} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
