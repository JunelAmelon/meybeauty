'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Star, Play, Send } from 'lucide-react'
import { Button } from '@/apps/b2c/components/ui/button'
import { Input } from '@/apps/b2c/components/ui/input'
import { Textarea } from '@/apps/b2c/components/ui/textarea'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Header } from '@/apps/b2c/components/header'
import { Footer } from '@/apps/b2c/components/footer'
import { NewsletterSection } from '@/apps/b2c/components/newsletter-section'
import { useCart } from '@/apps/b2c/lib/cart-context'
import { useTranslations, useLocale } from 'next-intl'
import { useProduct, useProducts } from '@/apps/b2c/hooks/useProducts'
import { addDoc, collection, db, getDocs, query, serverTimestamp, where } from '@meybeauty/firebase'

// Helper function to calculate delivery date range
function calculateDeliveryDate(deliveryDays: { min: number; max: number } | undefined, locale: string): string {
  if (!deliveryDays) return '';

  const today = new Date();
  const minDate = new Date(today);
  minDate.setDate(today.getDate() + deliveryDays.min);

  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + deliveryDays.max);

  const formatter = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long'
  });

  return `${formatter.format(minDate)} - ${formatter.format(maxDate)}`;
}

type Tab = 'Description' | 'Reviews' | 'Questions'

interface Review {
  id: string | number
  author: string
  rating: number
  text: string
  date: string
}

interface Question {
  id: string | number
  author: string
  question: string
  answer?: string
  date: string
}

export function ProductDetail({ productId }: { productId: string }) {
  const td = useTranslations('b2c.shop.detail')
  const locale = useLocale()
  const { addToCart } = useCart()
  const [activeTab, setActiveTab] = useState<Tab>('Description')
  const descriptionRef = useRef<HTMLDivElement>(null)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewText, setReviewText] = useState('')
  const [reviewName, setReviewName] = useState('')
  const [questionText, setQuestionText] = useState('')
  const [questionName, setQuestionName] = useState('')
  const [isPickingQty, setIsPickingQty] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [stockMessage, setStockMessage] = useState<string>('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [submittingQuestion, setSubmittingQuestion] = useState(false)
  const [reviewError, setReviewError] = useState<string>('')
  const [questionError, setQuestionError] = useState<string>('')
  const [deliveryDateText, setDeliveryDateText] = useState<string>('')

  const minQty = 1

  const [reviews, setReviews] = useState<Review[]>([])
  const [questions, setQuestions] = useState<Question[]>([])

  const { product, loading, error } = useProduct(productId)
  const { products: allProducts } = useProducts()

  const similarProducts = useMemo(() => {
    if (!product) return []
    return allProducts
      .filter((p) => p.category === product.category && p.slug !== product.slug)
      .slice(0, 4)
  }, [allProducts, product])

  useEffect(() => {
    setDeliveryDateText(calculateDeliveryDate(product?.deliveryDays, locale))
  }, [product, locale])

  useEffect(() => {
    let mounted = true
    const fetchData = async () => {
      try {
        const [revSnap, qSnap] = await Promise.all([
          getDocs(query(collection(db, 'productReviews'), where('productId', '==', productId))),
          getDocs(query(collection(db, 'productQuestions'), where('productId', '==', productId)))
        ])

        if (!mounted) return

        const mappedReviews: Review[] = revSnap.docs.map((d) => {
          const data = d.data() as Record<string, unknown>
          const createdAt =
            (data.createdAt as { toDate?: () => Date } | undefined)?.toDate?.() ?? null
          return {
            id: d.id,
            author: (data.author as string) || 'Anonyme',
            rating: (data.rating as number) || 0,
            text: (data.text as string) || '',
            date: createdAt ? createdAt.toLocaleDateString(locale === 'fr' ? 'fr-FR' : locale === 'es-PE' ? 'es-PE' : 'en-US') : ''
          }
        })

        const mappedQuestions: Question[] = qSnap.docs.map((d) => {
          const data = d.data() as Record<string, unknown>
          const createdAt =
            (data.createdAt as { toDate?: () => Date } | undefined)?.toDate?.() ?? null
          return {
            id: d.id,
            author: (data.author as string) || 'Anonyme',
            question: (data.question as string) || '',
            answer: data.answer as string | undefined,
            date: createdAt ? createdAt.toLocaleDateString(locale === 'fr' ? 'fr-FR' : locale === 'es-PE' ? 'es-PE' : 'en-US') : ''
          }
        })

        setReviews(mappedReviews)
        setQuestions(mappedQuestions)
      } catch {
        // silencieux pour éviter de bloquer l'affichage produit
      }
    }

    fetchData()
    return () => {
      mounted = false
    }
  }, [productId, locale])

  const startQuantityPicker = () => {
    setIsPickingQty(true)
    setQuantity(minQty)
  }

  const handleQuantityChange = (value: string) => {
    const parsed = parseInt(value, 10)
    setQuantity(Number.isNaN(parsed) ? minQty : parsed)
  }

  const handleConfirmAdd = () => {
    if (!product) return
    const stock = product.stock ?? 0
    const qty = Math.max(minQty, quantity || minQty)
    if (stock <= 0) {
      setStockMessage(td('stock_out') || 'Rupture de stock')
      return
    }
    if (qty > stock) {
      setStockMessage(td('stock_limited', { max: stock }) || `Stock insuffisant, max ${stock}`)
      setQuantity(stock)
      return
    }
    setStockMessage('')
    addToCart(
      {
        id: product.slug,
        name: product.name,
        price: product.price,
        image: product.image,
      },
      qty
    )
    setIsPickingQty(false)
  }

  const handleCancelAdd = () => {
    setIsPickingQty(false)
    setQuantity(minQty)
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reviewText || !reviewName) return
    setSubmittingReview(true)
    setReviewError('')
    const createdAt = new Date()
    const optimisticId = `tmp-${Date.now()}`
    const optimistic: Review = {
      id: optimisticId,
      author: reviewName,
      rating: reviewRating,
      text: reviewText,
      date: createdAt.toLocaleDateString(locale === 'fr' ? 'fr-FR' : locale === 'es-PE' ? 'es-PE' : 'en-US')
    }
    setReviews((prev) => [optimistic, ...prev])
    setReviewText('')
    setReviewName('')
    setReviewRating(5)

    try {
      const ref = await addDoc(collection(db, 'productReviews'), {
        productId,
        author: optimistic.author,
        rating: optimistic.rating,
        text: optimistic.text,
        createdAt: serverTimestamp()
      })
      setReviews((prev) =>
        prev.map((r) => (r.id === optimisticId ? { ...r, id: ref.id } : r))
      )
    } catch {
      setReviewError('Impossible d’enregistrer l’avis. Veuillez réessayer.')
    } finally {
      setSubmittingReview(false)
    }
  }

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!questionText || !questionName) return
    setSubmittingQuestion(true)
    setQuestionError('')
    const createdAt = new Date()
    const optimisticId = `tmp-${Date.now()}`
    const optimistic: Question = {
      id: optimisticId,
      author: questionName,
      question: questionText,
      date: createdAt.toLocaleDateString(locale === 'fr' ? 'fr-FR' : locale === 'es-PE' ? 'es-PE' : 'en-US')
    }
    setQuestions((prev) => [optimistic, ...prev])
    setQuestionText('')
    setQuestionName('')

    try {
      const ref = await addDoc(collection(db, 'productQuestions'), {
        productId,
        author: optimistic.author,
        question: optimistic.question,
        createdAt: serverTimestamp()
      })
      setQuestions((prev) =>
        prev.map((q) => (q.id === optimisticId ? { ...q, id: ref.id } : q))
      )
    } catch {
      setQuestionError('Impossible d’enregistrer la question. Veuillez réessayer.')
    } finally {
      setSubmittingQuestion(false)
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen pt-20 flex items-center justify-center text-gray-600">
          {td('loading_product') || 'Chargement du produit...'}
        </div>
        <Footer />
      </>
    )
  }

  if (error || !product) {
    return (
      <>
        <Header />
        <div className="min-h-screen pt-20 flex items-center justify-center text-red-600">
          {td('product_not_found') || 'Produit introuvable'}
        </div>
        <Footer />
      </>
    )
  }

  const stock = product.stock ?? 0;
  const reviewCount = reviews.length > 0 ? reviews.length : product.reviews ?? 0
  const ratingValue =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
      : product.rating ?? 0

  return (
    <>
      <Header />
      <div className="min-h-screen pt-20">
        <div className="container mx-auto px-6 py-12 md:py-16">
          <div className="mb-10">
            <Link href="/produits" className="inline-flex items-center gap-2 mb-8 hover:opacity-80 transition-opacity">
              <Image src="/b2c/akar-icons_arrow-back.svg" alt={td('back')} width={32} height={32} />
            </Link>
            <h2 className="text-[#523A28] mb-2" style={{ fontFamily: 'var(--font-caveat)', fontSize: '48px', fontWeight: 400 }}>
              {product.name}
            </h2>
            <div className="w-full h-[1px] bg-[#523A28]"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <div className="relative h-[400px] lg:h-[500px]">
              <Image src={product.image} alt={product.name} fill className="object-contain" />
            </div>

            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-semibold text-[#2d2d2d] mb-1">{product.name}</h1>
                <div className="flex items-center gap-3">
                  {product.volume && <p className="text-sm text-gray-500">{product.volume}</p>}
                  <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                    {stock > 0
                      ? td('stock_left', { count: stock }) || `Stock : ${stock}`
                      : td('stock_out') || 'Rupture de stock'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < ratingValue ? 'fill-[#C4A35A] text-[#C4A35A]' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span className="text-sm text-gray-600">{td('reviews', { count: reviewCount })}</span>
                <span className="text-sm text-[#523A28] underline cursor-pointer">{td('questions', { count: questions.length })}</span>
              </div>

              <p className="text-gray-600">
                {product.desc}
                <br />
                <span
                  className="text-sm text-[#523A28] underline cursor-pointer"
                  onClick={() => {
                    setActiveTab('Description')
                    descriptionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }}
                >
                  {td('view_desc')}
                </span>
              </p>

              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-[#2d2d2d]">{product.price} {td('currency')}</span>
                {product.oldPrice && (
                  <span className="text-lg text-gray-400 line-through">{product.oldPrice} {td('currency')}</span>
                )}
              </div>

              <div className="space-y-2">
                {stock > 0 ? (
                  <p className="text-sm font-semibold text-[#523A28] uppercase">
                    {td('in_stock_with_qty', { count: stock }) || td('in_stock') || 'En stock'}
                  </p>
                ) : (
                  <p className="text-sm font-semibold text-red-600 uppercase">
                    {td('stock_out') || 'Rupture de stock'}
                  </p>
                )}
                <p className="text-sm text-gray-600">
                  {td('delivery')}<br />
                  <span className="font-medium">{deliveryDateText}</span>
                </p>
              </div>

              {product.loyaltyPoints !== undefined && (
                <div className="border border-dashed border-[#523A28] rounded px-4 py-2 inline-block">
                  <p className="text-sm text-[#523A28]">{td('points', { count: product.loyaltyPoints })}</p>
                </div>
              )}

              {isPickingQty ? (
                <div className="space-y-3">
                  <div className="flex items-center w-full max-w-xs border border-[#523A28]/40 rounded-sm overflow-hidden mx-auto">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(minQty, (q || minQty) - 1))}
                      className="px-3 py-2 text-[#523A28] hover:bg-[#523A28]/10"
                    >
                      -
                    </button>
                    <Input
                      type="number"
                      min={minQty}
                      value={quantity}
                      onChange={(e) => handleQuantityChange(e.target.value)}
                      className="h-11 text-center border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none"
                    />
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(minQty, (q || minQty) + 1))}
                      className="px-3 py-2 text-[#523A28] hover:bg-[#523A28]/10"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={handleConfirmAdd}
                      className="bg-[#523A28] hover:bg-[#3A2819] text-white rounded-sm text-base px-6 py-3 h-auto"
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      {td('add_to_cart')}
                    </Button>
                    <Button
                      onClick={handleCancelAdd}
                      variant="secondary"
                      className="bg-white text-[#523A28] border border-[#523A28] hover:bg-[#523A28] hover:text-white rounded-sm text-base px-6 py-3 h-auto"
                    >
                      {td('cancel') ?? 'Annuler'}
                    </Button>
                  </div>
                  {stockMessage && <p className="text-xs text-red-600">{stockMessage}</p>}
                </div>
              ) : (
                <Button onClick={startQuantityPicker} className="w-full bg-[#523A28] hover:bg-[#3A2819] text-white rounded-sm text-base px-8 py-6 h-auto">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {td('add_to_cart')}
                </Button>
              )}
              {stockMessage && !isPickingQty && <p className="text-xs text-red-600">{stockMessage}</p>}
            </div>
          </div>

          <div ref={descriptionRef} className="mb-16 scroll-mt-20">
            <div className="flex flex-wrap gap-0 mb-8 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('Description')}
                className={`px-8 py-4 text-sm font-medium transition-all ${activeTab === 'Description'
                  ? 'bg-[#523A28] text-white'
                  : 'bg-transparent text-gray-600 hover:text-[#523A28]'
                  }`}
              >
                {td('tabs.description')}
              </button>
              <button
                onClick={() => setActiveTab('Reviews')}
                className={`px-8 py-4 text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'Reviews'
                  ? 'bg-[#523A28] text-white'
                  : 'bg-transparent text-gray-600 hover:text-[#523A28]'
                  }`}
              >
                {td('tabs.reviews', { count: reviews.length })}
                <span className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3 h-3 ${activeTab === 'Reviews' ? 'fill-white text-white' : 'fill-[#C4A35A] text-[#C4A35A]'}`} />
                  ))}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('Questions')}
                className={`px-8 py-4 text-sm font-medium transition-all ${activeTab === 'Questions'
                  ? 'bg-[#523A28] text-white'
                  : 'bg-transparent text-gray-600 hover:text-[#523A28]'
                  }`}
              >
                {td('tabs.questions', { count: questions.length })}
              </button>
            </div>

            {activeTab === 'Description' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-4">
                  {product.categoryLabel && (
                    <p className="text-xs uppercase tracking-wide text-[#523A28] font-semibold">
                      {product.categoryLabel}
                    </p>
                  )}
                  <p className="text-sm text-gray-600 leading-relaxed text-justify">
                    {product.long_desc || product.desc || td('no_description')}
                  </p>
                  {product.usage && (
                    <div className="pt-4">
                      <h4 className="text-sm font-semibold text-[#523A28] mb-2">{td('usage_title')}</h4>
                      <p className="text-sm text-gray-600 leading-relaxed text-justify">{product.usage}</p>
                    </div>
                  )}
                  {product.ingredient_base && (
                    <div className="pt-4">
                      <h4 className="text-sm font-semibold text-[#523A28] mb-2">{td('ingredient_title')}</h4>
                      <p className="text-sm text-gray-600 leading-relaxed text-justify">{product.ingredient_base}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  {product.nutritionalInfo && product.nutritionalInfo.length > 0 && (
                    <table className="w-full text-sm">
                      <tbody>
                        {product.nutritionalInfo.map((info: { name: string; value: string }, index: number) => (
                          <tr key={index} className="border-b border-gray-200">
                            <td className="py-3 text-gray-600">{info.name}</td>
                            <td className="py-3 text-right text-gray-900">{info.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                  <div className="relative h-48 bg-[#6B4C35] rounded-lg overflow-hidden flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="text-2xl mb-2" style={{ fontFamily: 'var(--font-caveat)' }}>Mey Beauty</div>
                      <p className="text-sm mb-4">{td('video_desc')}</p>
                      <button className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors mx-auto">
                        <Play className="w-6 h-6 text-white fill-white" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Reviews' && (
              <div className="space-y-8">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="font-semibold text-lg text-[#2d2d2d] mb-4">{td('form_review.title')}</h3>
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-600 mb-2 block">{td('form_review.label_rating')}</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            className="focus:outline-none"
                          >
                            <Star className={`w-6 h-6 ${star <= reviewRating ? 'fill-[#C4A35A] text-[#C4A35A]' : 'text-gray-300'} hover:text-[#C4A35A] transition-colors`} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <Input
                      placeholder={td('form_review.placeholder_name')}
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                      className="border-gray-300"
                    />
                    <Textarea
                      placeholder={td('form_review.placeholder_text')}
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      className="border-gray-300 min-h-[100px]"
                    />
                    <Button
                      type="submit"
                      className="bg-[#523A28] hover:bg-[#3A2819] text-white disabled:opacity-60"
                      disabled={submittingReview}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {submittingReview ? td('loading') || 'Envoi...' : td('form_review.btn_send')}
                    </Button>
                    {reviewError && <p className="text-sm text-red-600">{reviewError}</p>}
                  </form>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-[#2d2d2d]">{td('tabs.reviews', { count: reviews.length })}</h3>
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-white p-6 rounded-lg shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-[#C4A35A] text-[#C4A35A]' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <p className="text-gray-600 mb-3">{review.text}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span className="font-medium">{review.author}</span>
                        <span>{review.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'Questions' && (
              <div className="space-y-8">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="font-semibold text-lg text-[#2d2d2d] mb-4">{td('form_question.title')}</h3>
                  <form onSubmit={handleSubmitQuestion} className="space-y-4">
                    <Input
                      placeholder={td('form_question.placeholder_name')}
                      value={questionName}
                      onChange={(e) => setQuestionName(e.target.value)}
                      className="border-gray-300"
                    />
                    <Textarea
                      placeholder={td('form_question.placeholder_text')}
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                      className="border-gray-300 min-h-[100px]"
                    />
                    <Button
                      type="submit"
                      className="bg-[#523A28] hover:bg-[#3A2819] text-white disabled:opacity-60"
                      disabled={submittingQuestion}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {submittingQuestion ? td('loading') || 'Envoi...' : td('form_question.btn_send')}
                    </Button>
                    {questionError && <p className="text-sm text-red-600">{questionError}</p>}
                  </form>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-[#2d2d2d]">{td('tabs.questions', { count: questions.length })}</h3>
                  {questions.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">{td('no_questions')}</p>
                  ) : (
                    questions.map((q) => (
                      <div key={q.id} className="bg-white p-6 rounded-lg shadow-sm">
                        <p className="font-medium text-[#2d2d2d] mb-2">{td('qa_prefix.q')}: {q.question}</p>
                        {q.answer && <p className="text-gray-600 mb-2">{td('qa_prefix.r')}: {q.answer}</p>}
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>{q.author}</span>
                          <span>{q.date}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Image Section */}
          <div className="mb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative h-[300px] md:h-[400px] rounded-lg overflow-hidden">
                <Image src="/b2c/femme-mey-beauty.png" alt="Femme utilisant un produit Mey Beauty" fill className="object-cover" />
              </div>
              <div className="relative h-[300px] md:h-[400px] rounded-lg overflow-hidden">
                <Image src="/b2c/huile.png" alt="Huile naturelle" fill className="object-cover" />
              </div>
            </div>
            <div className="mt-4">
              <div className="relative h-[300px] md:h-[400px] rounded-lg overflow-hidden">
                <Image src="/b2c/beurre.png" alt="Beurre naturel" fill className="object-cover" />
              </div>
            </div>
          </div>

          {/* Similar Products */}
          {similarProducts.length > 0 && (
            <div className="mb-16">
              <h3 className="text-[#523A28] mb-2" style={{ fontFamily: 'var(--font-caveat)', fontSize: '32px', fontWeight: 400 }}>
                {td('similar_products') || 'Produits similaires'}
              </h3>
              <div className="w-full h-[1px] bg-[#523A28] mb-8"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {similarProducts.map((p) => (
                  <Link key={p.slug} href={`/produits/${p.slug}`} className="group">
                    <div className="relative h-56 mb-3 cursor-pointer">
                      <Image
                        src={p.image}
                        alt={p.name}
                        fill
                        className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <h4 className="text-sm font-semibold text-[#523A28] line-clamp-2 mb-1" style={{ fontFamily: 'var(--font-lato)' }}>
                      {p.name}
                    </h4>
                    <p className="text-sm text-[#523A28] font-semibold">{p.price} {td('currency')}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <NewsletterSection />
      </div>
      <Footer />
    </>
  )
}
