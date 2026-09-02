'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, ZoomIn } from 'lucide-react'
import { Button } from '@/apps/b2c/components/ui/button'
import { Input } from '@/apps/b2c/components/ui/input'
import { useMemo, useState, useEffect } from 'react'
import { Header } from '@/apps/b2c/components/header'
import { Footer } from '@/apps/b2c/components/footer'
import { NewsletterSection } from '@/apps/b2c/components/newsletter-section'
import { useCart } from '@/apps/b2c/lib/cart-context'
import { useLocale, useTranslations } from 'next-intl'
import { useProducts } from '@/apps/b2c/hooks/useProducts'
import { useSearchParams } from 'next/navigation'

export default function ProduitsPage() {
  const t = useTranslations('b2c.shop')
  const locale = useLocale()
  const [selectedCategory, setSelectedCategory] = useState('Tous')
  const [activeProduct, setActiveProduct] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [stockMessages, setStockMessages] = useState<Record<string, string>>({})
  const [currentPage, setCurrentPage] = useState(1)
  const minQty = 1
  const PRODUCTS_PER_PAGE = 12
  const { addToCart } = useCart()
  const { products, loading, error } = useProducts()
  const searchParams = useSearchParams()
  const searchQuery = searchParams.get('q') || ''

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

  const categories = useMemo(() => {
    const map = new Map<string, string>()
    products.forEach((p) => {
      if (p.category) {
        const label = p.categoryLabel || p.category
        if (!map.has(p.category)) map.set(p.category, label)
      }
    })
    return [{ value: 'Tous', label: t('categories.all') }, ...Array.from(map.entries()).map(([value, label]) => ({ value, label }))]
  }, [products, t])

  const filteredProducts = useMemo(() => {
    let result = products
    if (selectedCategory !== 'Tous') {
      result = result.filter(product => product.category === selectedCategory)
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(product =>
        product.name.toLowerCase().includes(q) ||
        (product.desc && product.desc.toLowerCase().includes(q))
      )
    }
    return result
  }, [products, selectedCategory, searchQuery])

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE)

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PRODUCTS_PER_PAGE
    return filteredProducts.slice(start, start + PRODUCTS_PER_PAGE)
  }, [filteredProducts, currentPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory, searchQuery])

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1)
    }
  }, [totalPages, currentPage])

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
    <>
      <Header />
      <div className="min-h-screen">
        <div className="relative h-[300px] md:h-[400px] w-full pt-16 md:pt-20">
          <Image
            src="/b2c/hero-produits.png"
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
          <div className="mb-12">
            <div className="mb-10">
              <Link href="/" className="inline-flex items-center gap-2 mb-8 hover:opacity-80 transition-opacity">
                <Image
                  src="/b2c/akar-icons_arrow-back.svg"
                  alt={t('back')}
                  width={32}
                  height={32}
                />
              </Link>
              <h2
                className="text-[#523A28] mb-2"
                style={{
                  fontFamily: 'var(--font-caveat)',
                  fontSize: '48px',
                  fontWeight: 400,
                }}
              >
                {t('categories_heading')}
              </h2>
              <div className="w-full h-[1px] bg-[#523A28]"></div>
            </div>

            <div className="flex flex-wrap gap-3 mb-8">
              {searchQuery && (
                <div className="w-full mb-4 flex items-center gap-3 bg-[#523A28]/5 border border-[#523A28]/20 rounded-md px-4 py-2">
                  <span className="text-sm text-[#523A28]">
                    Résultats pour « <strong>{searchQuery}</strong> » — {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''}
                  </span>
                  <Link href="/produits" className="ml-auto text-sm text-[#523A28] underline hover:opacity-70">
                    Effacer
                  </Link>
                </div>
              )}
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-6 py-2 text-sm transition-all rounded-sm ${selectedCategory === cat.value
                    ? 'bg-[#523A28] text-white'
                    : 'bg-white text-[#523A28] border border-[#523A28] hover:bg-[#523A28] hover:text-white'
                    }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {loading && (
              <p className="text-gray-500">{t('loading') || 'Chargement...'}</p>
            )}
            {error && (
              <p className="text-red-600 text-sm">Erreur : {error}</p>
            )}
            {!loading && !error && paginatedProducts.length === 0 && filteredProducts.length === 0 && (
              <p className="text-gray-500 text-center py-12 col-span-full">
                {searchQuery
                  ? `Aucun produit trouvé pour « ${searchQuery} ».`
                  : 'Aucun produit dans cette catégorie.'}
              </p>
            )}
            {!loading && !error && paginatedProducts.map((product) => (
              <div
                key={product.slug}
                className="bg-transparent flex flex-col h-full"
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
                <div className="flex flex-col flex-grow space-y-3">
                  <Link href={`/produits/${product.slug}`}>
                    <h3 className="font-bold text-base text-[#523A28] hover:text-[#523A28]/80 transition-colors cursor-pointer h-12 line-clamp-2" style={{ fontFamily: 'var(--font-lato)' }}>
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-xs text-[#2d2d2d] leading-relaxed line-clamp-3" style={{ fontFamily: 'var(--font-lato)' }}>
                    {product.desc}
                  </p>
                  <div className="flex items-center justify-between">
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

          {/* Pagination */}
          {!loading && !error && totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12 flex-wrap">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm rounded-sm border border-[#523A28] text-[#523A28] hover:bg-[#523A28] hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[#523A28]"
              >
                Précédent
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 text-sm rounded-sm transition-colors ${
                    currentPage === page
                      ? 'bg-[#523A28] text-white'
                      : 'border border-[#523A28] text-[#523A28] hover:bg-[#523A28] hover:text-white'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm rounded-sm border border-[#523A28] text-[#523A28] hover:bg-[#523A28] hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[#523A28]"
              >
                Suivant
              </button>
            </div>
          )}

          {/* Results count */}
          {!loading && !error && filteredProducts.length > 0 && (
            <p className="text-center text-sm text-gray-500 mt-4">
              {Math.min((currentPage - 1) * PRODUCTS_PER_PAGE + 1, filteredProducts.length)}
              {'–'}
              {Math.min(currentPage * PRODUCTS_PER_PAGE, filteredProducts.length)}
              {' sur '}
              {filteredProducts.length} produits
            </p>
          )}
        </div>

        <NewsletterSection />
      </div>
      <Footer />
    </>
  )
}
