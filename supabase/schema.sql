-- Rezeptsammler – Datenbankschema
-- Ausführen im Supabase SQL-Editor: https://supabase.com/dashboard/project/_/sql

create extension if not exists "uuid-ossp";

-- Rezepte
create table public.rezepte (
  id                uuid primary key default uuid_generate_v4(),
  titel             text not null,
  quelle_url        text,
  kategorie         text not null default 'Sonstiges',
  bild_url          text,
  vorbereitungszeit integer,
  kochzeit          integer,
  portionen         integer default 4,
  erstellt_am       timestamptz not null default now(),
  aktualisiert_am   timestamptz not null default now()
);

-- Zutaten (normalisiert)
create table public.zutaten (
  id          uuid primary key default uuid_generate_v4(),
  rezept_id   uuid not null references public.rezepte(id) on delete cascade,
  menge       text,
  einheit     text,
  zutat       text not null,
  reihenfolge integer default 0
);

-- Zubereitungsschritte (normalisiert)
create table public.schritte (
  id        uuid primary key default uuid_generate_v4(),
  rezept_id uuid not null references public.rezepte(id) on delete cascade,
  nummer    integer not null,
  text      text not null
);

-- Nährwerte (1:1 mit rezepte)
create table public.naehrwerte (
  id            uuid primary key default uuid_generate_v4(),
  rezept_id     uuid not null unique references public.rezepte(id) on delete cascade,
  kalorien      integer,
  protein       numeric(6,1),
  kohlenhydrate numeric(6,1),
  fett          numeric(6,1)
);

-- Indizes
create index idx_rezepte_kategorie    on public.rezepte(kategorie);
create index idx_rezepte_erstellt_am  on public.rezepte(erstellt_am desc);
create index idx_zutaten_rezept_id    on public.zutaten(rezept_id);
create index idx_schritte_rezept_id   on public.schritte(rezept_id);

-- Auto-Update für aktualisiert_am
create or replace function update_aktualisiert_am()
returns trigger as $$
begin
  new.aktualisiert_am = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_rezepte_updated
  before update on public.rezepte
  for each row execute function update_aktualisiert_am();

-- RLS deaktivieren (Single-User-App ohne Auth)
alter table public.rezepte   disable row level security;
alter table public.zutaten   disable row level security;
alter table public.schritte  disable row level security;
alter table public.naehrwerte disable row level security;
