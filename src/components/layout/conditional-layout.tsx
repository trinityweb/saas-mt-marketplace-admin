"use client"

import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { AdminLayout } from "./admin-layout";

interface ConditionalLayoutProps {
  children: ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  
  // Detectar si estamos en rutas de autenticación
  const isAuthRoute = pathname.startsWith('/auth');
  
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
  
  // Para todas las demás rutas, usar el AdminLayout normal
  return <AdminLayout>{children}</AdminLayout>;
} 