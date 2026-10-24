// Traffic watch — ALERT ONLY. It never blocks, slows or changes anything a visitor sees.
//
// Every request passes through middleware.ts, which calls recordRequest(). We keep a short-lived,
// in-memory tally per visitor address (IP) over 10-minute windows. If one visitor does something
// no ordinary shopper does — pulls hundreds of photos, walks through the whole catalogue, or is
// an obvious automated client making lots of requests — we:
//   1. email REPORT_RECIPIENTS (at most 10 emails a day, at most 3 per visitor per day), and
//   2. save one row in `traffic_flags` (readable IP, browser string, counts) for 30 days.
// Ordinary visitors are never written anywhere. Counts live in memory only, so they reset when
// Hostinger restarts the site, and each server process counts separately — treat numbers as
// "at least this much".
//
// The thresholds are first guesses; look at the first week of alerts and adjust.

import { supabaseAdmin } from './supabase';
import { getReportRecipients, isReportEmailConfigured, sendReportEmail } from './email';

const WINDOW_MS = 10 * 60 * 1000;
const MAX_IPS = 5000; // memory guard
const MAX_PATHS_PER_IP = 300;
const RETENTION_DAYS = 30;

export const THRESHOLDS = {
  imagesPerWindow: 400, // a person loading a page fetches ~30 photos; 400 in 10 minutes is not a person
  distinctPerWindow: 150, // different pages/photos touched — walking the whole catalogue
  automatedClientRequests: 100, // requests from a self-declared / obvious automated client
};
const MAX_EMAILS_PER_DAY = 10;
const MAX_REPORTS_PER_IP_PER_DAY = 3;

const AUTOMATED_UA =
  /bot|crawl|spider|scrap|python|curl|wget|headless|http-?client|go-http|axios|node-fetch|java\/|okhttp|libwww|puppeteer|playwright|selenium|phantom/i;
const KNOWN_CRAWLER =
  /googlebot|bingbot|duckduckbot|yandex|baiduspider|applebot|facebookexternalhit|meta-externalagent|whatsapp|twitterbot|slackbot|linkedinbot|telegrambot|pinterest|gptbot|oai-searchbot|chatgpt|claudebot|anthropic|perplexity|ccbot|bytespider|amazonbot|petalbot|semrush|ahrefs|mj12bot|dotbot/i;

const IP_HEADERS = [
  'x-forwarded-for',
  'x-real-ip',
  'cf-connecting-ip',
  'true-client-ip',
  'fastly-client-ip',
  'x-client-ip',
];

type Entry = {
  ip: string;
  ipSource: string;
  ua: string;
  forwarded: string;
  first: number;
  last: number;
  images: number;
  pages: number;
  api: number;
  adminHits: number;
  paths: Set<string>;
};

type FlagMemo = { day: string; reports: number; lastTotal: number };

type FlagLog = {
  at: string;
  ip: string;
  looksLike: string;
  reasons: string[];
  requests: number;
};

type State = {
  windowStart: number;
  entries: Map<string, Entry>;
  flagged: Map<string, FlagMemo>;
  emails: { day: string; count: number };
  recent: FlagLog[];
};

function getState(): State {
  const g = globalThis as any;
  if (!g.__agavaiTrafficWatch) {
    g.__agavaiTrafficWatch = {
      windowStart: Date.now(),
      entries: new Map(),
      flagged: new Map(),
      emails: { day: '', count: 0 },
      recent: [],
    } as State;
  }
  return g.__agavaiTrafficWatch as State;
}

function istDay(): string {
  return new Date(Date.now() + 5.5 * 3600 * 1000).toISOString().slice(0, 10);
}

/** Which address do we think this request came from, and which header told us. */
export function pickIp(headers: Headers): { ip: string | null; source: string } {
  for (const name of IP_HEADERS) {
    const val = headers.get(name);
    if (val) return { ip: val.split(',')[0].trim().slice(0, 64), source: name };
  }
  return { ip: null, source: 'none' };
}

export function recordRequest(info: {
  headers: Headers;
  pathname: string;
  imageUrl?: string | null;
}): void {
  const state = getState();
  const now = Date.now();

  if (now - state.windowStart > WINDOW_MS) {
    state.windowStart = now;
    state.entries.clear();
  }

  const { ip, source } = pickIp(info.headers);
  if (!ip) return;

  let e = state.entries.get(ip);
  if (!e) {
    if (state.entries.size >= MAX_IPS) return;
    e = {
      ip,
      ipSource: source,
      ua: (info.headers.get('user-agent') || '').slice(0, 220),
      forwarded: (info.headers.get('x-forwarded-for') || '').slice(0, 220),
      first: now,
      last: now,
      images: 0,
      pages: 0,
      api: 0,
      adminHits: 0,
      paths: new Set(),
    };
    state.entries.set(ip, e);
  }
  e.last = now;

  let key: string;
  if (info.pathname === '/_next/image') {
    e.images++;
    key = 'img:' + (info.imageUrl || '').slice(-80);
  } else if (info.pathname.startsWith('/api/')) {
    e.api++;
    key = '';
  } else {
    e.pages++;
    if (info.pathname.startsWith('/admin')) e.adminHits++;
    key = info.pathname.slice(0, 120);
  }
  if (key && e.paths.size < MAX_PATHS_PER_IP) e.paths.add(key);

  evaluate(state, e);
}

function total(e: Entry) {
  return e.images + e.pages + e.api;
}

function classify(e: Entry): string {
  if (e.adminHits > 0) return 'admin session (probably you or your team)';
  const known = e.ua.match(KNOWN_CRAWLER);
  if (known) return `known crawler (${known[0]}) — not necessarily harmful`;
  if (!e.ua) return 'no browser identity at all — very likely automated';
  if (AUTOMATED_UA.test(e.ua)) return 'automated client';
  return 'looks like a normal browser (could be a person on a shared network, or a bot pretending)';
}

// Addresses that are the server itself or Hostinger's internal network. If ALL visitors show up
// as one of these, the host isn't passing the real visitor address through — we can't tell
// visitors apart, so we don't alert (the admin diagnostic page will show this clearly).
function isInternalIp(ip: string): boolean {
  return (
    ip === '::1' ||
    ip.startsWith('127.') ||
    ip.startsWith('10.') ||
    ip.startsWith('192.168.') ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(ip) ||
    ip.startsWith('fc') ||
    ip.startsWith('fd')
  );
}

function evaluate(state: State, e: Entry) {
  if (isInternalIp(e.ip)) return;
  const reasons: string[] = [];
  if (e.images >= THRESHOLDS.imagesPerWindow) reasons.push(`requested ${e.images} photos`);
  if (e.paths.size >= THRESHOLDS.distinctPerWindow)
    reasons.push(`touched ${e.paths.size} different pages/photos`);
  if (AUTOMATED_UA.test(e.ua) && total(e) >= THRESHOLDS.automatedClientRequests)
    reasons.push(`automated client made ${total(e)} requests`);
  if (reasons.length === 0) return;

  const day = istDay();
  let memo = state.flagged.get(e.ip);
  if (!memo || memo.day !== day) memo = { day, reports: 0, lastTotal: 0 };
  // Report on first crossing, then again only if activity grows 5x (max 3 reports/day/visitor).
  if (memo.reports >= MAX_REPORTS_PER_IP_PER_DAY) return;
  if (memo.reports > 0 && total(e) < memo.lastTotal * 5) return;
  memo.reports++;
  memo.lastTotal = total(e);
  state.flagged.set(e.ip, memo);

  const looksLike = classify(e);
  state.recent.unshift({
    at: new Date().toISOString(),
    ip: e.ip,
    looksLike,
    reasons,
    requests: total(e),
  });
  state.recent.length = Math.min(state.recent.length, 20);

  // Fire and forget — alerting must never slow or break a visitor's request.
  void report(state, e, reasons, looksLike).catch((err) => {
    console.error('Traffic watch alert could not be sent:', err?.message || err);
  });
}

async function report(state: State, e: Entry, reasons: string[], looksLike: string) {
  const windowMinutes = Math.max(1, Math.round((e.last - e.first) / 60000));
  const samplePaths = Array.from(e.paths).slice(0, 10);

  // 1. Save the row (readable IP only for flagged visitors; purged after 30 days).
  try {
    const admin = supabaseAdmin();
    await admin.from('traffic_flags').insert({
      ip: e.ip,
      ip_source: e.ipSource,
      forwarded_for: e.forwarded || null,
      user_agent: e.ua || null,
      looks_like: looksLike,
      reasons: reasons.join('; '),
      requests: total(e),
      image_requests: e.images,
      page_requests: e.pages,
      distinct_paths: e.paths.size,
      admin_hits: e.adminHits,
      first_seen: new Date(e.first).toISOString(),
      last_seen: new Date(e.last).toISOString(),
      sample_paths: samplePaths,
    });
    const cutoff = new Date(Date.now() - RETENTION_DAYS * 86400 * 1000).toISOString();
    await admin.from('traffic_flags').delete().lt('flagged_at', cutoff);
  } catch {
    // Database unavailable or table not created yet — the email below still goes out.
  }

  // 2. Email.
  const day = istDay();
  if (state.emails.day !== day) state.emails = { day, count: 0 };
  if (state.emails.count >= MAX_EMAILS_PER_DAY) return;
  if (!isReportEmailConfigured()) return;
  const to = getReportRecipients();
  if (to.length === 0) return;
  state.emails.count++;

  const text = [
    'Agavai traffic watch — ALERT ONLY. Nothing was blocked or changed; visitors are unaffected.',
    '',
    `What looks unusual: ${reasons.join('; ')} (in about ${windowMinutes} min)`,
    `Best guess: ${looksLike}`,
    '',
    `Address (IP): ${e.ip}   [read from header: ${e.ipSource}]`,
    `Raw X-Forwarded-For: ${e.forwarded || '(none)'}`,
    `Browser string: ${e.ua || '(none)'}`,
    `Requests: ${total(e)} total — ${e.images} photos, ${e.pages} pages, ${e.api} background calls`,
    `Different pages/photos touched: ${e.paths.size}; admin pages opened: ${e.adminHits}`,
    `Sample: ${samplePaths.slice(0, 5).join(' | ') || '(none)'}`,
    '',
    'How to read this:',
    '- "admin session" means someone was logged in to /admin — most likely your own team refreshing.',
    '- "known crawler" (Google, WhatsApp/Instagram previews) is normal; AI/scraper crawlers are unwanted but not an attack.',
    '- Many alerts from DIFFERENT addresses at the same time, all pulling the same photos, is the pattern worth worrying about.',
    '- The IP header is not yet verified as trustworthy: if the address looks like your own or Hostinger\'s, treat it with caution.',
    '',
    'Thresholds are first guesses and will be tuned after a week of alerts.',
  ].join('\n');

  const html = `<pre style="font-family:ui-monospace,Menlo,monospace;font-size:13px;white-space:pre-wrap">${text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')}</pre>`;

  await sendReportEmail({
    to,
    subject: `Agavai traffic watch: ${total(e)} requests from one visitor — ${looksLike.split(' (')[0]}`,
    text,
    html,
  });
}

/** For the admin diagnostic page: what the watch currently sees. */
export function snapshot() {
  const state = getState();
  const top = Array.from(state.entries.values())
    .sort((a, b) => total(b) - total(a))
    .slice(0, 10)
    .map((e) => ({
      ip: e.ip,
      ipSource: e.ipSource,
      requests: total(e),
      photos: e.images,
      pages: e.pages,
      distinct: e.paths.size,
      adminHits: e.adminHits,
      ua: e.ua.slice(0, 100),
    }));
  return {
    windowStartedAt: new Date(state.windowStart).toISOString(),
    windowMinutes: WINDOW_MS / 60000,
    visitorsThisWindow: state.entries.size,
    thresholds: THRESHOLDS,
    emailsSentToday: state.emails.day === istDay() ? state.emails.count : 0,
    recentFlags: state.recent,
    topVisitorsNow: top,
  };
}
