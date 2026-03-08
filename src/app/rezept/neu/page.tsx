// ====================================================
// Seite: /rezept/neu – Manuelles Erfassen eines Rezepts
// ====================================================

import { RezeptFormular } from "@/components/rezept/RezeptFormular";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function NeuesRezeptPage() {
  return (
    <div className="container max-w-3xl mx-auto px-4 py-8">
      {/* Navigation */}
      <Link
        href="/extrahieren"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        Zurück zu Extrahieren
      </Link>

      <h1 className="text-2xl font-bold mb-2">Rezept manuell erfassen</h1>
      <p className="text-muted-foreground mb-8">
        Gib alle Informationen direkt ein – kein Link oder Foto nötig.
      </p>

      {/* Leeres Formular für ein neues Rezept */}
      <RezeptFormular />
    </div>
  );
}
