---
name: Deutsch-Coding-Standard
description: Dieser Skill erzwingt die Verwendung von deutschen Variablen, Objektnamen und ausführlichen deutschen Kommentaren im Code.
---

# Deutsch-Coding-Standard

Dieser Skill legt fest, wie Quellcode in diesem Projekt geschrieben werden soll. Ziel ist eine maximale Lesbarkeit für deutschsprachige Entwickler.

## Hauptregeln

1. **Bezeichner:** Alle Variablen, Konstanten, Klassen und Funktionen müssen deutsche Namen verwenden.
2. **Datenstrukturen:** Objektschlüssel (Keys) müssen deutsch sein.
3. **Dokumentation:**
   - Jede Funktion erhält einen deutschen Doc-Block.
   - Komplexe Logik wird Schritt für Schritt auf Deutsch kommentiert.
4. **Sprache:** Alle Ausgaben und Protokolle müssen in deutscher Sprache verfasst sein.

## Beispiele

### Richtig ✅
```javascript
// Liste aller Rezepte abrufen
const rezeptListe = await ladeRezepte();

rezeptListe.forEach(rezept => {
  // Zeige jeden Titel in der Konsole an
  console.log(rezept.titel);
});
```

### Falsch ❌
```javascript
const recipeList = await fetchRecipes();
recipeList.forEach(r => console.log(r.title));
```
