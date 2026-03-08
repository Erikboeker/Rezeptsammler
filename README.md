# 🍽️ Rezeptsammler

Eine KI-gestützte Rezept-App, die Rezepte automatisch aus URLs oder Screenshots extrahiert und in einer eigenen Bibliothek speichert.

## ✨ Features

- 🔗 **Rezept-Import per URL** – einfach einen Link einfügen, die KI extrahiert alle relevanten Daten
- 📸 **Screenshot-Import** – Rezept als Bild aus der Zwischenablage einfügen (Strg+V)
- 🖼️ **Bildkarussell** – mehrere Bilder pro Rezept, einzeln löschbar oder per Clipboard hinzufügbar
- 🗂️ **Rezept-Bibliothek** – alle Rezepte übersichtlich nach Kategorie filterbar
- 🤖 **KI-Extraktion** – powered by Google Gemini

## 🛠️ Technologie

- [Next.js 15](https://nextjs.org/) (App Router)
- [Supabase](https://supabase.com/) (Datenbank & Auth)
- [Google Gemini API](https://aistudio.google.com/) (KI-Extraktion)
- [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)

---

## 🚀 Lokale Installation

### 1. Repository klonen

```bash
git clone https://github.com/Erikboeker/Rezeptsammler.git
cd Rezeptsammler
```

### 2. Abhängigkeiten installieren

```bash
npm install
```

### 3. Umgebungsvariablen einrichten

Kopiere die Beispieldatei und trage deine Werte ein:

```bash
cp .env.example .env.local
```

Öffne `.env.local` und befülle die folgenden Variablen:

| Variable | Beschreibung | Wo erhältlich |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL deines Supabase-Projekts | [supabase.com](https://supabase.com) → Projekt → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Öffentlicher API-Schlüssel | ebenda |
| `SUPABASE_SERVICE_ROLE_KEY` | Geheimer Service-Role-Schlüssel (**nie veröffentlichen!**) | ebenda |
| `GEMINI_API_KEY` | Google Gemini API-Schlüssel | [aistudio.google.com](https://aistudio.google.com/apikey) |

### 4. Supabase-Datenbank einrichten

Führe das Schema-SQL in deinem Supabase-Projekt aus:

```bash
# Im Supabase Dashboard unter SQL-Editor einfügen:
# Inhalt von: supabase/schema.sql
```

### 5. App starten

```bash
npm run dev
```

Die App läuft dann unter [http://localhost:3000](http://localhost:3000).

---

## 📁 Projektstruktur

```
src/
├── app/
│   ├── api/rezepte/      # API-Routen (GET, POST, PATCH, DELETE)
│   ├── bibliothek/       # Rezept-Bibliothek
│   ├── extraktion/       # Neues Rezept erstellen
│   └── rezept/[id]/      # Einzel-Rezept-Ansicht
├── components/
│   ├── bibliothek/       # RecipeCard, RecipeGrid, SearchFilter
│   ├── extraktion/       # ExtractionForm, RecipePreview
│   └── rezept/           # RecipeHeader, ImageCarousel
└── lib/
    ├── gemini/           # KI-Extraktion (Gemini API)
    ├── supabase/         # Datenbankzugriff
    └── types.ts          # TypeScript-Typen
```

---

## 🔒 Sicherheitshinweis

Die Datei `.env.local` (oder `.env`) enthält geheime API-Schlüssel und wird **niemals** per Git gespeichert (steht in `.gitignore`). Teile diese Schlüssel nicht öffentlich.
