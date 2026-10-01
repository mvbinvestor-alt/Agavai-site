import CheckoutForm from '@/components/CheckoutForm';
import { getSettings } from '@/lib/settings';

export const revalidate = 0;

const DEFAULT_PAUSED_MESSAGE =
  "We're confirming orders manually right now while we fine-tune shipping — message us on WhatsApp or Instagram with what you'd like, and we'll help you complete your order and payment there.";

export default async function CheckoutPage() {
  const settings = await getSettings(['checkout_paused', 'checkout_paused_message']);
  const paused = settings.checkout_paused === 'true';
  const pausedMessage = settings.checkout_paused_message || DEFAULT_PAUSED_MESSAGE;

  return <CheckoutForm paused={paused} pausedMessage={pausedMessage} />;
}
