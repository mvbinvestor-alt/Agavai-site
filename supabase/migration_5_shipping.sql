-- Run this in the Supabase SQL Editor.
-- Per-product shipping, since it varies by weight/size and you're setting it
-- manually rather than computing it from a formula.

alter table products add column if not exists shipping_price_domestic numeric not null default 0;
alter table products add column if not exists shipping_price_international numeric;
-- international is nullable: leave it blank on a product to mean "not
-- shippable internationally" (checkout will flag this if it happens).
