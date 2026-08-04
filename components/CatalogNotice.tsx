import { instagramProfileLink, instagramDmLink } from '@/lib/instagram';
import { WHATSAPP_NUMBER } from '@/lib/whatsapp';
import { getSettings } from '@/lib/settings';

const DEFAULT_TEXT = "We're still adding pieces here — our full range is on Instagram.";

export default async function CatalogNotice() {
  const settings = await getSettings(['catalog_notice_enabled', 'catalog_notice_text']);
  const enabled = settings.catalog_notice_enabled !== 'false';
  if (!enabled) return null;

  const text = settings.catalog_notice_text || DEFAULT_TEXT;

  return (
    <div className="wrap">
      <div className="catalog-notice">
        <p>
          {text} Looking for something specific? Message us on{' '}
          {WHATSAPP_NUMBER && (
            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
          )}
          {WHATSAPP_NUMBER && ' or '}
          <a href={instagramDmLink()} target="_blank" rel="noopener noreferrer">
            Instagram DM
          </a>
          . Or browse{' '}
          <a href={instagramProfileLink()} target="_blank" rel="noopener noreferrer">
            our Instagram
          </a>{' '}
          for the full range.
        </p>
      </div>
    </div>
  );
}
