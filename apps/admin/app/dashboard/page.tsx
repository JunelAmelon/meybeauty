'use client';

import Link from 'next/link';
import { Users, ShoppingBag, Package, TrendingUp, ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
import { useAdminDashboard } from '@/apps/admin/hooks/useAdminDashboard';
import { useAdminUsers } from '@/apps/admin/hooks/useAdminUsers';
import { useTranslations } from 'next-intl';

export default function Dashboard() {
  const { stats, recentOrders, pendingProsList, loading } = useAdminDashboard();
  const { validateUser } = useAdminUsers();
  const t = useTranslations('admin.dashboard');

  const handleValidate = async (id: string, name: string) => {
    if (confirm(t('confirmValidation', { name }))) {
      try {
        await validateUser(id);
      } catch {
        alert(t('validationError'));
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#523A28] animate-spin" />
      </div>
    );
  }

  const statCards = [
    {
      title: t('stats.professionals'),
      value: stats.professionals.toString(),
      change: stats.pendingPros > 0 ? t('stats.pending', { count: stats.pendingPros }) : t('stats.upToDate'),
      trend: stats.pendingPros > 0 ? 'down' : 'up',
      icon: Users,
      color: 'bg-[#523A28]',
    },
    {
      title: t('stats.orders'),
      value: stats.orders.toString(),
      change: '+100%', // Temporary placeholder
      trend: 'up',
      icon: ShoppingBag,
      color: 'bg-green-500',
    },
    {
      title: t('stats.products'),
      value: stats.products.toString(),
      change: t('stats.catalog'),
      trend: 'up',
      icon: Package,
      color: 'bg-purple-500',
    },
    {
      title: t('stats.revenue'),
      value: `${stats.revenue.toLocaleString('fr-FR')} €`,
      change: t('stats.total'),
      trend: 'up',
      icon: TrendingUp,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl text-gray-900 mb-2 font-bold">{t('title')}</h1>
        <p className="text-gray-600">{t('subtitle')}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.title} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center shadow-inner`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold uppercase tracking-wider ${stat.trend === 'up' ? 'text-green-600' : 'text-orange-600'
                }`}>
                {stat.trend === 'up' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                {stat.change}
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1 leading-none">{stat.value}</h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-tight">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">{t('recentOrders.title')}</h2>
            <Link href="/admin/commandes" className="text-xs font-bold text-[#523A28] hover:underline uppercase tracking-wider">
              {t('recentOrders.viewAll')}
            </Link>
          </div>
          <div className="space-y-3">
            {recentOrders.length === 0 ? (
              <p className="text-center py-8 text-gray-400 text-sm italic">{t('recentOrders.noOrders')}</p>
            ) : (
              recentOrders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200">
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 leading-tight">#CMD-{order.id.substring(0, 4).toUpperCase()}</p>
                    <p className="text-xs text-gray-500 font-medium">{order.client}</p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <p className="font-bold text-gray-900">{order.amount}</p>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${order.status === 'Livrée' ? 'bg-green-100 text-green-700 border border-green-200' :
                      order.status === 'En cours' ? 'bg-[#523A28]/10 text-[#523A28] border border-[#523A28]/20' :
                        'bg-yellow-100 text-yellow-700 border border-yellow-200'
                      }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending Professionals */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">{t('pendingValidations.title')}</h2>
            <Link href="/admin/professionnels" className="text-xs font-bold text-[#523A28] hover:underline uppercase tracking-wider">
              {t('pendingValidations.manage', { count: stats.pendingPros })}
            </Link>
          </div>
          <div className="space-y-4">
            {pendingProsList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                <Users className="w-16 h-16 mb-4 opacity-30" />
                <p className="text-base font-semibold">Aucune demande en attente</p>
              </div>
            ) : (
              pendingProsList.slice(0, 5).map((pro) => (
                <div key={pro.id} className="p-4 bg-gray-50 rounded-xl border border-transparent hover:border-gray-200 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-gray-900 leading-tight">{pro.name}</p>
                      <p className="text-xs text-gray-500 font-medium">{pro.company}</p>
                    </div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase">{pro.date}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-[10px] text-gray-400 font-mono">{t('pendingValidations.siret', { siret: pro.siret })}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleValidate(pro.id, pro.name)}
                        className="px-3 py-1.5 bg-[#523A28] text-white text-[10px] font-bold uppercase rounded-lg hover:bg-[#3A2819] transition-colors shadow-sm"
                      >
                        {t('pendingValidations.validate')}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
