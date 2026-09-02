'use client';

import { addDoc, collection, db, doc, runTransaction } from '@meybeauty/firebase';
import { serverTimestamp } from 'firebase/firestore';
import { useCallback } from 'react';

type CheckoutLine = {
  name: string;
  quantity: number;
  price: number;
  slug?: string;
};

type Totals = {
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
};

type ShippingInfo = {
  address?: string | null;
  city?: string | null;
  postalCode?: string | null;
  phone?: string | null;
  deliveryType?: string | null;
  fullName?: string | null;
};

type CreateOrderAndPaymentParams = {
  userId?: string | null;
  lines: CheckoutLine[];
  totals: Totals;
  paymentProvider: 'paypal' | 'card';
  paymentId?: string | null;
  status?: 'payee' | 'en_attente' | 'retard';
  shipping?: ShippingInfo;
};

export function useCheckout() {
  const createOrderAndPayment = useCallback(
    async ({ userId = null, lines, totals, paymentProvider, paymentId = null, status = 'payee', shipping }: CreateOrderAndPaymentParams) => {
      // Vérifier stock et décrémenter via transaction
      await runTransaction(db, async (trx) => {
        // Lire tous les stocks avant toute écriture (contrainte Firestore transactions).
        const stockSnapshots = await Promise.all(
          lines.map(async (l) => {
            if (!l.slug) return null;
            const ref = doc(db, 'products', l.slug);
            const snap = await trx.get(ref);
            return { line: l, ref, snap };
          })
        );

        // Validation stocks
        for (const entry of stockSnapshots) {
          if (!entry || !entry.snap.exists()) continue;
          const data = entry.snap.data() as { stock?: number };
          if (typeof data.stock === 'number' && data.stock < entry.line.quantity) {
            throw new Error(`Stock insuffisant pour ${entry.line.slug}`);
          }
        }

        // Ecritures après validation
        for (const entry of stockSnapshots) {
          if (!entry || !entry.snap.exists()) continue;
          const data = entry.snap.data() as { stock?: number };
          if (typeof data.stock === 'number') {
            trx.update(entry.ref, { stock: data.stock - entry.line.quantity });
          }
        }
      });

      const orderDoc = await addDoc(collection(db, 'orders'), {
        userId,
        createdAt: serverTimestamp(),
        lines: lines.map((l) => ({
          name: l.name,
          quantity: l.quantity,
          slug: l.slug,
          price: l.price,
        })),
        amountHT: totals.subtotal,
        amountTTC: totals.total,
        currency: totals.currency,
        paymentStatus: status,
        paymentProvider,
        paymentId,
        shipping: shipping ?? null,
      });

      await addDoc(collection(db, 'payments'), {
        orderId: orderDoc.id,
        amountHT: totals.subtotal,
        amountTTC: totals.total,
        tax: totals.tax,
        currency: totals.currency,
        paymentProvider,
        paymentId,
        status,
        userId,
        shipping: shipping ?? null,
      });

      return orderDoc.id;
    },
    []
  );

  return { createOrderAndPayment };
}
