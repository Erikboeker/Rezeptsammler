interface Schritt {
  id?: string;
  nummer: number;
  text: string;
}

interface Props {
  schritte: Schritt[];
}

export function StepList({ schritte }: Props) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Zubereitung</h2>
      <div className="space-y-4">
        {schritte.map((schritt) => (
          <div key={schritt.id ?? schritt.nummer} className="flex gap-4">
            <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">
              {schritt.nummer}
            </div>
            <div className="flex-1 bg-white border rounded-xl p-4">
              <p className="text-sm leading-relaxed">{schritt.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
