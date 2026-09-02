'use client';

import { useState, useEffect } from 'react';
import {
    db,
    collection,
    query,
    orderBy,
    limit,
    onSnapshot,
    where,
    type QuerySnapshot,
    type DocumentData,
} from '@meybeauty/firebase';

export interface DashboardOrder {
    id: string;
    client: string;
    amount: string;
    status: string;
    date: string;
}

export interface PendingPro {
    id: string;
    name: string;
    company: string;
    date: string;
    siret: string;
}

export function useAdminDashboard() {
    const [stats, setStats] = useState({
        professionals: 0,
        orders: 0,
        products: 0,
        revenue: 0,
        pendingPros: 0,
    });
    const [recentOrders, setRecentOrders] = useState<DashboardOrder[]>([]);
    const [pendingProsList, setPendingProsList] = useState<PendingPro[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Fetch Orders and Revenue
        const ordersUnsubscribe = onSnapshot(collection(db, 'orders'), (snapshot: QuerySnapshot<DocumentData>) => {
            let totalRevenue = 0;
            snapshot.docs.forEach(doc => {
                totalRevenue += (doc.data().amountTTC || 0);
            });
            setStats(prev => ({
                ...prev,
                orders: snapshot.size,
                revenue: totalRevenue
            }));
        });

        // 2. Fetch Professionals (Total and Pending)
        const prosQuery = query(collection(db, 'users'), where('role', '==', 'b2b'));
        const prosUnsubscribe = onSnapshot(prosQuery, (snapshot: QuerySnapshot<DocumentData>) => {
            const pendingCount = snapshot.docs.filter(doc => !doc.data().validated).length;
            const pendingList = snapshot.docs
                .filter(doc => !doc.data().validated)
                .map(doc => ({
                    id: doc.id,
                    name: `${doc.data().prenom || ''} ${doc.data().nom || ''}`.trim() || doc.id,
                    company: doc.data().company || doc.data().societe || 'N/A',
                    date: doc.data().createdAt?.toDate?.().toLocaleDateString('fr-FR') || '...',
                    siret: doc.data().siret || 'N/A',
                }))
                .slice(0, 5); // Only show top 5 pending

            setStats(prev => ({
                ...prev,
                professionals: snapshot.size,
                pendingPros: pendingCount
            }));
            setPendingProsList(pendingList);
        });

        // 3. Fetch Products count
        const productsUnsubscribe = onSnapshot(collection(db, 'products'), (snapshot: QuerySnapshot<DocumentData>) => {
            setStats(prev => ({ ...prev, products: snapshot.size }));
        });

        // 4. Recent Orders List
        const recentOrdersQ = query(
            collection(db, 'orders'),
            orderBy('createdAt', 'desc'),
            limit(5)
        );
        const recentOrdersUnsubscribe = onSnapshot(recentOrdersQ, (snapshot: QuerySnapshot<DocumentData>) => {
            const list = snapshot.docs.map(doc => {
                const data = doc.data();
                const isB2B = !!data.userSociete || data.source === 'b2b';
                return {
                    id: doc.id,
                    client: isB2B
                        ? (data.userSociete || `${data.userNom || ''} ${data.userPrenom || ''}`).trim()
                        : (data.shipping?.fullName || 'Client B2C'),
                    amount: `${(data.amountTTC || 0).toLocaleString('fr-FR')} €`,
                    status: data.paymentStatus === 'payee' ? 'Livrée' : 'En cours', // Simplification for dashboard
                    date: data.createdAt?.toDate?.().toLocaleDateString('fr-FR') || '...',
                };
            });
            setRecentOrders(list);
            setLoading(false);
        });

        return () => {
            ordersUnsubscribe();
            prosUnsubscribe();
            productsUnsubscribe();
            recentOrdersUnsubscribe();
        };
    }, []);

    return { stats, recentOrders, pendingProsList, loading };
}
