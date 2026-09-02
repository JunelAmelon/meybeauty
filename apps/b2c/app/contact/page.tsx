import Image from 'next/image'
import Link from 'next/link'
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react'
import { Button } from '@/apps/b2c/components/ui/button'
import { Input } from '@/apps/b2c/components/ui/input'
import { Textarea } from '@/apps/b2c/components/ui/textarea'
import { Label } from '@/apps/b2c/components/ui/label'
import { Header } from '@/apps/b2c/components/header'
import { Footer } from '@/apps/b2c/components/footer'
import { NewsletterSection } from '@/apps/b2c/components/newsletter-section'

import { useTranslations } from 'next-intl'

export default function ContactPage() {
  const t = useTranslations('b2c.contact')

  return (
    <>
      <Header />
      <div className="min-h-screen">
        <div className="relative h-[300px] md:h-[400px] w-full pt-16 md:pt-20">
          <Image
            src="https://images.pexels.com/photos/3762879/pexels-photo-3762879.jpeg?auto=compress&cs=tinysrgb&w=1600"
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-[#523A28] mb-6" style={{ fontFamily: 'var(--font-caveat)', fontSize: '36px' }}>
                {t('form.title')}
              </h2>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-sm text-gray-600">{t('form.first_name')}</Label>
                    <Input
                      id="firstName"
                      placeholder={t('form.placeholder_first_name')}
                      className="border-gray-300 focus:border-[#523A28] focus:ring-[#523A28]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-sm text-gray-600">{t('form.last_name')}</Label>
                    <Input
                      id="lastName"
                      placeholder={t('form.placeholder_last_name')}
                      className="border-gray-300 focus:border-[#523A28] focus:ring-[#523A28]"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email" className="text-sm text-gray-600">{t('form.email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('form.placeholder_email')}
                    className="border-gray-300 focus:border-[#523A28] focus:ring-[#523A28]"
                  />
                </div>
                <div>
                  <Label htmlFor="subject" className="text-sm text-gray-600">{t('form.subject')}</Label>
                  <Input
                    id="subject"
                    placeholder={t('form.placeholder_subject')}
                    className="border-gray-300 focus:border-[#523A28] focus:ring-[#523A28]"
                  />
                </div>
                <div>
                  <Label htmlFor="message" className="text-sm text-gray-600">{t('form.message')}</Label>
                  <Textarea
                    id="message"
                    placeholder={t('form.placeholder_message')}
                    rows={5}
                    className="border-gray-300 focus:border-[#523A28] focus:ring-[#523A28]"
                  />
                </div>
                <Button className="bg-[#523A28] hover:bg-[#3A2819] text-white rounded-sm px-8">
                  <Send className="w-4 h-4 mr-2" />
                  {t('form.btn_send')}
                </Button>
              </form>
            </div>

            <div className="space-y-8">
              <h2 className="text-[#523A28] mb-6" style={{ fontFamily: 'var(--font-caveat)', fontSize: '36px' }}>
                {t('info.title')}
              </h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#523A28]/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-[#523A28]" />
                  </div>
                  <div>
                    <h3 className="font-medium text-[#2d2d2d] mb-1">{t('info.email')}</h3>
                    <p className="text-gray-600">contact@meybeauty.fr</p>
                    <p className="text-gray-600">support@meybeauty.fr</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#523A28]/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-[#523A28]" />
                  </div>
                  <div>
                    <h3 className="font-medium text-[#2d2d2d] mb-1">{t('info.phone')}</h3>
                    <p className="text-gray-600">+33 1 23 45 67 89</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#523A28]/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-[#523A28]" />
                  </div>
                  <div>
                    <h3 className="font-medium text-[#2d2d2d] mb-1">{t('info.address')}</h3>
                    <p className="text-gray-600">123 Avenue de la Nature</p>
                    <p className="text-gray-600">75001 Paris, France</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#523A28]/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-[#523A28]" />
                  </div>
                  <div>
                    <h3 className="font-medium text-[#2d2d2d] mb-1">{t('info.hours.title')}</h3>
                    <p className="text-gray-600">{t('info.hours.weekdays')}</p>
                    <p className="text-gray-600">{t('info.hours.saturday')}</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#523A28]/5 rounded-lg p-6 mt-8">
                <h3 className="font-medium text-[#2d2d2d] mb-2">{t('service.title')}</h3>
                <p className="text-gray-600 text-sm">
                  {t('service.desc')}
                </p>
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
