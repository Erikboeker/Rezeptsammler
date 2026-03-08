"use client";

import { Zutat, EINHEITEN } from "@/lib/types";
import { Plus, Trash2 } from "lucide-react";

interface Props {
  zutaten: Zutat[];
  onChange: (zutaten: Zutat[]) => void;
}

export function IngredientEditor({ zutaten, onChange }: Props) {
  function update(index: number, field: keyof Zutat, value: string) {
    const updated = zutaten.map((z, i) =>
      i === index ? { ...z, [field]: value } : z
    );
    onChange(updated);
  }

  function add() {
    onChange([...zutaten, { menge: "", einheit: "g", zutat: "" }]);
  }

  function remove(index: number) {
    onChange(zutaten.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[80px_130px_1fr_32px] gap-2 text-xs font-medium text-muted-foreground px-1">
        <span>Menge</span>
        <span>Einheit</span>
        <span>Zutat</span>
        <span />
      </div>
      {zutaten.map((z, i) => (
        <div key={i} className="grid grid-cols-[80px_130px_1fr_32px] gap-2 items-center">
          <input
            value={String(z.menge)}
            onChange={(e) => update(i, "menge", e.target.value)}
            placeholder="250"
            className="px-2 py-1.5 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <select
            value={z.einheit}
            onChange={(e) => update(i, "einheit", e.target.value)}
            className="px-2 py-1.5 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
          >
            {EINHEITEN.map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
          <input
            value={z.zutat}
            onChange={(e) => update(i, "zutat", e.target.value)}
            placeholder="Zutat-Name"
            className="px-2 py-1.5 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="button"
            onClick={() => remove(i)}
            className="text-muted-foreground hover:text-destructive transition-colors flex items-center justify-center"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 font-medium"
      >
        <Plus className="h-4 w-4" />
        Zutat hinzufügen
      </button>
    </div>
  );
}
