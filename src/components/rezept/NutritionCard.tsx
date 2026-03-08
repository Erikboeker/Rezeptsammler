import { Flame, Beef, Wheat, Droplets } from "lucide-react";
import { Naehrwerte } from "@/lib/types";

interface Props {
  naehrwerte: Naehrwerte;
}

const MAKROS = [
  { key: "kalorien" as const, label: "Kalorien", unit: "kcal", Icon: Flame, color: "text-orange-500" },
  { key: "protein" as const, label: "Protein", unit: "g", Icon: Beef, color: "text-red-500" },
  { key: "kohlenhydrate" as const, label: "Kohlenhydrate", unit: "g", Icon: Wheat, color: "text-yellow-500" },
  { key: "fett" as const, label: "Fett", unit: "g", Icon: Droplets, color: "text-blue-500" },
];

export function NutritionCard({ naehrwerte }: Props) {
  return (
    <div className="bg-white border rounded-xl p-6">
      <h2 className="text-xl font-semibold mb-1">Nährwerte</h2>
      <p className="text-xs text-muted-foreground mb-4">pro Portion (KI-Schätzung)</p>
      <div className="grid grid-cols-2 gap-4">
        {MAKROS.map(({ key, label, unit, Icon, color }) => (
          <div key={key} className="text-center p-3 bg-muted/40 rounded-lg">
            <Icon className={`h-5 w-5 mx-auto mb-1 ${color}`} />
            <div className="text-xl font-bold">{naehrwerte[key]}</div>
            <div className="text-xs text-muted-foreground">{unit}</div>
            <div className="text-xs font-medium mt-0.5">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
