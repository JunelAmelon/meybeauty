'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Mail, Calendar, TrendingUp, Package, Loader2 } from 'lucide-react';
import { useAdminUsers, useAdminUserDetail } from '@/apps/admin/hooks/useAdminUsers';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/apps/admin/components/ui/dialog';
import { Input } from '@/apps/admin/components/ui/input';
import { Label } from '@/apps/admin/components/ui/label';
import { Button } from '@/apps/admin/components/ui/button';

export default function ProfessionnelDetail() {
  const params = useParams();
  const id = params.id as string;

  const { user, orders, stats, loading, error } = useAdminUserDetail(id);
  const { validateUser, suspendUser, reactivateUser, updateUserRemise } = useAdminUsers();
  const t = useTranslations('admin.professionalDetail');

  const [modalOpen, setModalOpen] = useState(false);
  const [tempRemise, setTempRemise] = useState<string>('0');
  const [isUpdating, setIsUpdating] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#523A28] animate-spin" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-xl border border-red-200">
        {t('error', { error: error || t('userNotFound') })}
      </div>
    );
  }

  const handleModifyDiscount = () => {
    setTempRemise((user.remise || 0).toString());
    setModalOpen(true);
  };

  const confirmModifyDiscount = async () => {
    const newRemise = parseFloat(tempRemise);
    if (!isNaN(newRemise) && newRemise >= 0 && newRemise <= 100) {
      setIsUpdating(true);
      try {
        await updateUserRemise(user.id, newRemise);
        setModalOpen(false);
      } catch {
        alert('Erreur lors de la modification de la remise');
      } finally {
        setIsUpdating(false);
      }
    } else {
      alert('Veuillez entrer un nombre valide entre 0 et 100');
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href="/admin/professionnels"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('backToList')}
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{user.name}</h1>
            <p className="text-gray-600">{user.company}</p>
          </div>
          <span
            className={`px-3 py-1 text-sm rounded-full ${user.status === 'Validé'
              ? 'bg-green-100 text-green-700'
              : user.status === 'En attente'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-red-100 text-red-700'
              }`}
          >
            {user.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 text-gray-600 text-sm">
            <Mail className="w-5 h-5" />
            <span>{user.email}</span>
          </div>
          <div className="flex items-center gap-3 text-gray-600 text-sm">
            <Calendar className="w-5 h-5" />
            <span>{t('memberSince', { date: user.createdAt })}</span>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-1">{t('siret')}</p>
          <p className="font-medium text-gray-900">{user.siret}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#523A28]/10 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-[#523A28]" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{stats.totalOrders}</p>
          <p className="text-sm text-gray-600">{t('stats.totalOrders')}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{stats.totalSpent.toLocaleString('fr-FR')} €</p>
          <p className="text-sm text-gray-600">{t('stats.totalSpent')}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{stats.avgOrderValue.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €</p>
          <p className="text-sm text-gray-600">{t('stats.avgOrderValue')}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{user.remise}%</p>
          <p className="text-sm text-gray-600">{t('stats.discountGranted')}</p>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('recentOrders.title')}</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">{t('recentOrders.orderNumber')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">{t('recentOrders.date')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">{t('recentOrders.items')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">{t('recentOrders.amount')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">{t('recentOrders.status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500 text-sm">
                    {t('recentOrders.noOrders')}
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const lines = (order.lines as { quantity: number }[]) || [];
                  const totalQuantity = lines.reduce((acc, line) => acc + (line.quantity || 0), 0) || 0;
                  const uniqueProducts = lines.length || 0;

                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">#{order.id}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{order.date}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {totalQuantity} ({uniqueProducts} {uniqueProducts > 1 ? t('recentOrders.products') : t('recentOrders.product')})
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{order.amountTTC || 0} €</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${order.paymentStatus === 'payee'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                          }`}>
                          {order.paymentStatus || t('recentOrders.pending')}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('actions.title')}</h2>
        <div className="flex flex-wrap gap-3">
          {user.status === 'En attente' && (
            <button
              onClick={() => validateUser(user.id)}
              className="px-4 py-2 bg-[#523A28] text-white rounded-lg hover:bg-[#3A2819] transition-colors"
            >
              {t('actions.validateAccount')}
            </button>
          )}
          <button
            onClick={handleModifyDiscount}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {t('actions.modifyDiscount')}
          </button>
          <button
            onClick={() => {
              if (user.status === 'Suspendu') {
                reactivateUser(user.id);
              } else {
                suspendUser(user.id);
              }
            }}
            className={`px-4 py-2 rounded-lg transition-colors ${user.status === 'Suspendu'
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
              }`}
          >
            {user.status === 'Suspendu' ? t('actions.reactivateAccount') : t('actions.suspendAccount')}
          </button>
        </div>
      </div>

      {/* Discount Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('actions.modifyDiscount')}</DialogTitle>
            <DialogDescription>
              {user?.name} ({user?.company})
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="remise">
                {t('stats.discountGranted')}
              </Label>
              <div className="relative">
                <Input
                  id="remise"
                  type="number"
                  min="0"
                  max="100"
                  value={tempRemise}
                  onChange={(e) => setTempRemise(e.target.value)}
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">%</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={isUpdating}>
              {t('actions.cancel') || 'Annuler'}
            </Button>
            <Button onClick={confirmModifyDiscount} disabled={isUpdating}>
              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : (t('actions.save') || 'Enregistrer')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
