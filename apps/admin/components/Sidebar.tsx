'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Package,
  Settings,
  FileText,
  BookOpen,
  Sparkles,
  Download,
  X,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();
  const t = useTranslations('admin.sidebar');

  const navItems = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: t('navigation.dashboard') },
    { to: '/admin/professionnels', icon: Users, label: t('navigation.professionals') },
    { to: '/admin/commandes', icon: ShoppingBag, label: t('navigation.orders') },
    { to: '/admin/produits', icon: Package, label: t('navigation.products') },
    { to: '/admin/blog', icon: BookOpen, label: t('navigation.blog') },
    { to: '/admin/rituels', icon: Sparkles, label: t('navigation.rituals') },
    { to: '/admin/protocoles', icon: FileText, label: t('navigation.protocoles') },
    { to: '/admin/telechargements', icon: Download, label: t('navigation.downloads') },
    { to: '/admin/parametres', icon: Settings, label: t('navigation.settings') },
    { to: '/admin/logs', icon: FileText, label: t('navigation.logs') },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 block lg:hidden"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 max-w-[80vw] bg-white border-r border-gray-200 flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          h-full lg:h-auto
        `}
      >
        {/* Header with Logo */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-[#523A28]">
          <div className="flex-1 flex items-center justify-center">
            <Image
              src="/b2b/images/logo-mey-beauty.png"
              alt="Mey Beauty Admin"
              width={110}
              height={36}
              className="object-contain brightness-0 invert"
            />
          </div>
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors absolute right-4"
            aria-label={t('closeMenu')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.to || pathname?.startsWith(item.to + '/');
            return (
              <Link
                key={item.to}
                href={item.to}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                    ? 'bg-[#523A28] text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                  }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm md:text-base truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Admin Badge */}
        <div className="p-4 border-t border-gray-200">
          <div className="rounded-lg p-4" style={{ backgroundColor: '#F5EDE4' }}>
            <p className="text-xs text-gray-600 mb-1">{t('adminMode')}</p>
            <p className="text-xs font-semibold" style={{ color: '#523A28' }}>
              {t('fullAccess')}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
