-- Run this in the Supabase SQL Editor.
-- Country-level traffic, resolved via a free IP-geolocation API and cached
-- so repeat visits from the same IP never trigger a second lookup.

alter table page_views add column if not exists country text;

create table if not exists ip_country_cache (
  ip_hash text primary key, -- sha256 of the IP, so we're not storing raw IPs long-term
  country text,
  looked_up_at timestamptz not null default now()
);

alter table ip_country_cache enable row level security;
-- No public policies — service role only, same as page_views.
