"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Building, Users, UserCheck, Package, Shield } from "lucide-react";
import { Button } from "@/components/shared-ui";
import { Card } from "@/components/shared-ui";

interface IamMenuItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  description: string;
}

const iamMenuItems: IamMenuItem[] = [
  { 
    icon: Building, 
    label: "Tenants", 
    href: "/iam/tenants",
    description: "Gestión de inquilinos y organizaciones"
  },
  { 
    icon: UserCheck, 
    label: "Roles", 
    href: "/iam/roles",
    description: "Configuración de roles y permisos"
  },
  { 
    icon: Package, 
    label: "Planes", 
    href: "/iam/plans",
    description: "Gestión de planes de suscripción"
  }
];

export default function IamLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const getCurrentPageInfo = () => {
    const currentItem = iamMenuItems.find(item => item.href === pathname);
    return currentItem || { icon: Shield, label: "IAM", description: "Identity & Access Management" };
  };

  const currentPage = getCurrentPageInfo();

  return (
    <div className="space-y-6">
      {/* Breadcrumb / Navigation */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">IAM</h1>
          </div>
          {pathname !== "/iam" && (
            <>
              <span className="text-muted-foreground">/</span>
              <div className="flex items-center space-x-2">
                <currentPage.icon className="h-5 w-5 text-muted-foreground" />
                <span className="text-lg font-medium">{currentPage.label}</span>
              </div>
            </>
          )}
        </div>
        
        {/* Navigation Pills */}
        <div className="flex space-x-2">
          {iamMenuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Button
                key={item.href}
                variant={isActive ? "default" : "outline"}
                size="sm"
                asChild
              >
                <Link href={item.href} className="flex items-center space-x-2">
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Page Content */}
      <div>
        {children}
      </div>
    </div>
  );
} 