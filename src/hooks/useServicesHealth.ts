import { useState, useEffect } from 'react'

export interface ServiceHealth {
  name: string
  status: 'healthy' | 'unhealthy' | 'unknown'
  url: string
  port: number
  description: string
  lastCheck?: Date
  responseTime?: number
  error?: string
}

export interface ServicesHealthData {
  services: ServiceHealth[]
  overallStatus: 'healthy' | 'degraded' | 'down'
  lastUpdate: Date
  summary?: {
    total: number
    healthy: number
    unhealthy: number
  }
}

// Configuración de servicios (no se usa actualmente, se obtiene del endpoint)
/*
const SERVICES_CONFIG: Omit<ServiceHealth, 'status' | 'lastCheck' | 'responseTime' | 'error'>[] = [
  {
    name: 'IAM Service',
    url: 'http://localhost:8080',
    port: 8080,
    description: 'Servicio de autenticación y autorización'
  },
  {
    name: 'Chat Service',
    url: 'http://localhost:8000',
    port: 8000,
    description: 'Servicio de mensajería y comunicación'
  },
  {
    name: 'PIM Service',
    url: 'http://localhost:8090',
    port: 8090,
    description: 'Gestión de información de productos'
  },
  {
    name: 'Stock Service',
    url: 'http://localhost:8100',
    port: 8100,
    description: 'Gestión de inventario y stock'
  },
  {
    name: 'API Gateway',
    url: 'http://localhost:8001',
    port: 8001,
    description: 'Gateway de APIs y enrutamiento'
  },
  {
    name: 'PostgreSQL',
    url: 'http://localhost:5432',
    port: 5432,
    description: 'Base de datos principal'
  },
  {
    name: 'MongoDB',
    url: 'http://localhost:27017',
    port: 27017,
    description: 'Base de datos NoSQL'
  },
  {
    name: 'Prometheus',
    url: 'http://localhost:9090',
    port: 9090,
    description: 'Sistema de monitoreo y métricas'
  },
  {
    name: 'Grafana',
    url: 'http://localhost:3002',
    port: 3002,
    description: 'Dashboard de visualización'
  }
]
*/

export function useServicesHealth(refreshInterval: number = 30000) {
  const [healthData, setHealthData] = useState<ServicesHealthData>({
    services: [],
    overallStatus: 'unknown' as 'healthy' | 'degraded' | 'down',
    lastUpdate: new Date()
  })
  const [isLoading, setIsLoading] = useState(true)

  const checkAllServices = async () => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/health', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      // Convertir las fechas de string a Date objects
      const processedData = {
        ...data,
        lastUpdate: new Date(data.lastUpdate),
        services: data.services.map((service: ServiceHealth & { lastCheck?: string }) => ({
          ...service,
          lastCheck: service.lastCheck ? new Date(service.lastCheck) : undefined
        }))
      }

      setHealthData(processedData)
    } catch (error) {
      console.error('Error checking services health:', error)
      
      // En caso de error, mantener el estado anterior pero marcar como degraded
      setHealthData(prev => ({
        ...prev,
        overallStatus: 'down',
        lastUpdate: new Date()
      }))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Check immediately on mount
    checkAllServices()

    // Set up interval for periodic checks
    const interval = setInterval(checkAllServices, refreshInterval)

    return () => clearInterval(interval)
  }, [refreshInterval, checkAllServices])

  return {
    ...healthData,
    isLoading,
    refresh: checkAllServices
  }
} 