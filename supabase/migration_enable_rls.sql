-- ====================================================
-- Migration: Row Level Security aktivieren
-- Im Supabase SQL-Editor ausführen
--
-- Hintergrund: Der öffentliche Anon-Key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
-- liegt im Browser-Bundle offen. Ohne RLS kann jeder, der diesen Key
-- kennt, die Tabellen direkt über die Supabase-REST-API lesen und
-- schreiben – am App-Code vorbei. Die App selbst nutzt serverseitig
-- ausschließlich den SUPABASE_SERVICE_ROLE_KEY (umgeht RLS ohnehin),
-- daher ändert diese Migration nichts am Verhalten der App, schließt
-- aber den öffentlichen Zugriff über den Anon-Key.
-- ====================================================

alter table public.rezepte    enable row level security;
alter table public.zutaten    enable row level security;
alter table public.schritte   enable row level security;
alter table public.naehrwerte enable row level security;
