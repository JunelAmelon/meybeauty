'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { db, collection, fsDoc as doc, getDoc, getDocs, query, where } from '@meybeauty/firebase';

export type ProductDoc = {
  id: string;
  slug: string;
  category: string;
  categoryLabel?: string;
  price: number;
  image: string;
  name: string;
  desc: string;
  long_desc?: string;
  usage?: string;
  ingredient_base?: string;
  volume?: string;
  oldPrice?: number | string;
  inStock?: boolean;
  stock?: number;
  deliveryDate?: string;
  deliveryDays?: { min: number; max: number };
  loyaltyPoints?: number;
  rating?: number;
  reviews?: number;
  nutritionalInfo?: { name: string; value: string }[];
};

type ProductDb = {
  slug: string;
  category: string;
  translations?: Record<string, {
    name?: string;
    desc?: string;
    long_desc?: string;
    category?: string;
    usage?: string;
    ingredient_base?: string;
  }>;
  price: number;
  image: string;
  defaultLocale?: string;
  volume?: string;
  oldPrice?: number | string;
  inStock?: boolean;
  stock?: number;
  deliveryDate?: string;
  deliveryDays?: { min: number; max: number };
  loyaltyPoints?: number;
  rating?: number;
  reviews?: number;
  nutritionalInfo?: { name: string; value: string }[];
};

function mapProduct(
  docId: string,
  data: ProductDb,
  locale: string
): ProductDoc {
  const fallbackLocale = data.defaultLocale || 'fr';
  const trans =
    data.translations?.[locale] ||
    data.translations?.[fallbackLocale] ||
    {};

  return {
    id: docId,
    slug: data.slug || docId,
    category: data.category,
    categoryLabel: trans?.category || data.category,
    price: data.price,
    image: data.image,
    name: trans?.name || data.slug || docId,
    desc: trans?.desc || '',
    long_desc: trans?.long_desc || trans?.desc || '',
    usage: trans?.usage || '',
    ingredient_base: trans?.ingredient_base || '',
    volume: data.volume,
    oldPrice: data.oldPrice,
    inStock: data.inStock,
    stock: data.stock,
    deliveryDate: data.deliveryDate,
    deliveryDays: data.deliveryDays,
    loyaltyPoints: data.loyaltyPoints,
    rating: data.rating,
    reviews: data.reviews,
    nutritionalInfo: data.nutritionalInfo || [],
  };
}

export function useProducts() {
  const locale = useLocale();
  const [products, setProducts] = useState<ProductDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const snap = await getDocs(collection(db, 'products'));
        if (!mounted) return;
        const mapped = snap.docs.map((d) =>
          mapProduct(d.id, d.data() as ProductDb, locale)
        );
        setProducts(mapped);
      } catch (err: unknown) {
        if (!mounted) return;
        const msg = err instanceof Error ? err.message : 'Erreur de récupération des produits';
        setError(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchProducts();
    return () => {
      mounted = false;
    };
  }, [locale]);

  return { products, loading, error };
}

export function useProduct(slug: string) {
  const locale = useLocale();
  const [product, setProduct] = useState<ProductDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        // First, try querying by slug field
        const q = query(collection(db, 'products'), where('slug', '==', slug));
        const snap = await getDocs(q);
        if (!mounted) return;
        if (!snap.empty) {
          const docSnap = snap.docs[0];
          setProduct(mapProduct(docSnap.id, docSnap.data() as ProductDb, locale));
          return;
        }
        // Fallback: try by document ID (in case URL uses Firebase ID directly)
        const docRef = doc(db, 'products', slug);
        const docSnap = await getDoc(docRef);
        if (!mounted) return;
        if (!docSnap.exists()) {
          setProduct(null);
          setError('Produit introuvable');
          return;
        }
        setProduct(mapProduct(docSnap.id, docSnap.data() as ProductDb, locale));
      } catch (err: unknown) {
        if (!mounted) return;
        const msg = err instanceof Error ? err.message : 'Erreur de récupération du produit';
        setError(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchProduct();
    return () => {
      mounted = false;
    };
  }, [slug, locale]);

  return { product, loading, error };
}
