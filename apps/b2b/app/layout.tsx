import type { Metadata } from "next";
import { Lato, Cormorant_Garamond, Caveat } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import "./globals.css";
import { Providers } from "./providers";

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
  fallback: ['Georgia', 'serif'],
});

const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-caveat',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  fallback: ['cursive'],
});

export const metadata: Metadata = {
  title: "Mey Beauty B2B - Espace Professionnel",
  description: "Plateforme B2B pour professionnels de la beauté - Mey Beauty",
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
      <body className={`${lato.variable} ${cormorant.variable} ${caveat.variable} antialiased`} style={{ fontFamily: 'var(--font-lato), system-ui, sans-serif' }}>
        <NextIntlClientProvider messages={messages}>
          <Providers>
            {children}
            <LanguageSwitcher />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}