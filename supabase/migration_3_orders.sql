-- Run this in the Supabase SQL Editor (same place as before).
-- Creates the orders table used by the Razorpay Buy Now flow.

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete set null,
  product_name text not null,
  price numeric,
  quantity integer not null default 1,
  buyer_name text,
  buyer_phone text,
  buyer_email text,
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'cancelled', 'expired')),
  razorpay_payment_link_id text,
  razorpay_payment_id text,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create index if not exists orders_status_idx on orders (status);
create index if not exists orders_payment_link_idx on orders (razorpay_payment_link_id);

-- Orders contain buyer contact info, so this table is locked down: RLS is
-- enabled with NO policies, meaning only the service role (used in our
-- server-side API routes) can read or write it. The public anon/publishable
-- key cannot see orders at all.
alter table orders enable row level security;
