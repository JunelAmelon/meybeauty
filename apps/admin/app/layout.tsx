import type { Metadata } from 'next';
import { Lato, Cormorant_Garamond, Caveat } from 'next/font/google';
import Layout from '../components/Layout';
import './globals.css';

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
  title: 'Mey Beauty Admin',
  description: 'Administration Mey Beauty',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body suppressHydrationWarning className={`${lato.variable} ${cormorant.variable} ${caveat.variable}`} style={{ fontFamily: 'var(--font-lato), system-ui, sans-serif' }}>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
