'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Header } from '@/apps/b2c/components/header'
import { Footer } from '@/apps/b2c/components/footer'
import { Button } from '@/apps/b2c/components/ui/button'
import { Input } from '@/apps/b2c/components/ui/input'
import { useTranslations } from 'next-intl'
import { db, login, doc, getDoc } from '@meybeauty/firebase'
import { FirebaseError } from 'firebase/app'
import { useCart } from '@/apps/b2c/lib/cart-context'
import { auth } from '@meybeauty/firebase'
import { onAuthStateChanged } from 'firebase/auth'

export default function LoginPage() {
  const t = useTranslations('b2c.auth.login')
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/'
  const { setCartOwner } = useCart()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Si déjà connecté, associer le panier et rediriger selon le rôle
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return
      setCartOwner(user.uid)
      try {
        const snap = await getDoc(doc(db, 'users', user.uid))
        const role = snap.exists() ? (snap.data().role as string | undefined) : undefined
        // Ne rediriger vers /admin ou /pro que si le rôle correspond
        if (redirect.startsWith('/admin') && role !== 'admin') {
          router.replace('/')
          return
        }
        if (redirect.startsWith('/pro') && role !== 'b2b') {
          router.replace('/')
          return
        }
        router.replace(redirect)
      } catch {
        router.replace('/')
      }
    })
    return () => unsub()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      const user = await login(email, password)
      setCartOwner(user.uid)
      const snap = await getDoc(doc(db, 'users', user.uid))
      const role = snap.exists() ? (snap.data().role as string | undefined) : undefined

      let target = redirect
      if (role === 'admin') {
        target = '/admin'
      } else if (role === 'b2b') {
        target = '/pro'
      } else if (redirect.startsWith('/admin') || redirect.startsWith('/pro')) {
        // L'utilisateur n'a pas le rôle pour accéder à la cible → page d'accueil
        target = '/'
      }

      router.push(target)
    } catch (err) {
      console.log('err', err)
      if (err instanceof FirebaseError) {
        if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
          setError('Identifiants invalides. Vérifiez votre email/mot de passe.')
        } else {
          setError(`Connexion impossible (${err.code}). Réessayez.`)
        }
      } else {
        setError('Impossible de vous connecter. Vérifiez vos identifiants.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Header />
      <div className="min-h-screen pt-20 flex flex-col items-center justify-center">
        <div className="container mx-auto px-6 py-12 md:py-16">
          <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-100">
            <Link href="/" className="inline-flex items-center gap-2 mb-8 hover:opacity-80 transition-opacity">
              <Image src="/b2c/akar-icons_arrow-back.svg" alt={t('back')} width={24} height={24} />
              <span className="text-sm text-gray-500">{t('back')}</span>
            </Link>

            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold text-[#523A28] mb-2" style={{ fontFamily: 'var(--font-caveat)' }}>
                {t('title')}
              </h1>
              <p className="text-gray-500 text-sm">
                {t('subtitle')}
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">{t('email')}</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="border-gray-200"
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-gray-700">{t('password')}</label>
                  <Link href="#" className="text-xs text-[#523A28] hover:underline">
                    {t('forgot')}
                  </Link>
                </div>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="border-gray-200"
                  required
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#523A28] hover:bg-[#3A2819] text-white py-6 disabled:opacity-50"
              >
                {isLoading ? t('btn_login') + '...' : t('btn_login')}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-500">
                {t('no_account')}{' '}
                <Link
                  href={`/register?redirect=${encodeURIComponent(redirect)}`}
                  className="text-[#523A28] font-semibold hover:underline"
                >
                  {t('register')}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
