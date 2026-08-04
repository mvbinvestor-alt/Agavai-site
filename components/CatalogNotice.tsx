import { instagramProfileLink, instagramDmLink } from '@/lib/instagram';
import { WHATSAPP_NUMBER } from '@/lib/whatsapp';

export default function CatalogNotice() {
  return (
    <div className="wrap">
      <div className="catalog-notice">
        <p>
          We&apos;re still adding pieces here — our full range is on{' '}
          <a href={instagramProfileLink()} target="_blank" rel="noopener noreferrer">
            Instagram
          </a>
          . Looking for something specific? Message us on{' '}
          {WHATSAPP_NUMBER && (
            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
          )}
          {WHATSAPP_NUMBER && ' or '}
          <a href={instagramDmLink()} target="_blank" rel="noopener noreferrer">
            Instagram DM
          </a>{' '}
          and we&apos;ll help you find it.
        </p>
      </div>
    </div>
  );
}
