import Image from 'next/image'
import Link from 'next/link'
import { Leaf, Recycle, Heart, TreePine, Droplets, Sun } from 'lucide-react'
import { Header } from '@/apps/b2c/components/header'
import { Footer } from '@/apps/b2c/components/footer'
import { NewsletterSection } from '@/apps/b2c/components/newsletter-section'

import { useTranslations } from 'next-intl'

export default function SustainabilityPage() {
  const t = useTranslations('b2c.engagement')

  const commitmentsList = [
    {
      icon: Leaf,
      title: t('commitments.ingredients.title'),
      description: t('commitments.ingredients.desc')
    },
    {
      icon: Recycle,
      title: t('commitments.packaging.title'),
      description: t('commitments.packaging.desc')
    },
    {
      icon: TreePine,
      title: t('commitments.reforestation.title'),
      description: t('commitments.reforestation.desc')
    },
    {
      icon: Droplets,
      title: t('commitments.water.title'),
      description: t('commitments.water.desc')
    },
    {
      icon: Heart,
      title: t('commitments.fair.title'),
      description: t('commitments.fair.desc')
    },
    {
      icon: Sun,
      title: t('commitments.energy.title'),
      description: t('commitments.energy.desc')
    }
  ]

  return (
    <>
      <Header />
      <div className="min-h-screen">
        <div className="relative h-[300px] md:h-[400px] w-full pt-16 md:pt-20">
          <Image
            src="https://images.pexels.com/photos/3785147/pexels-photo-3785147.jpeg?auto=compress&cs=tinysrgb&w=1600"
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
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-[#523A28] mb-6" style={{ fontFamily: 'var(--font-caveat)', fontSize: '42px' }}>
                {t('hero_title')}
              </h2>
              <p className="text-gray-600 leading-relaxed max-w-2xl mx-auto">
                {t('hero_desc')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {commitmentsList.map((commitment, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-14 h-14 bg-[#523A28]/10 rounded-full flex items-center justify-center mb-4">
                    <commitment.icon className="w-7 h-7 text-[#523A28]" />
                  </div>
                  <h3 className="font-semibold text-[#2d2d2d] mb-2">{commitment.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{commitment.description}</p>
                </div>
              ))}
            </div>

            <div className="bg-[#523A28] rounded-lg p-8 md:p-12 text-white mb-16">
              <h2 className="text-3xl mb-6" style={{ fontFamily: 'var(--font-caveat)' }}>
                {t('stats.title')}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                <div>
                  <p className="text-4xl font-bold mb-2">5000+</p>
                  <p className="text-white/80 text-sm">{t('stats.trees')}</p>
                </div>
                <div>
                  <p className="text-4xl font-bold mb-2">0%</p>
                  <p className="text-white/80 text-sm">{t('stats.plastic')}</p>
                </div>
                <div>
                  <p className="text-4xl font-bold mb-2">50</p>
                  <p className="text-white/80 text-sm">{t('stats.families')}</p>
                </div>
                <div>
                  <p className="text-4xl font-bold mb-2">-60%</p>
                  <p className="text-white/80 text-sm">{t('stats.carbon')}</p>
                </div>
              </div>
            </div>

            <div className="mb-16">
              <h2 className="text-[#523A28] mb-6" style={{ fontFamily: 'var(--font-caveat)', fontSize: '36px' }}>
                {t('supply.title')}
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-[#523A28] text-white rounded-full flex items-center justify-center flex-shrink-0 font-medium">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#2d2d2d] mb-1">{t('supply.steps.sourcing.title')}</h3>
                    <p className="text-gray-600 text-sm">
                      {t('supply.steps.sourcing.desc')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-[#523A28] text-white rounded-full flex items-center justify-center flex-shrink-0 font-medium">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#2d2d2d] mb-1">{t('supply.steps.manufacturing.title')}</h3>
                    <p className="text-gray-600 text-sm">
                      {t('supply.steps.manufacturing.desc')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-[#523A28] text-white rounded-full flex items-center justify-center flex-shrink-0 font-medium">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#2d2d2d] mb-1">{t('supply.steps.packaging.title')}</h3>
                    <p className="text-gray-600 text-sm">
                      {t('supply.steps.packaging.desc')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-[#523A28] text-white rounded-full flex items-center justify-center flex-shrink-0 font-medium">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#2d2d2d] mb-1">{t('supply.steps.delivery.title')}</h3>
                    <p className="text-gray-600 text-sm">
                      {t('supply.steps.delivery.desc')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#523A28]/5 rounded-lg p-8 text-center">
              <h2 className="text-[#523A28] mb-4" style={{ fontFamily: 'var(--font-caveat)', fontSize: '32px' }}>
                {t('join.title')}
              </h2>
              <p className="text-gray-600 mb-6 max-w-xl mx-auto">
                {t('join.desc')}
              </p>
              <Link href="/produits" className="inline-block bg-[#523A28] hover:bg-[#3A2819] text-white px-8 py-3 rounded-sm transition-colors">
                {t('join.cta')}
              </Link>
            </div>
          </div>
        </div>

        <NewsletterSection />
      </div>
      <Footer />
    </>
  )
}
