'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale } from 'next-intl';
import { collection, db, doc, getDoc, getDocs } from '@meybeauty/firebase';

type Locale = string;

type TransData = {
  title?: string;
  description?: string;
  introduction?: string;
  category?: string;
  duration?: string;
  reference?: string;
  theme?: string;
  ambiance?: string;
  extraction?: string;
  volume?: string;
  proprietes?: string[];
  actifs?: { nom: string; role: string }[];
  avis_experts?: string;
  retail?: string[];
  notes?: string[];
  preparation?: {
    cabine?: string[];
    materiel?: string[];
    produits?: string[];
  };
  deroulement?: {
    phase: string;
    duree: string;
    description: string;
    actions: string[];
  }[];
  utilisation?: {
    frequence?: string;
    methode?: string;
    temps?: string;
    retrait?: string;
  };
  caracteristiques?: {
    texture?: string;
    odeur?: string;
    ph?: string;
    conservation?: string;
  };
  [key: string]: unknown;
};

type BaseDoc = {
  slug: string;
  category: string;
  image: string;
  defaultLocale?: Locale;
  translations?: Record<string, TransData>;
};

type RituelDoc = BaseDoc & {
  reference: string;
  theme?: string;
  ambiance?: string;
  duration?: string;
  preparation?: {
    cabine?: string[];
    materiel?: string[];
    produits?: string[];
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

type FicheDoc = BaseDoc & {
  reference: string;
  extraction?: string;
  volume?: string;
  description?: string;
  proprietes?: string[];
  actifs?: { nom: string; role: string }[];
  utilisation?: {
    frequence?: string;
    methode?: string;
    temps?: string;
    retrait?: string;
  };
  caracteristiques?: {
    texture?: string;
    odeur?: string;
    ph?: string;
    conservation?: string;
  };
  avis_experts?: string;
};

export type ProtocoleListItem = {
  slug: string;
  type: 'fiche' | 'rituel';
  title: string;
  description: string;
  category: string;
  duration: string;
  image: string;
};

export type RituelDetail = {
  slug: string;
  reference: string;
  title: string;
  introduction: string;
  category: string;
  duration: string;
  theme: string;
  ambiance: string;
  image: string;
  preparation: {
    cabine: string[];
    materiel: string[];
    produits: string[];
  };
  deroulement: {
    phase: string;
    duree: string;
    description: string;
    actions: string[];
  }[];
  retail: string[];
  notes: string[];
};

export type FicheDetail = {
  slug: string;
  reference: string;
  title: string;
  category: string;
  extraction: string;
  volume: string;
  image: string;
  description: string;
  proprietes: string[];
  actifs: { nom: string; role: string }[];
  utilisation: {
    frequence: string;
    methode: string;
    temps: string;
    retrait: string;
  };
  caracteristiques: {
    texture: string;
    odeur: string;
    ph: string;
    conservation: string;
  };
  avis_experts: string;
};

const pickTrans = <T extends BaseDoc>(docData: T, locale: string): TransData => {
  const fallback = docData.defaultLocale || 'fr';
  return (docData.translations?.[locale] || docData.translations?.[fallback] || {}) as TransData;
};

export function useProtocolesListB2B() {
  const locale = useLocale();
  const [items, setItems] = useState<ProtocoleListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [rituelSnap, ficheSnap] = await Promise.all([
          getDocs(collection(db, 'rituelsB2B')),
          getDocs(collection(db, 'fichesTechniquesB2B')),
        ]);
        if (!mounted) return;

        const rituels = rituelSnap.docs.map((d) => {
          const data = d.data() as RituelDoc;
          const trans = pickTrans(data, locale);
          return {
            slug: data.slug,
            type: 'rituel' as const,
            title: trans.title || data.slug,
            description: trans.introduction || trans.description || '',
            category: trans.category || data.category || '',
            duration: trans.duration || data.duration || '',
            image: data.image,
          };
        });

        const fiches = ficheSnap.docs.map((d) => {
          const data = d.data() as FicheDoc;
          const trans = pickTrans(data, locale);
          return {
            slug: data.slug,
            type: 'fiche' as const,
            title: trans.title || data.slug,
            description: trans.description || '',
            category: trans.category || data.category || '',
            duration: trans.utilisation?.temps || data.utilisation?.temps || '',
            image: data.image,
          };
        });

        setItems([...rituels, ...fiches]);
      } catch (e: unknown) {
        if (!mounted) return;
        const msg = e instanceof Error ? e.message : 'Erreur de récupération des protocoles';
        setError(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchData();
    return () => {
      mounted = false;
    };
  }, [locale]);

  const categorized = useMemo(() => {
    const cats = new Set(items.map((i) => i.category).filter(Boolean));
    return Array.from(cats);
  }, [items]);

  return { items, categories: categorized, loading, error };
}

export function useRituelB2B(slug: string | undefined) {
  const locale = useLocale();
  const [rituel, setRituel] = useState<RituelDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let mounted = true;
    const fetchOne = async () => {
      setLoading(true);
      setError(null);
      try {
        const snap = await getDoc(doc(db, 'rituelsB2B', slug));
        if (!mounted) return;
        if (!snap.exists()) {
          setError('Rituel introuvable');
          setRituel(null);
          return;
        }
        const data = snap.data() as RituelDoc;
        const trans = pickTrans(data, locale);
        setRituel({
          slug: data.slug,
          reference: data.reference,
          title: trans.title || data.slug,
          introduction: trans.introduction || trans.description || '',
          category: trans.category || data.category || '',
          duration: trans.duration || data.duration || '',
          theme: trans.theme || data.theme || '',
          ambiance: trans.ambiance || data.ambiance || '',
          image: data.image,
          preparation: {
            cabine: trans.preparation?.cabine || data.preparation?.cabine || [],
            materiel: trans.preparation?.materiel || data.preparation?.materiel || [],
            produits: trans.preparation?.produits || data.preparation?.produits || [],
          },
          deroulement:
            trans.deroulement?.length
              ? trans.deroulement
              : data.deroulement || [],
          retail: trans.retail || data.retail || [],
          notes: trans.notes || data.notes || [],
        });
      } catch (e: unknown) {
        if (!mounted) return;
        const msg = e instanceof Error ? e.message : 'Erreur de récupération du rituel';
        setError(msg);
        setRituel(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchOne();
    return () => {
      mounted = false;
    };
  }, [locale, slug]);

  return { rituel, loading, error };
}

export function useFicheB2B(slug: string | undefined) {
  const locale = useLocale();
  const [fiche, setFiche] = useState<FicheDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let mounted = true;
    const fetchOne = async () => {
      setLoading(true);
      setError(null);
      try {
        const snap = await getDoc(doc(db, 'fichesTechniquesB2B', slug));
        if (!mounted) return;
        if (!snap.exists()) {
          setError('Fiche introuvable');
          setFiche(null);
          return;
        }
        const data = snap.data() as FicheDoc;
        const trans = pickTrans(data, locale);
        setFiche({
          slug: data.slug,
          reference: trans.reference || data.reference,
          title: trans.title || data.slug,
          category: trans.category || data.category || '',
          extraction: trans.extraction || data.extraction || '',
          volume: trans.volume || data.volume || '',
          image: data.image,
          description: trans.description || data.description || '',
          proprietes: trans.proprietes || data.proprietes || [],
          actifs: trans.actifs || data.actifs || [],
          utilisation: {
            frequence: trans.utilisation?.frequence || data.utilisation?.frequence || '',
            methode: trans.utilisation?.methode || data.utilisation?.methode || '',
            temps: trans.utilisation?.temps || data.utilisation?.temps || '',
            retrait: trans.utilisation?.retrait || data.utilisation?.retrait || '',
          },
          caracteristiques: {
            texture: trans.caracteristiques?.texture || data.caracteristiques?.texture || '',
            odeur: trans.caracteristiques?.odeur || data.caracteristiques?.odeur || '',
            ph: trans.caracteristiques?.ph || data.caracteristiques?.ph || '',
            conservation: trans.caracteristiques?.conservation || data.caracteristiques?.conservation || '',
          },
          avis_experts: trans.avis_experts || data.avis_experts || '',
        });
      } catch (e: unknown) {
        if (!mounted) return;
        const msg = e instanceof Error ? e.message : 'Erreur de récupération de la fiche technique';
        setError(msg);
        setFiche(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchOne();
    return () => {
      mounted = false;
    };
  }, [locale, slug]);

  return { fiche, loading, error };
}
