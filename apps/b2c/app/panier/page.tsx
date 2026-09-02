'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ShoppingBag, Plus, Minus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { Button } from '@/apps/b2c/components/ui/button'
import { Header } from '@/apps/b2c/components/header'
import { Footer } from '@/apps/b2c/components/footer'
import { NewsletterSection } from '@/apps/b2c/components/newsletter-section'
import { useCart } from '@/apps/b2c/lib/cart-context'
import { auth } from '@meybeauty/firebase'
import { useEffect, useMemo, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'

export default function CartPage() {
  const { items, removeFromCart, prepareCheckout, updateQuantity } = useCart()
  const t = useTranslations('b2c.cart')
  const locale = useLocale()
  const router = useRouter()
  const [isAuth, setIsAuth] = useState(false)

  const formatMoney = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    [locale]
  )

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => setIsAuth(Boolean(user)))
    return () => unsub()
  }, [])

  const goToCheckout = (selection = items) => {
    prepareCheckout(selection)
    if (!isAuth) {
      router.push('/login?redirect=/paiement')
      return
    }
    router.push('/paiement')
  }

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <>
      <Header />
      <div className="min-h-screen pt-20">
        <div className="container mx-auto px-6 py-12 md:py-16">
          <div className="mb-10">
            <Link href="/produits" className="inline-flex items-center gap-2 mb-8 hover:opacity-80 transition-opacity">
              <Image
                src="/b2c/akar-icons_arrow-back.svg"
                alt={t('back')}
                width={32}
                height={32}
              />
            </Link>
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-8 h-8 text-[#523A28]" />
              <h2
                className="text-[#523A28]"
                style={{
                  fontFamily: 'var(--font-caveat)',
                  fontSize: '48px',
                  fontWeight: 400,
                }}
              >
                {t('title')}
              </h2>
            </div>
            <div className="w-full h-[1px] bg-[#523A28] mt-2"></div>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="space-y-4 mb-8">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-sm"
                >
                  <div className="relative w-20 h-20 flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#2d2d2d]">{item.name}</h3>
                    <p className="text-[#523A28] font-bold">{formatMoney.format(item.price)}</p>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex items-center border border-gray-200 rounded-sm overflow-hidden">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          className="px-3 py-2 text-[#523A28] hover:bg-[#523A28]/10"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-4 py-2 text-center min-w-[3rem] text-sm text-black">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-3 py-2 text-[#523A28] hover:bg-[#523A28]/10"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-500">
                        {t('quantity')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      className="border-red-200 text-red-500 bg-red-50 hover:bg-red-100 hover:text-red-600 rounded-sm text-sm px-4 flex-1 sm:flex-initial transition-colors duration-200"
                      onClick={() => removeFromCart(item.id)}
                    >
                      {t('remove')}
                    </Button>
                    <Button
                      onClick={() => goToCheckout([item])}
                      className="bg-[#523A28] hover:bg-[#3A2819] text-white rounded-sm text-sm px-6 w-full"
                    >
                      {t('buy')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {items.length > 0 ? (
              <div className="text-center space-y-4">
                <p className="text-lg font-bold text-[#2d2d2d]">
                  {t('total')}: {formatMoney.format(total)}
                </p>
                <Button
                  onClick={() => goToCheckout(items)}
                  className="bg-[#523A28] hover:bg-[#3A2819] text-white rounded-sm text-base px-8 py-3 h-auto"
                >
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  {t('checkout')}
                </Button>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">{t('empty')}</p>
                <Button asChild className="bg-[#523A28] hover:bg-[#3A2819] text-white rounded-sm">
                  <Link href="/produits">
                    {t('discover')}
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        <NewsletterSection />
      </div>
      <Footer />
    </>
  )
}
