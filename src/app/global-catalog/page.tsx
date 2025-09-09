'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Package,
  CheckCircle,
  Globe,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  ExternalLink,
  Shield,
  ShieldCheck,
  AlertTriangle,
  Download,
  Upload,
  Star
} from 'lucide-react';

import { Button } from '@/components/shared-ui/atoms/button';
import { Badge } from '@/components/shared-ui/atoms/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/shared-ui/molecules/card';

import { useAuth } from '@/hooks/use-auth';
import { useHeader } from '@/components/layout/admin-layout';
import { useMarketplaceOverview } from '@/hooks/use-marketplace-overview';
// Removed unused imports: CriteriaDataTable, FilterType, ColumnDef
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/shared-ui/molecules/dropdown-menu';
import { 
  StatsOverview, 
  StatsMetric,
  FiltersOnlyBar,
  ActionsOnlyBar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  type FilterConfig,
  type ActionConfig
} from '@/components/shared-ui';

// Types
interface Product {
  id: string;
  name: string;
  price: number;
  source: string;
  is_verified: boolean;
  is_active: boolean;
  quality_score: number;
  brand?: string;
  category?: string;
}

const verificationStatusLabels = {
  verified: 'Verificado',
  unverified: 'Sin Verificar',
  pending: 'Pendiente'
};

export default function GlobalCatalogPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { setHeaderProps, clearHeaderProps } = useHeader();

  // States
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  
  // Filter states for FiltersOnlyBar
  const [searchValue, setSearchValue] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Overview hook para stats
  const { 
    data: overviewData, 
    loading: overviewLoading, 
    refetch: refetchOverview 
  } = useMarketplaceOverview({ 
    sections: ['global-catalog'], 
    includeStats: true 
  });

  // Configurar header
  useEffect(() => {
    setHeaderProps({
      title: 'Catálogo Global',
      subtitle: `${totalCount} productos en el marketplace`,
      icon: <Globe className="w-5 h-5 text-white" />
    });

    return () => clearHeaderProps();
  }, [setHeaderProps, clearHeaderProps, totalCount]);

  // Stats derivados del overview
  const statsMetrics: StatsMetric[] = useMemo(() => {
    const data = overviewData?.['global-catalog'] || {};
    
    return [
      {
        id: 'total_products',
        title: 'Total Productos',
        value: data.total_products || 0,
        description: 'Productos en el catálogo global',
        icon: Package,
        color: 'blue',
        progress: {
          current: data.total_products || 0,
          total: 10000,
          label: 'Capacidad máxima'
        }
      },
      {
        id: 'verified_products',
        title: 'Productos Verificados',
        value: data.verified_products || 0,
        description: 'Productos validados y verificados',
        icon: CheckCircle,
        color: 'green',
        progress: {
          current: data.verified_products || 0,
          total: data.total_products || 1,
          label: 'Porcentaje verificado'
        },
        badge: {
          text: `${data.total_products > 0 ? Math.round(((data.verified_products || 0) / data.total_products) * 100) : 0}%`,
          variant: 'default'
        }
      },
      {
        id: 'argentine_products',
        title: 'Productos Argentinos',
        value: data.argentine_products || 0,
        description: 'Productos de origen nacional',
        icon: Globe,
        color: 'yellow',
        progress: {
          current: data.argentine_products || 0,
          total: data.total_products || 1,
          label: 'Porcentaje nacional'
        },
        badge: {
          text: `${Math.round((data.avg_quality_score || 0) * 100)}% calidad`,
          variant: 'secondary'
        }
      }
    ];
  }, [overviewData]);

  // Cargar productos con filtros
  const fetchProducts = useCallback(async (criteria: any = {}) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(criteria.page || 1),
        page_size: String(criteria.page_size || 10) // Backend PIM no soporta 20, usar 10
      });

      // ✅ AGREGAR FILTROS A LA BÚSQUEDA
      if (searchValue) {
        params.append('search', searchValue);
      }
      if (brandFilter) {
        params.append('brand', brandFilter);
      }
      if (verificationFilter) {
        params.append('is_verified', verificationFilter);
      }
      if (sourceFilter) {
        params.append('source', sourceFilter);
      }
      if (statusFilter) {
        params.append('is_active', statusFilter);
      }

      // Solo agregar sorting si está especificado para evitar 500 error
      if (criteria.sort_by && criteria.sort_dir) {
        params.append('sort_by', criteria.sort_by);
        params.append('sort_dir', criteria.sort_dir);
      }

      console.log('🔍 Fetching products with filters:', params.toString());
      const response = await fetch(`/api/pim/global-catalog?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setProducts(data.items || []);
      setTotalCount(data.total_count || 0);
      console.log('✅ Products loaded:', data.items?.length || 0, 'total:', data.total_count || 0);
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      setProducts([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [searchValue, brandFilter, verificationFilter, sourceFilter, statusFilter]);

  // ✅ AUTO-APLICAR FILTROS: Ejecutar búsqueda cuando cambien los filtros
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchProducts();
    }, searchValue ? 300 : 0); // Debounce para búsqueda, inmediato para otros filtros

    return () => clearTimeout(debounceTimer);
  }, [searchValue, brandFilter, verificationFilter, sourceFilter, statusFilter]); // Dependencias específicas, no fetchProducts

  // Handlers
  const handleViewProduct = (productId: string) => {
    router.push(`/global-catalog/view/${productId}`);
  };

  const handleEditProduct = (productId: string) => {
    router.push(`/global-catalog/edit/${productId}`);
  };

  const handleDeleteProduct = async (productId: string) => {
    // TODO: Implementar delete
    console.log('Delete product:', productId);
  };

  // Configuración de tabla
  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: 'name',
      header: 'Producto',
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="space-y-1">
            <div className="font-medium text-sm">{product.name}</div>
            {product.brand && (
              <div className="text-xs text-muted-foreground">
                Marca: {product.brand}
              </div>
            )}
            {product.category && (
              <div className="text-xs text-muted-foreground">
                Categoría: {product.category}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'price',
      header: 'Precio',
      cell: ({ row }) => {
        const price = row.getValue('price') as number;
        return (
          <span className="font-medium text-green-600">
            ${price ? price.toFixed(2) : 'N/A'}
          </span>
        );
      },
    },
    {
      accessorKey: 'source',
      header: 'Fuente',
      cell: ({ row }) => {
        const source = row.getValue('source') as string;
        return (
          <Badge variant="outline" className="capitalize">
            {source}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'quality_score',
      header: 'Calidad',
      cell: ({ row }) => {
        const score = row.getValue('quality_score') as number;
        return (
          <div className="flex items-center gap-2">
            <div className="w-16 bg-muted rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${score || 0}%` }}
              />
            </div>
            <span className="text-sm text-muted-foreground min-w-[40px]">
              {score || 0}%
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'is_verified',
      header: 'Estado',
      cell: ({ row }) => {
        const product = row.original;
        const isVerified = product.is_verified;
        const isActive = product.is_active;

        return (
          <div className="space-y-1">
            <Badge
              variant={isVerified ? "default" : "secondary"}
              className={isVerified ? "bg-green-100 text-green-800" : ""}
            >
              {isVerified ? 'Verificado' : 'Sin verificar'}
            </Badge>
            {!isActive && (
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                Inactivo
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => {
        const product = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => handleViewProduct(product.id)}
                className="cursor-pointer"
              >
                <Eye className="mr-2 h-4 w-4" />
                Ver Producto
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleEditProduct(product.id)}
                className="cursor-pointer"
              >
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDeleteProduct(product.id)}
                className="cursor-pointer text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // ✅ Clear all filters function
  const clearAllFilters = useCallback(() => {
    console.log('🧹 Clearing all filters...');
    setSearchValue('');
    setBrandFilter('');
    setVerificationFilter('');
    setSourceFilter('');
    setStatusFilter('');
  }, []);

  // 🔍 FiltersOnlyBar configuration (v2.0 with API connections)
  const filtersConfig: FilterConfig[] = [
    {
      key: 'search',
      type: 'search',
      placeholder: 'Buscar productos por nombre...',
      value: searchValue,
      onChange: (value) => {
        console.log('🔍 Search changed:', value);
        setSearchValue(value);
      }
    },
    {
      key: 'brand',
      label: 'Marca',
      type: 'brand-select', // ✅ NEW: Connected to MarketplaceBrandSelect API
      placeholder: 'Todas las marcas',
      value: brandFilter,
      onChange: (value) => {
        console.log('🏷️ Brand changed:', value);
        setBrandFilter(value);
      },
      showActiveOnly: true,
      showVerifiedOnly: false
    },
    {
      key: 'is_verified',
      label: 'Estado de Verificación',
      type: 'select',
      value: verificationFilter,
      onChange: (value) => {
        console.log('✅ Verification changed:', value);
        setVerificationFilter(value);
      },
      options: [
        { label: 'Todos', value: '' },
        { label: 'Verificados', value: 'true' },
        { label: 'Sin Verificar', value: 'false' }
      ]
    },
    {
      key: 'source',
      label: 'Fuente',
      type: 'api-select', // ✅ NEW: Using SearchableSelect  
      value: sourceFilter,
      onChange: (value) => {
        console.log('📁 Source changed:', value);
        setSourceFilter(value);
      },
      options: [
        { label: 'Todas las fuentes', value: '' },
        { label: 'Disco', value: 'disco' },
        { label: 'Manual', value: 'manual' },
        { label: 'API', value: 'api' }
      ]
    },
    {
      key: 'is_active',
      label: 'Estado de Producto',
      type: 'select',
      value: statusFilter,
      onChange: (value) => {
        console.log('🔄 Status changed:', value);
        setStatusFilter(value);
      },
      options: [
        { label: 'Todos los estados', value: '' },
        { label: 'Activos', value: 'true' },
        { label: 'Inactivos', value: 'false' }
      ]
    }
  ];

  // ✅ Refresh function for filters
  const refreshFilters = useCallback(() => {
    // Trigger refresh of both overview and products with current filters
    refetchOverview();
    fetchProducts(); 
    console.log('🔄 Refreshing global catalog data with current filters...');
  }, [refetchOverview, fetchProducts]);

  // ⚡ ActionsOnlyBar configuration
  const actionsConfig: ActionConfig[] = [
    {
      label: 'Exportar Catálogo',
      icon: Download,
      variant: 'outline',
      onClick: () => {
        // TODO: Implementar exportación
        alert('Exportando catálogo...');
      }
    },
    {
      label: 'Importar Productos',
      icon: Upload,
      variant: 'outline',
      onClick: () => {
        // TODO: Implementar importación
        router.push('/global-catalog/import');
      }
    }
  ];

  const primaryAction: ActionConfig = {
    label: 'Nuevo Producto',
    icon: Plus,
    variant: 'default',
    onClick: () => router.push('/global-catalog/create')
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Stats Overview */}
      <StatsOverview
        title="Estadísticas del Catálogo"
        subtitle={`${totalCount} productos totales`}
        metrics={statsMetrics}
        defaultExpanded={false}
        variant="detailed"
      />

      {/* ✅ FiltersOnlyBar v2.0 - Colapsable + APIs reales */}
      <FiltersOnlyBar
        filters={filtersConfig}
        variant="full"
        groupByType={true}
        collapsible={true}
        defaultExpanded={false}
        expandedFiltersBreakpoint={1} // Solo búsqueda visible por defecto
        onRefresh={refreshFilters}
        loading={overviewLoading}
      />

      {/* ✅ ActionsOnlyBar - Botones separados por función */}
      <ActionsOnlyBar
        actions={actionsConfig}
        primaryAction={primaryAction}
        variant="full"
        justifyContent="start"
        groupSimilar={true}
      />

      {/* ✅ Tabla limpia sin Card wrapper */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Fuente</TableHead>
              <TableHead>Calidad</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-[100px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
                    Cargando productos...
                  </div>
                </TableCell>
              </TableRow>
            ) : products.length > 0 ? (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{product.name}</span>
                      {product.brand && (
                        <span className="text-xs text-muted-foreground">{product.brand}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-green-600 font-medium">
                    ${product.price}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {product.source}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{
                            backgroundColor: product.quality_score >= 75 ? '#22c55e' : 
                                           product.quality_score >= 50 ? '#eab308' : '#ef4444'
                          }}
                        />
                        <span className="text-xs">{product.quality_score}%</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Badge variant={product.is_verified ? 'default' : 'secondary'}>
                        {product.is_verified ? (
                          <>
                            <ShieldCheck className="w-3 h-3 mr-1" />
                            Verificado
                          </>
                        ) : (
                          <>
                            <Shield className="w-3 h-3 mr-1" />
                            Sin verificar
                          </>
                        )}
                      </Badge>
                      <Badge variant={product.is_active ? 'outline' : 'destructive'}>
                        {product.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => router.push(`/global-catalog/${product.id}`)}
                          className="cursor-pointer"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Ver Detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => router.push(`/global-catalog/${product.id}/edit`)}
                          className="cursor-pointer"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            if (confirm('¿Estás seguro de eliminar este producto?')) {
                              // TODO: Implementar eliminación
                              alert('Eliminando producto...');
                            }
                          }}
                          className="cursor-pointer text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No hay productos en el catálogo.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* ✅ Información de resultados con filtros */}
      <div className="flex items-center justify-between py-4 border-t">
        <div className="text-sm text-muted-foreground">
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              Aplicando filtros...
            </div>
          ) : totalCount > 0 ? (
            <div className="flex items-center gap-2">
              <span>Mostrando {products.length} de {totalCount} productos</span>
              {(searchValue || brandFilter || verificationFilter || sourceFilter || statusFilter) && (
                <Badge variant="outline" className="text-xs">
                  Filtros aplicados automáticamente
                </Badge>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-4 w-4" />
              No se encontraron productos con los filtros actuales
            </div>
          )}
        </div>
        
        <div className="text-xs text-muted-foreground">
          🔄 Los filtros se aplican automáticamente
        </div>
      </div>
    </div>
  );
}