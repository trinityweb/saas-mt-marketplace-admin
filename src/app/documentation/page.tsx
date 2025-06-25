"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, FileText, Calendar, BookOpen } from 'lucide-react'

interface DocumentInfo {
  filename: string
  title: string
  description: string
  category: string
  lastModified?: string
}

const DOCUMENTS: DocumentInfo[] = [
  {
    filename: 'README.md',
    title: 'Guía Principal del Proyecto',
    description: 'Información general y estructura del proyecto SaaS multitenant',
    category: 'Introducción'
  },
  {
    filename: 'ARQUITECTURA_MICROSERVICIOS.md',
    title: 'Arquitectura de Microservicios',
    description: 'Diseño y patrones de la arquitectura de microservicios',
    category: 'Arquitectura'
  },
  {
    filename: 'DATABASE_SCHEMA_EXPLAINED.md',
    title: 'Esquema de Base de Datos',
    description: 'Documentación completa del esquema de base de datos',
    category: 'Base de Datos'
  },
  {
    filename: 'MARKETPLACE_MULTI_TENANT_ROADMAP.md',
    title: 'Roadmap Marketplace Multitenant',
    description: 'Hoja de ruta del desarrollo del marketplace',
    category: 'Planificación'
  },
  {
    filename: 'MARKETPLACE_USE_CASES_SPECIFICATION.md',
    title: 'Casos de Uso del Marketplace',
    description: 'Especificación detallada de casos de uso',
    category: 'Especificación'
  },
  {
    filename: 'PROJECT_TRACKING.md',
    title: 'Seguimiento del Proyecto',
    description: 'Estado actual y progreso del desarrollo',
    category: 'Gestión'
  },
  {
    filename: 'PROJECT_JOURNAL.md',
    title: 'Diario del Proyecto',
    description: 'Bitácora de desarrollo y decisiones tomadas',
    category: 'Gestión'
  },
  {
    filename: 'onboarding-summary.md',
    title: 'Resumen de Onboarding',
    description: 'Guía de incorporación para nuevos desarrolladores',
    category: 'Onboarding'
  },
  {
    filename: 'Onboarding.md',
    title: 'Guía de Onboarding Completa',
    description: 'Proceso completo de incorporación al proyecto',
    category: 'Onboarding'
  },
  {
    filename: 'PIM-Onboarding-Integration.md',
    title: 'Integración PIM Onboarding',
    description: 'Guía de integración del sistema PIM',
    category: 'Integración'
  },
  {
    filename: 'CONVENCIONES_OPENAPI.md',
    title: 'Convenciones OpenAPI',
    description: 'Estándares y convenciones para APIs',
    category: 'API'
  },
  {
    filename: 'SISTEMA_FILTROS_PAGINACION.md',
    title: 'Sistema de Filtros y Paginación',
    description: 'Implementación de filtros y paginación',
    category: 'Desarrollo'
  },
  {
    filename: 'FEATURE_FLAGS.md',
    title: 'Feature Flags',
    description: 'Sistema de flags de características',
    category: 'Desarrollo'
  },
  {
    filename: 'MONITOREO_OBSERVABILIDAD.md',
    title: 'Monitoreo y Observabilidad',
    description: 'Sistema de monitoreo y métricas',
    category: 'Infraestructura'
  },
  {
    filename: 'DASHBOARDS_GRAFANA.md',
    title: 'Dashboards Grafana',
    description: 'Configuración de dashboards de monitoreo',
    category: 'Infraestructura'
  },
  {
    filename: 'IMPLEMENTACION_METRICAS.md',
    title: 'Implementación de Métricas',
    description: 'Guía de implementación de métricas',
    category: 'Infraestructura'
  },
  {
    filename: 'DOCKER_SERVICES_PORTS.md',
    title: 'Puertos de Servicios Docker',
    description: 'Configuración de puertos para servicios',
    category: 'Infraestructura'
  },
  {
    filename: 'InfraDeployCICD.md',
    title: 'Infraestructura y CI/CD',
    description: 'Configuración de despliegue e integración continua',
    category: 'Infraestructura'
  },
  {
    filename: 'GIT_HOOKS.md',
    title: 'Git Hooks',
    description: 'Configuración de hooks de Git',
    category: 'Desarrollo'
  },
  {
    filename: 'REPOSITORIES.md',
    title: 'Repositorios',
    description: 'Estructura y organización de repositorios',
    category: 'Desarrollo'
  },
  {
    filename: 'CONSISTENCY_VALIDATION.md',
    title: 'Validación de Consistencia',
    description: 'Herramientas de validación y consistencia',
    category: 'Desarrollo'
  },
  {
    filename: 'AnalisisPreliminarMercado.md',
    title: 'Análisis Preliminar de Mercado',
    description: 'Investigación de mercado y competencia',
    category: 'Análisis'
  },
  {
    filename: 'Geolocalizacion.md',
    title: 'Geolocalización',
    description: 'Sistema de geolocalización y mapas',
    category: 'Características'
  },
  {
    filename: 'Plan.md',
    title: 'Plan de Desarrollo',
    description: 'Plan general de desarrollo del proyecto',
    category: 'Planificación'
  },
  {
    filename: 'Stock.md',
    title: 'Sistema de Stock',
    description: 'Gestión de inventario y stock',
    category: 'Características'
  },
  {
    filename: 'RecomendacionesPendientes.md',
    title: 'Recomendaciones Pendientes',
    description: 'Lista de mejoras y recomendaciones por implementar',
    category: 'Mejoras'
  },
  {
    filename: 'MCP_PRODUCT_CURATOR_DESIGN.md',
    title: 'Diseño MCP Product Curator',
    description: 'Diseño del curador de productos MCP',
    category: 'MCP Tools'
  },
  {
    filename: 'mcp-go-generator-node-resumen.md',
    title: 'Resumen MCP Go Generator',
    description: 'Resumen del generador de código Go MCP',
    category: 'MCP Tools'
  },
  {
    filename: 'ENTORNO-ORGANIZADO.md',
    title: 'Entorno Organizado',
    description: 'Organización del entorno de desarrollo',
    category: 'Desarrollo'
  },
  {
    filename: 'mapping-port-services.md',
    title: 'Mapeo de Puertos de Servicios',
    description: 'Mapeo detallado de puertos para todos los servicios',
    category: 'Infraestructura'
  },
  {
    filename: 'PORT_NORMALIZATION_SUMMARY.md',
    title: 'Resumen de Normalización de Puertos',
    description: 'Resumen del proceso de normalización de puertos',
    category: 'Infraestructura'
  },
  {
    filename: 'QUICKSTART_MIGRATION_SPEC.md',
    title: 'Especificación de Migración Quickstart',
    description: 'Especificación para migración de funcionalidad quickstart',
    category: 'Migración'
  }
]

const CATEGORIES = [
  'Todas',
  'Introducción',
  'Arquitectura',
  'Base de Datos',
  'Planificación',
  'Especificación',
  'Gestión',
  'Onboarding',
  'Integración',
  'API',
  'Desarrollo',
  'Infraestructura',
  'Características',
  'Análisis',
  'Mejoras',
  'MCP Tools',
  'Migración'
]

export default function DocumentationPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todas')
  const [filteredDocs, setFilteredDocs] = useState(DOCUMENTS)

  useEffect(() => {
    let filtered = DOCUMENTS

    // Filtrar por categoría
    if (selectedCategory !== 'Todas') {
      filtered = filtered.filter(doc => doc.category === selectedCategory)
    }

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(doc =>
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.filename.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredDocs(filtered)
  }, [searchTerm, selectedCategory])

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <BookOpen className="h-8 w-8 text-purple-600" />
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Documentación del Proyecto
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Centro de documentación del SaaS Multitenant Marketplace
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            placeholder="Buscar documentación..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((category) => (
            <Badge
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Badge>
          ))}
        </div>
      </div>

      {/* Results Stats */}
      <div className="text-sm text-slate-600 dark:text-slate-400">
        Mostrando {filteredDocs.length} de {DOCUMENTS.length} documentos
        {selectedCategory !== 'Todas' && ` en la categoría "${selectedCategory}"`}
      </div>

      {/* Documents Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredDocs.map((doc) => (
          <Link key={doc.filename} href={`/documentation/${doc.filename.replace('.md', '')}`}>
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-purple-600" />
                    <Badge variant="secondary" className="text-xs">
                      {doc.category}
                    </Badge>
                  </div>
                </div>
                <CardTitle className="text-lg">{doc.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm line-clamp-3">
                  {doc.description}
                </CardDescription>
                {doc.lastModified && (
                  <div className="flex items-center space-x-1 text-xs text-slate-500 mt-3">
                    <Calendar className="h-3 w-3" />
                    <span>Actualizado: {doc.lastModified}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* No Results */}
      {filteredDocs.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
            No se encontraron documentos
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            Intenta ajustar tu búsqueda o seleccionar una categoría diferente
          </p>
        </div>
      )}
    </div>
  )
} 