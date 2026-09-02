'use client'

import { useTranslations } from 'next-intl'
import { Header } from '@/apps/b2c/components/header'
import { Footer } from '@/apps/b2c/components/footer'
import { NewsletterSection } from '@/apps/b2c/components/newsletter-section'
import Image from 'next/image'
import Link from 'next/link'
import { Clock, Sparkles, Heart } from 'lucide-react'
import { Button } from '@/apps/b2c/components/ui/button'
import { useRituals } from '@/apps/b2c/hooks/useRituals'

export default function RituelsPage() {
  const t = useTranslations('b2c.rituals')
  const { rituals, loading, error } = useRituals()

  return (
    <>
      <Header />
      <div className="min-h-screen">
        <div className="relative h-[300px] md:h-[400px] w-full pt-16 md:pt-20">
          <Image
            src="https://images.pexels.com/photos/3997379/pexels-photo-3997379.jpeg?auto=compress&cs=tinysrgb&w=1600"
            alt={t('title')}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#523A28]/80 to-transparent" />
          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-6">
              <h1 className="text-white text-4xl md:text-6xl" style={{ fontFamily: 'var(--font-caveat)' }}>
                {t('title')}
              </h1>
              <p className="text-white/90 mt-4 max-w-xl">
                {t('subtitle')}
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-12 md:py-16">
          <div className="mb-10">
            <Link href="/" className="inline-flex items-center gap-2 mb-8 hover:opacity-80 transition-opacity">
              <Image src="/b2c/akar-icons_arrow-back.svg" alt={t('back')} width={32} height={32} />
            </Link>
            <h2 className="text-[#523A28] mb-2" style={{ fontFamily: 'var(--font-caveat)', fontSize: '48px', fontWeight: 400 }}>
              {t('heading')}
            </h2>
            <div className="w-full h-[1px] bg-[#523A28]"></div>
          </div>

          {loading && (
            <div className="py-12 text-center text-gray-600">{t('loading')}</div>
          )}
          {error && !loading && (
            <div className="py-12 text-center text-red-600">{error}</div>
          )}
          {!loading && !error && rituals.length === 0 && (
            <div className="py-12 text-center text-gray-600">{t('empty')}</div>
          )}

          <div className="space-y-12">
            {rituals.map((ritual, index) => (
              <div
                key={ritual.slug}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-8 items-center ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}
              >
                <div className={`relative h-[300px] md:h-[400px] rounded-lg overflow-hidden ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                  <Image src={ritual.image} alt={ritual.title} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </div>

                <div className={`space-y-6 ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                  <div>
                    <span className="text-[#523A28] text-sm font-medium uppercase tracking-wide">
                      {ritual.subtitle}
                    </span>
                    <h3 className="text-3xl font-semibold text-[#2d2d2d] mt-2" style={{ fontFamily: 'var(--font-caveat)' }}>
                      {ritual.title}
                    </h3>
                  </div>

                  <p className="text-gray-600 leading-relaxed">
                    {ritual.description}
                  </p>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4 text-[#523A28]" />
                      {ritual.duration}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Sparkles className="w-4 h-4 text-[#523A28]" />
                      {ritual.difficulty}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-[#2d2d2d] mb-3">{t('steps_title')}:</h4>
                    <ol className="space-y-2">
                      {ritual.steps.map((step, stepIndex) => (
                        <li key={stepIndex} className="flex items-center gap-3 text-sm text-gray-600">
                          <span className="w-6 h-6 bg-[#523A28] text-white rounded-full flex items-center justify-center text-xs">
                            {stepIndex + 1}
                          </span>
                          {step.name || step.desc}
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="pt-4">
                    <Button asChild className="bg-[#523A28] hover:bg-[#3A2819] text-white rounded-sm">
                      <Link href={`/rituels/${ritual.slug}`}>
                        <Heart className="w-4 h-4 mr-2" />
                        {t('discover')}
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <NewsletterSection />
      </div>
      <Footer />
    </>
  )
}
