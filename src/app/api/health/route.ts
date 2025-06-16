import { NextResponse } from 'next/server'

interface ServiceConfig {
  name: string
  url: string
  port: number
  description: string
  healthEndpoint?: string
}

// Detectar si estamos en desarrollo o producción
const isDevelopment = process.env.NODE_ENV === 'development'

const SERVICES_CONFIG: ServiceConfig[] = [
  {
    name: 'IAM Service',
    url: isDevelopment ? 'http://localhost:8080' : 'http://iam-service:8080',
    port: 8080,
    description: 'Servicio de autenticación y autorización',
    healthEndpoint: '/health'
  },
  {
    name: 'Chat Service',
    url: isDevelopment ? 'http://localhost:8000' : 'http://chat-service:8000',
    port: 8000,
    description: 'Servicio de mensajería y comunicación',
    healthEndpoint: '/health'
  },
  {
    name: 'PIM Service',
    url: isDevelopment ? 'http://localhost:8090' : 'http://pim-service:8080',
    port: isDevelopment ? 8090 : 8080,
    description: 'Gestión de información de productos',
    healthEndpoint: '/api/v1/health'
  },
  {
    name: 'Stock Service',
    url: isDevelopment ? 'http://localhost:8100' : 'http://stock-service:8080',
    port: isDevelopment ? 8100 : 8080,
    description: 'Gestión de inventario y stock',
    healthEndpoint: '/health'
  },
  {
    name: 'API Gateway',
    url: isDevelopment ? 'http://localhost:8001' : 'http://api-gateway:8001',
    port: 8001,
    description: 'Gateway de APIs y enrutamiento'
  },
  {
    name: 'Kong Admin',
    url: isDevelopment ? 'http://localhost:8444' : 'http://kong-admin:8444',
    port: 8444,
    description: 'Panel de administración de Kong',
    healthEndpoint: '/status'
  },
  {
    name: 'PostgreSQL',
    url: isDevelopment ? 'localhost:5432' : 'postgres:5432',
    port: 5432,
    description: 'Base de datos principal'
  },
  {
    name: 'MongoDB',
    url: isDevelopment ? 'localhost:27017' : 'mongodb:27017',
    port: 27017,
    description: 'Base de datos NoSQL'
  },
  {
    name: 'Prometheus',
    url: isDevelopment ? 'http://localhost:9090' : 'http://prometheus:9090',
    port: 9090,
    description: 'Sistema de monitoreo y métricas',
    healthEndpoint: '/-/healthy'
  },
  {
    name: 'Grafana',
    url: isDevelopment ? 'http://localhost:3002' : 'http://grafana:3000',
    port: isDevelopment ? 3002 : 3000,
    description: 'Dashboard de visualización',
    healthEndpoint: '/api/health'
  },
  {
    name: 'Backoffice Admin',
    url: isDevelopment ? 'http://localhost:3005' : 'http://backoffice:3005',
    port: 3005,
    description: 'Panel de administración del backoffice',
    healthEndpoint: '/api/health'
  },
  {
    name: 'Marketplace Admin',
    url: isDevelopment ? 'http://localhost:3000' : 'http://marketplace-admin:3000',
    port: 3000,
    description: 'Panel de administración del marketplace',
    healthEndpoint: '/api/health'
  }
]

async function checkServiceHealth(service: ServiceConfig) {
  const startTime = Date.now()
  
  try {
    // Para servicios sin endpoint HTTP (bases de datos y API Gateway), verificamos conectividad
    if (!service.healthEndpoint) {
      // Para API Gateway, probamos conectividad básica
      if (service.name === 'API Gateway') {
        try {
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 3000)
          
          const response = await fetch(service.url, {
            method: 'GET',
            signal: controller.signal,
            headers: {
              'Accept': '*/*',
              'User-Agent': 'Marketplace-Admin-Health-Check/1.0'
            },
          })
          
          clearTimeout(timeoutId)
          const responseTime = Date.now() - startTime
          
          // Para Kong, cualquier respuesta (incluso 404) significa que está funcionando
          return {
            name: service.name,
            status: 'healthy' as const,
            url: service.url,
            port: service.port,
            description: service.description,
            lastCheck: new Date(),
            responseTime
          }
        } catch (error) {
          return {
            name: service.name,
            status: 'unhealthy' as const,
            url: service.url,
            port: service.port,
            description: service.description,
            lastCheck: new Date(),
            responseTime: Date.now() - startTime,
            error: error instanceof Error ? error.message : 'Connection failed'
          }
        }
      }
      
      // Para bases de datos, simulamos el check por ahora
      await new Promise(resolve => setTimeout(resolve, 50))
      return {
        name: service.name,
        status: 'healthy' as const,
        url: service.url,
        port: service.port,
        description: service.description,
        lastCheck: new Date(),
        responseTime: Date.now() - startTime
      }
    }

    const healthUrl = `${service.url}${service.healthEndpoint}`
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

    const response = await fetch(healthUrl, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Marketplace-Admin-Health-Check/1.0'
      },
    })

    clearTimeout(timeoutId)
    const responseTime = Date.now() - startTime

    if (response.ok) {
      return {
        name: service.name,
        status: 'healthy' as const,
        url: service.url,
        port: service.port,
        description: service.description,
        lastCheck: new Date(),
        responseTime
      }
    } else {
      return {
        name: service.name,
        status: 'unhealthy' as const,
        url: service.url,
        port: service.port,
        description: service.description,
        lastCheck: new Date(),
        responseTime,
        error: `HTTP ${response.status}: ${response.statusText}`
      }
    }
  } catch (error) {
    const responseTime = Date.now() - startTime
    let errorMessage = 'Unknown error'
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorMessage = 'Request timeout'
      } else if (error.message.includes('ECONNREFUSED')) {
        errorMessage = 'Connection refused'
      } else if (error.message.includes('ENOTFOUND')) {
        errorMessage = 'Service not found'
      } else {
        errorMessage = error.message
      }
    }
    
    return {
      name: service.name,
      status: 'unhealthy' as const,
      url: service.url,
      port: service.port,
      description: service.description,
      lastCheck: new Date(),
      responseTime,
      error: errorMessage
    }
  }
}

export async function GET() {
  try {
    const healthChecks = await Promise.all(
      SERVICES_CONFIG.map(service => checkServiceHealth(service))
    )

    const healthyCount = healthChecks.filter(s => s.status === 'healthy').length
    const totalCount = healthChecks.length
    
    let overallStatus: 'healthy' | 'degraded' | 'down'
    if (healthyCount === totalCount) {
      overallStatus = 'healthy'
    } else if (healthyCount > 0) {
      overallStatus = 'degraded'
    } else {
      overallStatus = 'down'
    }

    return NextResponse.json({
      services: healthChecks,
      overallStatus,
      lastUpdate: new Date(),
      summary: {
        total: totalCount,
        healthy: healthyCount,
        unhealthy: totalCount - healthyCount
      },
      environment: isDevelopment ? 'development' : 'production'
    })
  } catch (error) {
    console.error('Error checking services health:', error)
    return NextResponse.json(
      { 
        error: 'Failed to check services health',
        message: error instanceof Error ? error.message : 'Unknown error',
        environment: isDevelopment ? 'development' : 'production'
      },
      { status: 500 }
    )
  }
} 