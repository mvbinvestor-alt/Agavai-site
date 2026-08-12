// Fixed WhatsApp number used for every "Order on WhatsApp" button.
// Set as an env var so it's easy to change without touching code.
// Format: country code + number, digits only, e.g. 919876543210
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '';

export function whatsappLink(productName?: string, productSku?: string | null, productUrl?: string) {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  if (!productName) return base;
  const lines = [`Hi Agavai! I'm interested in this product.`, `Product: ${productName}`];
  if (productSku) lines.push(`Product ID: ${productSku}`);
  if (productUrl) lines.push(productUrl);
  const text = encodeURIComponent(lines.join('\n'));
  return `${base}?text=${text}`;
}
