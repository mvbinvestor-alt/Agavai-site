-- Run this in the Supabase SQL Editor.

alter table products add column if not exists dimensions text;
alter table products add column if not exists origin text;
alter table products add column if not exists is_featured boolean not null default false;
