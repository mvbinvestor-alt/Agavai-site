import { whatsappLink } from '@/lib/whatsapp';

export default function WhatsAppButton({
  productName,
  productSku,
  productUrl,
  label = 'Order on WhatsApp',
}: {
  productName?: string;
  productSku?: string | null;
  productUrl?: string;
  label?: string;
}) {
  return (
    <a
      className="btn btn-whatsapp"
      href={whatsappLink(productName, productSku, productUrl)}
      target="_blank"
      rel="noopener noreferrer"
    >
      {label}
    </a>
  );
}
