-- Run this in the Supabase SQL Editor.
-- Enforces SKU uniqueness at the database level (belt-and-suspenders with
-- the application-level check in lib/sku.ts). Allows multiple NULLs, in case
-- any product doesn't have a SKU set.

create unique index if not exists products_sku_unique_idx
  on products (sku)
  where sku is not null;
