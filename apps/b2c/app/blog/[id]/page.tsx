'use client'

import Image from 'next/image'
import Link from 'next/link'
import { use } from 'react'
import { Calendar, Clock, ArrowLeft, Share2, Facebook, Twitter, Linkedin } from 'lucide-react'
import { Header } from '@/apps/b2c/components/header'
import { Footer } from '@/apps/b2c/components/footer'
import { NewsletterSection } from '@/apps/b2c/components/newsletter-section'
import { notFound } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useBlog, useBlogs } from '@/apps/b2c/hooks/useBlogs'

export default function BlogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const t = useTranslations('b2c.blog.detail')
  const { id } = use(params)
  const { post, loading, error } = useBlog(id)
  const { posts: allPosts } = useBlogs()

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen pt-20 flex items-center justify-center text-gray-600">
          {t('loading_article') || 'Chargement de l’article...'}
        </div>
        <Footer />
      </>
    )
  }

  if (error || !post) {
    notFound()
  }

  const relatedPostsData = post?.related || []

  return (
    <>
      <Header />
      <div className="min-h-screen">
        <div className="relative h-[300px] md:h-[450px] w-full pt-16 md:pt-20">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute inset-0 flex items-end">
            <div className="container mx-auto px-6 pb-12">
              <span className="inline-block bg-[#523A28] text-white text-xs px-3 py-1 rounded-full mb-4">
                {post.category}
              </span>
              <h1 className="text-white text-3xl md:text-5xl font-semibold max-w-3xl leading-tight" style={{ fontFamily: 'var(--font-caveat)' }}>
                {post.title}
              </h1>
              <div className="flex items-center gap-6 mt-4 text-white/80">
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {post.date}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {post.readTime} {t('read_time_suffix')}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-12 md:py-16">
          <div className="mb-8">
            <Link href="/blog" className="inline-flex items-center gap-2 text-[#523A28] hover:opacity-80 transition-opacity">
              <ArrowLeft className="w-5 h-5" />
              {t('back_to_articles')}
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-200">
                <div className="w-12 h-12 bg-[#523A28] text-white rounded-full flex items-center justify-center font-semibold">
                  {post.author?.avatar || (post.author?.name?.[0] ?? '').toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-[#2d2d2d]">{post.author?.name}</p>
                  <p className="text-sm text-gray-500">{post.author?.role}</p>
                </div>
              </div>

              <article className="prose prose-lg max-w-none">
                {post.content.map((paragraph, index) => (
                  <p key={index} className="text-gray-600 leading-relaxed mb-6">
                    {paragraph}
                  </p>
                ))}
              </article>

              <div className="mt-12 pt-8 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">{t('share_article')}</span>
                  <div className="flex items-center gap-4">
                    <button className="w-10 h-10 bg-[#523A28]/10 rounded-full flex items-center justify-center hover:bg-[#523A28] hover:text-white transition-colors text-[#523A28]">
                      <Facebook className="w-5 h-5" />
                    </button>
                    <button className="w-10 h-10 bg-[#523A28]/10 rounded-full flex items-center justify-center hover:bg-[#523A28] hover:text-white transition-colors text-[#523A28]">
                      <Twitter className="w-5 h-5" />
                    </button>
                    <button className="w-10 h-10 bg-[#523A28]/10 rounded-full flex items-center justify-center hover:bg-[#523A28] hover:text-white transition-colors text-[#523A28]">
                      <Linkedin className="w-5 h-5" />
                    </button>
                    <button className="w-10 h-10 bg-[#523A28]/10 rounded-full flex items-center justify-center hover:bg-[#523A28] hover:text-white transition-colors text-[#523A28]">
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-8">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-[#523A28] mb-4" style={{ fontFamily: 'var(--font-caveat)', fontSize: '24px' }}>
                    {t('similar_articles')}
                  </h3>
                  <div className="space-y-3">
                    {relatedPostsData.length === 0 && (
                      <p className="text-sm text-gray-500">{t('no_related')}</p>
                    )}
                    {relatedPostsData.map((slug) => {
                      const relatedPost = allPosts.find((p: { slug: string }) => p.slug === slug)
                      return (
                        <Link key={slug} href={`/blog/${slug}`}>
                          <div className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                            <div className="w-10 h-10 bg-[#523A28]/10 rounded flex items-center justify-center text-sm text-[#523A28] font-semibold uppercase">
                              {relatedPost ? relatedPost.title.slice(0, 2) : String(slug).slice(0, 2)}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-sm text-[#2d2d2d] line-clamp-1">
                                {relatedPost ? relatedPost.title : `${t('article_prefix')} ${slug}`}
                              </h4>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>

                <div className="bg-[#523A28] rounded-lg p-6 text-white">
                  <h3 className="text-xl mb-3" style={{ fontFamily: 'var(--font-caveat)' }}>
                    {t('newsletter_title')}
                  </h3>
                  <p className="text-sm text-white/80 mb-4">
                    {t('newsletter_desc')}
                  </p>
                  <Link href="#newsletter" className="block w-full bg-white text-[#523A28] px-4 py-2 rounded-sm font-medium hover:bg-white/90 transition-colors text-center">
                    {t('subscribe')}
                  </Link>
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
