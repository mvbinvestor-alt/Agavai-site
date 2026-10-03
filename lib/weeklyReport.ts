import { supabaseAdmin } from './supabase';

const REVENUE_STATUSES = ['paid', 'packed', 'shipped', 'delivered'];
const DAY_MS = 24 * 60 * 60 * 1000;

interface ProductRow {
  name: string;
  viewsThis: number;
  viewsLast: number;
  addsThis: number;
  purchasedThis: number;
}

export interface WeeklyReportData {
  viewsThis: number;
  viewsLast: number;
  viewsPctChange: number | null;
  revenueThis: number;
  revenueLast: number;
  ordersThis: number;
  topReferrers: { ref: string; count: number }[];
  topCountries: { country: string; count: number }[];
  products: ProductRow[];
  abandoned: ProductRow[];
  trendingUp: ProductRow[];
  suggestions: string[];
}

function productPath(path: string): string | null {
  const match = path.match(/^\/product\/([a-f0-9-]+)/i);
  return match ? match[1] : null;
}

export async function buildWeeklyReport(): Promise<WeeklyReportData> {
  const admin = supabaseAdmin();
  const now = Date.now();
  const since14 = new Date(now - 14 * DAY_MS).toISOString();
  const cutoff7 = now - 7 * DAY_MS;

  const [{ data: views }, { data: products }, { data: cartAdds }, { data: orders }] = await Promise.all([
    admin.from('page_views').select('path, referrer, country, created_at').gte('created_at', since14).limit(20000),
    admin.from('products').select('id, name'),
    admin
      .from('product_interest_events')
      .select('product_id, product_name, created_at')
      .gte('created_at', since14)
      .limit(10000),
    admin.from('orders').select('id, total, status, created_at').gte('created_at', since14).limit(5000),
  ]);

  const productNames: Record<string, string> = {};
  for (const p of products || []) productNames[p.id] = p.name;

  const allViews = views || [];
  const viewsThisArr = allViews.filter((v) => new Date(v.created_at).getTime() >= cutoff7);
  const viewsLastArr = allViews.filter((v) => new Date(v.created_at).getTime() < cutoff7);

  const viewsThis = viewsThisArr.length;
  const viewsLast = viewsLastArr.length;
  const viewsPctChange = viewsLast > 0 ? Math.round(((viewsThis - viewsLast) / viewsLast) * 100) : null;

  // Referrers (this week only)
  const byReferrer: Record<string, number> = {};
  for (const v of viewsThisArr) {
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
    .slice(0, 5)
    .map(([ref, count]) => ({ ref, count }));

  // Countries (this week only)
  const byCountry: Record<string, number> = {};
  for (const v of viewsThisArr) {
    const c = v.country || 'Unknown';
    byCountry[c] = (byCountry[c] || 0) + 1;
  }
  const topCountries = Object.entries(byCountry)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([country, count]) => ({ country, count }));

  // Orders / revenue
  const allOrders = orders || [];
  const ordersThisArr = allOrders.filter(
    (o) => new Date(o.created_at).getTime() >= cutoff7 && REVENUE_STATUSES.includes(o.status)
  );
  const ordersLastArr = allOrders.filter(
    (o) => new Date(o.created_at).getTime() < cutoff7 && REVENUE_STATUSES.includes(o.status)
  );
  const revenueThis = ordersThisArr.reduce((sum, o) => sum + (o.total || 0), 0);
  const revenueLast = ordersLastArr.reduce((sum, o) => sum + (o.total || 0), 0);

  // Per-product views this/last week
  const viewsThisByProduct: Record<string, number> = {};
  for (const v of viewsThisArr) {
    const id = productPath(v.path);
    if (id) viewsThisByProduct[id] = (viewsThisByProduct[id] || 0) + 1;
  }
  const viewsLastByProduct: Record<string, number> = {};
  for (const v of viewsLastArr) {
    const id = productPath(v.path);
    if (id) viewsLastByProduct[id] = (viewsLastByProduct[id] || 0) + 1;
  }

  // Cart adds this week, by product
  const allAdds = cartAdds || [];
  const addsThisByProduct: Record<string, number> = {};
  const nameFallback: Record<string, string> = {};
  for (const a of allAdds) {
    if (!a.product_id) continue;
    if (new Date(a.created_at).getTime() >= cutoff7) {
      addsThisByProduct[a.product_id] = (addsThisByProduct[a.product_id] || 0) + 1;
    }
    nameFallback[a.product_id] = a.product_name;
  }

  // Purchases this week, by product (via order_items of this-week revenue orders)
  const thisWeekOrderIds = ordersThisArr.map((o) => o.id);
  let purchasedThisByProduct: Record<string, number> = {};
  if (thisWeekOrderIds.length > 0) {
    const { data: items } = await admin
      .from('order_items')
      .select('product_id, product_name, quantity')
      .in('order_id', thisWeekOrderIds);
    for (const it of items || []) {
      if (!it.product_id) continue;
      purchasedThisByProduct[it.product_id] = (purchasedThisByProduct[it.product_id] || 0) + it.quantity;
      nameFallback[it.product_id] = nameFallback[it.product_id] || it.product_name;
    }
  }

  const allProductIds = new Set([
    ...Object.keys(viewsThisByProduct),
    ...Object.keys(viewsLastByProduct),
    ...Object.keys(addsThisByProduct),
    ...Object.keys(purchasedThisByProduct),
  ]);

  const products_: ProductRow[] = Array.from(allProductIds).map((id) => ({
    name: productNames[id] || nameFallback[id] || 'Unknown product',
    viewsThis: viewsThisByProduct[id] || 0,
    viewsLast: viewsLastByProduct[id] || 0,
    addsThis: addsThisByProduct[id] || 0,
    purchasedThis: purchasedThisByProduct[id] || 0,
  }));

  products_.sort((a, b) => b.viewsThis - a.viewsThis);

  const abandoned = products_
    .filter((p) => p.addsThis > 0 && p.purchasedThis === 0)
    .sort((a, b) => b.addsThis - a.addsThis)
    .slice(0, 6);

  const trendingUp = products_
    .filter((p) => p.viewsThis - p.viewsLast > 0 && p.viewsLast > 0)
    .sort((a, b) => b.viewsThis - b.viewsLast - (a.viewsThis - a.viewsLast))
    .slice(0, 4);

  // Rule-based suggestions — trend/heuristic reporting, not predictive modeling.
  const suggestions: string[] = [];
  for (const p of abandoned.slice(0, 4)) {
    suggestions.push(
      `"${p.name}" was added to cart ${p.addsThis} time${p.addsThis > 1 ? 's' : ''} this week but not bought — worth checking its price, shipping cost, or photos.`
    );
  }
  if (topReferrers.length > 0 && viewsThis > 0) {
    const top = topReferrers[0];
    const share = Math.round((top.count / viewsThis) * 100);
    if (share >= 40) {
      suggestions.push(`${share}% of this week's traffic came from ${top.ref} — worth posting there more often.`);
    }
  }
  if (viewsPctChange !== null && viewsPctChange <= -25) {
    suggestions.push(`Traffic is down ${Math.abs(viewsPctChange)}% from last week — worth a check-in on recent posts or ads.`);
  }
  for (const p of trendingUp.slice(0, 2)) {
    suggestions.push(`"${p.name}" views jumped from ${p.viewsLast} to ${p.viewsThis} this week — make sure stock and photos are ready.`);
  }
  if (suggestions.length === 0) {
    suggestions.push('No major changes to flag this week — traffic and sales are steady.');
  }

  return {
    viewsThis,
    viewsLast,
    viewsPctChange,
    revenueThis,
    revenueLast,
    ordersThis: ordersThisArr.length,
    topReferrers,
    topCountries,
    products: products_.slice(0, 12),
    abandoned,
    trendingUp,
    suggestions,
  };
}

function money(n: number) {
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

export function renderReportEmail(data: WeeklyReportData): { subject: string; html: string; text: string } {
  const changeLabel =
    data.viewsPctChange === null ? '' : data.viewsPctChange >= 0 ? ` (+${data.viewsPctChange}%)` : ` (${data.viewsPctChange}%)`;

  const subject = `Agavai weekly update: ${data.viewsThis} views, ${money(data.revenueThis)} revenue`;

  const rows = (items: { label: string; values: (string | number)[] }[]) =>
    items
      .map(
        (r) =>
          `<tr><td style="padding:4px 8px;border-bottom:1px solid #eee;">${r.label}</td>${r.values
            .map((v) => `<td style="padding:4px 8px;border-bottom:1px solid #eee;text-align:right;">${v}</td>`)
            .join('')}</tr>`
      )
      .join('');

  const html = `
    <div style="font-family:Georgia,serif;color:#2a2420;max-width:600px;margin:0 auto;">
      <h2 style="margin-bottom:4px;">Agavai — Weekly Update</h2>
      <p style="color:#766f66;margin-top:0;">Last 7 days vs the week before</p>

      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        <tr><td style="padding:4px 0;">Views</td><td style="text-align:right;"><strong>${data.viewsThis}</strong>${changeLabel}</td></tr>
        <tr><td style="padding:4px 0;">Orders</td><td style="text-align:right;"><strong>${data.ordersThis}</strong></td></tr>
        <tr><td style="padding:4px 0;">Revenue</td><td style="text-align:right;"><strong>${money(data.revenueThis)}</strong> (prev week: ${money(data.revenueLast)})</td></tr>
      </table>

      <h3 style="margin-bottom:6px;">Suggestions</h3>
      <ul style="padding-left:18px;">
        ${data.suggestions.map((s) => `<li style="margin-bottom:6px;">${s}</li>`).join('')}
      </ul>

      <h3 style="margin-bottom:6px;">Product interest (top this week)</h3>
      <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:20px;">
        <tr style="color:#766f66;font-size:12px;"><td style="padding:4px 8px;">Product</td><td style="padding:4px 8px;text-align:right;">Views</td><td style="padding:4px 8px;text-align:right;">Added</td><td style="padding:4px 8px;text-align:right;">Bought</td></tr>
        ${rows(
          data.products.map((p) => ({
            label: p.name,
            values: [p.viewsThis, p.addsThis, p.purchasedThis],
          }))
        )}
      </table>

      <h3 style="margin-bottom:6px;">Where visitors came from</h3>
      <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:20px;">
        ${rows(data.topReferrers.map((r) => ({ label: r.ref, values: [r.count] })))}
      </table>

      <h3 style="margin-bottom:6px;">Countries</h3>
      <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:20px;">
        ${rows(data.topCountries.map((c) => ({ label: c.country, values: [c.count] })))}
      </table>

      <p style="color:#999;font-size:12px;margin-top:30px;">
        Automated weekly summary from agavai.in — trend/heuristic reporting based on your site's own traffic
        and order data, not a sales forecast.
      </p>
    </div>
  `;

  const text = [
    `Agavai — Weekly Update`,
    `Views: ${data.viewsThis}${changeLabel} | Orders: ${data.ordersThis} | Revenue: ${money(data.revenueThis)} (prev week ${money(data.revenueLast)})`,
    ``,
    `Suggestions:`,
    ...data.suggestions.map((s) => `- ${s}`),
    ``,
    `Top products this week (views / added / bought):`,
    ...data.products.map((p) => `- ${p.name}: ${p.viewsThis} / ${p.addsThis} / ${p.purchasedThis}`),
    ``,
    `Where visitors came from:`,
    ...data.topReferrers.map((r) => `- ${r.ref}: ${r.count}`),
    ``,
    `Countries:`,
    ...data.topCountries.map((c) => `- ${c.country}: ${c.count}`),
  ].join('\n');

  return { subject, html, text };
}
