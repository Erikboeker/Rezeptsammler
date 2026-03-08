import Link from "next/link";
import { ExtractionForm } from "@/components/extraktion/ExtractionForm";
import { PenLine } from "lucide-react";

export const metadata = {
  title: "Rezept extrahieren – Rezeptsammler",
};

export default function ExtrahierenPage() {
  return (
    <div className="container max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Rezept extrahieren</h1>
          <p className="text-muted-foreground mt-2">
            Gib eine URL ein oder lade ein Foto hoch – die KI erkennt das Rezept automatisch.
          </p>
        </div>
        {/* Link zur manuellen Erfassung */}
        <Link
          href="/rezept/neu"
          className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium hover:bg-muted transition-colors"
        >
          <PenLine className="h-4 w-4" />
          Manuell erfassen
        </Link>
      </div>
      <ExtractionForm />
    </div>
  );
}
