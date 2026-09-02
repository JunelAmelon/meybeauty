'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale } from 'next-intl';
import { collection, db, getDocs, query, where } from '@meybeauty/firebase';

type OrderLine = {
  name?: string;
  quantity?: number;
};

type OrderDoc = {
  lines?: OrderLine[];
  createdAt?: string;
  amountHT?: number;
  amountTTC?: number;
  status?: string;
};

type PaymentDoc = {
  amountHT?: number;
  amountTTC?: number;
  createdAt?: string;
};

type NotificationDoc = {
  title?: string;
  description?: string;
  time?: string;
  type?: 'info' | 'warning' | 'success';
};

type ReassortConfigDoc = {
  active?: boolean;
};

type Stats = {
  monthlyOrders: number;
  turnover: number;
  stockCount: number;
  activeRefills: number;
};

export type DashboardOrder = {
  id: string;
  date: string;
  products: string;
  amount: number;
  status: string;
};

export type DashboardNotification = {
  title: string;
  description: string;
  time: string;
  type: 'info' | 'warning' | 'success';
};

export function useProDashboardB2B(userId?: string | null) {
  const locale = useLocale();
  const [stats, setStats] = useState<Stats>({
    monthlyOrders: 0,
    turnover: 0,
    stockCount: 0,
    activeRefills: 0,
  });
  const [recentOrders, setRecentOrders] = useState<DashboardOrder[]>([]);
  const [notifications, setNotifications] = useState<DashboardNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const parseDate = (value?: string) => {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  useEffect(() => {
    let mounted = true;
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!userId) {
          setStats({
            monthlyOrders: 0,
            turnover: 0,
            stockCount: 0,
            activeRefills: 0,
          });
          setRecentOrders([]);
          setNotifications([]);
          return;
        }

        const ordersQ = query(collection(db, 'orders'), where('userId', '==', userId));
        const paymentsQ = query(collection(db, 'payments'), where('userId', '==', userId));

        const [ordersSnap, paymentsSnap, reassortSnap, notificationsSnap] = await Promise.all([
          getDocs(ordersQ),
          getDocs(paymentsQ),
          getDocs(collection(db, 'reassortConfigsB2B')),
          getDocs(query(collection(db, 'notificationsB2B'), where('userId', '==', userId))),
        ]);
        if (!mounted) return;

        const orders = ordersSnap.docs.map((d) => ({ id: d.id, ...(d.data() as OrderDoc) }));
        const payments = paymentsSnap.docs.map((d) => d.data() as PaymentDoc);
        const turnover = payments.reduce((sum, p) => sum + (p.amountHT ?? p.amountTTC ?? 0), 0);
        const monthlyOrders = orders.length;
        const activeRefills = reassortSnap.docs.filter((d) => {
          const data = d.data() as Partial<ReassortConfigDoc>;
          return data.active !== false;
        }).length;
        const stockCount = orders.reduce((sum, o) => sum + (o.lines?.reduce((s, l) => s + (l.quantity ?? 0), 0) ?? 0), 0);

        const mappedOrders: DashboardOrder[] = orders
          .map((o) => {
            const date = parseDate(o.createdAt);
            const lines = o.lines || [];
            const products = lines
              .map((l) => {
                const name = l.name || '';
                const qty = l.quantity ?? 0;
                return qty ? `${name} x${qty}` : name;
              })
              .filter(Boolean)
              .join(', ');
            return {
              id: o.id,
              date: date ? date.toISOString() : '',
              products,
              amount: o.amountHT ?? o.amountTTC ?? 0,
              status: o.status || 'en_cours',
            };
          })
          .sort((a, b) => {
            const ta = parseDate(a.date)?.getTime() ?? 0;
            const tb = parseDate(b.date)?.getTime() ?? 0;
            return tb - ta;
          })
          .slice(0, 5);

        const mappedNotifications: DashboardNotification[] = notificationsSnap.docs.map((d) => {
          const data = d.data() as NotificationDoc;
          return {
            title: data.title || '',
            description: data.description || '',
            time: data.time || '',
            type: data.type || 'info',
          };
        });

        setStats({ monthlyOrders, turnover, stockCount, activeRefills });
        setRecentOrders(mappedOrders);
        setNotifications(mappedNotifications);
      } catch (err: unknown) {
        if (!mounted) return;
        const message = err instanceof Error ? err.message : 'Erreur de chargement du dashboard';
        setError(message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAll();
    return () => {
      mounted = false;
    };
  }, [locale, userId]);

  const formatAmount = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
      }),
    [locale]
  );

  const formatDate = useMemo(
    () =>
      (value: string) => {
        const d = parseDate(value);
        if (!d) return '';
        return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(d);
      },
    [locale]
  );

  return {
    stats,
    recentOrders,
    notifications,
    loading,
    error,
    formatAmount,
    formatDate,
  };
}
