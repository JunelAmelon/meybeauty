'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale } from 'next-intl';
import { collection, db, doc, getDocs } from '@meybeauty/firebase';
import { addDoc, deleteDoc, updateDoc } from 'firebase/firestore';

type Locale = string;

type ProductDoc = {
  slug: string;
  reference?: string;
  translations?: Record<Locale, { name?: string }>;
  defaultLocale?: Locale;
};

type ReassortConfigDoc = {
  productSlug: string;
  threshold: number;
  autoQty: number;
  frequency: 'weekly' | 'bi_monthly' | 'monthly' | string;
  active: boolean;
  lastRunAt?: string | null;
  nextRunAt?: string | null;
};

type ReassortHistoryDoc = {
  configId: string;
  productSlug: string;
  quantity: number;
  amount: number;
  status: 'complete' | 'in_progress' | 'cancelled' | string;
  date: string;
};

export type ReassortConfig = {
  id: string;
  productSlug: string;
  productName: string;
  reference: string;
  threshold: number;
  autoQty: number;
  frequency: ReassortConfigDoc['frequency'];
  active: boolean;
  lastRunAt: string | null;
  nextRunAt: string | null;
};

export type ReassortHistory = {
  id: string;
  configId: string;
  productName: string;
  quantity: number;
  amount: number;
  status: ReassortHistoryDoc['status'];
  date: string;
};

export function useReassortB2B() {
  const locale = useLocale();
  const [configs, setConfigs] = useState<ReassortConfig[]>([]);
  const [history, setHistory] = useState<ReassortHistory[]>([]);
  const [products, setProducts] = useState<{ slug: string; name: string; reference: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const [productsSnap, configsSnap, historySnap] = await Promise.all([
          getDocs(collection(db, 'products')),
          getDocs(collection(db, 'reassortConfigsB2B')),
          getDocs(collection(db, 'reassortHistoryB2B')),
        ]);
        if (!mounted) return;

        const productMap = new Map<string, { name: string; reference: string }>();
        productsSnap.docs.forEach((doc) => {
          const data = doc.data() as ProductDoc;
          const fallback = data.defaultLocale || 'fr';
          const trans = data.translations?.[locale] || data.translations?.[fallback] || {};
          productMap.set(doc.id, {
            name: trans.name || data.slug || doc.id,
            reference: data.slug || doc.id,
          });
        });
        setProducts(
          productsSnap.docs.map((doc) => {
            const data = doc.data() as ProductDoc;
            const fallback = data.defaultLocale || 'fr';
            const trans = data.translations?.[locale] || data.translations?.[fallback] || {};
            return {
              slug: doc.id,
              name: trans.name || data.slug || doc.id,
              reference: data.slug || doc.id,
            };
          })
        );

        const mappedConfigs: ReassortConfig[] = configsSnap.docs.map((doc) => {
          const data = doc.data() as ReassortConfigDoc;
          const productInfo = productMap.get(data.productSlug) || {
            name: data.productSlug,
            reference: data.productSlug,
          };
          return {
            id: doc.id,
            productSlug: data.productSlug,
            productName: productInfo.name,
            reference: productInfo.reference,
            threshold: data.threshold,
            autoQty: data.autoQty,
            frequency: data.frequency,
            active: data.active,
            lastRunAt: data.lastRunAt ?? null,
            nextRunAt: data.nextRunAt ?? null,
          };
        });

        const mappedHistory: ReassortHistory[] = historySnap.docs.map((doc) => {
          const data = doc.data() as ReassortHistoryDoc;
          const productInfo = productMap.get(data.productSlug) || {
            name: data.productSlug,
            reference: data.productSlug,
          };
          return {
            id: doc.id,
            configId: data.configId,
            productName: productInfo.name,
            quantity: data.quantity,
            amount: data.amount,
            status: data.status,
            date: data.date,
          };
        });

        setConfigs(mappedConfigs);
        setHistory(mappedHistory);
      } catch (err: unknown) {
        if (!mounted) return;
        const message = err instanceof Error ? err.message : 'Erreur de récupération du réassort';
        setError(message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAll();
    return () => {
      mounted = false;
    };
  }, [locale]);

  const stats = useMemo(() => {
    const active = configs.filter((c) => c.active).length;
    const monitored = configs.length;
    const now = Date.now();
    const next7days = configs.filter((c) => {
      if (!c.nextRunAt) return false;
      const ts = Date.parse(c.nextRunAt);
      return !Number.isNaN(ts) && ts - now <= 7 * 24 * 60 * 60 * 1000 && ts - now >= 0;
    }).length;
    const thresholdReached = 0; // sans stock courant, non calculable
    return { active, monitored, next7days, thresholdReached };
  }, [configs]);

  const addConfig = async (payload: Omit<ReassortConfigDoc, 'active'> & { active?: boolean }) => {
    setLoading(true);
    setError(null);
    try {
      await addDoc(collection(db, 'reassortConfigsB2B'), {
        ...payload,
        active: payload.active ?? true,
      });
      const snap = await getDocs(collection(db, 'reassortConfigsB2B'));
      const productSnap = await getDocs(collection(db, 'products'));
      if (!snap.empty) {
        // refresh by refetch to keep mapping logic in one place
      }
      // Trigger full refetch
      const fetchAgain = async () => {
        const [productsSnap, configsSnap, historySnap] = await Promise.all([
          Promise.resolve(productSnap),
          Promise.resolve(snap),
          getDocs(collection(db, 'reassortHistoryB2B')),
        ]);
        const productMap = new Map<string, { name: string; reference: string }>();
        productsSnap.docs.forEach((doc) => {
          const data = doc.data() as ProductDoc;
          const fallback = data.defaultLocale || 'fr';
          const trans = data.translations?.[locale] || data.translations?.[fallback] || {};
          productMap.set(doc.id, {
            name: trans.name || data.slug || doc.id,
            reference: data.slug || doc.id,
          });
        });
        setConfigs(
          configsSnap.docs.map((doc) => {
            const data = doc.data() as ReassortConfigDoc;
            const productInfo = productMap.get(data.productSlug) || {
              name: data.productSlug,
              reference: data.productSlug,
            };
            return {
              id: doc.id,
              productSlug: data.productSlug,
              productName: productInfo.name,
              reference: productInfo.reference,
              threshold: data.threshold,
              autoQty: data.autoQty,
              frequency: data.frequency,
              active: data.active,
              lastRunAt: data.lastRunAt ?? null,
              nextRunAt: data.nextRunAt ?? null,
            };
          })
        );
        setHistory(
          historySnap.docs.map((doc) => {
            const data = doc.data() as ReassortHistoryDoc;
            const productInfo = productMap.get(data.productSlug) || {
              name: data.productSlug,
              reference: data.productSlug,
            };
            return {
              id: doc.id,
              configId: data.configId,
              productName: productInfo.name,
              quantity: data.quantity,
              amount: data.amount,
              status: data.status,
              date: data.date,
            };
          })
        );
      };
      await fetchAgain();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la création du réassort';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (id: string, payload: Partial<ReassortConfigDoc>) => {
    setLoading(true);
    setError(null);
    try {
      await updateDoc(doc(db, 'reassortConfigsB2B', id), payload);
      const snap = await getDocs(collection(db, 'reassortConfigsB2B'));
      const productSnap = await getDocs(collection(db, 'products'));
      const productMap = new Map<string, { name: string; reference: string }>();
      productSnap.docs.forEach((doc) => {
        const data = doc.data() as ProductDoc;
        const fallback = data.defaultLocale || 'fr';
        const trans = data.translations?.[locale] || data.translations?.[fallback] || {};
        productMap.set(doc.id, {
          name: trans.name || data.slug || doc.id,
          reference: data.slug || doc.id,
        });
      });
      setConfigs(
        snap.docs.map((doc) => {
          const data = doc.data() as ReassortConfigDoc;
          const productInfo = productMap.get(data.productSlug) || {
            name: data.productSlug,
            reference: data.productSlug,
          };
          return {
            id: doc.id,
            productSlug: data.productSlug,
            productName: productInfo.name,
            reference: productInfo.reference,
            threshold: data.threshold,
            autoQty: data.autoQty,
            frequency: data.frequency,
            active: data.active,
            lastRunAt: data.lastRunAt ?? null,
            nextRunAt: data.nextRunAt ?? null,
          };
        })
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du réassort';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const deleteConfig = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteDoc(doc(db, 'reassortConfigsB2B', id));
      setConfigs((prev) => prev.filter((c) => c.id !== id));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la suppression du réassort';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (id: string, active: boolean) => {
    await updateConfig(id, { active });
  };

  return { configs, history, products, stats, loading, error, addConfig, updateConfig, deleteConfig, toggleActive };
}
