'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { db, collection, fsDoc as doc, getDoc, getDocs } from '@meybeauty/firebase';

export type BlogDoc = {
  id: string;
  slug: string;
  image: string;
  date: string;
  readTime: string;
  category: string;
  related: string[];
  author?: { name?: string; role?: string; avatar?: string };
  title: string;
  excerpt: string;
  content: string[];
};

type BlogDb = {
  slug: string;
  image: string;
  date: string;
  readTime: string;
  category: string;
  related?: string[];
  author?: { name?: string; role?: string; avatar?: string };
  defaultLocale?: string;
  translations?: Record<string, { title?: string; excerpt?: string; content?: string[] }>;
};

function mapBlog(docId: string, data: BlogDb, locale: string): BlogDoc {
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
    readTime: data.readTime,
    category: data.category,
    related: data.related || [],
    author: data.author,
    title: trans?.title || data.slug || docId,
    excerpt: trans?.excerpt || '',
    content: trans?.content || [],
  };
}

export function useBlogs() {
  const locale = useLocale();
  const [posts, setPosts] = useState<BlogDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        const snap = await getDocs(collection(db, 'blogPosts'));
        if (!mounted) return;
        const mapped = snap.docs.map((d) => mapBlog(d.id, d.data() as BlogDb, locale));
        setPosts(mapped);
      } catch (err: unknown) {
        if (!mounted) return;
        const msg = err instanceof Error ? err.message : 'Erreur de récupération des articles';
        setError(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchPosts();
    return () => {
      mounted = false;
    };
  }, [locale]);

  return { posts, loading, error };
}

export function useBlog(slug: string) {
  const locale = useLocale();
  const [post, setPost] = useState<BlogDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let mounted = true;
    const fetchPost = async () => {
      setLoading(true);
      setError(null);
      try {
        const ref = doc(collection(db, 'blogPosts'), slug);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          if (mounted) setError('Article introuvable');
          return;
        }
        if (!mounted) return;
        setPost(mapBlog(snap.id, snap.data() as BlogDb, locale));
      } catch (err: unknown) {
        if (!mounted) return;
        const msg = err instanceof Error ? err.message : 'Erreur de récupération de l’article';
        setError(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchPost();
    return () => {
      mounted = false;
    };
  }, [slug, locale]);

  return { post, loading, error };
}
