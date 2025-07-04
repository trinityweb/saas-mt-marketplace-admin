import { useState, useEffect, useCallback, useRef } from 'react'

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

// Cache global para compartir datos entre componentes
let healthCache: ServicesHealthData | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 5000 // 5 segundos de cache

export function useServicesHealthOptimized(refreshInterval: number = 60000) { // Aumentar a 60 segundos por defecto
  const [healthData, setHealthData] = useState<ServicesHealthData>(() => {
    // Usar cache si está disponible y no ha expirado
    if (healthCache && Date.now() - cacheTimestamp < CACHE_DURATION) {
      return healthCache
    }
    return {
      services: [],
      overallStatus: 'unknown' as 'healthy' | 'degraded' | 'down',
      lastUpdate: new Date()
    }
  })
  const [isLoading, setIsLoading] = useState(!healthCache)
  const abortControllerRef = useRef<AbortController | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const checkAllServices = useCallback(async () => {
    // Si hay una petición en curso, cancelarla
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Crear nuevo AbortController
    abortControllerRef.current = new AbortController()
    
    try {
      const response = await fetch('/api/health', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: abortControllerRef.current.signal
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

      // Actualizar cache
      healthCache = processedData
      cacheTimestamp = Date.now()

      setHealthData(processedData)
      setIsLoading(false)
    } catch (error: any) {
      // Ignorar errores de cancelación
      if (error.name === 'AbortError') {
        return
      }
      
      console.error('Error checking services health:', error)
      
      // En caso de error, mantener el estado anterior pero marcar como degraded
      setHealthData(prev => ({
        ...prev,
        overallStatus: 'down',
        lastUpdate: new Date()
      }))
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // Solo hacer la petición inicial si no hay cache válido
    if (!healthCache || Date.now() - cacheTimestamp >= CACHE_DURATION) {
      checkAllServices()
    } else {
      setIsLoading(false)
    }

    // Configurar el intervalo
    intervalRef.current = setInterval(checkAllServices, refreshInterval)

    return () => {
      // Limpiar al desmontar
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [refreshInterval, checkAllServices])

  return {
    ...healthData,
    isLoading,
    refresh: checkAllServices
  }
}