'use client'

import * as React from "react"
import { useState } from "react"
import { Plus, Download, Filter, Search, Package, CheckCircle, XCircle, Clock, AlertTriangle, MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { 
  StatsOverview,
  CombinedFilterActions, 
  FiltersOnlyBar,
  ActionsOnlyBar,
  AutoRefreshTabs, 
  NumberedPagination,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/shared-ui"
import type { StatsMetric, FilterConfig, ActionConfig, TabOption } from "@/components/shared-ui"

/**
 * EJEMPLO COMPLETO: Standard Data Page
 * 
 * Demuestra el uso de todos los componentes semánticos:
 * ✅ Sin títulos duplicados
 * ✅ CombinedFilterActions con filtros + acciones optimizadas
 * ✅ AutoRefreshTabs con conteos automáticos desde BD
 * ✅ NumberedPagination con números visibles (2,3,4...x,y,z)
 * ✅ Componentes especializados según función y complejidad
 */

interface Product {
  id: string
  name: string
  status: 'active' | 'inactive' | 'pending' | 'processing'
  category: string
  price: number
  stock: number
  created_at: string
}

export function StandardDataPageExample() {
  // Estados para la demostración
  const [activeTab, setActiveTab] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [searchValue, setSearchValue] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  
  // Datos de ejemplo
  const products: Product[] = [
    { id: '1', name: 'Producto A', status: 'active', category: 'Electrónica', price: 299.99, stock: 50, created_at: '2024-01-01' },
    { id: '2', name: 'Producto B', status: 'pending', category: 'Ropa', price: 99.99, stock: 25, created_at: '2024-01-02' },
    { id: '3', name: 'Producto C', status: 'processing', category: 'Hogar', price: 149.99, stock: 15, created_at: '2024-01-03' },
  ]

  // 📊 Estadísticas como en los templates creados
  const statsMetrics: StatsMetric[] = [
    {
      id: 'total-products',
      title: 'Total Productos',
      value: 1250,
      description: 'Productos en inventario',
      icon: Package,
      progress: { current: 1250, total: 2000, label: 'Capacidad' },
      trend: { value: '+12%', label: 'Crecimiento mensual', direction: 'up' },
      color: 'blue'
    },
    {
      id: 'active-products',
      title: 'Productos Activos',
      value: 980,
      description: 'Disponibles para venta',
      icon: CheckCircle,
      progress: { current: 980, total: 1250, label: 'Activación' },
      trend: { value: '+8%', label: 'Mejora este mes', direction: 'up' },
      color: 'green'
    },
    {
      id: 'low-stock',
      title: 'Stock Bajo',
      value: 45,
      description: 'Productos con stock crítico',
      icon: AlertTriangle,
      trend: { value: '-15%', label: 'Reducción exitosa', direction: 'down' },
      color: 'yellow'
    }
  ]

  // 🗂️ Tabs con conteos automáticos desde BD
  const autoRefreshTabs: TabOption[] = [
    { 
      id: 'all', 
      label: 'Todos', 
      count: 1250,
      variant: 'default',
      icon: Package,
      countQuery: { 
        endpoint: '/api/products/count',
        params: {}
      }
    },
    { 
      id: 'active', 
      label: 'Activos', 
      count: 980,
      variant: 'success',
      icon: CheckCircle,
      countQuery: { 
        endpoint: '/api/products/count',
        params: { status: 'active' }
      }
    },
    { 
      id: 'pending', 
      label: 'Pendientes', 
      count: 125,
      variant: 'warning',
      icon: Clock,
      countQuery: { 
        endpoint: '/api/products/count',
        params: { status: 'pending' }
      }
    },
    { 
      id: 'processing', 
      label: 'Procesando', 
      count: 78,
      variant: 'info',
      icon: AlertTriangle,
      countQuery: { 
        endpoint: '/api/products/count',
        params: { status: 'processing' }
      }
    },
    { 
      id: 'inactive', 
      label: 'Inactivos', 
      count: 67,
      variant: 'error',
      icon: XCircle,
      countQuery: { 
        endpoint: '/api/products/count',
        params: { status: 'inactive' }
      }
    }
  ]

  // 🔍 Configuración de filtros para CombinedFilterActions
  const combinedFilters: FilterConfig[] = [
    {
      key: 'search',
      type: 'search',
      placeholder: 'Buscar productos...',
      value: searchValue,
      onChange: setSearchValue
    },
    {
      key: 'category',
      type: 'select',
      label: 'Categoría',
      value: selectedCategory,
      onChange: setSelectedCategory,
      options: [
        { label: 'Todas las categorías', value: '' },
        { label: 'Electrónica', value: 'electronics' },
        { label: 'Ropa', value: 'clothing' },
        { label: 'Hogar', value: 'home' }
      ]
    }
  ]

  // 🔍 Configuración de muchos filtros para FiltersOnlyBar
  const manyFilters: FilterConfig[] = [
    ...combinedFilters,
    {
      key: 'status',
      type: 'select',
      label: 'Estado',
      value: selectedStatus,
      onChange: setSelectedStatus,
      options: [
        { label: 'Todos los estados', value: '' },
        { label: 'Activo', value: 'active' },
        { label: 'Inactivo', value: 'inactive' },
        { label: 'Pendiente', value: 'pending' }
      ]
    },
    {
      key: 'brand',
      type: 'select',
      label: 'Marca',
      value: '',
      onChange: () => {},
      options: [
        { label: 'Todas las marcas', value: '' },
        { label: 'Samsung', value: 'samsung' },
        { label: 'Apple', value: 'apple' }
      ]
    },
    {
      key: 'price_range',
      type: 'select',
      label: 'Rango de Precio',
      value: '',
      onChange: () => {},
      options: [
        { label: 'Todos los precios', value: '' },
        { label: '< $100', value: '0-100' },
        { label: '$100 - $500', value: '100-500' }
      ]
    }
  ]

  // ⚡ Acciones principales
  const actions: ActionConfig[] = [
    {
      label: 'Exportar',
      icon: Download,
      variant: 'outline',
      onClick: () => alert('Exportando...')
    }
  ]

  const primaryAction: ActionConfig = {
    label: 'Nuevo Producto',
    icon: Plus,
    variant: 'default',
    onClick: () => alert('Creando producto...')
  }

  // Acciones masivas para ActionsOnlyBar
  const massActions: ActionConfig[] = [
    {
      label: 'Activar Seleccionados',
      icon: CheckCircle,
      variant: 'outline',
      onClick: () => alert('Activando productos...')
    },
    {
      label: 'Desactivar Seleccionados',
      icon: XCircle,
      variant: 'outline',
      onClick: () => alert('Desactivando productos...')
    },
    {
      label: 'Eliminar Seleccionados',
      icon: Trash2,
      variant: 'destructive',
      onClick: () => alert('Eliminando productos...')
    }
  ]

  return (
    <div className="container mx-auto py-6 space-y-6">
      
      {/* ✅ 1. StatsOverview - Estadísticas expandibles */}
      <StatsOverview
        title="Estadísticas del Inventario"
        subtitle="Resumen del inventario actual"
        metrics={statsMetrics}
        defaultExpanded={false}
        variant="detailed"
      />

      {/* ✅ 2. AutoRefreshTabs con conteos automáticos desde BD */}
      <AutoRefreshTabs
        tabs={autoRefreshTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        showCounts={true}
        autoRefreshCounts={false} // Cambiar a true para refresh automático
        refreshInterval={30000}
      />

      {/* ✅ 3A. CombinedFilterActions - Filtros + botones juntos (páginas estándar) */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground">Opción A: CombinedFilterActions</h3>
        <CombinedFilterActions
          filters={combinedFilters}
          actions={actions}
          primaryAction={primaryAction}
          variant="full"
        />
      </div>

      {/* ✅ 3B. FiltersOnlyBar - Para páginas con muchos filtros */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground">Opción B: FiltersOnlyBar (páginas complejas)</h3>
        <FiltersOnlyBar
          filters={manyFilters}
          variant="full"
          groupByType={true}
        />
      </div>

      {/* ✅ 3C. ActionsOnlyBar - Para acciones masivas */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground">Opción C: ActionsOnlyBar (acciones masivas)</h3>
        <ActionsOnlyBar
          actions={massActions}
          primaryAction={primaryAction}
          variant="full"
          justifyContent="start"
          groupSimilar={true}
        />
      </div>

      {/* ✅ 4. Tabla limpia SIN título duplicado */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="w-[100px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>
                  <Badge 
                    variant={
                      product.status === 'active' ? 'default' : 
                      product.status === 'pending' ? 'secondary' :
                      product.status === 'processing' ? 'outline' : 'destructive'
                    }
                  >
                    {product.status}
                  </Badge>
                </TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>${product.price}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* ✅ 5. NumberedPagination con números visibles (2,3,4...x,y,z) */}
      <NumberedPagination
        currentPage={currentPage}
        totalPages={125}
        totalItems={2480}
        pageSize={20}
        onPageChange={setCurrentPage}
        showPageInfo={true}
        maxVisiblePages={7}
        compact={false}
      />

    </div>
  )
}

export default StandardDataPageExample
