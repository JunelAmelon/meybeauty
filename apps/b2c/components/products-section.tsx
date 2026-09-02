'use client'

import Image from "next/image"
import Link from "next/link"
import { ShoppingCart, ZoomIn } from "lucide-react"
import { Button } from "@/apps/b2c/components/ui/button"
import { Input } from "@/apps/b2c/components/ui/input"
import { useCart } from "@/apps/b2c/lib/cart-context"
import { useProducts } from "@/apps/b2c/hooks/useProducts"
import { useLocale, useTranslations } from "next-intl"
import { useMemo, useState } from "react"

export function ProductsSection() {
  const { addToCart } = useCart()
  const t = useTranslations('b2c.home.products')
  const locale = useLocale()
  const { products, loading, error } = useProducts()
  const [activeProduct, setActiveProduct] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [stockMessages, setStockMessages] = useState<Record<string, string>>({})
  const minQty = 1
  
  const HOMEPAGE_PRODUCT_COUNT = 8

  const limitedProducts = useMemo(() => {
    return products.slice(0, HOMEPAGE_PRODUCT_COUNT)
  }, [products])

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

  const openQuantityPicker = (slug: string) => {
    setActiveProduct(slug)
    setQuantity(minQty)
  }

  const handleQuantityChange = (value: string) => {
    const parsed = parseInt(value, 10)
    setQuantity(Number.isNaN(parsed) ? minQty : parsed)
  }

  const handleConfirm = (product: typeof products[number]) => {
    const stock = typeof product.stock === 'number' ? product.stock : null
    const qty = Math.max(minQty, quantity || minQty)
    if (stock !== null) {
      if (stock <= 0) {
        setStockMessages((prev) => ({ ...prev, [product.slug]: t('stock_out') || 'Rupture de stock' }))
        return
      }
      if (qty > stock) {
        setStockMessages((prev) => ({
          ...prev,
          [product.slug]: t('stock_limited', { max: stock }) || `Stock insuffisant, max ${stock}`,
        }))
        setQuantity(stock)
        return
      }
    }
    setStockMessages((prev) => ({ ...prev, [product.slug]: '' }))
    addToCart(
      {
        id: product.slug,
        name: product.name,
        price: product.price,
        image: product.image,
      },
      qty
    )
    setActiveProduct(null)
  }

  const handleCancel = () => {
    setActiveProduct(null)
    setQuantity(minQty)
  }

  return (
    <section className="py-16 bg-[#FDF8F3]">
      <div className="container mx-auto px-6">
        <div className="mb-10">
          <h2
            className="text-[#523A28] mb-2"
            style={{
              fontFamily: 'var(--font-caveat)',
              fontSize: '48px',
              fontWeight: 400,
            }}
          >
            {t('title')}
          </h2>
          <div className="w-full h-[1px] bg-[#523A28]"></div>
        </div>

        {loading && (
          <div className="py-8 text-center text-gray-600">{t('loading') ?? 'Chargement...'}</div>
        )}
        {error && !loading && (
          <div className="py-8 text-center text-red-600">{error}</div>
        )}
        {!loading && !error && limitedProducts.length === 0 && (
          <div className="py-8 text-center text-gray-600">{t('empty') ?? 'Aucun produit.'}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {limitedProducts.map((product) => (
            <div
              key={product.slug}
              className="bg-transparent flex flex-col"
            >
              <Link href={`/produits/${product.slug}`}>
                <div className="relative h-72 mb-4 cursor-pointer group">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 p-3 rounded-full">
                      <ZoomIn className="w-6 h-6 text-[#523A28]" />
                    </div>
                  </div>
                </div>
              </Link>
              <div className="flex flex-col flex-grow">
                <Link href={`/produits/${product.slug}`}>
                  <h3 className="font-bold text-base text-[#523A28] hover:text-[#523A28]/80 transition-colors cursor-pointer line-clamp-2 mb-1" style={{ fontFamily: 'var(--font-lato)' }}>
                    {product.name}
                  </h3>
                </Link>
                <p className="text-xs text-[#2d2d2d] leading-relaxed line-clamp-2 mb-3" style={{ fontFamily: 'var(--font-lato)' }}>
                  {product.desc || product.long_desc || ''}
                </p>
                <div className="flex items-center justify-between mb-2 mt-auto">
                  <p className="text-[#523A28] font-semibold">{formatMoney.format(product.price)}</p>
                  <span className="text-[11px] font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                    {typeof product.stock === 'number' && product.stock > 0
                      ? t('stock_left', { count: product.stock }) || `Stock : ${product.stock}`
                      : t('stock_out') || 'Rupture'}
                  </span>
                </div>
                {activeProduct === product.slug ? (
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <div className="flex items-center w-full max-w-[180px] border border-[#523A28]/40 rounded-sm overflow-hidden mx-auto">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(minQty, (q || minQty) - 1))}
                        className="px-2.5 py-2 text-[#523A28] hover:bg-[#523A28]/10"
                      >
                        -
                      </button>
                      <Input
                        type="number"
                        min={minQty}
                        value={quantity}
                        onChange={(e) => handleQuantityChange(e.target.value)}
                        className="h-10 text-center border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none"
                      />
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(minQty, (q || minQty) + 1))}
                        className="px-2.5 py-2 text-[#523A28] hover:bg-[#523A28]/10"
                      >
                        +
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleConfirm(product)}
                        className="bg-[#523A28] hover:bg-[#3A2819] text-white rounded-sm text-xs px-3 py-2 h-auto"
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        {t('add_to_cart')}
                      </Button>
                      <Button
                        onClick={handleCancel}
                        variant="secondary"
                        className="bg-white text-[#523A28] border border-[#523A28] hover:bg-[#523A28] hover:text-white rounded-sm text-xs px-3 py-2 h-auto"
                      >
                        {t('cancel') ?? 'Annuler'}
                      </Button>
                    </div>
                    {stockMessages[product.slug] && (
                      <p className="w-full text-center text-[11px] text-red-600">{stockMessages[product.slug]}</p>
                    )}
                  </div>
                ) : (
                  <Button
                    onClick={() => openQuantityPicker(product.slug)}
                    className="bg-[#523A28] hover:bg-[#3A2819] text-white rounded-sm text-sm px-6 py-2 h-auto"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {t('add_to_cart')}
                  </Button>
                )}
                {stockMessages[product.slug] && activeProduct !== product.slug && (
                  <p className="text-[11px] text-red-600">{stockMessages[product.slug]}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {!loading && !error && products.length > HOMEPAGE_PRODUCT_COUNT && (
          <div className="text-center mt-12">
            <Link
              href="/produits"
              className="inline-block px-8 py-3 bg-[#523A28] text-white rounded-sm hover:bg-[#3A2819] transition-colors text-sm font-semibold"
              style={{ fontFamily: 'var(--font-lato)' }}
            >
              Voir tous nos produits
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
