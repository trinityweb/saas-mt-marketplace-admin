"use client"

import { useState, useEffect, memo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shared-ui/molecules/card"
import { Button } from "@/components/shared-ui/atoms/button"
import { Badge } from "@/components/shared-ui/atoms/badge"
import dynamic from 'next/dynamic'

// Lazy load StatsCard
const StatsCard = dynamic(() => import("@/components/ui/stats-card").then(mod => ({ default: mod.StatsCard })), {
  loading: () => <Card className="animate-pulse"><CardContent className="h-32" /></Card>
})
import { 
  LayoutDashboard, 
  Settings, 
  Users, 
  ShoppingCart, 
  BarChart3,
  Globe,
  Layers,
  Zap,
  Shield,
  UserCheck,
  Crown,
  Package,
  Sliders,
  TrendingUp,
  Activity,
  Award,
  Plus,
  Eye,
  Edit,
  Search,
  Filter,
  Database,
  Sparkles
} from "lucide-react"
import Link from "next/link"
import { useDashboardOverview } from '@/hooks/use-marketplace-overview'

interface DashboardStats {
  totalProducts: number
  totalCategories: number
  totalBrands: number
  totalTenants: number
  loading: boolean
}

export default function MarketplaceAdminPage() {
  // Usar el hook de overview específico para dashboard
  const { data: overviewData, loading: overviewLoading, error: overviewError, refetch } = useDashboardOverview()

  // Extraer estadísticas del overview data
  const stats: DashboardStats = {
    totalProducts: overviewData?.dashboard?.total_global_products || 0,
    totalCategories: overviewData?.dashboard?.total_categories || 0,
    totalBrands: overviewData?.dashboard?.total_brands || 0,
    totalTenants: overviewData?.dashboard?.active_tenants || 12, // Fallback para demo
    loading: overviewLoading
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Marketplace</h1>
        <p className="text-muted-foreground">
          Panel de administración global del marketplace multi-tenant
        </p>
        
        {/* Error indicator */}
        {overviewError && (
          <div className="rounded-md bg-yellow-50 p-4 border border-yellow-200">
            <div className="flex">
              <div className="flex-shrink-0">
                <TrendingUp className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Datos de overview no disponibles
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Mostrando datos estáticos. {overviewError}</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => refetch()}
                    className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded hover:bg-yellow-200"
                  >
                    Reintentar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsCard
          title="Tenants Activos"
          value={stats.totalTenants}
          description="Clientes con suscripciones activas"
          iconName="Users"
          iconColor="text-blue-600"
          trend={{
            value: 20,
            label: "Crecimiento mensual",
            type: 'up'
          }}
          badge={{
            text: "100% activos",
            variant: 'default'
          }}
          href="/iam/tenants"
          loading={stats.loading}
        />

        <StatsCard
          title="Usuarios Totales"
          value={overviewData?.dashboard?.total_users || "2.4K"}
          description="Usuarios registrados en todos los tenants"
          iconName="Users"
          iconColor="text-indigo-600"
          trend={{
            value: 15,
            label: "Nuevos usuarios este mes",
            type: 'up'
          }}
          progress={{
            value: overviewData?.dashboard?.total_users || 2400,
            max: 5000,
            color: 'blue'
          }}
          href="/iam/users"
          loading={stats.loading}
        />

        <StatsCard
          title="Marcas Globales"
          value={stats.totalBrands}
          description="Marcas verificadas en el marketplace"
          iconName="Award"
          iconColor="text-orange-600"
          trend={{
            value: 8,
            label: "Nuevas marcas este mes",
            type: 'up'
          }}
          progress={{
            value: stats.totalBrands,
            max: 500,
            color: 'yellow'
          }}
          href="/marketplace-brands"
          loading={stats.loading}
        />

        <StatsCard
          title="Catálogo Global"
          value={stats.totalProducts.toLocaleString()}
          description="Productos disponibles en el marketplace"
          iconName="Package"
          iconColor="text-green-600"
          trend={{
            value: 15,
            label: "Nuevos productos esta semana",
            type: 'up'
          }}
          progress={{
            value: stats.totalProducts,
            max: 10000,
            color: 'green'
          }}
          href="/global-catalog"
          loading={stats.loading}
        />

        <StatsCard
          title="Órdenes Procesadas"
          value={overviewData?.dashboard?.total_orders || "18.7K"}
          description="Órdenes totales procesadas este mes"
          iconName="BarChart3"
          iconColor="text-emerald-600"
          trend={{
            value: 22,
            label: "Incremento vs mes anterior",
            type: 'up'
          }}
          badge={{
            text: "Récord mensual",
            variant: 'default'
          }}
          href="/orders"
          loading={stats.loading}
        />

        <StatsCard
          title="Categorías Globales"
          value={stats.totalCategories}
          description="Categorías principales del marketplace"
          iconName="Layers"
          iconColor="text-purple-600"
          trend={{
            value: 5,
            label: "Nuevas categorías este mes",
            type: 'up'
          }}
          progress={{
            value: stats.totalCategories,
            max: 100,
            color: 'purple'
          }}
          href="/taxonomy"
          loading={stats.loading}
        />
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-500" />
          <h2 className="text-xl font-semibold">Acciones Rápidas</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="group hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
            <CardContent>
              <Link href="/marketplace-brands/create" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium">Nueva Marca</p>
                  <p className="text-sm text-muted-foreground">Agregar marca al marketplace</p>
                </div>
              </Link>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
            <CardContent>
              <Link href="/iam/tenants/create" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Nuevo Tenant</p>
                  <p className="text-sm text-muted-foreground">Registrar nuevo cliente</p>
                </div>
              </Link>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
            <CardContent>
              <Link href="/global-catalog" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <Search className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Buscar Productos</p>
                  <p className="text-sm text-muted-foreground">Explorar catálogo global</p>
                </div>
              </Link>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
            <CardContent>
              <Link href="/taxonomy" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                  <Filter className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Gestionar Taxonomía</p>
                  <p className="text-sm text-muted-foreground">Categorías y atributos</p>
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>



      {/* Main Sections */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-500" />
          <h2 className="text-xl font-semibold">Módulos del Sistema</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* IAM Section */}
          <Card className="group hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Identity & Access Management</CardTitle>
                  <CardDescription>Gestiona tenants, roles y permisos</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/iam/tenants">
                <Button className="w-full justify-start" variant="outline" size="sm">
                  <Users className="w-4 h-4 mr-2" />
                  Tenants
                  <Badge variant="secondary" className="ml-auto">
                    {stats.totalTenants}
                  </Badge>
                </Button>
              </Link>
              <Link href="/iam/roles">
                <Button className="w-full justify-start" variant="outline" size="sm">
                  <UserCheck className="w-4 h-4 mr-2" />
                  Roles y Permisos
                </Button>
              </Link>
              <Link href="/iam/plans">
                <Button className="w-full justify-start" variant="outline" size="sm">
                  <Crown className="w-4 h-4 mr-2" />
                  Planes y Suscripciones
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Taxonomía Section */}
          <Card className="group hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                  <Layers className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Taxonomía Global</CardTitle>
                  <CardDescription>Categorías y atributos del marketplace</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/taxonomy">
                <Button className="w-full justify-start" variant="outline" size="sm">
                  <Layers className="w-4 h-4 mr-2" />
                  Gestionar Categorías
                  <Badge variant="secondary" className="ml-auto">
                    {stats.totalCategories}
                  </Badge>
                </Button>
              </Link>
              <Link href="/attributes">
                <Button className="w-full justify-start" variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Configurar Atributos
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Catálogo Global Section */}
          <Card className="group hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <Package className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Catálogo Global</CardTitle>
                  <CardDescription>Productos y marcas del marketplace</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/global-catalog">
                <Button className="w-full justify-start" variant="outline" size="sm">
                  <Package className="w-4 h-4 mr-2" />
                  Productos Globales
                  <Badge variant="secondary" className="ml-auto">
                    {stats.totalProducts}
                  </Badge>
                </Button>
              </Link>
              <Link href="/marketplace-brands">
                <Button className="w-full justify-start" variant="outline" size="sm">
                  <Award className="w-4 h-4 mr-2" />
                  Marcas Marketplace
                  <Badge variant="secondary" className="ml-auto">
                    {stats.totalBrands}
                  </Badge>
                </Button>
              </Link>
              <Link href="/marketplace-attributes">
                <Button className="w-full justify-start" variant="outline" size="sm">
                  <Sliders className="w-4 h-4 mr-2" />
                  Atributos Marketplace
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Quickstart Section */}
          <Card className="group hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Quickstart Dinámico</CardTitle>
                  <CardDescription>Templates de configuración rápida</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/business-types">
                <Button className="w-full justify-start" variant="outline" size="sm">
                  <Users className="w-4 h-4 mr-2" />
                  Tipos de Negocio
                </Button>
              </Link>
              <Link href="/business-type-templates">
                <Button className="w-full justify-start" variant="outline" size="sm">
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Templates Quickstart
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Analytics Section */}
          <Card className="group hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Analytics</CardTitle>
                  <CardDescription>Métricas y estadísticas del marketplace</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline" size="sm">
                <BarChart3 className="w-4 h-4 mr-2" />
                Dashboard Analytics
                <Badge variant="outline" className="ml-auto">
                  Próximamente
                </Badge>
              </Button>
              <Button className="w-full justify-start" variant="outline" size="sm">
                <TrendingUp className="w-4 h-4 mr-2" />
                Reportes Tenants
              </Button>
            </CardContent>
          </Card>

          {/* Configuration Section */}
          <Card className="group hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <Settings className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Configuración</CardTitle>
                  <CardDescription>Configuración global del marketplace</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline" size="sm">
                <Globe className="w-4 h-4 mr-2" />
                Configuración General
              </Button>
              <Button className="w-full justify-start" variant="outline" size="sm">
                <Search className="w-4 h-4 mr-2" />
                Configuración Búsqueda
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
