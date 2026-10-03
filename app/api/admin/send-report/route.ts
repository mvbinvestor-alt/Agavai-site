import { NextRequest, NextResponse } from 'next/server';
import { sendReportEmail, isReportEmailConfigured, getReportRecipients } from '@/lib/email';

export const runtime = 'nodejs';

// Generic "send a pre-written report to the founders" endpoint, protected by
// the same CRON_SECRET as /api/admin/weekly-report. Used by the product-
// scouting scheduled task, which does live web research each run (not
// something that can be expressed as a fixed query against our own
// database) and POSTs its finished write-up here to actually deliver it —
// this route only sends, it doesn't generate anything itself.
export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  if (!isReportEmailConfigured()) {
    return NextResponse.json({ error: 'Email is not configured yet (RESEND_API_KEY)' }, { status: 503 });
  }

  const recipients = getReportRecipients();
  if (recipients.length === 0) {
    return NextResponse.json({ error: 'No recipients configured (REPORT_RECIPIENTS)' }, { status: 503 });
  }

  const body = await req.json().catch(() => null);
  const subject = typeof body?.subject === 'string' ? body.subject.trim() : '';
  const html = typeof body?.html === 'string' ? body.html : '';
  const text = typeof body?.text === 'string' ? body.text : '';

  if (!subject || !html || !text) {
    return NextResponse.json({ error: 'Request must include subject, html, and text' }, { status: 400 });
  }

  try {
    await sendReportEmail({ to: recipients, subject, html, text });
    return NextResponse.json({ ok: true, sentTo: recipients.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to send report' }, { status: 500 });
  }
}
