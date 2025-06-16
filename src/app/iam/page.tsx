"use client";

import React from "react";
import Link from "next/link";
import { Building, UserCheck, Package, Users, Shield, Activity, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useHeader } from "@/components/layout/admin-layout";
import { Badge } from "@/components/ui/badge";

export default function IamPage() {
  const { setHeaderProps, clearHeaderProps } = useHeader();

  // Configurar header
  React.useEffect(() => {
    const headerIcon = <Shield className="w-5 h-5 text-white" />
    setHeaderProps({
      title: "Identity & Access Management",
      subtitle: "Panel de control para gestión de identidades y accesos",
      backUrl: "/",
      backLabel: "Volver al Dashboard",
      icon: headerIcon
    });

    return () => {
      clearHeaderProps();
    };
  }, [setHeaderProps, clearHeaderProps]);

  const iamModules = [
    {
      title: "Tenants",
      description: "Gestión de inquilinos y organizaciones",
      icon: Building,
      href: "/iam/tenants",
      stats: {
        count: "12",
        label: "Tenants activos",
        trend: "+2 esta semana"
      }
    },
    {
      title: "Roles",
      description: "Configuración de roles y permisos",
      icon: UserCheck,
      href: "/iam/roles",
      stats: {
        count: "8",
        label: "Roles configurados",
        trend: "+1 este mes"
      }
    },
    {
      title: "Planes",
      description: "Gestión de planes de suscripción",
      icon: Package,
      href: "/iam/plans",
      stats: {
        count: "5",
        label: "Planes disponibles",
        trend: "Estable"
      }
    }
  ];

  const systemStats = [
    {
      title: "Usuarios Totales",
      value: "1,234",
      description: "Usuarios registrados",
      icon: Users,
      trend: "+12%"
    },
    {
      title: "Sesiones Activas",
      value: "89",
      description: "Usuarios conectados",
      icon: Activity,
      trend: "+5%"
    },
    {
      title: "Crecimiento",
      value: "24%",
      description: "Nuevos usuarios este mes",
      icon: TrendingUp,
      trend: "+8%"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <Shield className="h-16 w-16 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Identity & Access Management</h1>
          <p className="text-lg text-muted-foreground mt-2">
            Centro de control para la gestión de identidad, acceso y autenticación
          </p>
        </div>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {systemStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
                <div className="text-xs text-green-600 mt-1">
                  {stat.trend}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* IAM Modules */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Módulos IAM</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {iamModules.map((module) => {
            const Icon = module.icon;
            return (
              <Card key={module.title} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{module.title}</CardTitle>
                      <CardDescription>{module.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">{module.stats.count}</div>
                    <div className="text-sm text-muted-foreground">
                      {module.stats.label}
                    </div>
                    <div className="text-xs text-blue-600">
                      {module.stats.trend}
                    </div>
                  </div>
                  <Button asChild className="w-full">
                    <Link href={module.href}>
                      Gestionar {module.title}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button variant="outline" asChild className="h-auto p-4">
            <Link href="/iam/tenants" className="flex flex-col items-center space-y-2">
              <Building className="h-6 w-6" />
              <span>Crear Tenant</span>
            </Link>
          </Button>
          <Button variant="outline" asChild className="h-auto p-4">
            <Link href="/iam/roles" className="flex flex-col items-center space-y-2">
              <UserCheck className="h-6 w-6" />
              <span>Nuevo Rol</span>
            </Link>
          </Button>
          <Button variant="outline" asChild className="h-auto p-4">
            <Link href="/iam/plans" className="flex flex-col items-center space-y-2">
              <Package className="h-6 w-6" />
              <span>Crear Plan</span>
            </Link>
          </Button>
          <Button variant="outline" asChild className="h-auto p-4">
            <Link href="/iam/tenants" className="flex flex-col items-center space-y-2">
              <Users className="h-6 w-6" />
              <span>Ver Usuarios</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
          <CardDescription>
            Últimas acciones realizadas en el sistema IAM
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-muted-foreground">Hace 2 horas</span>
              <span>Nuevo tenant "Empresa ABC" creado</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-muted-foreground">Hace 5 horas</span>
              <span>Rol "Administrador Marketplace" actualizado</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-muted-foreground">Hace 1 día</span>
              <span>Plan "Premium" modificado</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-muted-foreground">Hace 2 días</span>
              <span>Usuario "admin@ejemplo.com" activado</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 