import { Zutat } from "@/lib/types";

interface Props {
  zutaten: Zutat[];
  portionen?: number;
}

export function IngredientList({ zutaten, portionen }: Props) {
  return (
    <div className="bg-white border rounded-xl p-6">
      <h2 className="text-xl font-semibold mb-4">
        Zutaten
        {portionen != null && (
          <span className="text-sm font-normal text-muted-foreground ml-2">
            für {portionen} {portionen === 1 ? "Portion" : "Portionen"}
          </span>
        )}
      </h2>
      <div className="space-y-1">
        {zutaten.map((zutat, i) => {
          const mengText = String(zutat.menge);
          const istNachBelieben = mengText === "nach Belieben";
          return (
            <div
              key={zutat.id ?? i}
              className="flex items-baseline gap-3 py-2 border-b last:border-0"
            >
              <div className="min-w-[100px] text-right flex-shrink-0">
                {istNachBelieben ? (
                  <span className="text-sm text-muted-foreground italic">n. B.</span>
                ) : (
                  <>
                    <span className="font-medium text-sm">{mengText}</span>{" "}
                    <span className="text-sm text-muted-foreground">{zutat.einheit}</span>
                  </>
                )}
              </div>
              <span className="text-sm">{zutat.zutat}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
