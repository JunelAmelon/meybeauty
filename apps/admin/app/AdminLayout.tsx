'use client';

import { useState, ReactNode } from 'react';
import Sidebar from '@/apps/admin/components/Sidebar';
import Header from '@/apps/admin/components/Header';
import AdminGuard from '@/apps/admin/components/AdminGuard';

export default function AdminLayout({ children }: { children: ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setIsSidebarOpen((open) => !open);
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };

    return (
        <AdminGuard>
            <div className="flex min-h-screen bg-[#F5EDE4]">
                <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
                <div className="flex-1 flex flex-col overflow-hidden w-full">
                    <Header onToggleSidebar={toggleSidebar} />
                    <main className="flex-1 overflow-y-auto p-6 max-w-full">
                        {children}
                    </main>
                </div>
            </div>
        </AdminGuard>
    );
}
