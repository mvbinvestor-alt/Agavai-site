import { NextRequest, NextResponse } from 'next/server';
import { buildWeeklyReport, renderReportEmail } from '@/lib/weeklyReport';
import { sendReportEmail, isReportEmailConfigured, getReportRecipients } from '@/lib/email';

export const runtime = 'nodejs';

// Triggered by an external scheduler (e.g. cron-job.org) hitting this URL
// weekly with ?secret=CRON_SECRET — Hostinger's Node hosting has no built-in
// cron, so the schedule lives outside the app. Not meant to be called by the
// browser or linked from anywhere on the site.
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  if (!isReportEmailConfigured()) {
    return NextResponse.json({ error: 'Email is not configured yet (GMAIL_USER / GMAIL_APP_PASSWORD)' }, { status: 503 });
  }

  const recipients = getReportRecipients();
  if (recipients.length === 0) {
    return NextResponse.json({ error: 'No recipients configured (REPORT_RECIPIENTS)' }, { status: 503 });
  }

  try {
    const data = await buildWeeklyReport();
    const { subject, html, text } = renderReportEmail(data);
    await sendReportEmail({ to: recipients, subject, html, text });
    return NextResponse.json({ ok: true, sentTo: recipients.length, viewsThis: data.viewsThis });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to send weekly report' }, { status: 500 });
  }
}
