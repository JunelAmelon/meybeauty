'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Calendar, Clock, ArrowRight } from 'lucide-react'
import { Header } from '@/apps/b2c/components/header'
import { Footer } from '@/apps/b2c/components/footer'
import { NewsletterSection } from '@/apps/b2c/components/newsletter-section'
import { useTranslations } from 'next-intl'
import { useBlogs } from '@/apps/b2c/hooks/useBlogs'

export default function BlogPage() {
  const t = useTranslations('b2c.blog')
  const { posts: blogPosts, loading, error } = useBlogs()

  return (
    <>
      <Header />
      <div className="min-h-screen">
        <div className="relative h-[300px] md:h-[400px] w-full pt-16 md:pt-20">
          <Image
            src="/b2c/blog-hero.jpg"
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading && (
              <p className="text-gray-500">{t('loading') || 'Chargement...'}</p>
            )}
            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}
            {!loading && !error && blogPosts.map((post) => (
              <article key={post.id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="relative h-48">
                  <Image src={post.image} alt={post.title} fill className="object-cover" />
                  <div className="absolute top-4 left-4">
                    <span className="bg-[#523A28] text-white text-xs px-3 py-1 rounded-full">
                      {post.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {post.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {post.readTime}
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg text-[#2d2d2d] mb-2 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <Link href={`/blog/${post.id}`} className="inline-flex items-center gap-2 text-[#523A28] text-sm font-medium hover:gap-3 transition-all">
                    {t('read_more')}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>

        <NewsletterSection />
      </div>
      <Footer />
    </>
  )
}
