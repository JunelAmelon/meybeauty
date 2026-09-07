'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Bell, ShoppingCart, User, LogOut, ChevronDown, Menu } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const t = useTranslations('b2b.layout.header');
  const { user, logout } = useAuth();
  const { items } = useCart();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Show number of distinct products (lines), not total quantity
  const cartItemsCount = items.length;

  return (
    <header className="border-b border-[#523A28]/10 px-4 md:px-6 py-3 md:py-4 bg-white">
      <div className="flex items-center justify-between">
        {/* Mobile Menu Button + Welcome */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Mobile Menu Toggle */}
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 text-[#523A28] hover:bg-[#523A28]/10 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Welcome Text */}
          {/* <div className="flex-1 min-w-0 max-w-[180px] sm:max-w-[260px]">
            <h2 className="text-[#523A28] truncate text-xs md:text-sm font-normal leading-tight max-w-full">
              {t('welcome', { name: user?.prenom ?? '' })}
            </h2>
            <p className="text-xs text-[#523A28]/70 truncate hidden sm:block max-w-full">
              {user?.societe || ''}
            </p>
          </div> */}
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {/* Notifications */}
          <button className="relative p-2 text-[#523A28]/80 hover:text-[#523A28] rounded-lg hover:bg-[#523A28]/10 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Cart */}
          <button
            onClick={() => router.push('/pro/panier')}
            className="relative p-2 text-[#523A28]/80 hover:text-[#523A28] rounded-lg hover:bg-[#523A28]/10 transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#523A28] text-white text-xs rounded-full flex items-center justify-center">
                {cartItemsCount}
              </span>
            )}
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 md:gap-3 px-2 md:px-3 py-2 rounded-lg hover:bg-[#523A28]/10 transition-colors"
            >
              <div className="w-8 h-8 bg-[#523A28]/15 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-[#523A28]" />
              </div>
              <div className="text-left hidden md:block">
                <p className="text-sm text-[#523A28]">
                  {user?.prenom} {user?.nom}
                </p>
                <p className="text-xs text-[#523A28]/70">{t('discount', { count: user?.remise || 0 })}</p>
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
                    <p className="text-sm text-gray-900 truncate">{user?.email}</p>
                    <p className="text-xs text-gray-500 mt-1">SIRET: {user?.siret}</p>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    {t('logout')}
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
