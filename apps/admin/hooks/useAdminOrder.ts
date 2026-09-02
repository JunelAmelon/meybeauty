'use client';

import { useState, useEffect } from 'react';
import {
    db,
    doc as fsDoc,
    getDoc,
    type DocumentData,
    type Timestamp,
} from '@meybeauty/firebase';

export type OrderLine = {
    reference?: string;
    name?: string;
    quantity: number;
    unitPriceHT?: number;
    prixHT?: number;
    image?: string;
};

export type OrderDetail = {
    id: string;
    client: string;
    clientEmail: string;
    clientSociete?: string;
    clientPhone?: string;
    shippingAddress?: string;
    shippingCity?: string;
    shippingPostalCode?: string;
    date: string;
    amountHT: number;
    amountTTC: number;
    currency: string;
    itemsCount: number;
    status: string;
    source: 'b2c' | 'b2b';
    lines: OrderLine[];
    paymentProvider?: string;
    paymentId?: string;
};

export function useAdminOrder(id: string) {
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        let mounted = true;

        const fetchOrder = async () => {
            setLoading(true);
            setError(null);
            try {
                const snap = await getDoc(fsDoc(db, 'orders', id));
                if (!snap.exists()) {
                    if (mounted) setError('Commande introuvable');
                    return;
                }
                if (!mounted) return;

                const data = snap.data() as DocumentData & {
                    userSociete?: string;
                    userNom?: string;
                    userPrenom?: string;
                    userEmail?: string;
                    userId?: string;
                    shipping?: {
                        fullName?: string;
                        email?: string;
                        phone?: string;
                        address?: string;
                        city?: string;
                        postalCode?: string;
                    };
                    createdAt?: Timestamp;
                    amountHT?: number;
                    amountTTC?: number;
                    currency?: string;
                    paymentStatus?: string;
                    lines?: OrderLine[];
                    source?: string;
                    paymentProvider?: string;
                    paymentId?: string;
                };

                const isB2B = !!data.userSociete || data.source === 'b2b';
                const client = isB2B
                    ? (data.userSociete || `${data.userNom || ''} ${data.userPrenom || ''}`).trim()
                    : (data.shipping?.fullName || 'Client B2C');

                let clientEmail = 'N/A';
                if (isB2B) {
                    clientEmail = data.userEmail || 'N/A';
                } else if (data.shipping?.email) {
                    clientEmail = data.shipping.email;
                } else if (data.userId) {
                    try {
                        const userSnap = await getDoc(fsDoc(db, 'users', data.userId));
                        if (userSnap.exists()) {
                            clientEmail = (userSnap.data() as { email?: string }).email || 'N/A';
                        }
                    } catch {}
                }

                const date = data.createdAt?.toDate
                    ? data.createdAt.toDate().toLocaleDateString('fr-FR')
                    : '...';

                const lines = (data.lines as OrderLine[]) || [];
                const itemsCount = lines.reduce((acc, line) => acc + (line.quantity || 0), 0);

                setOrder({
                    id: snap.id,
                    client,
                    clientEmail,
                    clientSociete: data.userSociete,
                    clientPhone: data.shipping?.phone,
                    shippingAddress: data.shipping?.address,
                    shippingCity: data.shipping?.city,
                    shippingPostalCode: data.shipping?.postalCode,
                    date,
                    amountHT: data.amountHT || 0,
                    amountTTC: data.amountTTC || 0,
                    currency: data.currency || 'EUR',
                    itemsCount,
                    status: data.paymentStatus || 'En attente',
                    source: isB2B ? 'b2b' : 'b2c',
                    lines,
                    paymentProvider: data.paymentProvider,
                    paymentId: data.paymentId,
                });
            } catch (err: unknown) {
                if (!mounted) return;
                setError(err instanceof Error ? err.message : 'Erreur de récupération de la commande');
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchOrder();
        return () => { mounted = false; };
    }, [id]);

    return { order, loading, error };
}
