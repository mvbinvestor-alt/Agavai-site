import { getSettings } from '@/lib/settings';

export default async function SaleBanner() {
  const settings = await getSettings([
    'sale_banner_enabled',
    'sale_banner_message',
    'sale_banner_start',
    'sale_banner_end',
  ]);

  if (settings.sale_banner_enabled !== 'true') return null;

  const today = new Date().toISOString().slice(0, 10);
  if (settings.sale_banner_start && today < settings.sale_banner_start) return null;
  if (settings.sale_banner_end && today > settings.sale_banner_end) return null;

  const message = settings.sale_banner_message?.trim();
  if (!message) return null;

  return <div className="sale-banner">{message}</div>;
}
