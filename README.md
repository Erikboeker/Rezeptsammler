# 🍽️ Rezeptsammler

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Erikboeker/Rezeptsammler&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY,GEMINI_API_KEY&envDescription=API-Schlüssel%20für%20Supabase%20und%20Google%20Gemini%20werden%20benötigt.)

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

## ☁️ Deployment mit Vercel (empfohlen)

### Option A – Ein-Klick-Deploy

Klicke auf den Button oben ☝️ – Vercel fragt dich automatisch nach den benötigten Umgebungsvariablen:

| Variable | Beschreibung | Wo erhältlich |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL deines Supabase-Projekts | [supabase.com](https://supabase.com) → Projekt → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Öffentlicher Anon-Schlüssel | ebenda |
| `SUPABASE_SERVICE_ROLE_KEY` | Geheimer Service-Role-Schlüssel ⚠️ | ebenda |
| `GEMINI_API_KEY` | Google Gemini API-Schlüssel | [aistudio.google.com](https://aistudio.google.com/apikey) |

### Option B – Bestehendes Vercel-Projekt verbinden

1. Gehe zu **[vercel.com/new](https://vercel.com/new)**
2. Klicke **„Import Git Repository"** → wähle `Rezeptsammler`
3. Trage unter **„Environment Variables"** alle vier Variablen ein
4. Klicke **„Deploy"** ✅

### Automatische Deployments

Ab jetzt löst jeder `git push` auf `master` automatisch ein neues Deployment aus – kein manueller Schritt nötig.

### Umgebungsvariablen nachträglich ändern

**Vercel Dashboard → Dein Projekt → Settings → Environment Variables**

---

## 🚀 Lokale Entwicklung

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

```bash
cp .env.example .env.local
# .env.local mit deinen echten Werten befüllen
```

### 4. Supabase-Datenbank einrichten

Führe das Schema-SQL in deinem Supabase-Projekt aus (SQL-Editor im Dashboard):

```
supabase/schema.sql
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

Die Datei `.env.local` enthält geheime API-Schlüssel und wird **niemals** per Git gespeichert (`.gitignore`). Teile insbesondere den `SUPABASE_SERVICE_ROLE_KEY` niemals öffentlich.
