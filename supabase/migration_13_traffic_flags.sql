-- Run this in the Supabase SQL Editor.
-- Traffic watch (alert-only): one row per unusual visitor. Ordinary visitors are never stored here.
-- Rows older than 30 days are deleted automatically by the site whenever a new row is written.

create table if not exists traffic_flags (
  id uuid primary key default gen_random_uuid(),
  flagged_at timestamptz not null default now(),
  ip text not null,
  ip_source text,
  forwarded_for text,
  user_agent text,
  looks_like text,
  reasons text,
  requests int,
  image_requests int,
  page_requests int,
  distinct_paths int,
  admin_hits int,
  first_seen timestamptz,
  last_seen timestamptz,
  sample_paths text[]
);

create index if not exists traffic_flags_flagged_at_idx on traffic_flags (flagged_at desc);

alter table traffic_flags enable row level security;
-- No public policies — service role only, same as page_views.
