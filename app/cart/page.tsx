import Header from '@/components/Header';
import SaleBanner from '@/components/SaleBanner';
import Footer from '@/components/Footer';
import CartContent from '@/components/CartContent';

export const revalidate = 0;

export default function CartPage() {
  return (
    <>
      <SaleBanner />
      <Header />
      <CartContent />
      <Footer />
    </>
  );
}
