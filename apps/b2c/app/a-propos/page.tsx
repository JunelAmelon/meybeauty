import Image from 'next/image'
import Link from 'next/link'
import { Leaf, Heart, Globe, Users } from 'lucide-react'
import { Header } from '@/apps/b2c/components/header'
import { Footer } from '@/apps/b2c/components/footer'
import { NewsletterSection } from '@/apps/b2c/components/newsletter-section'

import { useTranslations } from 'next-intl'

export default function AboutPage(): React.JSX.Element {
  const t = useTranslations('b2c.about')

  const values = [
    {
      icon: Leaf,
      title: t('values.natural.title'),
      description: t('values.natural.desc')
    },
    {
      icon: Heart,
      title: t('values.authenticity.title'),
      description: t('values.authenticity.desc')
    },
    {
      icon: Globe,
      title: t('values.sustainability.title'),
      description: t('values.sustainability.desc')
    },
    {
      icon: Users,
      title: t('values.community.title'),
      description: t('values.community.desc')
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
            <div className="mb-16">
              <h2 className="text-[#523A28] mb-6" style={{ fontFamily: 'var(--font-caveat)', fontSize: '42px' }}>
                {t('history.title')}
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>{t('history.p1')}</p>
                <p>{t('history.p2')}</p>
                <p>{t('history.p3')}</p>
              </div>
            </div>

            <div className="mb-16">
              <h2 className="text-[#523A28] mb-8" style={{ fontFamily: 'var(--font-caveat)', fontSize: '42px' }}>
                {t('values.title')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {values.map((value, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="w-14 h-14 bg-[#523A28]/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <value.icon className="w-6 h-6 text-[#523A28]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#2d2d2d] mb-2">{value.title}</h3>
                      <p className="text-gray-600 text-sm">{value.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-16">
              <h2 className="text-[#523A28] mb-6" style={{ fontFamily: 'var(--font-caveat)', fontSize: '42px' }}>
                {t('engagement.title')}
              </h2>
              <div className="bg-[#523A28]/5 rounded-lg p-8 space-y-4">
                <p className="text-gray-600 leading-relaxed">
                  {t('engagement.intro')}
                </p>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#523A28] rounded-full mt-2 flex-shrink-0"></span>
                    {t('engagement.list.ingredients')}
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#523A28] rounded-full mt-2 flex-shrink-0"></span>
                    {t('engagement.list.fair')}
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#523A28] rounded-full mt-2 flex-shrink-0"></span>
                    {t('engagement.list.carbon')}
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#523A28] rounded-full mt-2 flex-shrink-0"></span>
                    {t('engagement.list.packaging')}
                  </li>
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="p-6">
                <p className="text-4xl font-bold text-[#523A28] mb-2">100%</p>
                <p className="text-gray-600">{t('stats.ingredients')}</p>
              </div>
              <div className="p-6">
                <p className="text-4xl font-bold text-[#523A28] mb-2">50+</p>
                <p className="text-gray-600">{t('stats.families')}</p>
              </div>
              <div className="p-6">
                <p className="text-4xl font-bold text-[#523A28] mb-2">0</p>
                <p className="text-gray-600">{t('stats.animals')}</p>
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
