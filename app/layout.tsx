import type { Metadata } from 'next';
import { Fraunces, Work_Sans } from 'next/font/google';
import FloatingContact from '@/components/FloatingContact';
import { CartProvider } from '@/context/CartContext';
import './globals.css';

const display = Fraunces({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});

const body = Work_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Agavai — Artistry for the Ages',
  description:
    'Agavai curates vintage treasures (Agavai Pokkisham) and handcrafted heritage decor, including 150-year-old Chettinad enamelware and Athangudi tile furniture. Founded by four childhood friends. Browse the collection and order on WhatsApp.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable}`}>
        <CartProvider>
          {children}
          <FloatingContact />
        </CartProvider>
      </body>
    </html>
  );
}
