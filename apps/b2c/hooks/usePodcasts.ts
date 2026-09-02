'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { db, collection, fsDoc as doc, getDoc, getDocs } from '@meybeauty/firebase';

export type PodcastDoc = {
  id: string;
  slug: string;
  image: string;
  date: string;
  duration: string;
  guest: string;
  title: string;
  description: string;
  guest_title: string;
};

type PodcastDb = {
  slug: string;
  image: string;
  date: string;
  duration: string;
  guest: string;
  defaultLocale?: string;
  translations?: Record<string, { title?: string; description?: string; guest_title?: string }>;
};

function mapPodcast(docId: string, data: PodcastDb, locale: string): PodcastDoc {
  const fallbackLocale = data.defaultLocale || 'fr';
  const trans =
    data.translations?.[locale] ||
    data.translations?.[fallbackLocale] ||
    {};

  return {
    id: docId,
    slug: data.slug || docId,
    image: data.image,
    date: data.date,
    duration: data.duration,
    guest: data.guest,
    title: trans?.title || data.slug || docId,
    description: trans?.description || '',
    guest_title: trans?.guest_title || '',
  };
}

export function usePodcasts() {
  const locale = useLocale();
  const [episodes, setEpisodes] = useState<PodcastDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchPodcasts = async () => {
      setLoading(true);
      setError(null);
      try {
        const snap = await getDocs(collection(db, 'podcasts'));
        if (!mounted) return;
        const mapped = snap.docs.map((d) => mapPodcast(d.id, d.data() as PodcastDb, locale));
        setEpisodes(mapped);
      } catch (err: unknown) {
        if (!mounted) return;
        const msg = err instanceof Error ? err.message : 'Erreur de récupération des podcasts';
        setError(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchPodcasts();
    return () => {
      mounted = false;
    };
  }, [locale]);

  return { episodes, loading, error };
}

export function usePodcast(slug: string) {
  const locale = useLocale();
  const [episode, setEpisode] = useState<PodcastDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let mounted = true;
    const fetchPodcast = async () => {
      setLoading(true);
      setError(null);
      try {
        const ref = doc(collection(db, 'podcasts'), slug);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          if (mounted) setError('Podcast introuvable');
          return;
        }
        if (!mounted) return;
        setEpisode(mapPodcast(snap.id, snap.data() as PodcastDb, locale));
      } catch (err: unknown) {
        if (!mounted) return;
        const msg = err instanceof Error ? err.message : 'Erreur de récupération du podcast';
        setError(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchPodcast();
    return () => {
      mounted = false;
    };
  }, [slug, locale]);

  return { episode, loading, error };
}
