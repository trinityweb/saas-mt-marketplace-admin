"use client"

import { useState, useEffect, memo, useMemo } from "react"
import dynamic from 'next/dynamic'
import Link from "next/link"
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

// Imports optimizados desde shared-ui
import { Button } from "@/components/shared-ui/atoms/button"
import { Badge } from "@/components/shared-ui/atoms/badge"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/shared-ui/molecules/card"
import { PageWrapper, PageContent } from "@/components/shared-ui/templates/page-wrapper"

// Lazy load StatsCard ya que es pesado
const StatsCard = dynamic(
  () => import("@/components/ui/stats-card").then(mod => ({ default: mod.StatsCard })),
  { 
    loading: () => (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }
)

interface DashboardStats {
  totalProducts: number
  totalCategories: number
  totalBrands: number
  totalTenants: number
  loading: boolean
}

// Componente memoizado para Quick Actions
const QuickActionCard = memo(function QuickActionCard({ 
  href, 
  icon: Icon, 
  title, 
  description, 
  color 
}: {
  href: string
  icon: any
  title: string
  description: string
  color: string
}) {
  return (
    <Card className="group hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
      <CardContent>
        <Link href={href} className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="font-medium">{title}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </Link>
      </CardContent>
    </Card>
  )
})

// Componente memoizado para Module Cards
const ModuleCard = memo(function ModuleCard({ 
  icon: Icon, 
  title, 
  description, 
  color, 
  items 
}: {
  icon: any
  title: string
  description: string
  color: string
  items: Array<{ href: string; icon: any; text: string; count?: number }>
}) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item, index) => (
          <Link key={index} href={item.href}>
            <Button className="w-full justify-start" variant="outline" size="sm">
              <item.icon className="w-4 h-4 mr-2" />
              {item.text}
              {item.count !== undefined && (
                <Badge variant="secondary" className="ml-auto">
                  {item.count}
                </Badge>
              )}
            </Button>
          </Link>
        ))}
      </CardContent>
    </Card>
  )
})

export default function MarketplaceAdminPageOptimized() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalCategories: 0,
    totalBrands: 0,
    totalTenants: 12,
    loading: true
  })

  // Fetch datos de forma optimizada
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        // Hacer las peticiones en paralelo
        const [productsResponse, brandsResponse] = await Promise.all([
          fetch('/api/pim/global-catalog?limit=1'),
          fetch('/api/pim/marketplace-brands?limit=1')
        ])

        const productsData = await productsResponse.json()
        const brandsData = brandsResponse.ok ? await brandsResponse.json() : { total: 192 }

        setStats({
          totalProducts: productsData.count || 692,
          totalCategories: 45, // Hardcoded por ahora
          totalBrands: brandsData.total || brandsData.data?.length || 192,
          totalTenants: 12,
          loading: false
        })
      } catch (error) {
        // Usar valores por defecto en caso de error
        setStats({
          totalProducts: 692,
          totalCategories: 45,
          totalBrands: 192,
          totalTenants: 12,
          loading: false
        })
      }
    }

    fetchDashboardStats()
  }, [])

  // Memoizar las quick actions
  const quickActions = useMemo(() => [
    {
      href: "/marketplace-brands/create",
      icon: Plus,
      title: "Nueva Marca",
      description: "Agregar marca al marketplace",
      color: "bg-orange-100 dark:bg-orange-900/20 text-orange-600"
    },
    {
      href: "/iam/tenants/create",
      icon: Plus,
      title: "Nuevo Tenant",
      description: "Registrar nuevo cliente",
      color: "bg-blue-100 dark:bg-blue-900/20 text-blue-600"
    },
    {
      href: "/global-catalog",
      icon: Search,
      title: "Buscar Productos",
      description: "Explorar catálogo global",
      color: "bg-green-100 dark:bg-green-900/20 text-green-600"
    },
    {
      href: "/taxonomy",
      icon: Filter,
      title: "Gestionar Taxonomía",
      description: "Categorías y atributos",
      color: "bg-purple-100 dark:bg-purple-900/20 text-purple-600"
    }
  ], [])

  // Memoizar los módulos
  const modules = useMemo(() => [
    {
      icon: Shield,
      title: "Identity & Access Management",
      description: "Gestiona tenants, roles y permisos",
      color: "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600",
      items: [
        { href: "/iam/tenants", icon: Users, text: "Tenants", count: stats.totalTenants },
        { href: "/iam/roles", icon: UserCheck, text: "Roles y Permisos" },
        { href: "/iam/plans", icon: Crown, text: "Planes y Suscripciones" }
      ]
    },
    {
      icon: Layers,
      title: "Taxonomía Global",
      description: "Categorías y atributos del marketplace",
      color: "bg-purple-100 dark:bg-purple-900/20 text-purple-600",
      items: [
        { href: "/taxonomy", icon: Layers, text: "Gestionar Categorías", count: stats.totalCategories },
        { href: "/attributes", icon: Settings, text: "Configurar Atributos" }
      ]
    },
    {
      icon: Package,
      title: "Catálogo Global",
      description: "Productos y marcas del marketplace",
      color: "bg-green-100 dark:bg-green-900/20 text-green-600",
      items: [
        { href: "/global-catalog", icon: Package, text: "Productos Globales", count: stats.totalProducts },
        { href: "/marketplace-brands", icon: Award, text: "Marcas Marketplace", count: stats.totalBrands },
        { href: "/marketplace-attributes", icon: Sliders, text: "Atributos Marketplace" }
      ]
    }
  ], [stats])

  return (
    <PageWrapper>
      <PageContent>
        {/* Header Section */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Marketplace</h1>
          <p className="text-muted-foreground">
            Panel de administración global del marketplace multi-tenant
          </p>
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
            href="/global-catalog"
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
            {quickActions.map((action, index) => (
              <QuickActionCard key={index} {...action} />
            ))}
          </div>
        </div>

        {/* Main Sections */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-500" />
            <h2 className="text-xl font-semibold">Módulos del Sistema</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module, index) => (
              <ModuleCard key={index} {...module} />
            ))}
          </div>
        </div>
      </PageContent>
    </PageWrapper>
  )
}