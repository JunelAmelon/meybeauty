'use client';

import { useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Bell, User, LogOut, ChevronDown, Menu, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { logout } from '@meybeauty/firebase';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('admin.header');

  const notifications = [
    { id: 1, title: 'Nouvelle commande', message: 'Commande #MEY-2025-001 reçue', time: 'Il y a 5 min', type: 'order' },
    { id: 2, title: 'Nouveau professionnel', message: 'Inscription de Spa Lumière en attente de validation', time: 'Il y a 1h', type: 'registration' },
    { id: 3, title: 'Stock faible', message: 'Huile de jojoba : 3 unités restantes', time: 'Il y a 3h', type: 'stock' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchValue.trim();
    if (!trimmed) return;
    if (pathname.startsWith('/admin/professionnels')) {
      router.push(`/admin/professionnels?q=${encodeURIComponent(trimmed)}`);
    } else if (pathname.startsWith('/admin/commandes')) {
      router.push(`/admin/commandes?q=${encodeURIComponent(trimmed)}`);
    } else if (pathname.startsWith('/admin/produits')) {
      router.push(`/admin/produits?q=${encodeURIComponent(trimmed)}`);
    } else if (pathname.startsWith('/admin/logs')) {
      router.push(`/admin/logs?q=${encodeURIComponent(trimmed)}`);
    } else {
      router.push(`/admin/professionnels?q=${encodeURIComponent(trimmed)}`);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="border-b border-[#523A28]/10 px-6 py-4 bg-white">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-4 flex-1">
          {/* Mobile Menu Toggle */}
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 text-[#523A28] hover:bg-[#523A28]/10 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#523A28]/50 pointer-events-none" />
              <input
                ref={searchRef}
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder={t('search')}
                className="w-full pl-10 pr-4 py-2 bg-[#523A28]/5 border border-[#523A28]/20 rounded-lg text-[#523A28] placeholder-[#523A28]/50 focus:outline-none focus:ring-2 focus:ring-[#523A28]/30 focus:bg-[#523A28]/10 text-sm"
              />
            </form>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-[#523A28]/80 hover:text-[#523A28] rounded-lg hover:bg-[#523A28]/10 transition-colors"
            >
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>

            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotifications(false)}
                ></div>
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 max-h-96 overflow-y-auto">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">Notifications</p>
                    <p className="text-xs text-gray-500 mt-1">{notifications.length} non lues</p>
                  </div>
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className="px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 cursor-pointer"
                      onClick={() => setShowNotifications(false)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                          notif.type === 'order' ? 'bg-green-500' :
                          notif.type === 'registration' ? 'bg-blue-500' :
                          'bg-orange-500'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                          <p className="text-xs text-gray-600 mt-0.5">{notif.message}</p>
                          <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="px-4 py-2 border-t border-gray-100">
                    <button className="text-xs text-[#523A28] hover:opacity-70 transition-opacity">
                      Marquer tout comme lu
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#523A28]/10 transition-colors"
            >
              <div className="w-8 h-8 bg-[#523A28]/15 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-[#523A28]" />
              </div>
              <div className="text-left hidden md:block">
                <p className="text-sm text-[#523A28]">{t('admin')}</p>
                <p className="text-xs text-[#523A28]/70">{t('administrator')}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-[#523A28]/70 hidden sm:block" />
            </button>

            {showUserMenu && (
              <>
                {/* Backdrop for mobile */}
                <div
                  className="fixed inset-0 z-40 lg:hidden"
                  onClick={() => setShowUserMenu(false)}
                ></div>

                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm text-gray-900">admin@meybeauty.fr</p>
                    <p className="text-xs text-gray-500 mt-1">{t('systemAdministrator')}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-60"
                  >
                    <LogOut className="w-4 h-4" />
                    {isLoggingOut ? '...' : t('logout')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
