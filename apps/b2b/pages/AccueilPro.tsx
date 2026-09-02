'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useTranslations } from 'next-intl';
import {
  Package,
  TrendingUp,
  ShoppingCart,
  RotateCcw,
  Download,
  FileText,
  Bell,
  ArrowRight,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { useProDashboardB2B } from '../hooks/useProDashboardB2B';

export default function AccueilPro() {
  const { user } = useAuth();
  const t = useTranslations('b2b.accueil');
  const {
    stats,
    recentOrders,
    notifications,
    error,
    formatAmount,
    formatDate,
  } = useProDashboardB2B(user?.id);

  const quickActions = [
    {
      title: t('actions.catalogue'),
      description: t('actions.catalogue_desc'),
      icon: Package,
      link: '/pro/catalogue',
      color: '#523A28',
    },
    {
      title: t('actions.quick_order'),
      description: t('actions.quick_order_desc'),
      icon: ShoppingCart,
      link: '/pro/commande-rapide',
      color: '#523A28',
    },
    {
      title: t('actions.protocols'),
      description: t('actions.protocols_desc'),
      icon: FileText,
      link: '/pro/protocoles',
      color: '#523A28',
    },
    {
      title: t('actions.downloads'),
      description: t('actions.downloads_desc'),
      icon: Download,
      link: '/pro/telechargements',
      color: '#523A28',
    },
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
        <h1 className="text-gray-900 mb-2 text-xl md:text-2xl">
          {t('welcome')}{' '}
          {[user?.prenom, user?.nom].filter(Boolean).join(' ') || user?.email || ''}
        </h1>
        <p className="text-sm md:text-base text-gray-600">
          {user?.societe} • {t('pro_discount')}: {user?.remise}% • {t('siret')}: {user?.siret}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {stats &&
          [
            {
              label: t('stats.monthly_orders'),
              value: stats.monthlyOrders.toString(),
              change: '',
              icon: ShoppingCart,
            },
            {
              label: t('stats.turnover'),
              value: formatAmount.format(stats.turnover),
              change: '',
              icon: TrendingUp,
            },
            {
              label: t('stats.stock'),
              value: stats.stockCount.toString(),
              change: '',
              icon: Package,
            },
            {
              label: t('stats.active_refills'),
              value: stats.activeRefills.toString(),
              change: t('stats.active'),
              icon: RotateCcw,
            },
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <div className="p-2 md:p-3 rounded-lg" style={{ backgroundColor: '#523A28' }}>
                  <stat.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                {stat.change && <span className="text-xs md:text-sm text-green-600">{stat.change}</span>}
              </div>
              <p className="text-xs md:text-sm text-gray-600 mb-1">{stat.label}</p>
              <p className="text-xl md:text-2xl text-gray-900">{stat.value}</p>
            </div>
          ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-gray-900 mb-4">{t('quick_access')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  href={action.link}
                  className="bg-white rounded-xl p-6 border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all group"
                >
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: action.color }}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-gray-900 mb-1 transition-colors" style={{ '--hover-color': '#523A28' } as React.CSSProperties} onMouseEnter={(e) => e.currentTarget.style.color = '#523A28'} onMouseLeave={(e) => e.currentTarget.style.color = ''}>
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                  <div className="flex items-center gap-2 mt-3 text-sm group-hover:gap-3 transition-all" style={{ color: '#523A28' }}>
                    {t('actions.access')}
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Orders */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-gray-900 text-lg md:text-xl">{t('recent_orders.title')}</h2>
              <Link href="/factures" className="text-xs md:text-sm hover:underline" style={{ color: '#523A28' }}>
                {t('recent_orders.view_all')}
              </Link>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 md:px-6 py-3 text-left text-xs text-gray-600">{t('recent_orders.col_id')}</th>
                      <th className="px-4 md:px-6 py-3 text-left text-xs text-gray-600">{t('recent_orders.col_date')}</th>
                      <th className="px-4 md:px-6 py-3 text-left text-xs text-gray-600 hidden sm:table-cell">{t('recent_orders.col_products')}</th>
                      <th className="px-4 md:px-6 py-3 text-left text-xs text-gray-600">{t('recent_orders.col_amount')}</th>
                      <th className="px-4 md:px-6 py-3 text-left text-xs text-gray-600">{t('recent_orders.col_status')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-4 md:px-6 py-4 text-sm text-gray-900">{order.id}</td>
                        <td className="px-4 md:px-6 py-4 text-xs md:text-sm text-gray-600">{formatDate(order.date)}</td>
                        <td className="px-4 md:px-6 py-4 text-sm text-gray-600 max-w-xs truncate hidden sm:table-cell">
                          {order.products}
                        </td>
                        <td className="px-4 md:px-6 py-4 text-sm text-gray-900">{formatAmount.format(order.amount)}</td>
                        <td className="px-4 md:px-6 py-4">
                          {order.status === 'livree' ? (
                            <span className="inline-flex items-center gap-1 px-2 md:px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                              <CheckCircle2 className="w-3 h-3" />
                              <span className="hidden sm:inline">{t('recent_orders.status_delivered')}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 md:px-3 py-1 bg-[#523A28]/10 text-[#523A28] rounded-full text-xs">
                              <Clock className="w-3 h-3" />
                              <span className="hidden sm:inline">{t('recent_orders.status_processing')}</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Notifications & Reassort */}
        <div className="space-y-6">
          {/* Notifications */}
          <div>
            <h2 className="text-gray-900 mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5" />
              {t('notifications.title')}
            </h2>
            <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-200">
              {notifications.map((notif, index) => (
                <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${notif.type === 'warning'
                        ? 'bg-yellow-500'
                        : notif.type === 'success'
                          ? 'bg-green-500'
                          : 'bg-[#F5EDE4]0'
                        }`}
                    ></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 mb-1">{notif.title}</p>
                      <p className="text-xs text-gray-600 mb-1">{notif.description}</p>
                      <p className="text-xs text-gray-400">{notif.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reassort Widget */}
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#523A28' }}>
                <RotateCcw className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-gray-900">{t('reassort.title')}</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              {t('reassort.desc', { count: 4 })}
            </p>
            <Link
              href="/reassort"
              className="w-full px-4 py-2 bg-white rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center justify-center gap-2"
              style={{ color: '#523A28' }}
            >
              {t('reassort.manage')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Downloads Widget */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#523A28' }}>
                <Download className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-gray-900">{t('downloads_widget.title')}</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              {t('downloads_widget.desc')}
            </p>
            <Link
              href="/telechargements"
              className="w-full px-4 py-2 bg-white rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center justify-center gap-2"
              style={{ color: '#523A28' }}
            >
              {t('downloads_widget.library')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
