# Agavai website — setup guide

A catalog site for Agavai (Artistry for the Ages) with a password-protected
admin page where you can upload product photos and videos straight from your
phone. Built with Next.js + Supabase, deployed free on Vercel.

## 1. Create a Supabase project

1. Go to https://supabase.com → New project (free tier is enough to start).
2. Once it's created, open **SQL Editor** → New query, paste the contents of
   `supabase/schema.sql` from this project, and run it. This creates the
   `products` and `product_media` tables and a public `product-media` storage
   bucket.
3. Go to **Project Settings → API** and note down:
   - Project URL
   - `anon` public key
   - `service_role` key (keep this one secret — never put it in client code)

## 2. Set environment variables

Copy `.env.local.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
ADMIN_PASSWORD=choose-a-strong-password
NEXT_PUBLIC_WHATSAPP_NUMBER=91XXXXXXXXXX   # digits only, country code, no +
```

## 3. Run it locally (optional, needs Node.js installed)

```
npm install
npm run dev
```

Visit http://localhost:3000 for the catalog and http://localhost:3000/admin
to log in and add products.

## 4. Deploy to Vercel (free)

1. Push this folder to a GitHub repo.
2. Go to https://vercel.com → New Project → import the repo.
3. In the project's Environment Variables settings, add the same 5 variables
   from step 2.
4. Deploy. Vercel gives you a live URL immediately; you can attach
   `agavai.in` under Project → Settings → Domains.

## 5. Add your first products

Go to `yoursite.com/admin`, enter the admin password, and click **Add
product** for each piece. For each one you can:
- Upload multiple photos and a video
- Set name, category, material, price, description
- Mark it sold (hides the WhatsApp button, shows a "Sold" tag)

Everything appears on the live catalog immediately — no redeploy needed.

## What's already in place

- Real Agavai logo and brand colors (pulled from your logo file)
- Homepage catalog with category filter chips
- Product detail pages with photo/video gallery + WhatsApp order button
  (uses the fixed number in `NEXT_PUBLIC_WHATSAPP_NUMBER` for every product)
- `/admin` — simple password gate, add/edit/delete products, upload media
- **Two-tier photo enhancement pipeline** on every image upload:
  1. **Always on, free:** auto-orientation, exposure/contrast fix, slight
     sharpen, resize, recompression — runs on every photo automatically,
     no setup needed.
  2. **Optional, needs `ANTHROPIC_API_KEY`:** toggle "✨ Enhance with AI" in
     the upload form to also get an AI-suggested crop (trims excess
     background), a light brightness/contrast/saturation nudge if the photo
     is genuinely dull, and auto-filled name/category/material suggestions
     based on what's in the photo (you can always edit these before saving).
     Without this key, uploads still go through step 1 — the toggle just has
     no extra effect.

Photo enhancement fixes technical issues (orientation, exposure, framing) —
it doesn't invent detail. Get an Anthropic API key at
https://console.anthropic.com if you want the AI step; it's billed per use,
a few uploads a day is inexpensive.

## Notes / things to decide later

- The admin password is a single shared password (not per-user login), stored
  server-side only. Good enough for one or two people managing the catalog;
  say the word if you'd rather have proper email/password accounts.
- Storage limits on Supabase's free tier: 1GB storage / 2GB bandwidth per
  month. Fine for a growing catalog of photos; videos will use it up faster —
  worth checking usage after a month of real uploads.
- I sourced product photos from what you shared in chat — the piece names,
  materials, and prices in the site are placeholders until you fill in the
  real ones through `/admin`.
