import "./globals.css";

import { AuthProvider } from "@/apps/b2b/context/AuthContext";
import { CartProvider } from "@/apps/b2c/lib/cart-context";
import { Lato, Cormorant_Garamond, Caveat } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import RoleRedirector from '@/components/RoleRedirector';

const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-lato",
  display: "swap",
  fallback: ["system-ui", "arial"],
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant-garamond",
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  fallback: ["Georgia", "serif"],
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  weight: ["400", "500", "600", "700"],
  display: "swap",
  fallback: ["cursive"],
});

export default async function LocaleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale();
  const messages = await getMessages();
  return (
    <html lang={locale}>
      <body suppressHydrationWarning className={`${lato.variable} ${cormorant.variable} ${caveat.variable}`} style={{ fontFamily: 'var(--font-lato), system-ui, sans-serif' }}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AuthProvider>
            <CartProvider>
              <RoleRedirector />
              {children}
              <LanguageSwitcher />
            </CartProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
