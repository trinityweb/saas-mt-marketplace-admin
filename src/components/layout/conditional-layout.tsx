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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <div className="w-full max-w-md px-6">
          {children}
        </div>
      </div>
    );
  }
  
  // Para todas las demás rutas, usar el AdminLayout normal
  return <AdminLayout>{children}</AdminLayout>;
} 