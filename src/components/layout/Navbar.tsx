"use client";

// ====================================================
// Navbar – Hauptnavigation von "Eriks Rezepte"
// Zeigt App-Name, Version und prominenter Neu-Button
// ====================================================

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Plus, ChefHat } from "lucide-react";
import { cn } from "@/lib/utils";

// Versionsnummer aus package.json – wird zur Build-Zeit eingelesen
const APP_VERSION = "1.1.0";

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="border-b bg-white sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-6xl">

        {/* App-Logo + Name + Version */}
        <Link
          href="/bibliothek"
          className="flex items-center gap-2.5 font-bold text-xl group"
        >
          <div className="p-1.5 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <ChefHat className="h-5 w-5 text-primary" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-foreground font-bold tracking-tight">Eriks Rezepte</span>
            <span className="text-[10px] font-normal text-muted-foreground tracking-widest">
              v{APP_VERSION}
            </span>
          </div>
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-2">
          {/* Bibliothek-Link */}
          <Link
            href="/bibliothek"
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              pathname === "/bibliothek" || pathname.startsWith("/rezept")
                ? "bg-primary/10 text-primary"
                : "hover:bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            <BookOpen className="h-4 w-4" />
            Bibliothek
          </Link>

          {/* Prominenter Neu-Button */}
          <Link
            href="/extrahieren"
            className={cn(
              "flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm",
              pathname === "/extrahieren"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                : "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md hover:shadow-primary/30 active:scale-95"
            )}
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            Neu
          </Link>
        </div>
      </div>
    </nav>
  );
}
