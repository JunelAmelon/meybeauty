import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram } from "lucide-react"
import { useTranslations } from "next-intl"

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  )
}

export function Footer() {
  const t = useTranslations('b2c.layout.footer')

  return (
    <footer className="bg-[#523A28] text-white py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex items-start">
            <Link href="/">
              <Image
                src="/b2c/logo-mey-beauty.png"
                alt="Mey Beauty"
                width={120}
                height={40}
                className="brightness-0 invert"
              />
            </Link>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">{t('help.title')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/contact" className="hover:opacity-80 transition-opacity text-sm">
                  {t('help.contact')}
                </Link>
              </li>
              <li>
                <Link href="/conditions" className="hover:opacity-80 transition-opacity text-sm">
                  {t('help.terms')}
                </Link>
              </li>
              <li>
                <Link href="/confidentialite" className="hover:opacity-80 transition-opacity text-sm">
                  {t('help.privacy')}
                </Link>
              </li>
              <li>
                <Link href="/livraison" className="hover:opacity-80 transition-opacity text-sm">
                  {t('help.shipping')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">{t('about.title')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/a-propos" className="hover:opacity-80 transition-opacity text-sm">
                  {t('about.who_are_we')}
                </Link>
              </li>
              <li>
                <Link href="/engagement" className="hover:opacity-80 transition-opacity text-sm">
                  {t('about.sustainable')}
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:opacity-80 transition-opacity text-sm">
                  {t('about.news')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">{t('social.title')}</h3>
            <p className="text-sm opacity-90 mb-4">
              {t('social.desc')}
            </p>
            <div className="flex items-center gap-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                <Instagram className="w-6 h-6" />
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                <TikTokIcon className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-8 text-center text-sm opacity-80">
          <p>{t('rights')}</p>
        </div>
      </div>
    </footer>
  )
}
