import { whatsappLink } from '@/lib/whatsapp';
import { instagramDmLink } from '@/lib/instagram';

export default function FloatingContact() {
  return (
    <div className="floating-contact">
      <a
        href={instagramDmLink()}
        target="_blank"
        rel="noopener noreferrer"
        className="floating-contact__btn floating-contact__btn--instagram"
        aria-label="Message Agavai on Instagram"
        title="Message us on Instagram"
      >
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
        </svg>
      </a>
      <a
        href={whatsappLink()}
        target="_blank"
        rel="noopener noreferrer"
        className="floating-contact__btn floating-contact__btn--whatsapp"
        aria-label="Chat with Agavai on WhatsApp"
        title="Chat on WhatsApp"
      >
        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.29-1.38a9.86 9.86 0 0 0 4.7 1.2h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm5.79 14.13c-.24.68-1.4 1.3-1.93 1.37-.5.07-1.05.1-3.16-.66-2.66-.98-4.36-3.66-4.5-3.83-.13-.17-1.08-1.43-1.08-2.73 0-1.3.68-1.94.93-2.2.24-.27.53-.34.7-.34l.5.01c.16.01.38-.06.6.45.24.57.79 1.98.86 2.12.07.14.12.31.02.5-.1.19-.15.31-.29.48-.15.17-.31.38-.44.51-.15.15-.3.31-.13.61.17.3.76 1.25 1.63 2.02 1.12 1 2.06 1.31 2.36 1.46.3.15.47.13.65-.08.17-.21.74-.86.94-1.16.19-.3.39-.25.65-.15.27.1 1.68.79 1.97.93.29.14.48.21.55.33.07.12.07.68-.17 1.36z" />
        </svg>
      </a>
    </div>
  );
}
