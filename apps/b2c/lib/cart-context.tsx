'use client'
import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db, doc, getDoc } from '@meybeauty/firebase'

interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  itemCount: number
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => Promise<void>
  updateQuantity: (id: string, quantity: number) => Promise<void>
  removeFromCart: (id: string) => void
  removeItems: (ids: string[]) => void
  clearCart: () => void
  setCartOwner: (userId: string | null) => void
  checkoutItems: CartItem[]
  prepareCheckout: (selection: CartItem[]) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [checkoutItems, setCheckoutItems] = useState<CartItem[]>([])

  const storageKey = (uid: string | null) => (uid ? `meybeauty_cart_user_${uid}` : 'meybeauty_cart_guest')

  const loadCart = (uid: string | null) => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem(storageKey(uid)) : null
    if (!stored) return [] as CartItem[]
    try {
      return JSON.parse(stored) as CartItem[]
    } catch {
      return [] as CartItem[]
    }
  }

  const mergeCarts = (a: CartItem[], b: CartItem[]) => {
    const map = new Map<string, CartItem>()
    ;[...a, ...b].forEach((item) => {
      const existing = map.get(item.id)
      if (existing) {
        map.set(item.id, { ...existing, quantity: existing.quantity + item.quantity })
      } else {
        map.set(item.id, { ...item })
      }
    })
    return Array.from(map.values())
  }

  // Hydrate from localStorage to keep cart across sessions (guest-friendly).
  // We intentionally hydrate after mount to avoid SSR mismatches.
  useEffect(() => {
    setItems(loadCart(userId))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync cart owner with Firebase auth state (merge guest -> user)
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCartOwner(user ? user.uid : null)
    })
    return () => unsub()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    localStorage.setItem(storageKey(userId), JSON.stringify(items))
    // Pas de persistance distante côté B2C
  }, [items, userId])

  const itemCount = items.reduce((total, item) => total + item.quantity, 0)

  const prepareCheckout = (selection: CartItem[]) => {
    setCheckoutItems(selection)
  }

  const fetchStock = async (productId: string): Promise<number | null> => {
    try {
      const snap = await getDoc(doc(db, 'products', productId))
      if (!snap.exists()) return null
      const data = snap.data() as { stock?: number }
      if (typeof data.stock === 'number') return data.stock
      return null
    } catch {
      return null
    }
  }

  const addToCart = async (newItem: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
    const desiredQty = Math.max(1, quantity)
    const currentItem = items.find((i) => i.id === newItem.id)
    const currentQty = currentItem?.quantity ?? 0
    const stock = await fetchStock(newItem.id)
    if (stock !== null && currentQty + desiredQty > stock) {
      const allowed = Math.max(0, stock - currentQty)
      if (allowed <= 0) {
        console.warn('Stock insuffisant pour ce produit')
        return
      }
      setItems((current) =>
        current.map((item) =>
          item.id === newItem.id ? { ...item, quantity: currentQty + allowed } : item
        )
      )
      return
    }
    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === newItem.id)
      if (existingItem) {
        return currentItems.map((item) =>
          item.id === newItem.id ? { ...item, quantity: item.quantity + desiredQty } : item
        )
      }
      return [...currentItems, { ...newItem, quantity: desiredQty }]
    })
  }

  const updateQuantity = async (id: string, quantity: number) => {
    const min = 1
    const nextQty = Math.max(min, quantity)
    const stock = await fetchStock(id)
    const clamped = stock !== null ? Math.min(nextQty, stock) : nextQty
    setItems((currentItems) =>
      currentItems.map((item) => (item.id === id ? { ...item, quantity: clamped } : item))
    )
  }

  const removeFromCart = (id: string) => {
    setItems(currentItems => currentItems.filter(item => item.id !== id))
  }

  const removeItems = (ids: string[]) => {
    if (!ids.length) return
    const idSet = new Set(ids)
    setItems(currentItems => currentItems.filter(item => !idSet.has(item.id)))
  }

  const clearCart = () => {
    setItems([])
  }

  const setCartOwner = (newUserId: string | null) => {
    // Si on passe sur un compte, on fusionne le guest puis on vide le guest pour éviter des re-fusions ultérieures.
    const assign = async () => {
      if (newUserId) {
        const guestCart = loadCart(null)
        const userLocalCart = loadCart(newUserId)
        // Merge uniquement local (pas de remote)
        const merged = mergeCarts(mergeCarts(guestCart, userLocalCart.length ? userLocalCart : items), [])
        setUserId(newUserId)
        setItems(merged)
        if (typeof window !== 'undefined') {
          localStorage.setItem(storageKey(newUserId), JSON.stringify(merged))
          localStorage.setItem(storageKey(null), JSON.stringify([]))
        }
        return
      }

      // Si on revient invité (logout), on repart sur un panier vide pour éviter de réinjecter l'ancien panier user.
      setUserId(null)
      setItems([])
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey(null), JSON.stringify([]))
      }
    }
    void assign()
  }

  return (
    <CartContext.Provider value={{ items, itemCount, addToCart, updateQuantity, removeFromCart, removeItems, clearCart, setCartOwner, checkoutItems, prepareCheckout }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
