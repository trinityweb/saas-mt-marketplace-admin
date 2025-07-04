"use client"

import { usePathname } from "next/navigation";
import { ReactNode, useMemo } from "react";
import dynamic from 'next/dynamic';
import { Loading } from "@/components/shared-ui/atoms/loading";

// Lazy load AdminLayout solo cuando se necesita
const AdminLayout = dynamic(
  () => import("./admin-layout-optimized").then(mod => ({ default: mod.AdminLayoutOptimized })),
  { 
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    ),
    ssr: true // Mantener SSR para el layout principal
  }
);

interface ConditionalLayoutProps {
  children: ReactNode;
}

export function ConditionalLayoutOptimized({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  
  // Memoizar el cálculo de la ruta
  const isAuthRoute = useMemo(() => pathname.startsWith('/auth'), [pathname]);
  
  // Si es una ruta de auth, usar layout sin header/sidebar
  if (isAuthRoute) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="w-full max-w-md px-6">
          {children}
        </div>
      </div>
    );
  }
  
  // Para todas las demás rutas, usar el AdminLayout optimizado
  return <AdminLayout>{children}</AdminLayout>;
}