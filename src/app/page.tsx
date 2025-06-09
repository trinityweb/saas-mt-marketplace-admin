import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  LayoutDashboard, 
  Settings, 
  Users, 
  ShoppingCart, 
  BarChart3,
  Globe,
  Layers,
  Zap
} from "lucide-react"

export default function MarketplaceAdminPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Marketplace Admin</h1>
                <p className="text-sm text-muted-foreground">Panel de administración marketplace multi-tenant</p>
              </div>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Zap className="w-3 h-3" />
              v1.0.0
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Layers className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Categorías Globales</p>
                  <p className="text-2xl font-semibold">45</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tenants Activos</p>
                  <p className="text-2xl font-semibold">12</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Productos Marketplace</p>
                  <p className="text-2xl font-semibold">1,234</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-secondary" />
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
            {/* Taxonomía Section */}
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Layers className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold">Taxonomía Global</h2>
                </div>
                <p className="text-muted-foreground">
                  Gestiona las categorías y atributos globales del marketplace
                </p>
                <div className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Layers className="w-4 h-4 mr-2" />
                    Gestionar Categorías
                  </Button>
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
                  <Zap className="w-5 h-5 text-secondary" />
                  <h2 className="text-lg font-semibold">Quickstart Dinámico</h2>
                </div>
                <p className="text-muted-foreground">
                  Administra tipos de negocio y templates de configuración
                </p>
                <div className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Users className="w-4 h-4 mr-2" />
                    Tipos de Negocio
                  </Button>
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
                  <BarChart3 className="w-5 h-5 text-primary" />
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
                  <Settings className="w-5 h-5 text-secondary" />
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

          {/* Status Section */}
          <Card className="p-6">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Estado del Sistema</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">API Gateway</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Funcionando correctamente</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">ElasticSearch</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Índices actualizados</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm font-medium">Cache Redis</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Configuración pendiente</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
