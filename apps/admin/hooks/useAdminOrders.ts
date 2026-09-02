'use client';

import { useState, useEffect } from 'react';
import {
    db,
    collection,
    query,
    orderBy,
    onSnapshot,
    getDoc,
    deleteDoc,
    doc as fsDoc,
    type QuerySnapshot,
    type DocumentData,
    type QueryDocumentSnapshot,
    type Timestamp,
} from '@meybeauty/firebase';

export type RawOrderData = {
    userSociete?: string;
    userNom?: string;
    userPrenom?: string;
    userEmail?: string;
    userId?: string;
    shipping?: {
        fullName?: string;
        email?: string;
    };
    createdAt?: Timestamp;
    amountTTC?: number;
    currency?: string;
    paymentStatus?: string;
    lines?: { quantity: number }[];
    source?: string;
};

export type AdminOrder = {
    id: string;
    client: string;
    clientEmail: string;
    date: string;
    amount: number;
    currency: string;
    itemsCount: number;
    status: string;
    source: 'b2c' | 'b2b';
};

export function useAdminOrders() {
    const [orders, setOrders] = useState<AdminOrder[]>([]);
    const [userEmails, setUserEmails] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, async (snapshot: QuerySnapshot<DocumentData>) => {
            // Map raw document data, casting to RawOrderData for better type inference
            const rawOrders = snapshot.docs.map(doc => doc.data() as RawOrderData);

            // Identify unique B2C userIds to fetch emails
            const b2cUserIds = Array.from(new Set(
                rawOrders
                    .filter((data) => !data.userSociete && data.userId)
                    .map((data) => data.userId as string)
            ));

            // Fetch missing emails
            const newEmails = { ...userEmails };
            let updated = false;

            await Promise.all(b2cUserIds.map(async (uid) => {
                if (!newEmails[uid]) {
                    try {
                        const userSnap = await getDoc(fsDoc(db, 'users', uid));
                        if (userSnap.exists()) {
                            newEmails[uid] = (userSnap.data() as { email?: string }).email || 'Email inconnu';
                            updated = true;
                        } else {
                            newEmails[uid] = 'Utilisateur supprimé';
                            updated = true;
                        }
                    } catch (err) {
                        console.error(`Failed to fetch email for user ${uid}`, err);
                    }
                }
            }));

            if (updated) {
                setUserEmails(newEmails);
            }

            const ordersData = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
                const data = doc.data() as RawOrderData; // Cast to RawOrderData for normalization

                // Normalization
                const isB2B = !!data.userSociete || data.source === 'b2b';
                const client = isB2B
                    ? (data.userSociete || `${data.userNom || ''} ${data.userPrenom || ''}`).trim()
                    : (data.shipping?.fullName || 'Client B2C');

                let clientEmail = 'N/A';
                if (isB2B) {
                    clientEmail = data.userEmail || 'N/A';
                } else if (data.userId) {
                    clientEmail = newEmails[data.userId] || 'Chargement...';
                } else if (data.shipping?.email) {
                    clientEmail = data.shipping.email;
                }

                const date = data.createdAt?.toDate
                    ? data.createdAt.toDate().toLocaleDateString('fr-FR')
                    : '...';

                const lines = (data.lines as { quantity: number }[]) || [];
                const itemsCount = lines.reduce((acc: number, line) => acc + (line.quantity || 0), 0);

                return {
                    id: doc.id,
                    client,
                    clientEmail,
                    date,
                    amount: data.amountTTC || 0,
                    currency: data.currency || 'EUR',
                    itemsCount,
                    status: data.paymentStatus || 'En attente',
                    source: isB2B ? 'b2b' : 'b2c',
                } as AdminOrder;
            });

            setOrders(ordersData);
            setLoading(false);
        }, (err: Error) => {
            console.error('Error fetching admin orders:', err);
            setError(err.message);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userEmails]); // Re-run when userEmails changes to update normalized orders

    const deleteOrder = async (id: string) => {
        await deleteDoc(fsDoc(db, 'orders', id));
    };

    return { orders, loading, error, deleteOrder };
}
