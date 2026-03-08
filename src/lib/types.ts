export interface Zutat {
  id?: string;
  menge: string | number;
  einheit: string;
  zutat: string;
  reihenfolge?: number;
}

export interface Naehrwerte {
  kalorien: number;
  protein: number;
  kohlenhydrate: number;
  fett: number;
}

export interface Rezept {
  id: string;
  titel: string;
  quelle_url?: string;
  kategorie: string;
  bild_url?: string;
  bilder_urls?: string[];
  vorbereitungszeit?: number;
  kochzeit?: number;
  portionen?: number;
  erstellt_am: string;
  aktualisiert_am: string;
  zutaten: Zutat[];
  schritte: { id?: string; nummer: number; text: string }[];
  naehrwerte?: Naehrwerte;
}

export interface ExtraktionsErgebnis {
  titel: string;
  quelle_url?: string;
  kategorie: string;
  bild_url?: string;
  bilder_urls?: string[];
  zutaten: Zutat[];
  schritte: string[];
  vorbereitungszeit?: number;
  kochzeit?: number;
  portionen?: number;
  naehrwerte?: Naehrwerte;
}

export type ExtractionStatus = "idle" | "fetching" | "analyzing" | "done" | "error";

export const KATEGORIEN = [
  "Frühstück",
  "Hauptspeise",
  "Dessert",
  "Vorspeise",
  "Snack",
  "Suppe",
  "Salat",
  "Vegan",
  "Vegetarisch",
  "Sonstiges",
] as const;

export type Kategorie = (typeof KATEGORIEN)[number];

export const EINHEITEN = [
  "g",
  "kg",
  "ml",
  "l",
  "EL",
  "TL",
  "Stück",
  "Prise",
  "Bund",
  "Scheibe",
  "nach Belieben",
] as const;

export type Einheit = (typeof EINHEITEN)[number];
