'use client'

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  AlertCircle,
  CheckCircle,
  RefreshCw,
  HelpCircle
} from "lucide-react"
import { useServicesHealth } from "@/hooks/useServicesHealth"
import { cn } from "@/lib/utils"

interface ServicesStatusIndicatorProps {
  className?: string
  showDetails?: boolean
}

export function ServicesStatusIndicator({ className, showDetails = false }: ServicesStatusIndicatorProps) {
  const { overallStatus, summary, isLoading, refresh } = useServicesHealth()

  const getStatusConfig = (status: typeof overallStatus) => {
    switch (status) {
      case 'healthy':
        return {
          icon: CheckCircle,
          color: 'text-green-500',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          label: 'Operativo',
          description: 'Todos los servicios funcionando'
        }
      case 'degraded':
        return {
          icon: AlertCircle,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          label: 'Degradado',
          description: 'Algunos servicios con problemas'
        }
      case 'down':
        return {
          icon: AlertCircle,
          color: 'text-red-500',
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          label: 'Crítico',
          description: 'Servicios críticos caídos'
        }
      default:
        return {
          icon: HelpCircle,
          color: 'text-gray-400',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          label: 'Desconocido',
          description: 'Estado no disponible'
        }
    }
  }

  const statusConfig = getStatusConfig(overallStatus)
  const StatusIcon = statusConfig.icon

  if (!showDetails) {
    // Versión compacta para el header
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="flex items-center gap-1">
          <StatusIcon className={cn("w-4 h-4", statusConfig.color)} />
          <span className="text-sm font-medium">{statusConfig.label}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={refresh}
          disabled={isLoading}
          className="h-6 w-6 p-0"
        >
          <RefreshCw className={cn("w-3 h-3", isLoading && "animate-spin")} />
        </Button>
      </div>
    )
  }

  // Versión detallada
  return (
    <div className={cn("space-y-2", className)}>
      <Badge className={cn(statusConfig.bgColor, statusConfig.textColor, "hover:bg-opacity-80")}>
        <StatusIcon className="w-3 h-3 mr-1" />
        {statusConfig.label}
      </Badge>
      
      {summary && (
        <div className="text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>Servicios activos:</span>
            <span className="font-medium">{summary.healthy}/{summary.total}</span>
          </div>
          {summary.unhealthy > 0 && (
            <div className="flex items-center justify-between text-red-600">
              <span>Con problemas:</span>
              <span className="font-medium">{summary.unhealthy}</span>
            </div>
          )}
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{statusConfig.description}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={refresh}
          disabled={isLoading}
          className="h-6 w-6 p-0"
        >
          <RefreshCw className={cn("w-3 h-3", isLoading && "animate-spin")} />
        </Button>
      </div>
    </div>
  )
} 