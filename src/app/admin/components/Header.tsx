'use client';

import { useState } from 'react';
import { Bell, User, LogOut, ChevronDown, Menu, Search } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="border-b border-gray-200 px-6 py-4" style={{ backgroundColor: '#523A28' }}>
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-4 flex-1">
          {/* Mobile Menu Toggle */}
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative p-2 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="text-left hidden md:block">
                <p className="text-sm text-white">Admin</p>
                <p className="text-xs text-white/80">Administrateur</p>
              </div>
              <ChevronDown className="w-4 h-4 text-white/80 hidden sm:block" />
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
                    <p className="text-xs text-gray-500 mt-1">Administrateur système</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      // Add logout logic here
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Déconnexion
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
