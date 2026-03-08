# 📘 Technische Anleitung: Rezeptsammler

Willkommen zur technischen Dokumentation des **Rezeptsammlers**. Dieses Dokument dient als Leitfaden für die Architektur, die Datenstruktur und die Entwicklungsprozesse der Anwendung.

---

## 🛠️ 1. System-Architektur

Die Anwendung basiert auf dem modernsten Web-Stack für maximale Geschwindigkeit und Skalierbarkeit:

- **Frontend/Backend:** [Next.js 15](https://nextjs.org/) (App Router Architektur)
- **Datenbank & API:** [Supabase](https://supabase.com/) (PostgreSQL + PostgREST)
- **KI-Kern:** [Google Gemini 1.5 Pro](https://aistudio.google.com/) (für Datenextraktion und Bildanalyse)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) mit [shadcn/ui](https://ui.shadcn.com/) Komponenten
- **Deployment:** [Vercel](https://vercel.com/) (Serverless Functions & Edge Network)

---

## 🗄️ 2. Datenbank-Modell (Supabase)

Der `Rezeptsammler` nutzt eine relationale PostgreSQL-Datenbank. Das Schema befindet sich in `supabase/schema.sql`.

### Tabellen-Übersicht:
1. **`rezepte`**: Kopfdaten (Titel, Kategorie, Bild-URLs, Zeiten).
2. **`zutaten`**: Einzelne Zutaten (verknüpft via `rezept_id`).
3. **`schritte`**: Zubereitungsanweisungen (nummeriert).
4. **`naehrwerte`**: KI-geschätzte Nährstoffe pro Portion.

**Wichtig für die Sicherheit:** Row Level Security (RLS) ist aktuell deaktiviert, da es sich um eine Single-User-Anwendung ohne Authentifizierungs-Zwang handelt.

---

## 🤖 3. KI-Extraktions-Logik

Die Kernfunktionalität liegt in der Umwandlung unstrukturierter Daten (Web-Links oder Screenshots) in JSON.

- **URL-Extraktion:** `src/lib/extractors/url-fetcher.ts` lädt den Inhalt einer Webseite, entfernt Werbemüll und schickt den reinen Text an Gemini.
- **Bild-Analyse:** Bilder werden als Base64-Strings an Gemini gesendet, welches mittels Vision-Modellen die Handschrift oder Texte auf Fotos liest.
- **Prompts:** Die genauen Anweisungen für die KI liegen in `src/lib/gemini/prompts.ts`.

---

## 💻 4. Coding-Standards

Dieses Projekt folgt dem **Deutsch-Coding-Standard**. Das bedeutet:

- **Variablen & Funktionen:** Müssen deutsche Namen tragen (`ladeRezepte` statt `fetchRecipes`).
- **Objekt-Keys:** Müssen deutsch sein (`zutaten` statt `ingredients`).
- **Kommentierung:** Jede Datei und jede komplexe Funktion muss ausführlich auf Deutsch kommentiert sein.

---

## 🚀 5. Deployment & Wartung

### Neue Versionen (Git)
Änderungen werden über Git verwaltet:
1. `git add .`
2. `git commit -m "Aussagekräftige Nachricht"`
3. `git push origin master`

Vercel erkennt den Push automatisch und führt ein **Redeploy** durch.

### Umgebungsvariablen (Vercel Dashboard)
Stelle sicher, dass folgende Schlüssel in Vercel hinterlegt sind:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `GEMINI_API_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (für administrative Updates)

---

## 🛠️ 6. Fehlerbehebung (Troubleshooting)

| Problem | Mögliche Ursache | Lösung |
|---|---|---|
| **Speicherfehler 500** | Falsche Supabase URL/Key | Prüfe die Environment Variables in Vercel & mache ein Redeploy. |
| **Bilder laden nicht** | CORS-Blockierung | Stelle sicher, dass die Bilder-Domains in `next.config.mjs` erlaubt sind. |
| **KI extrahiert nichts** | API-Limit erreicht | Prüfe das Kontingent in der [Google AI Studio Console](https://aistudio.google.com/). |

---

*Zuletzt aktualisiert am: 08. März 2026*
