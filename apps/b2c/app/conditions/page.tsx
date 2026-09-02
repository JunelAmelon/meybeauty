'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Header } from '@/apps/b2c/components/header'
import { Footer } from '@/apps/b2c/components/footer'
import { useTranslations } from 'next-intl'

export default function TermsPage() {
  const t = useTranslations('b2c.legal.terms')
  const tl = useTranslations('b2c.legal')

  const sections = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 's10'] as const

  return (
    <>
      <Header />
      <div className="min-h-screen">
        <div className="relative h-[200px] md:h-[300px] w-full pt-16 md:pt-20">
          <div className="absolute inset-0 bg-[#523A28]" />
          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-6">
              <h1 className="text-white text-3xl md:text-5xl" style={{ fontFamily: 'var(--font-caveat)' }}>
                {t('title')}
              </h1>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-12 md:py-16">
          <div className="mb-10">
            <Link href="/" className="inline-flex items-center gap-2 mb-8 hover:opacity-80 transition-opacity">
              <Image src="/b2c/akar-icons_arrow-back.svg" alt={tl('back')} width={32} height={32} />
            </Link>
          </div>

          <div className="max-w-3xl mx-auto prose prose-gray">
            <p className="text-sm text-gray-500 mb-8">{t('update')}</p>

            {sections.map((section) => (
              <section key={section} className="mb-8">
                <h2 className="text-[#523A28] text-xl font-semibold mb-4">{t(`${section}.title`)}</h2>
                <p className="text-gray-600 leading-relaxed text-justify">
                  {t(`${section}.text`)}
                </p>
              </section>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
