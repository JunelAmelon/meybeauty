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

export type RitualDb = {
    slug: string;
    image: string;
    products?: (string | number)[];
    defaultLocale?: string;
    translations?: Record<string, {
        title?: string;
        subtitle?: string;
        description?: string;
        duration?: string;
        difficulty?: string;
        full_desc?: string;
        steps?: { name?: string; desc?: string }[];
        tips?: string[];
    }>;
};

export type AdminRitual = {
    id: string;
    slug: string;
    image: string;
    title: string;
    subtitle: string;
    description: string;
    duration: string;
    difficulty: string;
    translations?: RitualDb['translations'];
};

function mapAdminRitual(docId: string, data: RitualDb, locale: string): AdminRitual {
    const fallbackLocale = data.defaultLocale || 'fr';
    const trans =
        data.translations?.[locale] ||
        data.translations?.[fallbackLocale] ||
        {};

    return {
        id: docId,
        slug: data.slug || docId,
        image: data.image || '/placeholder.jpg',
        title: trans?.title || data.slug || docId,
        subtitle: trans?.subtitle || '',
        description: trans?.description || '',
        duration: trans?.duration || '',
        difficulty: trans?.difficulty || '',
        translations: data.translations,
    };
}

export function useAdminRituals() {
    const locale = useLocale();
    const [rituals, setRituals] = useState<AdminRitual[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const q = query(collection(db, 'rituals'), orderBy('slug', 'asc'));

        const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
            const ritualsData = snapshot.docs.map(d =>
                mapAdminRitual(d.id, d.data() as RitualDb, locale)
            );
            setRituals(ritualsData);
            setLoading(false);
        }, (err: Error) => {
            console.error('Error fetching admin rituals:', err);
            setError(err.message);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [locale]);

    const addRitual = async (data: RitualDb) => {
        try {
            await addDoc(collection(db, 'rituals'), data);
        } catch (err: unknown) {
            throw new Error(err instanceof Error ? err.message : 'Failed to add ritual');
        }
    };

    const updateRitual = async (id: string, data: Partial<RitualDb>) => {
        try {
            await updateDoc(doc(db, 'rituals', id), data);
        } catch (err: unknown) {
            throw new Error(err instanceof Error ? err.message : 'Failed to update ritual');
        }
    };

    const deleteRitual = async (id: string) => {
        try {
            await deleteDoc(doc(db, 'rituals', id));
        } catch (err: unknown) {
            throw new Error(err instanceof Error ? err.message : 'Failed to delete ritual');
        }
    };

    return { rituals, loading, error, addRitual, updateRitual, deleteRitual };
}
