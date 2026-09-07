import './globals.css';
import type { Metadata } from 'next';
import { Lato, Cormorant_Garamond, Caveat } from 'next/font/google';
import { CartProvider } from '@/apps/b2c/lib/cart-context';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const lato = Lato({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  display: 'swap',
  fallback: ['system-ui', 'arial'],
  variable: '--font-lato',
});
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cormorant-garamond',
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
  fallback: ['Georgia', 'serif']
});
const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-caveat',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  fallback: ['cursive'],
});

export const metadata: Metadata = {
  title: 'Mey Beauty - Cosmétiques d\'exception pour une peau éclatante',
  description: 'Découvrez l\'univers Mey Beauty : des soins expertaux qui allient actifs premium et formules avancées pour nourrir votre peau, sublimer votre routine et éveiller vos sens.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body suppressHydrationWarning className={`${lato.variable} ${cormorant.variable} ${caveat.variable}`} style={{ fontFamily: 'var(--font-lato), system-ui, sans-serif' }}>
        <NextIntlClientProvider messages={messages}>
          <CartProvider>
            {children}
            <LanguageSwitcher />
          </CartProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
