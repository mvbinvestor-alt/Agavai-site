import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthed } from '@/lib/auth';
import { pickIp, snapshot } from '@/lib/trafficWatch';

export const runtime = 'nodejs';

// Admin-only diagnostic: (1) which address and header the server believes YOU are coming from —
// open it once on mobile data and once on wifi to check the address really changes, which proves
// the IP header can be trusted — and (2) what the traffic watch currently sees.
export async function GET(req: NextRequest) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }
  const { ip, source } = pickIp(req.headers);
  const seen: Record<string, string | null> = {};
  for (const h of ['x-forwarded-for', 'x-real-ip', 'cf-connecting-ip', 'true-client-ip', 'fastly-client-ip', 'x-client-ip', 'user-agent']) {
    seen[h] = req.headers.get(h);
  }
  return NextResponse.json({ yourAddressAsSeenByServer: ip, readFromHeader: source, headersSeen: seen, watch: snapshot() }, { headers: { 'Cache-Control': 'no-store' } });
}
