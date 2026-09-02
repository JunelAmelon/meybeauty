'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/apps/admin/hooks/useAdminAuth';
import { Loader2 } from 'lucide-react';

interface AdminGuardProps {
    children: ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
    const { user, loading } = useAdminAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            // Redirect to login if not authenticated or not an admin
            // We encode the current path as a redirect parameter if needed
            router.push('/login?redirect=/admin');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F5EDE4]">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 text-[#523A28] animate-spin mx-auto" />
                    <p className="text-gray-600 font-medium">Vérification des accès...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        // This part might be momentarily visible before the useEffect redirect kicks in
        return null;
    }

    return <>{children}</>;
}
