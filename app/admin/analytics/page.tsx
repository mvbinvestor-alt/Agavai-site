import Link from 'next/link';
import { isAdminAuthed } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import AdminLogin from '@/components/AdminLogin';

export const revalidate = 0;

interface Row {
  path: string;
  referrer: string | null;
  country: string | null;
  created_at: string;
}

async function getViews(): Promise<Row[]> {
  const admin = supabaseAdmin();
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const { data } = await admin
    .from('page_views')
    .select('path, referrer, country, created_at')
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: false })
    .limit(10000);
  return data || [];
}

function dayKey(iso: string) {
  return iso.slice(0, 10); // YYYY-MM-DD
}

export default async function AnalyticsPage() {
  if (!(await isAdminAuthed())) {
    return <AdminLogin />;
  }

  const views = await getViews();
  const now = Date.now();
  const last24h = views.filter((v) => now - new Date(v.created_at).getTime() < 24 * 60 * 60 * 1000);
  const last7d = views.filter((v) => now - new Date(v.created_at).getTime() < 7 * 24 * 60 * 60 * 1000);

  const byPath: Record<string, number> = {};
  for (const v of last7d) byPath[v.path] = (byPath[v.path] || 0) + 1;
  const topPages = Object.entries(byPath)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const byReferrer: Record<string, number> = {};
  for (const v of last7d) {
    let ref = 'Direct / unknown';
    if (v.referrer) {
      try {
        ref = new URL(v.referrer).hostname.replace('www.', '');
      } catch {
        ref = v.referrer.slice(0, 40);
      }
    }
    byReferrer[ref] = (byReferrer[ref] || 0) + 1;
  }
  const topReferrers = Object.entries(byReferrer)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const byCountry: Record<string, number> = {};
  for (const v of last7d) {
    const c = v.country || 'Unknown';
    byCountry[c] = (byCountry[c] || 0) + 1;
  }
  const topCountries = Object.entries(byCountry).sort((a, b) => b[1] - a[1]);

  const byDay: Record<string, number> = {};
  for (const v of views) byDay[dayKey(v.created_at)] = (byDay[dayKey(v.created_at)] || 0) + 1;
  const days: { day: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({ day: key, count: byDay[key] || 0 });
  }
  const maxDay = Math.max(1, ...days.map((d) => d.count));

  return (
    <div className="admin-shell">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}>Traffic</h2>
        <Link href="/admin" className="btn btn-outline">
          Back to Admin
        </Link>
      </div>

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 30 }}>
        <div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{last24h.length}</div>
          <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>Views, last 24h</div>
        </div>
        <div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{last7d.length}</div>
          <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>Views, last 7 days</div>
        </div>
        <div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{views.length}</div>
          <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>Views, last 30 days</div>
        </div>
      </div>

      <h3 style={{ fontSize: 16, marginBottom: 10 }}>Daily views (last 14 days)</h3>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 100, marginBottom: 8 }}>
        {days.map((d) => (
          <div key={d.day} style={{ flex: 1, textAlign: 'center' }}>
            <div
              title={`${d.day}: ${d.count}`}
              style={{
                height: `${Math.max(4, (d.count / maxDay) * 90)}px`,
                background: 'var(--brass)',
                borderRadius: '2px 2px 0 0',
              }}
            />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 30, fontSize: 10, color: 'var(--ink-soft)' }}>
        {days.map((d) => (
          <div key={d.day} style={{ flex: 1, textAlign: 'center' }}>
            {d.day.slice(5)}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <h3 style={{ fontSize: 16, marginBottom: 10 }}>Top pages (7 days)</h3>
          {topPages.length === 0 ? (
            <p style={{ color: 'var(--ink-soft)', fontSize: 14 }}>No visits yet.</p>
          ) : (
            topPages.map(([path, count]) => (
              <div key={path} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 14 }}>
                <span>{path}</span>
                <strong>{count}</strong>
              </div>
            ))
          )}
        </div>

        <div style={{ flex: 1, minWidth: 240 }}>
          <h3 style={{ fontSize: 16, marginBottom: 10 }}>Countries (7 days)</h3>
          {topCountries.length === 0 ? (
            <p style={{ color: 'var(--ink-soft)', fontSize: 14 }}>No visits yet.</p>
          ) : (
            topCountries.map(([country, count]) => (
              <div key={country} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 14 }}>
                <span>{country}</span>
                <strong>{count}</strong>
              </div>
            ))
          )}
        </div>

        <div style={{ flex: 1, minWidth: 240 }}>
          <h3 style={{ fontSize: 16, marginBottom: 10 }}>Where visitors came from (7 days)</h3>
          {topReferrers.length === 0 ? (
            <p style={{ color: 'var(--ink-soft)', fontSize: 14 }}>No visits yet.</p>
          ) : (
            topReferrers.map(([ref, count]) => (
              <div key={ref} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 14 }}>
                <span>{ref}</span>
                <strong>{count}</strong>
              </div>
            ))
          )}
        </div>
      </div>

      <p style={{ color: 'var(--ink-soft)', fontSize: 12, marginTop: 30 }}>
        Counts every page load, including repeat visits from the same person — this is traffic
        volume, not unique visitor count. No cookies or personal data are stored.
      </p>
    </div>
  );
}
