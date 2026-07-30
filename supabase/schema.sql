-- Run this once in your Supabase project's SQL Editor (Supabase Dashboard -> SQL Editor -> New query)

create extension if not exists pgcrypto;

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  material text,
  price numeric,
  description text,
  is_available boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists product_media (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  type text not null check (type in ('image', 'video')),
  url text not null,
  sort_order int not null default 0
);

-- Row Level Security: anyone can READ (public catalog), nobody can write
-- directly from the browser. All writes go through the Next.js API routes,
-- which use the service role key on the server after checking the admin
-- password cookie.
alter table products enable row level security;
alter table product_media enable row level security;

create policy "Public read products" on products
  for select using (true);

create policy "Public read product_media" on product_media
  for select using (true);

-- Storage bucket for product photos/videos.
insert into storage.buckets (id, name, public)
values ('product-media', 'product-media', true)
on conflict (id) do nothing;

create policy "Public read product-media bucket" on storage.objects
  for select using (bucket_id = 'product-media');
