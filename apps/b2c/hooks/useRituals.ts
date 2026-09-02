'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { db, collection, fsDoc as doc, getDoc, getDocs } from '@meybeauty/firebase';

export type RitualDoc = {
  id: string;
  slug: string;
  image: string;
  products: (string | number)[];
  title: string;
  subtitle: string;
  description: string;
  duration: string;
  difficulty: string;
  full_desc: string;
  steps: { name: string; desc: string }[];
  tips: string[];
};

type RitualDb = {
  slug: string;
  image: string;
  products?: (string | number)[];
  defaultLocale?: string;
  translations?: Record<
    string,
    {
      title?: string;
      subtitle?: string;
      description?: string;
      duration?: string;
      difficulty?: string;
      full_desc?: string;
      steps?: { name?: string; desc?: string }[];
      tips?: string[];
    }
  >;
};

function mapRitual(docId: string, data: RitualDb, locale: string): RitualDoc {
  const fallbackLocale = data.defaultLocale || 'fr';
  const trans =
    data.translations?.[locale] ||
    data.translations?.[fallbackLocale] ||
    {};

  return {
    id: docId,
    slug: data.slug || docId,
    image: data.image,
    products: data.products || [],
    title: trans?.title || data.slug || docId,
    subtitle: trans?.subtitle || '',
    description: trans?.description || '',
    duration: trans?.duration || '',
    difficulty: trans?.difficulty || '',
    full_desc: trans?.full_desc || trans?.description || '',
    steps: (trans?.steps || []).map((s) => ({
      name: s?.name || '',
      desc: s?.desc || '',
    })),
    tips: trans?.tips || [],
  };
}

export function useRituals() {
  const locale = useLocale();
  const [rituals, setRituals] = useState<RitualDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchRituals = async () => {
      setLoading(true);
      setError(null);
      try {
        const snap = await getDocs(collection(db, 'rituals'));
        if (!mounted) return;
        const mapped = snap.docs.map((d) => mapRitual(d.id, d.data() as RitualDb, locale));
        setRituals(mapped);
      } catch (err: unknown) {
        if (!mounted) return;
        const msg = err instanceof Error ? err.message : 'Erreur de récupération des rituels';
        setError(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchRituals();
    return () => {
      mounted = false;
    };
  }, [locale]);

  return { rituals, loading, error };
}

export function useRitual(slug: string) {
  const locale = useLocale();
  const [ritual, setRitual] = useState<RitualDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let mounted = true;
    const fetchRitual = async () => {
      setLoading(true);
      setError(null);
      try {
        const ref = doc(collection(db, 'rituals'), slug);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          if (mounted) setError('Rituel introuvable');
          return;
        }
        if (!mounted) return;
        setRitual(mapRitual(snap.id, snap.data() as RitualDb, locale));
      } catch (err: unknown) {
        if (!mounted) return;
        const msg = err instanceof Error ? err.message : 'Erreur de récupération du rituel';
        setError(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchRitual();
    return () => {
      mounted = false;
    };
  }, [slug, locale]);

  return { ritual, loading, error };
}
