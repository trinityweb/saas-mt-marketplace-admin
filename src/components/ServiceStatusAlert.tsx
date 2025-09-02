'use client'

import { useEffect, useState } from 'react'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/shared-ui"
import { Button } from "@/components/shared-ui"
import { 
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  ExternalLink
} from "lucide-react"

interface ServiceStatusAlertProps {
  className?: string
  showOnlyErrors?: boolean
}

export function ServiceStatusAlert({ className, showOnlyErrors = false }: ServiceStatusAlertProps) {
  const [healthData, setHealthData] = useState<{
    overallStatus: string;
    summary: { healthy: number; unhealthy: number; total: number };
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastCheck, setLastCheck] = useState<Date | null>(null)

  const checkServices = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/health')
      if (response.ok) {
        const data = await response.json()
        setHealthData(data)
        setLastCheck(new Date())
      }
    } catch (error) {
      console.error('Error checking services:', error)
      setHealthData(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkServices()
  }, [])

  if (!healthData) {
    return null
  }

  const { overallStatus, summary } = healthData

  // Si solo queremos mostrar errores y todo está bien, no mostrar nada
  if (showOnlyErrors && overallStatus === 'healthy') {
    return null
  }

  const getAlertVariant = () => {
    switch (overallStatus) {
      case 'healthy':
        return 'default'
      case 'degraded':
        return 'default' // Usamos default ya que no hay variant warning
      case 'down':
        return 'destructive'
      default:
        return 'default'
    }
  }

  const getStatusConfig = () => {
    switch (overallStatus) {
      case 'healthy':
        return {
          icon: CheckCircle,
          title: 'Servicios Operativos',
          description: 'Todos los servicios están funcionando correctamente',
          color: 'text-green-600'
        }
      case 'degraded':
        return {
          icon: AlertTriangle,
          title: 'Servicios Degradados',
          description: `${summary?.unhealthy || 0} de ${summary?.total || 0} servicios tienen problemas`,
          color: 'text-yellow-600'
        }
      case 'down':
        return {
          icon: AlertTriangle,
          title: 'Servicios Críticos Caídos',
          description: 'Múltiples servicios no están disponibles',
          color: 'text-red-600'
        }
      default:
        return {
          icon: AlertTriangle,
          title: 'Estado Desconocido',
          description: 'No se pudo determinar el estado de los servicios',
          color: 'text-gray-600'
        }
    }
  }

  const statusConfig = getStatusConfig()
  const StatusIcon = statusConfig.icon

  return (
    <Alert variant={getAlertVariant()} className={className}>
      <StatusIcon className={`h-4 w-4 ${statusConfig.color}`} />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex-1">
          <div className="font-medium">{statusConfig.title}</div>
          <div className="text-sm text-muted-foreground mt-1">
            {statusConfig.description}
          </div>
          {summary && (
            <div className="flex gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                {summary.healthy} Activos
              </Badge>
              {summary.unhealthy > 0 && (
                <Badge variant="danger" className="text-xs">
                  {summary.unhealthy} Con problemas
                </Badge>
              )}
            </div>
          )}
          {lastCheck && (
            <div className="text-xs text-muted-foreground mt-1">
              Última verificación: {lastCheck.toLocaleTimeString()}
            </div>
          )}
        </div>
        <div className="flex gap-2 ml-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={checkServices}
            disabled={isLoading}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open('/', '_blank')}
            className="h-8 w-8 p-0"
          >
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
} 