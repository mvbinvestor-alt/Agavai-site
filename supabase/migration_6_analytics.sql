-- Run this in the Supabase SQL Editor.
-- Minimal, privacy-respecting pageview log: no cookies, no IP address,
-- no personal data — just which page, when, and where they came from.

create table if not exists page_views (
  id uuid primary key default gen_random_uuid(),
  path text not null,
  referrer text,
  created_at timestamptz not null default now()
);

create index if not exists page_views_created_idx on page_views (created_at);
create index if not exists page_views_path_idx on page_views (path);

alter table page_views enable row level security;
-- No public policies — only the service role (server API route) can write,
-- and only the admin page (also service role) can read.
