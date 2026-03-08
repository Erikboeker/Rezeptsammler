---
name: Deutsch-Coding-Standard
description: Regelsatz für die Entwicklung mit deutschen Bezeichnern, Objektnamen und ausführlicher Dokumentation in deutscher Sprache.
version: 1.0
---

# ZIEL
Sicherstellen, dass der gesamte Quellcode einheitlich deutschsprachige Bezeichner verwendet und durch ausführliche Kommentare in seiner Logik leicht nachvollziehbar bleibt.

# REGELN

## 1. Variablen & Konstanten
- Alle Variablen und Konstanten MÜSSEN in deutscher Sprache benannt werden.
- Verwende Kamelschreibweise (`camelCase`) oder Unterstriche (`snake_case`) gemäß Projektspezifikation (Standard hier: `camelCase`).
- Beispiele:
  - Anstatt `let recipeList = [];` -> `let rezeptListe = [];`
  - Anstatt `const isLoading = true;` -> `const laedtGerade = true;`

## 2. Objekte & Felder
- Schlüssel in Objekten und Datenstrukturen MÜSSEN deutsche Begriffe verwenden.
- Dies gilt auch für JSON-Outputs von APIs.
- Beispiele:
  - `zutaten` anstatt `ingredients`
  - `vorbereitungszeit` anstatt `prepTime`
  - `naehrwerte` anstatt `nutritionalInfo`

## 3. Funktionen & Methoden
- Funktionsnamen MÜSSEN die Aktion auf Deutsch beschreiben.
- Beispiel: `speichereRezept(daten)` anstatt `saveRecipe(data)`.

## 4. Kommentierung (Dokumentation)
- Jede Funktion MUSS einen JSDoc/TSDoc Header auf Deutsch erhalten, der Zweck, Parameter und Rückgabewert erklärt.
- Komplexe Logik-Blöcke MÜSSEN durch Inline-Kommentare detailliert erläutert werden.
- Ziel: Ein Entwickler ohne Englischkenntnisse soll den Code vollständig verstehen können.

# BEISPIEL

```typescript
/**
 * Berechnet die Gesamtzeit für ein Rezept in Minuten.
 * @param vorbereitungszeit - Zeit für die Vorbereitung (in Min.)
 * @param kochzeit - Zeit für das Kochen (in Min.)
 * @returns Die Summe der beiden Zeiten.
 */
function berechneGesamtzeit(vorbereitungszeit: number, kochzeit: number): number {
  // Addiere beide Werte. Falls ein Wert null ist, wird er als 0 gewertet.
  const summe = (vorbereitungszeit || 0) + (kochzeit || 0);
  
  return summe;
}

const meinRezept = {
  titel: "Kartoffelpuffer",
  zutaten: ["Kartoffeln", "Zwiebeln", "Eier"],
  gesamtDauer: berechneGesamtzeit(15, 20)
};
```

# GÜLTIGKEITSBEREICH
Dieser Standard gilt für alle neuen Dateien und Refactorings innerhalb dieses Projekts, sofern keine zwingenden technischen Gründe (wie externe Bibliotheks-Interfaces) dagegen sprechen.
