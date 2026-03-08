"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Plus, ChefHat } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="border-b bg-white sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-6xl">
        <Link
          href="/bibliothek"
          className="flex items-center gap-2 font-bold text-xl"
        >
          <ChefHat className="h-6 w-6 text-primary" />
          <span>Rezeptsammler</span>
        </Link>

        <div className="flex items-center gap-1">
          <Link
            href="/bibliothek"
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              pathname === "/bibliothek" || pathname.startsWith("/rezept")
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            <BookOpen className="h-4 w-4" />
            Bibliothek
          </Link>
          <Link
            href="/extrahieren"
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              pathname === "/extrahieren"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            <Plus className="h-4 w-4" />
            Neu
          </Link>
        </div>
      </div>
    </nav>
  );
}
