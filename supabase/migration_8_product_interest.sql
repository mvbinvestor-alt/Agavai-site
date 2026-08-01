-- Run this in the Supabase SQL Editor.
-- Lets us see products people add to cart but don't end up buying.

create table if not exists product_interest_events (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete set null,
  product_name text not null,
  event text not null default 'add_to_cart',
  created_at timestamptz not null default now()
);

create index if not exists product_interest_created_idx on product_interest_events (created_at);
create index if not exists product_interest_product_idx on product_interest_events (product_id);

alter table product_interest_events enable row level security;
-- No public policies — service role only, same as page_views.
