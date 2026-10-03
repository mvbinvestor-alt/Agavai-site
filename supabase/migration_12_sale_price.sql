-- Run this in the Supabase SQL Editor.

-- Per-product offer price. NULL = not on sale. When set and lower than
-- `price`, the site shows the original price struck through next to this
-- offer price, and checkout charges this price instead of `price`.
alter table products add column if not exists sale_price numeric;
