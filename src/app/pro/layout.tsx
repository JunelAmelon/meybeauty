'use client';

import { useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import "@/apps/b2b/app/globals.css";
import { Providers } from "@/apps/b2b/app/providers";
import { useAuth } from "@/apps/b2b/context/AuthContext";

function ProGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading } = useAuth();

  const redirectTo = useMemo(() => {
    if (isLoading) return null;
    const isValidationRoute = pathname?.startsWith("/pro/validation");
    if (!user) return "/login";
    if (user.role !== "b2b") return "/";
    if (!user.validated && !isValidationRoute) return "/pro/validation";
    return null;
  }, [isLoading, pathname, user]);

  useEffect(() => {
    if (redirectTo && redirectTo !== pathname) {
      router.replace(redirectTo);
    }
  }, [redirectTo, router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5EDE4] text-gray-700">
        Vérification des accès...
      </div>
    );
  }

  if (redirectTo && redirectTo !== pathname) {
    return null;
  }

  return <>{children}</>;
}

export default function ProLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <ProGate>{children}</ProGate>
    </Providers>
  );
}
