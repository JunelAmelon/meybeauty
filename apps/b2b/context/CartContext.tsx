'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db, doc, getDoc } from '@meybeauty/firebase';

interface CartItem {
  id: string;
  nom: string;
  reference: string;
  prixHT: number;
  quantite: number;
  image: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantite'>, quantite: number) => Promise<void>;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantite: number) => Promise<void>;
  clearCart: () => void;
  total: number;
  setCartOwner: (userId: string | null) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  const storageKey = (uid: string | null) => (uid ? `Mey Beauty_b2b_cart_user_${uid}` : 'Mey Beauty_b2b_cart_guest');

  const loadCart = (uid: string | null) => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem(storageKey(uid)) : null;
    if (!stored) return [] as CartItem[];
    try {
      return JSON.parse(stored) as CartItem[];
    } catch {
      return [] as CartItem[];
    }
  };

  const mergeCarts = (a: CartItem[], b: CartItem[]) => {
    const map = new Map<string, CartItem>();
    [...a, ...b].forEach((item) => {
      const existing = map.get(item.id);
      if (existing) {
        map.set(item.id, { ...existing, quantite: existing.quantite + item.quantite });
      } else {
        map.set(item.id, { ...item });
      }
    });
    return Array.from(map.values());
  };

  // Hydrate (guest by default)
  useEffect(() => {
    setItems(loadCart(userId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync cart owner with Firebase auth state (merge guest -> user) WITHOUT remote persistence
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCartOwner(user ? user.uid : null);
    });
    return () => unsub();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(storageKey(userId), JSON.stringify(items));
    // Pas de persistance distante côté B2B
  }, [items, userId]);

  const fetchStock = async (productId: string): Promise<number | null> => {
    try {
      const snap = await getDoc(doc(db, 'products', productId));
      if (!snap.exists()) return null;
      const data = snap.data() as { stock?: number };
      if (typeof data.stock === 'number') return data.stock;
      return null;
    } catch {
      return null;
    }
  };

  const addToCart = async (item: Omit<CartItem, 'quantite'>, quantite: number) => {
    const desired = Math.max(1, quantite);
    const current = items.find((i) => i.id === item.id)?.quantite ?? 0;
    const stock = await fetchStock(item.id);
    const allowed = stock !== null ? Math.max(0, stock - current) : desired;
    if (stock !== null && desired > allowed) {
      if (allowed <= 0) {
        console.warn('Stock insuffisant pour ce produit');
        return;
      }
    }
    const finalQty = stock !== null ? Math.min(desired, allowed) : desired;
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantite: i.quantite + finalQty } : i
        );
      }
      return [...prev, { ...item, quantite: finalQty }];
    });
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = async (id: string, quantite: number) => {
    const min = 100;
    const nextQty = Math.max(min, quantite);
    const stock = await fetchStock(id);
    const clamped = stock !== null ? Math.min(nextQty, stock) : nextQty;
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantite: clamped } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const setCartOwner = (newUserId: string | null) => {
    const assign = async () => {
      if (newUserId) {
        const guestCart = loadCart(null);
        const userLocal = loadCart(newUserId);
        // Merge uniquement local (pas de remote)
        const merged = mergeCarts(mergeCarts(items, guestCart), userLocal);
        setUserId(newUserId);
        setItems(merged);
        if (typeof window !== 'undefined') {
          localStorage.setItem(storageKey(newUserId), JSON.stringify(merged));
          localStorage.setItem(storageKey(null), JSON.stringify([]));
        }
        return;
      }

      setUserId(null);
      setItems([]);
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey(null), JSON.stringify([]));
      }
    };
    void assign();
  };

  const total = items.reduce((sum, item) => sum + item.prixHT * item.quantite, 0);

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, total, setCartOwner }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
