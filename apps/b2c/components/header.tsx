"use client"

import Link from "next/link"
import Image from "next/image"
import { Search, ShoppingCart, Menu, User, LogOut, UserCircle2, X } from "lucide-react"
import { Button } from "@/apps/b2c/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/apps/b2c/components/ui/sheet"
import { useCart } from "@/apps/b2c/lib/cart-context"
import { useEffect, useState, useRef } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/apps/b2c/components/ui/dropdown-menu"
import { auth, logout } from "@meybeauty/firebase"
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth"
import { useRouter } from "next/navigation"

import { useTranslations } from "next-intl"

export function Header() {
  const { itemCount } = useCart()
  const t = useTranslations('b2c.layout.header')
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileSearchQuery, setMobileSearchQuery] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u))
    return () => unsub()
  }, [])

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [searchOpen])

  const handleLogout = async () => {
    await logout()
    setUser(null)
  }

  const userLabel = user?.displayName || user?.email || 'Mon compte'

  const handleSearch = (e: React.FormEvent, query: string, isMobile = false) => {
    e.preventDefault()
    const trimmed = query.trim()
    if (trimmed) {
      router.push(`/produits?q=${encodeURIComponent(trimmed)}`)
      setSearchOpen(false)
      setSearchQuery('')
      if (isMobile) setMobileSearchQuery('')
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#523A28]/95 backdrop-blur-sm">
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <button className="md:hidden text-white hover:opacity-80 transition-opacity">
                  <Menu className="w-6 h-6" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-[#523A28] border-[#523A28]">
                <div className="flex flex-col gap-6 mt-8">
                  <div className="pb-4 border-b border-white/20">
                    <form onSubmit={(e) => handleSearch(e, mobileSearchQuery, true)} className="w-full flex items-center gap-3 text-white">
                      <Search className="w-5 h-5 shrink-0" />
                      <input
                        type="text"
                        value={mobileSearchQuery}
                        onChange={(e) => setMobileSearchQuery(e.target.value)}
                        placeholder={t('search')}
                        className="flex-1 bg-transparent text-white text-lg placeholder:text-white/60 focus:outline-none"
                      />
                    </form>
                  </div>
                  <nav className="flex flex-col gap-6">
                    <Link href="/produits" className="text-white text-lg hover:opacity-80 transition-opacity">
                      {t('nav.products')}
                    </Link>
                    <Link href="/blog" className="text-white text-lg hover:opacity-80 transition-opacity">
                      {t('nav.blog')}
                    </Link>
                    <Link href="/rituels" className="text-white text-lg hover:opacity-80 transition-opacity">
                      {t('nav.rituals')}
                    </Link>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>

            <nav className="hidden md:flex items-center gap-8">
              <Link href="/produits" className="text-white text-sm hover:opacity-80 transition-opacity">
                {t('nav.products')}
              </Link>
              <Link href="/blog" className="text-white text-sm hover:opacity-80 transition-opacity">
                {t('nav.blog')}
              </Link>
              <Link href="/rituels" className="text-white text-sm hover:opacity-80 transition-opacity">
                {t('nav.rituals')}
              </Link>
            </nav>
          </div>

          <Link href="/" className="absolute left-1/2 -translate-x-1/2">
            <Image
              src="/b2c/logo-mey-beauty.png"
              alt="Mey Beauty"
              width={160}
              height={53}
              className="h-12 sm:h-14 md:h-16 w-auto brightness-0 invert"
            />
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden md:flex items-center">
              {searchOpen ? (
                <form onSubmit={(e) => handleSearch(e, searchQuery)} className="flex items-center gap-2">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('search')}
                    className="w-48 bg-white/10 border border-white/20 rounded-md px-3 py-1.5 text-sm text-white placeholder:text-white/60 focus:outline-none focus:border-white/40"
                  />
                  <button
                    type="button"
                    onClick={() => { setSearchOpen(false); setSearchQuery('') }}
                    className="text-white hover:opacity-80 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="text-white hover:opacity-80 transition-opacity"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}
            </div>
            <Link href="/panier" className="text-white hover:opacity-80 transition-opacity relative">
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-[#523A28] text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>

            {!user ? (
              <>
                <Button asChild variant="ghost" className="hidden md:flex text-white text-sm hover:bg-white/10">
                  <Link href="/login">
                    {t('auth.login_register')}
                  </Link>
                </Button>
                <Link href="/login" className="md:hidden text-white hover:opacity-80 transition-opacity">
                  <User className="w-5 h-5" />
                </Link>
              </>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 text-white hover:opacity-90 transition-opacity rounded-md px-2 py-1">
                    <UserCircle2 className="w-5 h-5" />
                    <span className="hidden sm:inline text-sm">{userLabel}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/profil" className="flex items-center gap-2">
                      <UserCircle2 className="w-4 h-4" />
                      <span>Profil</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="p-0">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Déconnexion</span>
                    </button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
