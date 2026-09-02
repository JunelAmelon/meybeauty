'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import {
    db,
    collection,
    query,
    orderBy,
    onSnapshot,
    deleteDoc,
    doc,
    addDoc,
    updateDoc,
    type QuerySnapshot,
    type DocumentData,
} from '@meybeauty/firebase';

export type BlogDb = {
    slug: string;
    image: string;
    date: string;
    readTime: string;
    category: string;
    related?: string[];
    author?: { name?: string; role?: string; avatar?: string };
    defaultLocale?: string;
    translations?: Record<string, {
        title?: string;
        excerpt?: string;
        content?: string[];
    }>;
};

export type AdminBlog = {
    id: string;
    slug: string;
    image: string;
    date: string;
    readTime: string;
    category: string;
    title: string;
    excerpt: string;
    author?: { name?: string; role?: string; avatar?: string };
    translations?: BlogDb['translations'];
};

function mapAdminBlog(docId: string, data: BlogDb, locale: string): AdminBlog {
    const fallbackLocale = data.defaultLocale || 'fr';
    const trans =
        data.translations?.[locale] ||
        data.translations?.[fallbackLocale] ||
        {};

    return {
        id: docId,
        slug: data.slug || docId,
        image: data.image || '/placeholder.jpg',
        date: data.date || '',
        readTime: data.readTime || '',
        category: data.category || 'N/A',
        title: trans?.title || data.slug || docId,
        excerpt: trans?.excerpt || '',
        author: data.author,
        translations: data.translations,
    };
}

export function useAdminBlogs() {
    const locale = useLocale();
    const [blogs, setBlogs] = useState<AdminBlog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const q = query(collection(db, 'blogPosts'), orderBy('slug', 'asc'));

        const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
            const blogsData = snapshot.docs.map(d =>
                mapAdminBlog(d.id, d.data() as BlogDb, locale)
            );
            setBlogs(blogsData);
            setLoading(false);
        }, (err: Error) => {
            console.error('Error fetching admin blogs:', err);
            setError(err.message);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [locale]);

    const addBlog = async (data: BlogDb) => {
        try {
            await addDoc(collection(db, 'blogPosts'), data);
        } catch (err: unknown) {
            throw new Error(err instanceof Error ? err.message : 'Failed to add blog post');
        }
    };

    const updateBlog = async (id: string, data: Partial<BlogDb>) => {
        try {
            await updateDoc(doc(db, 'blogPosts', id), data);
        } catch (err: unknown) {
            throw new Error(err instanceof Error ? err.message : 'Failed to update blog post');
        }
    };

    const deleteBlog = async (id: string) => {
        try {
            await deleteDoc(doc(db, 'blogPosts', id));
        } catch (err: unknown) {
            throw new Error(err instanceof Error ? err.message : 'Failed to delete blog post');
        }
    };

    return { blogs, loading, error, addBlog, updateBlog, deleteBlog };
}
