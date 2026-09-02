import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useTranslations } from "next-intl"

export function HeroSection() {
  const t = useTranslations('b2c.home.hero')

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/b2c/hero-video.mp4" type="video/mp4" />
        </video>
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to left, rgba(82, 58, 40, 0) 0%, rgba(82, 58, 40, 0.9) 80%)',
          }}
        />
      </div>

      <div className="container mx-auto px-6 sm:px-16 md:px-24 py-20 sm:py-40 md:py-48 relative z-10">
        <div className="max-w-2xl text-white space-y-6 sm:space-y-5">
          <h1
            className="text-white text-left text-4xl sm:text-4xl md:text-5xl leading-tight"
            style={{
              fontFamily: 'var(--font-caveat)',
            }}
          >
            {t('title')}
          </h1>

          <p className="text-white text-justify text-base sm:text-xs md:text-sm leading-relaxed max-w-lg">
            {t('desc')}
          </p>

          <div className="pt-4 sm:pt-4">
            <Link href="/produits" className="inline-flex items-center justify-center gap-2 bg-white text-[#523A28] hover:bg-white/90 text-base px-6 py-3 rounded-sm font-medium transition-colors whitespace-nowrap">
              {t('cta')}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
