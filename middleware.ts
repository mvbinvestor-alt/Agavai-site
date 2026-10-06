import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Site-wide maintenance mode. Admin flips `maintenance_mode` on in
// site_settings right before pushing a risky change, so visitors see a
// calm "we'll be back" page instead of a half-deployed site or a dead
// request — then flips it off once the new deploy is confirmed working.
//
// /admin and /api always stay reachable, so the toggle itself (and admin
// login) never gets locked out by its own setting.

const ALWAYS_ALLOWED_PREFIXES = ['/admin', '/api'];

async function getMaintenanceState(): Promise<{ on: boolean; message: string }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return { on: false, message: '' };

  try {
    const res = await fetch(
      `${url}/rest/v1/site_settings?key=in.(maintenance_mode,maintenance_message)&select=key,value`,
      {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
        cache: 'no-store',
      }
    );
    if (!res.ok) return { on: false, message: '' };
    const rows: { key: string; value: string | null }[] = await res.json();
    const on = rows.find((r) => r.key === 'maintenance_mode')?.value === 'true';
    const message = rows.find((r) => r.key === 'maintenance_message')?.value || '';
    return { on, message };
  } catch {
    // Supabase unreachable for a moment, bad network, etc. — fail OPEN.
    // A settings lookup hiccup should never take the whole storefront down.
    return { on: false, message: '' };
  }
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function maintenancePage(message: string) {
  const text = escapeHtml(
    message || "We're making a quick update and will be back online shortly. Thanks for your patience!"
  );
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex" />
<title>Agavai — Back soon</title>
<style>
  body { margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center;
    background:#fbf6ec; color:#2b2420; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
    padding:24px; text-align:center; }
  .card { max-width:420px; }
  .mark { font-size:13px; letter-spacing:0.08em; text-transform:uppercase; color:#b44b33; margin-bottom:14px; }
  h1 { font-size:22px; margin:0 0 12px; }
  p { font-size:15px; line-height:1.5; color:#6b6056; margin:0; }
</style>
</head>
<body>
  <div class="card">
    <div class="mark">Agavai</div>
    <h1>We&rsquo;ll be right back</h1>
    <p>${text}</p>
  </div>
</body>
</html>`;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (ALWAYS_ALLOWED_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const { on, message } = await getMaintenanceState();
  if (!on) return NextResponse.next();

  return new NextResponse(maintenancePage(message), {
    status: 503,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Retry-After': '120' },
  });
}

export const config = {
  // Skip Next's own static asset routes — no point paying a Supabase round
  // trip for every JS/CSS chunk.
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
