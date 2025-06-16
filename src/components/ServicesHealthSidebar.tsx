'use client'

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Database,
  Globe,
  MessageSquare,
  Package,
  RefreshCw,
  Server,
  Shield,
  TrendingUp,
  Warehouse,
  HelpCircle,
  Monitor,
  Code,
  Layers,
  ChevronDown,
  ChevronRight
} from "lucide-react"
import { useServicesHealth, ServiceHealth } from "@/hooks/useServicesHealth"
import { cn } from "@/lib/utils"

const getServiceIcon = (serviceName: string) => {
  switch (serviceName) {
    case 'IAM Service':
      return Shield
    case 'Chat Service':
      return MessageSquare
    case 'PIM Service':
      return Package
    case 'Stock Service':
      return Warehouse
    case 'API Gateway':
      return Globe
    case 'PostgreSQL':
      return Database
    case 'MongoDB':
      return Database
    case 'Prometheus':
      return TrendingUp
    case 'Grafana':
      return Activity
    case 'Backoffice Admin':
      return Monitor
    case 'Marketplace Admin':
      return Monitor
    default:
      return Server
  }
}

const getServiceCategory = (serviceName: string): 'infrastructure' | 'backend' | 'frontend' => {
  switch (serviceName) {
    case 'PostgreSQL':
    case 'MongoDB':
    case 'Prometheus':
    case 'Grafana':
    case 'API Gateway':
      return 'infrastructure'
    case 'IAM Service':
    case 'Chat Service':
    case 'PIM Service':
    case 'Stock Service':
      return 'backend'
    case 'Backoffice Admin':
    case 'Marketplace Admin':
    case 'Marketplace App':
    case 'Admin Dashboard':
      return 'frontend'
    default:
      return 'backend' // Por defecto backend en lugar de frontend
  }
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'infrastructure':
      return Server
    case 'backend':
      return Code
    case 'frontend':
      return Monitor
    default:
      return Layers
  }
}

const getCategoryLabel = (category: string) => {
  switch (category) {
    case 'infrastructure':
      return 'Infraestructura'
    case 'backend':
      return 'Backend'
    case 'frontend':
      return 'Frontend'
    default:
      return 'Otros'
  }
}

const getStatusColor = (status: ServiceHealth['status']) => {
  switch (status) {
    case 'healthy':
      return 'text-green-500'
    case 'unhealthy':
      return 'text-red-500'
    case 'unknown':
      return 'text-gray-400'
    default:
      return 'text-gray-400'
  }
}

const getStatusIcon = (status: ServiceHealth['status']) => {
  switch (status) {
    case 'healthy':
      return CheckCircle
    case 'unhealthy':
      return AlertCircle
    case 'unknown':
      return HelpCircle
    default:
      return HelpCircle
  }
}

const getOverallStatusBadge = (status: 'healthy' | 'degraded' | 'down' | 'unknown') => {
  switch (status) {
    case 'healthy':
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">🟢 Todos los servicios operativos</Badge>
    case 'degraded':
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">🟡 Algunos servicios con problemas</Badge>
    case 'down':
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">🔴 Servicios críticos caídos</Badge>
    default:
      return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">⚪ Estado desconocido</Badge>
  }
}

interface ServicesHealthSidebarProps {
  className?: string
}

export function ServicesHealthSidebar({ className }: ServicesHealthSidebarProps) {
  const { services, overallStatus, lastUpdate, isLoading, refresh } = useServicesHealth()
  // Estado para controlar qué categorías están expandidas (por defecto todas)
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    infrastructure: true,
    backend: true,
    frontend: true
  })

  const formatLastUpdate = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSeconds = Math.floor(diffMs / 1000)
    const diffMinutes = Math.floor(diffSeconds / 60)

    if (diffSeconds < 60) {
      return `hace ${diffSeconds}s`
    } else if (diffMinutes < 60) {
      return `hace ${diffMinutes}m`
    } else {
      return date.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }
  }

  // Agrupar servicios por categoría
  const groupedServices = services.reduce((acc, service) => {
    const category = getServiceCategory(service.name)
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(service)
    return acc
  }, {} as Record<string, ServiceHealth[]>)

  const categories = ['infrastructure', 'backend', 'frontend'] as const

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }))
  }

  return (
    <Card className={cn("w-80 h-full flex flex-col", className)}>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">Estado del Sistema</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={refresh}
            disabled={isLoading}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
          </Button>
        </div>
        
        {/* Overall Status */}
        <div className="space-y-2">
          {getOverallStatusBadge(overallStatus)}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>Actualizado {formatLastUpdate(lastUpdate)}</span>
          </div>
        </div>
      </div>

      {/* Services List by Category - Acordeón */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {categories.map((category) => {
            const categoryServices = groupedServices[category] || []
            if (categoryServices.length === 0) return null

            const CategoryIcon = getCategoryIcon(category)
            const isExpanded = expandedCategories[category]
            
            return (
              <div key={category} className="space-y-2">
                {/* Category Header - Clickeable para expandir/colapsar */}
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 text-sm font-medium text-muted-foreground hover:text-foreground p-2 h-auto"
                  onClick={() => toggleCategory(category)}
                >
                  <CategoryIcon className="w-4 h-4" />
                  <span>{getCategoryLabel(category)}</span>
                  <div className="ml-auto">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </div>
                </Button>
                
                {/* Services in Category - Solo visible si está expandido */}
                {isExpanded && (
                  <div className="space-y-1 pl-6 animate-in slide-in-from-top-2 duration-200">
                    {categoryServices.map((service) => {
                      const ServiceIcon = getServiceIcon(service.name)
                      const StatusIcon = getStatusIcon(service.status)
                      const statusColor = getStatusColor(service.status)

                      return (
                        <div key={service.name} className="flex items-center justify-between p-2 rounded-md hover:bg-accent/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <ServiceIcon className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{service.name}</span>
                          </div>
                          <StatusIcon className={cn("w-4 h-4", statusColor)} />
                        </div>
                      )
                    })}
                  </div>
                )}
                
                {/* Separator between categories */}
                {category !== 'frontend' && <Separator className="mt-3" />}
              </div>
            )
          })}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t bg-muted/30">
        <div className="text-xs text-muted-foreground text-center">
          <div className="flex items-center justify-center gap-4 mb-1">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              {services.filter(s => s.status === 'healthy').length} Activos
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              {services.filter(s => s.status === 'unhealthy').length} Inactivos
            </span>
          </div>
          <div>Actualización automática cada 30s</div>
        </div>
      </div>
    </Card>
  )
} 