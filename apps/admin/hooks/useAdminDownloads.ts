'use client';

import { useState, useEffect } from 'react';
import {
    db,
    collection,
    onSnapshot,
    deleteDoc,
    doc as fsDoc,
    setDoc,
    type DocumentData,
    type QueryDocumentSnapshot,
} from '@meybeauty/firebase';

export type DownloadAsset = {
    slug: string;
    type: 'image' | 'pdf' | 'video';
    category: string;
    format: string;
    size: string;
    url: string;
    title: string;
    defaultLocale?: string;
};

type RawDownloadDoc = DocumentData & {
    slug: string;
    type: string;
    category: string;
    format: string;
    size: string;
    url: string;
    defaultLocale?: string;
    translations?: Record<string, { title?: string }>;
};

function normalize(doc: QueryDocumentSnapshot<DocumentData>): DownloadAsset {
    const data = doc.data() as RawDownloadDoc;
    const locale = data.defaultLocale || 'fr';
    const trans = data.translations?.[locale] || {};
    return {
        slug: data.slug || doc.id,
        type: (data.type as DownloadAsset['type']) || 'pdf',
        category: data.category || '',
        format: data.format || '',
        size: data.size || '',
        url: data.url || '',
        title: trans.title || data.slug,
        defaultLocale: data.defaultLocale,
    };
}

export function useAdminDownloads() {
    const [assets, setAssets] = useState<DownloadAsset[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unsub = onSnapshot(
            collection(db, 'downloadsB2B'),
            (snap) => {
                const mapped = snap.docs.map(normalize);
                setAssets(mapped);
                setLoading(false);
                setError(null);
            },
            (err) => {
                setError(err.message);
                setLoading(false);
            }
        );
        return () => unsub();
    }, []);

    const addDownload = async (asset: DownloadAsset) => {
        const ref = fsDoc(db, 'downloadsB2B', asset.slug);
        await setDoc(ref, {
            slug: asset.slug,
            type: asset.type,
            category: asset.category,
            format: asset.format,
            size: asset.size,
            url: asset.url,
            defaultLocale: asset.defaultLocale || 'fr',
            translations: {
                [asset.defaultLocale || 'fr']: { title: asset.title },
            },
        });
    };

    const updateDownload = async (asset: DownloadAsset) => {
        const ref = fsDoc(db, 'downloadsB2B', asset.slug);
        await setDoc(ref, {
            slug: asset.slug,
            type: asset.type,
            category: asset.category,
            format: asset.format,
            size: asset.size,
            url: asset.url,
            defaultLocale: asset.defaultLocale || 'fr',
            translations: {
                [asset.defaultLocale || 'fr']: { title: asset.title },
            },
        }, { merge: true });
    };

    const deleteDownload = async (slug: string) => {
        await deleteDoc(fsDoc(db, 'downloadsB2B', slug));
    };

    return { assets, loading, error, addDownload, updateDownload, deleteDownload };
}
