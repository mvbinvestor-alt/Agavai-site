// Fixed WhatsApp number used for every "Order on WhatsApp" button.
// Set as an env var so it's easy to change without touching code.
// Format: country code + number, digits only, e.g. 919876543210
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '';

export function whatsappLink(productName?: string) {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  if (!productName) return base;
  const text = encodeURIComponent(
    `Hi Agavai! I'd like to know more about "${productName}".`
  );
  return `${base}?text=${text}`;
}
