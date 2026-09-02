'use client';

import { useState, useEffect, useMemo } from 'react';
import {
    db,
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    updateDoc,
    doc,
    type QuerySnapshot,
    type DocumentData,
} from '@meybeauty/firebase';
import { type RawOrderData } from './useAdminOrders';

export type AdminUser = {
    id: string;
    name: string;
    email: string;
    company: string;
    siret: string;
    status: 'Validé' | 'En attente' | 'Suspendu';
    remise: number;
    createdAt: string;
    // Optional stats if we want to add them later
    ordersCount?: number;
    totalSpent?: number;
};

export function useAdminUsers() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // We fetch all users where role is b2b
        const q = query(
            collection(db, 'users'),
            where('role', '==', 'b2b'),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
            const usersData = snapshot.docs.map(doc => {
                const data = doc.data();

                // Status mapping based on 'validated' boolean or status field
                let status: AdminUser['status'] = 'En attente';
                if (data.status === 'suspended') status = 'Suspendu';
                else if (data.validated === true) status = 'Validé';

                return {
                    id: doc.id,
                    name: `${data.prenom || ''} ${data.nom || ''}`.trim() || `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Inconnu',
                    email: data.email || 'N/A',
                    company: data.company || data.societe || 'N/A',
                    siret: data.siret || 'N/A',
                    status,
                    remise: data.remise || 0,
                    createdAt: data.createdAt?.toDate
                        ? data.createdAt.toDate().toLocaleDateString('fr-FR')
                        : 'N/A',
                };
            });

            setUsers(usersData);
            setLoading(false);
        }, (err: Error) => {
            console.error('Error fetching admin users:', err);
            setError(err.message);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const validateUser = async (userId: string) => {
        try {
            await updateDoc(doc(db, 'users', userId), {
                validated: true,
                updatedAt: new Date(),
            });
        } catch (err: unknown) {
            console.error('Error validating user:', err);
            throw err;
        }
    };

    const suspendUser = async (userId: string) => {
        try {
            await updateDoc(doc(db, 'users', userId), {
                status: 'suspended',
                validated: false,
                updatedAt: new Date(),
            });
        } catch (err: unknown) {
            console.error('Error suspending user:', err);
            throw err;
        }
    };

    const reactivateUser = async (userId: string) => {
        try {
            await updateDoc(doc(db, 'users', userId), {
                status: 'active', // Assuming 'active' or just clearing suspended status
                validated: true,
                updatedAt: new Date(),
            });
        } catch (err: unknown) {
            console.error('Error reactivating user:', err);
            throw err;
        }
    };

    const updateUserRemise = async (userId: string, remise: number) => {
        try {
            await updateDoc(doc(db, 'users', userId), {
                remise,
                updatedAt: new Date(),
            });
        } catch (err: unknown) {
            console.error('Error updating user remise:', err);
            throw err;
        }
    };

    return { users, loading, error, validateUser, suspendUser, reactivateUser, updateUserRemise };
}

export function useAdminUserDetail(userId: string) {
    const [user, setUser] = useState<AdminUser | null>(null);
    const [orders, setOrders] = useState<DocumentData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) return;

        // 1. Fetch User Data
        const userUnsubscribe = onSnapshot(doc(db, 'users', userId), (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                let status: AdminUser['status'] = 'En attente';
                if (data.status === 'suspended') status = 'Suspendu';
                else if (data.validated === true) status = 'Validé';

                setUser({
                    id: docSnap.id,
                    name: `${data.prenom || ''} ${data.nom || ''}`.trim() || `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Inconnu',
                    email: data.email || 'N/A',
                    company: data.company || data.societe || 'N/A',
                    siret: data.siret || 'N/A',
                    status,
                    remise: data.remise || 0,
                    createdAt: data.createdAt?.toDate
                        ? data.createdAt.toDate().toLocaleDateString('fr-FR')
                        : 'N/A',
                });
            } else {
                setError('Utilisateur non trouvé');
            }
        });

        // 2. Fetch User Orders
        const ordersQ = query(
            collection(db, 'orders'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );

        const ordersUnsubscribe = onSnapshot(ordersQ, (snapshot: QuerySnapshot<DocumentData>) => {
            const ordersData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                date: (doc.data() as RawOrderData).createdAt?.toDate?.()?.toLocaleDateString('fr-FR') || '...'
            }));
            setOrders(ordersData);
            setLoading(false);
        }, (err) => {
            console.error('Error fetching user orders:', err);
            // We don't block the whole page if orders fail
        });

        return () => {
            userUnsubscribe();
            ordersUnsubscribe();
        };
    }, [userId]);

    const stats = useMemo(() => {
        const totalSpent = orders.reduce((acc, order) => acc + (order.amountTTC || 0), 0);
        const avgOrderValue = orders.length > 0 ? totalSpent / orders.length : 0;
        return {
            totalOrders: orders.length,
            totalSpent,
            avgOrderValue
        };
    }, [orders]);

    return { user, orders, stats, loading, error };
}
