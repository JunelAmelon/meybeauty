"use client"

import Image from "next/image"
import { Star, ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"

const reviews = [
  {
    id: 1,
    text: "\"Des produits que je rachèterais sans hésiter. Bon rapport qualité-prix, emballage soigné et livraison rapide. Je recommande !\"",
    rating: 5,
    author: "Rita D.",
    date: "14/02/2025",
    avatar: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100"
  },
  {
    id: 2,
    text: "\"La diversité des produits proposés, les prix accessibles et la rapidité de la livraison. Tout est parfait, je suis cliente fidèle maintenant !\"",
    rating: 5,
    author: "Annie L.",
    date: "09/01/2025",
    avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100"
  },
  {
    id: 3,
    text: "\"Des produits que je rachèterais sans hésiter. Bon rapport qualité-prix, emballage soigné et livraison rapide. Je recommande !\"",
    rating: 5,
    author: "Camille B.",
    date: "22/01/2025",
    avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100"
  }
]

export function ReviewsSection() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextReview = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length)
  }

  const prevReview = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length)
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
            Avis de nos clients
          </h2>
          <div className="w-full h-[1px] bg-[#523A28]"></div>
        </div>

        <div className="text-center mb-10">
          <p className="text-lg font-semibold text-[#1A1410]">Clients satisfaits</p>
          <div className="flex justify-center items-center gap-2 my-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-[#C4A35A] text-[#C4A35A]" />
            ))}
          </div>
          <p className="text-xl font-bold text-[#1A1410]">4,8/5 — Excellent</p>
          <p className="text-sm text-[#6B4C35]">Fondé sur 2 105 commentaires</p>
        </div>

        <div className="relative max-w-5xl mx-auto px-4 md:px-12">
          <button
            onClick={prevReview}
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center text-[#1A1410] hover:opacity-70 transition-opacity"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white p-6 shadow-sm"
              >
                <div className="flex justify-center gap-1 mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#C4A35A] text-[#C4A35A]" />
                  ))}
                </div>
                <p className="text-[#1A1410] text-sm mb-6 text-center leading-relaxed min-h-[60px]">
                  {review.text}
                </p>
                <div className="flex items-center justify-center gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden">
                    <Image
                      src={review.avatar}
                      alt={review.author}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-[#1A1410] text-sm">{review.author}</p>
                    <p className="text-xs text-[#6B4C35]">{review.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={nextReview}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center text-[#1A1410] hover:opacity-70 transition-opacity"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>
      </div>
    </section>
  )
}
