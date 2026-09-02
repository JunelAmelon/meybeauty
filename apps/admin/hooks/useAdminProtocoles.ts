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

export type ProtocoleType = 'fiche' | 'rituel';

export type AdminProtocole = {
    slug: string;
    type: ProtocoleType;
    title: string;
    description: string;
    category: string;
    image: string;
    documentUrl?: string;
    reference: string;
    duration: string;
    // Fiche-specific
    volume?: string;
    extraction?: string;
    proprietes?: string[];
    actifs?: { nom: string; role: string }[];
    utilisation?: {
        frequence: string;
        methode: string;
        temps: string;
        retrait: string;
    };
    caracteristiques?: {
        texture: string;
        odeur: string;
        ph: string;
        conservation: string;
    };
    avis_experts?: string;
    // Rituel-specific
    theme?: string;
    ambiance?: string;
    preparation?: {
        cabine: string[];
        materiel: string[];
        produits: string[];
    };
    deroulement?: {
        phase: string;
        duree: string;
        description: string;
        actions: string[];
    }[];
    retail?: string[];
    notes?: string[];
};

type BaseDoc = DocumentData & {
    slug: string;
    category?: string;
    image?: string;
    documentUrl?: string;
    reference?: string;
    defaultLocale?: string;
    translations?: Record<string, Record<string, unknown>>;
    // Rituel fields
    theme?: string;
    ambiance?: string;
    duration?: string;
    preparation?: { cabine?: string[]; materiel?: string[]; produits?: string[] };
    deroulement?: { phase: string; duree: string; description: string; actions: string[] }[];
    retail?: string[];
    notes?: string[];
    // Fiche fields
    volume?: string;
    extraction?: string;
    description?: string;
    proprietes?: string[];
    actifs?: { nom: string; role: string }[];
    utilisation?: { frequence?: string; methode?: string; temps?: string; retrait?: string };
    caracteristiques?: { texture?: string; odeur?: string; ph?: string; conservation?: string };
    avis_experts?: string;
};

function normalizeRituel(doc: QueryDocumentSnapshot<DocumentData>): AdminProtocole {
    const data = doc.data() as BaseDoc;
    const locale = data.defaultLocale || 'fr';
    const trans = (data.translations?.[locale] || {}) as Record<string, unknown>;
    const transPrep = (trans.preparation || data.preparation || {}) as { cabine?: string[]; materiel?: string[]; produits?: string[] };
    const transDeroulement = (trans.deroulement || data.deroulement || []) as { phase: string; duree: string; description: string; actions: string[] }[];
    return {
        slug: data.slug || doc.id,
        type: 'rituel',
        title: (trans.title as string) || data.slug,
        description: (trans.introduction as string) || (trans.description as string) || '',
        category: (trans.category as string) || data.category || '',
        image: data.image || '',
        documentUrl: data.documentUrl || '',
        reference: data.reference || '',
        duration: (trans.duration as string) || data.duration || '',
        theme: (trans.theme as string) || data.theme || '',
        ambiance: (trans.ambiance as string) || data.ambiance || '',
        preparation: {
            cabine: transPrep.cabine || [],
            materiel: transPrep.materiel || [],
            produits: transPrep.produits || [],
        },
        deroulement: transDeroulement,
        retail: (trans.retail as string[]) || data.retail || [],
        notes: (trans.notes as string[]) || data.notes || [],
    };
}

function normalizeFiche(doc: QueryDocumentSnapshot<DocumentData>): AdminProtocole {
    const data = doc.data() as BaseDoc;
    const locale = data.defaultLocale || 'fr';
    const trans = (data.translations?.[locale] || {}) as Record<string, unknown>;
    const transUtil = (trans.utilisation || data.utilisation || {}) as { frequence?: string; methode?: string; temps?: string; retrait?: string };
    const transCarac = (trans.caracteristiques || data.caracteristiques || {}) as { texture?: string; odeur?: string; ph?: string; conservation?: string };
    return {
        slug: data.slug || doc.id,
        type: 'fiche',
        title: (trans.title as string) || data.slug,
        description: (trans.description as string) || data.description || '',
        category: (trans.category as string) || data.category || '',
        image: data.image || '',
        documentUrl: data.documentUrl || '',
        reference: (trans.reference as string) || data.reference || '',
        duration: transUtil.temps || '',
        volume: (trans.volume as string) || data.volume || '',
        extraction: (trans.extraction as string) || data.extraction || '',
        proprietes: (trans.proprietes as string[]) || data.proprietes || [],
        actifs: (trans.actifs as { nom: string; role: string }[]) || data.actifs || [],
        utilisation: {
            frequence: transUtil.frequence || '',
            methode: transUtil.methode || '',
            temps: transUtil.temps || '',
            retrait: transUtil.retrait || '',
        },
        caracteristiques: {
            texture: transCarac.texture || '',
            odeur: transCarac.odeur || '',
            ph: transCarac.ph || '',
            conservation: transCarac.conservation || '',
        },
        avis_experts: (trans.avis_experts as string) || data.avis_experts || '',
    };
}

function buildTranslationData(proto: AdminProtocole): Record<string, unknown> {
    const base: Record<string, unknown> = {
        title: proto.title,
        description: proto.description,
        category: proto.category,
    };
    if (proto.type === 'fiche') {
        base.reference = proto.reference;
        base.extraction = proto.extraction || '';
        base.volume = proto.volume || '';
        base.proprietes = proto.proprietes || [];
        base.actifs = proto.actifs || [];
        base.utilisation = proto.utilisation || { frequence: '', methode: '', temps: '', retrait: '' };
        base.caracteristiques = proto.caracteristiques || { texture: '', odeur: '', ph: '', conservation: '' };
        base.avis_experts = proto.avis_experts || '';
    } else {
        base.introduction = proto.description;
        base.theme = proto.theme || '';
        base.ambiance = proto.ambiance || '';
        base.duration = proto.duration || '';
        base.preparation = proto.preparation || { cabine: [], materiel: [], produits: [] };
        base.deroulement = proto.deroulement || [];
        base.retail = proto.retail || [];
        base.notes = proto.notes || [];
    }
    return base;
}

export function useAdminProtocoles() {
    const [protocoles, setProtocoles] = useState<AdminProtocole[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let unsub1: () => void;
        let unsub2: () => void;
        let rituels: AdminProtocole[] = [];
        let fiches: AdminProtocole[] = [];
        let mounted = true;

        const updateAll = () => {
            if (!mounted) return;
            setProtocoles([...rituels, ...fiches]);
            setLoading(false);
        };

        unsub1 = onSnapshot(
            collection(db, 'rituelsB2B'),
            (snap) => {
                rituels = snap.docs.map(normalizeRituel);
                updateAll();
            },
            (err) => {
                setError(err.message);
                setLoading(false);
            }
        );

        unsub2 = onSnapshot(
            collection(db, 'fichesTechniquesB2B'),
            (snap) => {
                fiches = snap.docs.map(normalizeFiche);
                updateAll();
            },
            (err) => {
                setError(err.message);
                setLoading(false);
            }
        );

        return () => {
            mounted = false;
            unsub1();
            unsub2();
        };
    }, []);

    const deleteProtocole = async (slug: string, type: ProtocoleType) => {
        const col = type === 'fiche' ? 'fichesTechniquesB2B' : 'rituelsB2B';
        await deleteDoc(fsDoc(db, col, slug));
    };

    const addProtocole = async (proto: AdminProtocole) => {
        const col = proto.type === 'fiche' ? 'fichesTechniquesB2B' : 'rituelsB2B';
        const ref = fsDoc(db, col, proto.slug);
        const base: Record<string, unknown> = {
            slug: proto.slug,
            reference: proto.reference,
            category: proto.category,
            image: proto.image,
            documentUrl: proto.documentUrl || '',
            defaultLocale: 'fr',
            translations: {
                fr: buildTranslationData(proto),
            },
        };
        if (proto.type === 'fiche') {
            base.volume = proto.volume || '';
            base.extraction = proto.extraction || '';
        } else {
            base.theme = proto.theme || '';
            base.ambiance = proto.ambiance || '';
            base.duration = proto.duration || '';
        }
        await setDoc(ref, base);
    };

    const updateProtocole = async (proto: AdminProtocole) => {
        const col = proto.type === 'fiche' ? 'fichesTechniquesB2B' : 'rituelsB2B';
        const ref = fsDoc(db, col, proto.slug);
        const base: Record<string, unknown> = {
            slug: proto.slug,
            reference: proto.reference,
            category: proto.category,
            image: proto.image,
            documentUrl: proto.documentUrl || '',
            defaultLocale: 'fr',
            translations: {
                fr: buildTranslationData(proto),
            },
        };
        if (proto.type === 'fiche') {
            base.volume = proto.volume || '';
            base.extraction = proto.extraction || '';
        } else {
            base.theme = proto.theme || '';
            base.ambiance = proto.ambiance || '';
            base.duration = proto.duration || '';
        }
        await setDoc(ref, base, { merge: true });
    };

    return { protocoles, loading, error, addProtocole, updateProtocole, deleteProtocole };
}
