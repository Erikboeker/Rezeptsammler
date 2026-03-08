import { ExtractionForm } from "@/components/extraktion/ExtractionForm";

export const metadata = {
  title: "Rezept extrahieren – Rezeptsammler",
};

export default function ExtrahierenPage() {
  return (
    <div className="container max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Rezept extrahieren</h1>
        <p className="text-muted-foreground mt-2">
          Gib eine URL ein oder lade ein Foto hoch – die KI erkennt das Rezept automatisch.
        </p>
      </div>
      <ExtractionForm />
    </div>
  );
}
