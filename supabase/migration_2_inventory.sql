-- Run this in your Supabase SQL Editor (same place you ran schema.sql).
-- Adds inventory-tracking fields to the existing products table.
-- Safe to run even if you already have products — existing rows get
-- quantity = 1 and no SKU (you can fill SKUs in on your first export/import).

alter table products add column if not exists sku text unique;
alter table products add column if not exists quantity integer not null default 1;

create index if not exists products_sku_idx on products (sku);
