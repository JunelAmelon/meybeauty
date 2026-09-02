'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale } from 'next-intl';
import { collection, db, getDocs } from '@meybeauty/firebase';

type Locale = string;

type DownloadDoc = {
  slug: string;
  type: 'image' | 'pdf' | 'video';
  category: string;
  format: string;
  size: string;
  url: string;
  defaultLocale?: Locale;
  translations?: Record<
    Locale,
    {
      title?: string;
    }
  >;
};

export type DownloadAsset = {
  slug: string;
  title: string;
  type: 'image' | 'pdf' | 'video';
  category: string;
  format: string;
  size: string;
  url: string;
};

const pickTrans = (docData: DownloadDoc, locale: string) => {
  const fallback = docData.defaultLocale || 'fr';
  return docData.translations?.[locale] || docData.translations?.[fallback] || {};
};

export function useDownloadsB2B() {
  const locale = useLocale();
  const [assets, setAssets] = useState<DownloadAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const snap = await getDocs(collection(db, 'downloadsB2B'));
        if (!mounted) return;
        const mapped = snap.docs.map((d) => {
          const data = d.data() as DownloadDoc;
          const trans = pickTrans(data, locale);
          return {
            slug: data.slug,
            title: trans.title || data.slug,
            type: data.type,
            category: data.category,
            format: data.format,
            size: data.size,
            url: data.url,
          };
        });
        setAssets(mapped);
      } catch (err: unknown) {
        if (!mounted) return;
        const message = err instanceof Error ? err.message : 'Erreur de récupération des téléchargements';
        setError(message);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchData();
    return () => {
      mounted = false;
    };
  }, [locale]);

  const categories = useMemo(() => {
    const cats = new Set(assets.map((a) => a.category).filter(Boolean));
    return Array.from(cats);
  }, [assets]);

  return { assets, categories, loading, error };
}
