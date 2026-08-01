-- Phase 1: multi-item cart, shipping addresses, fuller order status lifecycle.
-- Run this in the Supabase SQL Editor.

-- 1. Line items — one order can now hold multiple products.
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_name text not null,
  price numeric not null,
  quantity integer not null default 1
);

create index if not exists order_items_order_idx on order_items (order_id);

-- 2. Move any existing single-item orders into order_items so nothing is lost.
insert into order_items (order_id, product_id, product_name, price, quantity)
select id, product_id, product_name, coalesce(price, 0), quantity
from orders
where product_name is not null
  and not exists (select 1 from order_items where order_items.order_id = orders.id);

-- 3. Shipping address + totals on the order itself.
alter table orders add column if not exists shipping_name text;
alter table orders add column if not exists shipping_phone text;
alter table orders add column if not exists shipping_address_line1 text;
alter table orders add column if not exists shipping_address_line2 text;
alter table orders add column if not exists shipping_city text;
alter table orders add column if not exists shipping_state text;
alter table orders add column if not exists shipping_pincode text;
alter table orders add column if not exists shipping_country text not null default 'India';
alter table orders add column if not exists subtotal numeric;
alter table orders add column if not exists shipping_fee numeric not null default 0;
alter table orders add column if not exists total numeric;

-- Backfill total/subtotal for the old single-item orders using their existing price.
update orders set subtotal = price, total = price where total is null and price is not null;

-- 4. Fuller status lifecycle: paid -> packed -> shipped -> delivered, plus returned.
alter table orders drop constraint if exists orders_status_check;
alter table orders add constraint orders_status_check
  check (status in ('pending', 'paid', 'packed', 'shipped', 'delivered', 'failed', 'cancelled', 'expired', 'returned'));

alter table orders add column if not exists packed_at timestamptz;
alter table orders add column if not exists shipped_at timestamptz;
alter table orders add column if not exists delivered_at timestamptz;
alter table orders add column if not exists tracking_number text;
alter table orders add column if not exists tracking_url text;

-- is_dispatched/dispatched_at from before are kept for now (harmless) but the
-- admin UI now drives off `status` instead.

alter table order_items enable row level security;
-- No public policies — same lockdown as orders: only the service role (server
-- API routes) can read/write. The public anon/publishable key cannot see this.

-- 5. Out-of-stock messaging. `is_available` stays a manual "sold, delisted"
-- flag (mainly for one-of-a-kind Pokkisham antiques); `quantity = 0` now
-- means "out of stock but may restock" and shows this message instead.
alter table products add column if not exists restock_message text;


-- 6. Fix: product_name was NOT NULL from the old single-item order design.
-- New orders don't set it directly (items live in order_items now), so this
-- was silently blocking every order insert. Drop the constraint.
alter table orders alter column product_name drop not null;
