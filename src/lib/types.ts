// =====================================
// Typen und Konstanten für den Rezeptsammler
// Gesamte Datentypstruktur der Anwendung
// =====================================

// ------ Basis-Datentypen ------

/** Eine einzelne Zutat mit Menge, Einheit und Name */
export interface Zutat {
  id?: string;
  menge: string | number;
  einheit: string;
  zutat: string;
  reihenfolge?: number;
}

/** Nährwerte pro Portion (KI-Schätzung oder Angabe) */
export interface Naehrwerte {
  kalorien: number;
  protein: number;
  kohlenhydrate: number;
  fett: number;
}

// ------ Haupt-Rezept-Interface ------

/** Vollständiges Rezept-Objekt aus der Datenbank */
export interface Rezept {
  id: string;
  titel: string;
  quelle_url?: string;
  /** @deprecated Wird durch tags[] ersetzt, bleibt aus Kompatibilitätsgründen erhalten */
  kategorie?: string;
  tags: string[];
  /** Bewertung 1–5 Sterne (null = noch nicht bewertet) */
  bewertung?: number | null;
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

// ------ Extraktions-Interface (KI-Output) ------

/** Ergebnis der KI-Extraktion (vor dem Speichern) */
export interface ExtraktionsErgebnis {
  titel: string;
  quelle_url?: string;
  /** @deprecated Wird durch tags[] ersetzt */
  kategorie?: string;
  tags: string[];
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

// ------ Vordefinierte Tags ------

/** Geräte-Tags für spezielle Küchengeräte */
export const TAGS_GERAETE = [
  "Airfryer",
  "Thermomix",
  "Monsieur Cuisine",
  "Backofen",
  "Grill",
  "Schnellkochtopf",
  "Dampfgarer",
  "Wok",
] as const;

/** Ernährungs-Tags */
export const TAGS_ERNAEHRUNG = [
  "Vegan",
  "Vegetarisch",
  "Glutenfrei",
  "Laktosefrei",
  "Low Carb",
  "High Protein",
] as const;

/** Gericht-Typen als Tags */
export const TAGS_GERICHT = [
  "Frühstück",
  "Hauptspeise",
  "Dessert",
  "Vorspeise",
  "Snack",
  "Suppe",
  "Salat",
  "Beilage",
  "Getränk",
  "Backen",
] as const;

/** Anlass-Tags */
export const TAGS_ANLASS = [
  "Schnell (<30 Min)",
  "Meal Prep",
  "Familientisch",
  "Party",
  "Gäste",
] as const;

/** Alle vordefinierten Tags zusammen */
export const ALLE_TAGS = [
  ...TAGS_GERAETE,
  ...TAGS_ERNAEHRUNG,
  ...TAGS_GERICHT,
  ...TAGS_ANLASS,
] as const;

/** Typ für alle gültigen vordefinierten Tags */
export type VordefinierterTag = (typeof ALLE_TAGS)[number];

// Einheiten-Liste für Zutaten
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
