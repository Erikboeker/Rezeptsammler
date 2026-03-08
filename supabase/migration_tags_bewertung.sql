-- ====================================================
-- Migration: Tags und Bewertung hinzufügen
-- Im Supabase SQL-Editor ausführen
-- ====================================================

-- Tags-Spalte als Text-Array hinzufügen (falls noch nicht vorhanden)
alter table public.rezepte
  add column if not exists tags text[] default '{}';

-- Bewertung 1–5 Sterne (null = noch nicht bewertet)
alter table public.rezepte
  add column if not exists bewertung integer check (bewertung >= 1 and bewertung <= 5);

-- Index für Tag-Suche (GIN-Index für Array-Operationen)
create index if not exists idx_rezepte_tags on public.rezepte using gin(tags);
