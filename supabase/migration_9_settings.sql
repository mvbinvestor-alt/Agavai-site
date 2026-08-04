-- Run this in the Supabase SQL Editor.
-- General-purpose key/value settings, so future on/off toggles or editable
-- text don't each need their own migration + column.

create table if not exists site_settings (
  key text primary key,
  value text,
  updated_at timestamptz not null default now()
);

alter table site_settings enable row level security;
-- No public policies — read happens server-side via service role (the
-- homepage fetches it at render time, not from the browser), writes only
-- from the admin-gated settings page.

insert into site_settings (key, value) values
  ('catalog_notice_enabled', 'true'),
  ('catalog_notice_text', 'We''re still adding pieces here — our full range is on Instagram. Looking for something specific? Message us on WhatsApp or Instagram DM and we''ll help you find it.')
on conflict (key) do nothing;
