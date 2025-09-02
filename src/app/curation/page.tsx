'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shared-ui'
import { CurationTable } from '@/components/curation/organisms/curation-table'
import { CurationFilters } from '@/components/curation/organisms/curation-filters'
import { CurationStats } from '@/components/curation/organisms/curation-stats'
import { BulkActionBar } from '@/components/curation/molecules/bulk-action-bar'
import { Button } from '@/components/shared-ui'
import { RefreshCw, Download, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import type { ScrapedProduct, CurationStatus, CurationFilter } from '@/types/curation'

// Tipos de estado válidos
type ProductStatus = 'pending' | 'processing' | 'curated' | 'rejected' | 'published';

interface ProductCounts {
  total: number;
  pending: number;
  processing: number;
  curated: number;
  rejected: number;
  published: number;
}

export default function CurationPage() {
  const [products, setProducts] = useState<ScrapedProduct[]>([])
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [pageSize] = useState(50)
  
  // Estado de la pestaña activa
  const [activeTab, setActiveTab] = useState<'all' | ProductStatus>('all')
  
  // Filtros unificados (se mantienen entre pestañas)
  const [globalFilters, setGlobalFilters] = useState<CurationFilter>({})
  
  // Contadores reales por estado (se actualizan con cada carga)
  const [productCounts, setProductCounts] = useState<ProductCounts>({
    total: 0,
    pending: 0,
    processing: 0,
    curated: 0,
    rejected: 0,
    published: 0
  })
  
  // Métricas de curación
  const [curationMetrics, setCurationMetrics] = useState({
    totalAttempts: 0,
    aiSuccesses: 0,
    aiFaillures: 0,
    simpleFallbacks: 0,
    lastAIFailure: null as Date | null
  })

  // Función para cargar contadores de productos
  const loadProductCounts = useCallback(async () => {
    try {
      const authToken = localStorage.getItem('iam_access_token')
      if (!authToken) return

      // Usar el nuevo endpoint de estadísticas
      const response = await fetch('/api/scraper/products/stats', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })
      
      if (response.ok) {
        const stats = await response.json()
        
        // Actualizar contadores con las estadísticas reales
        setProductCounts({
          total: stats.total || 0,
          pending: stats.pending || 0,
          processing: stats.processing || 0,
          curated: stats.curated || 0,
          rejected: stats.rejected || 0,
          published: stats.published || 0
        })
      } else {
        // Si falla, intentar con el método anterior
        console.warn('Stats endpoint not available, falling back to individual counts')
        
        // Hacer una llamada para obtener todos y contar en frontend
        const fallbackResponse = await fetch(`/api/scraper/products?page_size=100`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        })
        
        if (fallbackResponse.ok) {
          const data = await fallbackResponse.json()
          
          const counts: ProductCounts = {
            total: 0,
            pending: 0,
            processing: 0,
            curated: 0,
            rejected: 0,
            published: 0
          }
          
          // Contar por estado
          data.products?.forEach((product: any) => {
            const status = product.status || product.curation_status || 'pending'
            if (status in counts && status !== 'total') {
              counts[status as keyof ProductCounts]++
              counts.total++
            }
          })
          
          setProductCounts(counts)
        }
      }
    } catch (error) {
      console.error('Error loading product counts:', error)
    }
  }, [globalFilters])

  // Cargar productos desde la API con filtros aplicados
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true)
      
      const authToken = localStorage.getItem('iam_access_token')
      if (!authToken) {
        toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.')
        setLoading(false)
        return
      }

      // Construir query params incluyendo TODOS los filtros
      const params = new URLSearchParams({
        page: currentPage.toString(),
        page_size: pageSize.toString(),
        // Agregar filtro de estado según la pestaña activa
        ...(activeTab !== 'all' && { curation_status: activeTab }),
        // Agregar filtros globales
        ...(globalFilters.source && { source: globalFilters.source }),
        ...(globalFilters.brand && { brand_id: globalFilters.brand }),
        ...(globalFilters.category && { category_id: globalFilters.category }),
        ...(globalFilters.search && { search: globalFilters.search }),
        ...(globalFilters.date_from && { date_from: globalFilters.date_from }),
        ...(globalFilters.date_to && { date_to: globalFilters.date_to })
      })

      const response = await fetch(`/api/scraper/products?${params}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Error al cargar productos')
      }

      const data = await response.json()
      
      // Normalizar productos
      const normalizedProducts = (data.products || []).map((p: any) => ({
        ...p,
        images: p.images || [],
        status: p.status || p.curation_status || 'pending',
        name: p.title || p.name || 'Sin nombre',
        title: p.title || p.name || 'Sin nombre',
        currency: p.currency || 'ARS'
      }))
      
      setProducts(normalizedProducts)
      setTotalCount(data.total_count || 0)
      setTotalPages(data.total_pages || 1)
      
      // Cargar contadores actualizados
      await loadProductCounts()
      
    } catch (error) {
      console.error('Error loading products:', error)
      toast.error('Error al cargar productos')
      
      // Intentar fallback directo a MongoDB
      try {
        const params = new URLSearchParams({
          page_size: '50',
          ...(activeTab !== 'all' && { curation_status: activeTab })
        })
        
        const fallbackResponse = await fetch(`http://localhost:8086/api/v1/marketplace/products?${params}`)
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json()
          
          const normalizedProducts = (fallbackData.products || []).map((p: any) => ({
            ...p,
            images: p.images || (p.image_url ? [p.image_url] : []),
            status: p.status || p.curation_status || 'pending',
            name: p.title || p.name || 'Sin nombre',
            title: p.title || p.name || 'Sin nombre',
            currency: p.currency || 'ARS'
          }))
          
          setProducts(normalizedProducts)
          setTotalCount(fallbackData.total_count || 0)
          setTotalPages(fallbackData.total_pages || 1)
        }
      } catch (fallbackError) {
        console.error('Fallback también falló:', fallbackError)
      }
    } finally {
      setLoading(false)
    }
  }, [currentPage, pageSize, activeTab, globalFilters, loadProductCounts])

  // Cargar productos cuando cambien las dependencias
  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  // Resetear página cuando cambien los filtros o la pestaña
  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab, globalFilters])

  // Refrescar productos
  const handleRefresh = async () => {
    setRefreshing(true)
    await loadProducts()
    setRefreshing(false)
    toast.success('Productos actualizados')
  }

  // Manejar cambio de filtros
  const handleFiltersChange = useCallback((newFilters: CurationFilter) => {
    setGlobalFilters(newFilters)
  }, [])

  // Manejar cambio de pestaña
  const handleTabChange = (value: string) => {
    setActiveTab(value as 'all' | ProductStatus)
    setSelectedProducts(new Set()) // Limpiar selección al cambiar de pestaña
  }

  // Curar productos seleccionados
  const handleBulkCurate = async () => {
    if (selectedProducts.size === 0) {
      toast.error('Selecciona al menos un producto')
      return
    }

    try {
      const productIds = Array.from(selectedProducts)
      let successCount = 0
      let errorCount = 0
      
      const authToken = localStorage.getItem('iam_access_token')
      if (!authToken) {
        toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.')
        return
      }
      
      toast.info(`Curando ${productIds.length} productos...`)
      
      for (const productId of productIds) {
        try {
          const response = await fetch('/api/ai/products/curate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
              product_id: productId
            })
          })
          
          if (response.ok) {
            successCount++
          } else {
            errorCount++
          }
        } catch (error) {
          console.error(`Error curando producto ${productId}:`, error)
          errorCount++
        }
      }
      
      if (successCount > 0 && errorCount === 0) {
        toast.success(`✓ ${successCount} producto${successCount !== 1 ? 's' : ''} curado${successCount !== 1 ? 's' : ''} exitosamente`)
      } else if (successCount > 0 && errorCount > 0) {
        toast.warning(`${successCount} curado${successCount !== 1 ? 's' : ''}, ${errorCount} con error${errorCount !== 1 ? 'es' : ''}`)
      } else {
        toast.error(`Error al curar los productos`)
      }
      
      setSelectedProducts(new Set())
      await loadProducts()
      
    } catch (error) {
      console.error('Error curando productos:', error)
      toast.error('Error al enviar productos a curación')
    }
  }

  // Aprobar productos seleccionados
  const handleBulkApprove = async () => {
    if (selectedProducts.size === 0) {
      toast.error('Selecciona al menos un producto')
      return
    }

    try {
      const productIds = Array.from(selectedProducts)
      const authToken = localStorage.getItem('iam_access_token')
      if (!authToken) {
        toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.')
        return
      }
      
      let successCount = 0
      
      for (const productId of productIds) {
        const response = await fetch(`/api/scraper/products/${productId}/publish-curated`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        })
        if (response.ok) successCount++
      }
      
      toast.success(`${successCount} productos aprobados y enviados a PIM`)
      setSelectedProducts(new Set())
      await loadProducts()
      
    } catch (error) {
      console.error('Error aprobando productos:', error)
      toast.error('Error al aprobar productos')
    }
  }

  // Rechazar productos seleccionados
  const handleBulkReject = async () => {
    if (selectedProducts.size === 0) {
      toast.error('Selecciona al menos un producto')
      return
    }

    try {
      const productIds = Array.from(selectedProducts)
      const authToken = localStorage.getItem('iam_access_token')
      if (!authToken) {
        toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.')
        return
      }
      
      let successCount = 0
      
      for (const productId of productIds) {
        const response = await fetch(`/api/scraper/products/${productId}/reject`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        })
        if (response.ok) successCount++
      }
      
      toast.success(`${successCount} productos rechazados`)
      setSelectedProducts(new Set())
      await loadProducts()
      
    } catch (error) {
      console.error('Error rechazando productos:', error)
      toast.error('Error al rechazar productos')
    }
  }

  // Curar un producto individual con AI
  const handleSingleCurate = async (productId: string) => {
    try {
      const authToken = localStorage.getItem('iam_access_token')
      if (!authToken) {
        toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.')
        throw new Error('No authentication token')
      }

      setCurationMetrics(prev => ({
        ...prev,
        totalAttempts: prev.totalAttempts + 1
      }))

      let response = await fetch('/api/ai/products/curate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          product_id: productId
        })
      })

      let usedSimpleFallback = false

      if (!response.ok) {
        console.warn('AI Gateway no disponible, usando curación simplificada')
        
        setCurationMetrics(prev => ({
          ...prev,
          aiFaillures: prev.aiFaillures + 1,
          simpleFallbacks: prev.simpleFallbacks + 1,
          lastAIFailure: new Date()
        }))
        
        const failureRate = curationMetrics.totalAttempts > 0 
          ? Math.round((curationMetrics.aiFaillures / curationMetrics.totalAttempts) * 100)
          : 0
        
        toast.warning(`⚠️ AI no disponible (${failureRate}% tasa de falla). Usando curación simplificada`)
        
        response = await fetch(`/api/scraper/products/${productId}/curate-simple`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          }
        })
        
        usedSimpleFallback = true
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
          throw new Error(errorData.error || 'Error en curación simplificada')
        }
      } else {
        setCurationMetrics(prev => ({
          ...prev,
          aiSuccesses: prev.aiSuccesses + 1
        }))
      }

      const result = await response.json()
      
      if (usedSimpleFallback) {
        toast.success('✓ Producto curado (método simplificado)')
      } else {
        toast.success('✓ Producto curado con AI exitosamente')
      }
      await loadProducts()
      return result
      
    } catch (error: any) {
      console.error('Error curando producto:', error)
      toast.error(`Error al curar: ${error.message || 'Servicio no disponible'}`)
      throw error
    }
  }

  // Aprobar un producto individual y enviarlo a PIM
  const handleSingleApprove = async (productId: string) => {
    try {
      const authToken = localStorage.getItem('iam_access_token')
      if (!authToken) {
        toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.')
        return
      }

      const product = products.find(p => p.id === productId)
      
      if (!product) {
        toast.error('Producto no encontrado')
        return
      }

      if (product.status === 'pending') {
        toast.error('El producto debe ser curado antes de aprobarlo. Use el botón de Curar primero.')
        return
      }

      if (product.status === 'processing') {
        toast.warning('El producto está siendo procesado. Espere a que termine la curación.')
        return
      }

      if (product.status === 'rejected') {
        toast.error('No se puede aprobar un producto rechazado.')
        return
      }

      if (product.status === 'published') {
        toast.info('Este producto ya fue publicado.')
        return
      }

      if (product.status !== 'curated') {
        toast.error(`Estado inválido para aprobación: ${product.status}`)
        return
      }

      const response = await fetch(`/api/scraper/products/${productId}/publish-curated`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }))
        throw new Error(errorData.error || 'Error al publicar en PIM')
      }

      const result = await response.json()
      toast.success(`Producto aprobado y publicado con ID global: ${result.global_product_id || 'N/A'}`)
      await loadProducts()
      
    } catch (error: any) {
      console.error('Error aprobando producto:', error)
      toast.error(`Error al aprobar: ${error.message || 'Error desconocido'}`)
    }
  }

  // Rechazar un producto individual
  const handleSingleReject = async (productId: string) => {
    try {
      const authToken = localStorage.getItem('iam_access_token')
      if (!authToken) {
        toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.')
        return
      }

      const response = await fetch(`/api/scraper/products/${productId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      if (!response.ok) {
        throw new Error('Error al rechazar producto')
      }

      toast.success('Producto rechazado')
      await loadProducts()
      
    } catch (error) {
      console.error('Error rechazando producto:', error)
      toast.error('Error al rechazar producto')
    }
  }

  // Estadísticas calculadas
  const stats = useMemo(() => ({
    total_products: productCounts.total,
    pending: productCounts.pending,
    processing: productCounts.processing,
    curated: productCounts.curated,
    rejected: productCounts.rejected,
    published: productCounts.published,
    avg_confidence: products.length > 0
      ? Math.round(products.reduce((acc, p) => acc + (p.confidence_score || 0), 0) / products.length)
      : 0,
    today_curated: 0,
    week_curated: 0,
    month_curated: 0,
    lastUpdate: new Date().toISOString()
  }), [productCounts, products])

  // Productos filtrados para la vista actual
  const currentProducts = useMemo(() => {
    if (activeTab === 'all') return products
    return products.filter(p => p.status === activeTab)
  }, [products, activeTab])

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Curación de Productos</h1>
          <p className="text-muted-foreground">
            Gestiona y valida productos scrapeados antes de publicar
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <CurationStats stats={stats} />
      
      {/* Métricas de AI - Solo mostrar si hay intentos */}
      {curationMetrics.totalAttempts > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Métricas de Curación AI
            </CardTitle>
            <CardDescription>
              Monitoreo del servicio de curación con inteligencia artificial
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Intentos</p>
                <p className="text-2xl font-bold">{curationMetrics.totalAttempts}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  AI Exitosos
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {curationMetrics.aiSuccesses}
                  <span className="text-sm text-muted-foreground ml-1">
                    ({Math.round((curationMetrics.aiSuccesses / curationMetrics.totalAttempts) * 100)}%)
                  </span>
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <XCircle className="h-3 w-3 text-red-500" />
                  AI Fallidos
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {curationMetrics.aiFaillures}
                  <span className="text-sm text-muted-foreground ml-1">
                    ({Math.round((curationMetrics.aiFaillures / curationMetrics.totalAttempts) * 100)}%)
                  </span>
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Fallback Simple</p>
                <p className="text-2xl font-bold text-yellow-600">{curationMetrics.simpleFallbacks}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Última Falla AI</p>
                <p className="text-sm font-mono">
                  {curationMetrics.lastAIFailure 
                    ? new Date(curationMetrics.lastAIFailure).toLocaleTimeString()
                    : 'N/A'}
                </p>
              </div>
            </div>
            
            {/* Alerta si la tasa de falla es muy alta */}
            {curationMetrics.aiFaillures > 0 && 
             (curationMetrics.aiFaillures / curationMetrics.totalAttempts) > 0.5 && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-sm text-red-800 dark:text-red-200">
                  ⚠️ <strong>Alerta:</strong> El servicio de AI tiene una tasa de falla superior al 50%. 
                  Se está usando curación simplificada que puede no ser precisa para categorías y marcas.
                  Por favor, contacta al equipo de infraestructura.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Contenido principal con tabs y filtros */}
      <Card>
        <CardHeader>
          <div className="space-y-4">
            {/* Filtros unificados - Siempre visibles */}
            <CurationFilters
              filters={globalFilters}
              onFiltersChange={handleFiltersChange}
              onRefresh={handleRefresh}
              loading={refreshing}
              showStatusFilter={false} // No mostrar filtro de estado ya que usamos tabs
            />
            
            {/* Tabs con contadores reales */}
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="all">
                  Todos ({productCounts.total})
                </TabsTrigger>
                <TabsTrigger value="pending">
                  Pendientes ({productCounts.pending})
                </TabsTrigger>
                <TabsTrigger value="processing">
                  Procesando ({productCounts.processing})
                </TabsTrigger>
                <TabsTrigger value="curated">
                  Curados ({productCounts.curated})
                </TabsTrigger>
                <TabsTrigger value="rejected">
                  Rechazados ({productCounts.rejected})
                </TabsTrigger>
                <TabsTrigger value="published">
                  Publicados ({productCounts.published})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Barra de acciones masivas - Siempre visible cuando hay selección */}
          {selectedProducts.size > 0 && (
            <BulkActionBar
              selectedCount={selectedProducts.size}
              onSendToAI={handleBulkCurate}
              onApprove={handleBulkApprove}
              onReject={handleBulkReject}
            />
          )}

          {/* Tabla de productos */}
          <CurationTable
            products={currentProducts}
            loading={loading}
            selectedIds={Array.from(selectedProducts)}
            onSelectionChange={(ids) => setSelectedProducts(new Set(ids))}
            onProductUpdate={(productId, updates) => {
              setProducts(prev => prev.map(p => 
                p.id === productId ? { ...p, ...updates } : p
              ));
            }}
            onProductSave={async (productId) => {
              await loadProducts();
            }}
            onProductCurate={handleSingleCurate}
            onProductApprove={handleSingleApprove}
            onProductReject={handleSingleReject}
          />

          {/* Paginación mejorada */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Mostrando {Math.min(((currentPage - 1) * pageSize) + 1, totalCount)} - {Math.min(currentPage * pageSize, totalCount)} de {totalCount} resultados
                {Object.keys(globalFilters).length > 0 && (
                  <span className="ml-2 text-xs">
                    (con {Object.keys(globalFilters).length} filtro{Object.keys(globalFilters).length > 1 ? 's' : ''} aplicado{Object.keys(globalFilters).length > 1 ? 's' : ''})
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  Primera
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                <div className="flex items-center gap-1">
                  <span className="px-3 py-1 text-sm">
                    Página
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={totalPages}
                    value={currentPage}
                    onChange={(e) => {
                      const page = parseInt(e.target.value)
                      if (page >= 1 && page <= totalPages) {
                        setCurrentPage(page)
                      }
                    }}
                    className="w-16 px-2 py-1 text-sm border rounded"
                  />
                  <span className="px-3 py-1 text-sm">
                    de {totalPages}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  Última
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}