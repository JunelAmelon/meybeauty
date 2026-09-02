'use client'

import Image from 'next/image'
import Link from 'next/link'
import { use, useMemo } from 'react'
import { Clock, Sparkles, Heart, CheckCircle, ShoppingCart } from 'lucide-react'
import { Button } from '@/apps/b2c/components/ui/button'
import { Header } from '@/apps/b2c/components/header'
import { Footer } from '@/apps/b2c/components/footer'
import { NewsletterSection } from '@/apps/b2c/components/newsletter-section'
import { notFound } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useRitual } from '@/apps/b2c/hooks/useRituals'
import { useProducts, ProductDoc as Product } from '@/apps/b2c/hooks/useProducts'

export default function RitualDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const t = useTranslations('b2c.rituals')
  const { id } = use(params)
  const { ritual, loading, error } = useRitual(id)
  const { products: allProducts } = useProducts()

  const recommendedProducts = useMemo(() => {
    if (!ritual) return []
    return (ritual.products || [])
      .map((pid) => {
        return allProducts.find((p) => p.slug === pid)
      })
      .filter((p): p is Product => !!p)
  }, [ritual, allProducts])

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen pt-20 flex items-center justify-center text-gray-600">
          {t('loading')}
        </div>
        <Footer />
      </>
    )
  }

  if (error || !ritual) {
    notFound()
  }

  return (
    <>
      <Header />
      <div className="min-h-screen">
        <div className="relative h-[300px] md:h-[450px] w-full pt-16 md:pt-20">
          <Image
            src={ritual.image}
            alt={ritual.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#523A28]/80 to-transparent" />
          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-6">
              <span className="text-white/90 text-sm uppercase tracking-wide">{ritual.subtitle}</span>
              <h1 className="text-white text-4xl md:text-6xl mt-2" style={{ fontFamily: 'var(--font-caveat)' }}>
                {ritual.title}
              </h1>
              <div className="flex items-center gap-6 mt-4">
                <div className="flex items-center gap-2 text-white/90">
                  <Clock className="w-5 h-5" />
                  {ritual.duration}
                </div>
                <div className="flex items-center gap-2 text-white/90">
                  <Sparkles className="w-5 h-5" />
                  {ritual.difficulty}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-12 md:py-16">
          <div className="mb-10">
            <Link href="/rituels" className="inline-flex items-center gap-2 mb-8 hover:opacity-80 transition-opacity">
              <Image src="/b2c/akar-icons_arrow-back.svg" alt={t('back')} width={32} height={32} />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-12">
              <div>
                <h2 className="text-[#523A28] mb-4" style={{ fontFamily: 'var(--font-caveat)', fontSize: '36px' }}>
                  {t('about')}
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {ritual.full_desc}
                </p>
              </div>

              <div>
                <h2 className="text-[#523A28] mb-6" style={{ fontFamily: 'var(--font-caveat)', fontSize: '36px' }}>
                  {t('steps_title')}
                </h2>
                <div className="space-y-6">
                  {ritual.steps.map((step: { name: string; desc: string }, index: number) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-[#523A28] text-white rounded-full flex items-center justify-center font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1 pt-1">
                        <h3 className="font-semibold text-[#2d2d2d] mb-1">{step.name}</h3>
                        <p className="text-gray-600 text-sm">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-[#523A28] mb-6" style={{ fontFamily: 'var(--font-caveat)', fontSize: '36px' }}>
                  {t('tips_title')}
                </h2>
                <div className="bg-[#523A28]/5 rounded-lg p-6 space-y-4">
                  {ritual.tips.map((tip: string, index: number) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-[#523A28] flex-shrink-0 mt-0.5" />
                      <p className="text-gray-600">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg p-6 shadow-sm sticky top-24">
                <h3 className="text-[#523A28] mb-6" style={{ fontFamily: 'var(--font-caveat)', fontSize: '28px' }}>
                  {t('recommended')}
                </h3>
                <div className="space-y-4">
                  {recommendedProducts.length === 0 && (
                    <p className="text-sm text-gray-500">{t('empty')}</p>
                  )}
                  {recommendedProducts.map((product) => (
                    <Link key={product.slug} href={`/produits/${product.slug}`}>
                      <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="relative w-16 h-16 flex-shrink-0">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-contain"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-[#2d2d2d] text-sm">{product.name}</h4>
                          <p className="text-[#523A28] font-bold">{product.price} {t('currency')}</p>
                        </div>
                        <ShoppingCart className="w-5 h-5 text-[#523A28]" />
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <Button asChild className="w-full bg-[#523A28] hover:bg-[#3A2819] text-white rounded-sm">
                    <Link href="/produits">
                      <Heart className="w-4 h-4 mr-2" />
                      {t('all_products')}
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <NewsletterSection />
      </div>
      <Footer />
    </>
  )
}
