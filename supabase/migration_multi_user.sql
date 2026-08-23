-- ====================================================
-- Migration: Mehrbenutzer-Betrieb (jeder sieht nur
-- seine eigenen Rezepte)
--
-- VORHER im Supabase-Dashboard erledigen:
--   1. Authentication → Sign In / Providers:
--      "Allow new users to sign up" DEAKTIVIEREN
--      (keine offene Registrierung für Fremde).
--   2. Authentication → Users → "Add user":
--      Beide Konten (deins + das deiner Frau) mit
--      E-Mail + Passwort anlegen, "Auto Confirm User" an.
--
-- DANN dieses Skript im SQL-Editor ausführen –
-- vorher unten im UPDATE die E-Mail-Adresse anpassen,
-- der die bisherigen Rezepte gehören sollen!
-- ====================================================

-- 1) Besitzer-Spalte: neue Rezepte gehören automatisch
--    dem eingeloggten Nutzer (Default auth.uid())
alter table public.rezepte
  add column if not exists user_id uuid references auth.users(id) default auth.uid();

create index if not exists idx_rezepte_user_id on public.rezepte(user_id);

-- 2) Bestehende Rezepte einem Konto zuordnen
--    >>> E-MAIL HIER ANPASSEN <<<
update public.rezepte
  set user_id = (select id from auth.users where email = 'bmpfestplatte@googlemail.com')
  where user_id is null;

-- 3) RLS-Policies: Jeder Nutzer sieht und bearbeitet nur
--    seine eigenen Rezepte (RLS selbst ist bereits aktiv,
--    siehe migration_enable_rls.sql)
drop policy if exists "rezepte_eigene" on public.rezepte;
create policy "rezepte_eigene" on public.rezepte
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Untertabellen: Zugriff nur, wenn das zugehörige Rezept
-- dem eingeloggten Nutzer gehört
drop policy if exists "zutaten_eigene" on public.zutaten;
create policy "zutaten_eigene" on public.zutaten
  for all to authenticated
  using (exists (
    select 1 from public.rezepte r
    where r.id = zutaten.rezept_id and r.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.rezepte r
    where r.id = zutaten.rezept_id and r.user_id = auth.uid()
  ));

drop policy if exists "schritte_eigene" on public.schritte;
create policy "schritte_eigene" on public.schritte
  for all to authenticated
  using (exists (
    select 1 from public.rezepte r
    where r.id = schritte.rezept_id and r.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.rezepte r
    where r.id = schritte.rezept_id and r.user_id = auth.uid()
  ));

drop policy if exists "naehrwerte_eigene" on public.naehrwerte;
create policy "naehrwerte_eigene" on public.naehrwerte
  for all to authenticated
  using (exists (
    select 1 from public.rezepte r
    where r.id = naehrwerte.rezept_id and r.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.rezepte r
    where r.id = naehrwerte.rezept_id and r.user_id = auth.uid()
  ));

-- 4) Kontrolle: Sollte die Anzahl deiner Rezepte zeigen
-- select count(*) from public.rezepte where user_id is not null;
