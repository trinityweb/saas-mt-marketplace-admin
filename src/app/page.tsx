import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
  Crown
} from "lucide-react"
import Link from "next/link"

export default function MarketplaceAdminPage() {
  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center">
              <Layers className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Categorías Globales</p>
              <p className="text-2xl font-semibold">45</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tenants Activos</p>
              <p className="text-2xl font-semibold">12</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Productos Marketplace</p>
              <p className="text-2xl font-semibold">1,234</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/50 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Búsquedas/día</p>
              <p className="text-2xl font-semibold">5,678</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* IAM Section */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-semibold">Identity & Access Management</h2>
            </div>
            <p className="text-muted-foreground">
              Gestiona tenants, roles, permisos y planes de suscripción
            </p>
            <div className="space-y-3">
              <Link href="/iam/tenants">
                <Button className="w-full justify-start" variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Tenants
                </Button>
              </Link>
              <Link href="/iam/roles">
                <Button className="w-full justify-start" variant="outline">
                  <UserCheck className="w-4 h-4 mr-2" />
                  Roles y Permisos
                </Button>
              </Link>
              <Link href="/iam/plans">
                <Button className="w-full justify-start" variant="outline">
                  <Crown className="w-4 h-4 mr-2" />
                  Planes y Suscripciones
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Taxonomía Section */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Layers className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold">Taxonomía Global</h2>
            </div>
            <p className="text-muted-foreground">
              Gestiona las categorías y atributos globales del marketplace
            </p>
            <div className="space-y-3">
              <Link href="/taxonomy">
                <Button className="w-full justify-start" variant="outline">
                  <Layers className="w-4 h-4 mr-2" />
                  Gestionar Categorías
                </Button>
              </Link>
              <Button className="w-full justify-start" variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Configurar Atributos
              </Button>
            </div>
          </div>
        </Card>

        {/* Quickstart Section */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-yellow-600" />
              <h2 className="text-lg font-semibold">Quickstart Dinámico</h2>
            </div>
            <p className="text-muted-foreground">
              Administra tipos de negocio y templates de configuración
            </p>
            <div className="space-y-3">
              <Link href="/business-types">
                <Button className="w-full justify-start" variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Tipos de Negocio
                </Button>
              </Link>
              <Button className="w-full justify-start" variant="outline">
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Templates Quickstart
              </Button>
            </div>
          </div>
        </Card>

        {/* Analytics Section */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold">Analytics</h2>
            </div>
            <p className="text-muted-foreground">
              Métricas y estadísticas del marketplace
            </p>
            <div className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <BarChart3 className="w-4 h-4 mr-2" />
                Dashboard Analytics
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Users className="w-4 h-4 mr-2" />
                Reportes Tenants
              </Button>
            </div>
          </div>
        </Card>

        {/* Configuration Section */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold">Configuración</h2>
            </div>
            <p className="text-muted-foreground">
              Configuración global del marketplace
            </p>
            <div className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Globe className="w-4 h-4 mr-2" />
                Configuración General
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Configuración Búsqueda
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
