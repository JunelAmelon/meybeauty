'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { db, collection, getDocs, query, where, fsDoc as doc, getDoc } from '@meybeauty/firebase';

type ProductDb = {
  slug: string;
  category: string;
  price: number;
  image: string;
  defaultLocale?: string;
  translations?: Record<string, {
    name?: string;
    desc?: string;
    category?: string;
    usage?: string;
    ingredient_base?: string;
  }>;
  volume?: string;
  stock?: number;
};

export type ProductB2B = {
  id: string;
  nom: string;
  reference: string;
  description: string;
  usage?: string;
  ingredient_base?: string;
  prixHT: number;
  categorie: string;
  categoryLabel?: string;
  formatCabine: string;
  stock: number;
  image: string;
};

const mapProduct = (docId: string, data: ProductDb, locale: string): ProductB2B => {
  const fallbackLocale = data.defaultLocale || 'fr';
  const trans = data.translations?.[locale] || data.translations?.[fallbackLocale] || {};

  return {
    id: docId,
    nom: trans.name || data.slug || docId,
    reference: data.slug || docId,
    description: trans.desc || '',
    usage: trans.usage || '',
    ingredient_base: trans.ingredient_base || '',
    prixHT: data.price,
    categorie: data.category || 'Divers',
    categoryLabel: trans.category || data.category,
    formatCabine: data.volume || '-',
    stock: data.stock || 0,
    image: data.image,
  };
};

export function useProductsB2B() {
  const locale = useLocale();
  const [products, setProducts] = useState<ProductB2B[]>([]);
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
        const mapped = snap.docs.map((d) => mapProduct(d.id, d.data() as ProductDb, locale));
        setProducts(mapped);
      } catch (err: unknown) {
        if (!mounted) return;
        const message = err instanceof Error ? err.message : 'Erreur de récupération des produits';
        setError(message);
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

export function useProductB2B(slug: string) {
  const locale = useLocale();
  const [product, setProduct] = useState<ProductB2B | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const q = query(collection(db, 'products'), where('slug', '==', slug));
        const snap = await getDocs(q);
        if (!mounted) return;
        if (!snap.empty) {
          const docSnap = snap.docs[0];
          setProduct(mapProduct(docSnap.id, docSnap.data() as ProductDb, locale));
          return;
        }
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
