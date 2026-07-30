import { whatsappLink } from '@/lib/whatsapp';

export default function WhatsAppButton({
  productName,
  label = 'Order on WhatsApp',
}: {
  productName?: string;
  label?: string;
}) {
  return (
    <a
      className="btn btn-whatsapp"
      href={whatsappLink(productName)}
      target="_blank"
      rel="noopener noreferrer"
    >
      {label}
    </a>
  );
}
