-- ============================================================
-- KAIRA CRM — Supabase schema
-- Paste this into Supabase → SQL Editor → Run (once).
-- All access is server-side via the service_role key, so RLS is
-- enabled with NO public policies (anon key can't read/write).
-- ============================================================

create extension if not exists "pgcrypto";

create table if not exists leads (
  id          uuid primary key default gen_random_uuid(),
  name        text,
  email       text,
  company     text,
  industry    text,
  budget      text,
  timeline    text,
  tier        text,           -- Hot | Warm | Cold
  context     text,           -- recent conversation snippet
  created_at  timestamptz not null default now()
);

create table if not exists events (
  id          uuid primary key default gen_random_uuid(),
  type        text not null,  -- open | message | blueprint | audit | lead
  label       text,           -- e.g. lead tier
  created_at  timestamptz not null default now()
);

create index if not exists leads_created_idx  on leads  (created_at desc);
create index if not exists events_type_idx     on events (type);
create index if not exists events_created_idx  on events (created_at desc);

alter table leads  enable row level security;
alter table events enable row level security;
-- No policies are created on purpose: only the service_role key
-- (used by the server) can read/write. The public anon key cannot.
