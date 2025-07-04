'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Package, 
  CheckCircle, 
  Star,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Globe,
  Grid3X3,
  List,
  ImageIcon,
  TrendingUp,
  Award,
  BarChart3
} from 'lucide-react';

// Importaciones desde shared-ui
import { 
  Button,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  cn
} from '@/components/shared-ui';

import { GlobalCatalogProduct } from '@/lib/api/pim';
import { useHeader } from '@/components/layout/admin-layout';
import { CriteriaDataTable, CriteriaResponse, SearchCriteria } from '@/components/ui/criteria-data-table';
import { useTableCriteria } from '@/hooks/use-table-criteria';
import { Filter as FilterType } from '@/components/ui/table-toolbar';
import { ColumnDef } from '@tanstack/react-table';

// Interfaces
interface GlobalCatalogSummary {
  total_products: number;
  argentine_products: number;
  verified_products: number;
  active_products: number;
  average_quality_score: number;
}

// Mock data generator para demostración
const generateMockProducts = (count: number): GlobalCatalogProduct[] => {
  const brands = ['Samsung', 'Apple', 'Sony', 'LG', 'Philips'];
  const categories = ['Electrónica', 'Hogar', 'Deportes', 'Moda', 'Juguetes'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `prod-${i + 1}`,
    gtin: `779123456789${i}`,
    name: `Producto ${i + 1}`,
    brand: brands[Math.floor(Math.random() * brands.length)],
    description: `Descripción del producto ${i + 1}`,
    category: categories[Math.floor(Math.random() * categories.length)],
    country_code: Math.random() > 0.7 ? 'AR' : 'US',
    is_verified: Math.random() > 0.3,
    is_active: Math.random() > 0.2,
    quality_score: Math.random(),
    images: [`https://via.placeholder.com/150?text=Prod${i + 1}`],
    created_at: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
    updated_at: new Date().toISOString()
  }));
};

// Componente ProductCard para vista de grilla con shared-ui
const ProductCard = ({ 
  product, 
  onView, 
  onEdit, 
  onDelete 
}: { 
  product: GlobalCatalogProduct;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  return (
    <Card className="group hover:shadow-lg transition-shadow">
      <CardContent>
        <div className="relative">
          <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
            {product.images && product.images[0] ? (
              <img 
                src={product.images[0]} 
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="h-12 w-12 text-gray-400" />
              </div>
            )}
          </div>
          
          <div className="absolute top-2 right-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 bg-white/90">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                <DropdownMenuItem onClick={onView}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver detalles
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onDelete} className="text-red-600 dark:text-red-400">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="font-semibold text-sm line-clamp-2">{product.name}</h3>
          <p className="text-xs text-muted-foreground">{product.brand}</p>
          
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs">
              {product.gtin}
            </Badge>
            {product.country_code === 'AR' && (
              <Badge variant="success" className="text-xs">
                AR
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2 mt-2">
            {product.is_verified && (
              <Badge variant="success" className="text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />
                Verificado
              </Badge>
            )}
            {product.quality_score > 0.8 && (
              <Badge variant="warning" className="text-xs">
                <Star className="h-3 w-3 mr-1" />
                Premium
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function GlobalCatalogPageRefactored() {
  const router = useRouter();
  const { setHeaderProps, clearHeaderProps } = useHeader();
  
  // Estados
  const [products, setProducts] = useState<GlobalCatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'table' | 'grid'>('table');
  const [summary, setSummary] = useState<GlobalCatalogSummary>({
    total_products: 0,
    argentine_products: 0,
    verified_products: 0,
    active_products: 0,
    average_quality_score: 0
  });

  // Estado para paginación
  const [criteriaResponse, setCriteriaResponse] = useState<CriteriaResponse<GlobalCatalogProduct>>({
    data: [],
    total_count: 0,
    page: 1,
    page_size: 20
  });

  // Icono memoizado
  const headerIcon = useMemo(() => <Package className="w-5 h-5 text-white" />, []);

  // Configurar header
  useEffect(() => {
    setHeaderProps({
      title: 'Catálogo Global',
      subtitle: `Explorar productos del catálogo global (${summary.total_products.toLocaleString()} productos)`,
      icon: headerIcon
    });

    return () => {
      clearHeaderProps();
    };
  }, [setHeaderProps, clearHeaderProps, headerIcon, summary.total_products]);

  // Hook para criterios de tabla
  const criteriaState = useTableCriteria({
    defaultPageSize: 20,
    onSearch: (criteria: SearchCriteria) => {
      applyFiltersAndPagination(criteria);
    }
  });

  // Función para aplicar filtros y paginación
  const applyFiltersAndPagination = useCallback((criteria: SearchCriteria) => {
    if (!products || products.length === 0) {
      setCriteriaResponse({
        data: [],
        total_count: 0,
        page: 1,
        page_size: 20
      });
      return;
    }

    let filtered = [...products];

    // Aplicar filtro de búsqueda
    if (criteria.search) {
      const searchTerm = criteria.search.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.brand?.toLowerCase().includes(searchTerm) ||
        product.gtin.includes(searchTerm)
      );
    }

    // Aplicar otros filtros si existen
    if (criteria.is_verified !== undefined && criteria.is_verified !== 'all') {
      const isVerified = criteria.is_verified === 'true';
      filtered = filtered.filter(product => product.is_verified === isVerified);
    }

    if (criteria.country_code && criteria.country_code !== 'all') {
      filtered = filtered.filter(product => product.country_code === criteria.country_code);
    }

    // Aplicar ordenamiento
    if (criteria.sort_by) {
      filtered.sort((a, b) => {
        const aValue = a[criteria.sort_by as keyof GlobalCatalogProduct];
        const bValue = b[criteria.sort_by as keyof GlobalCatalogProduct];
        
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;
        
        const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        return criteria.sort_dir === 'desc' ? -comparison : comparison;
      });
    }

    // Aplicar paginación
    const page = criteria.page || 1;
    const pageSize = criteria.page_size || 20;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = filtered.slice(startIndex, endIndex);

    setCriteriaResponse({
      data: paginatedData,
      total_count: filtered.length,
      page,
      page_size: pageSize
    });
  }, [products]);

  // Cargar datos mock
  useEffect(() => {
    const mockProducts = generateMockProducts(150);
    setProducts(mockProducts);
    
    // Calcular resumen
    setSummary({
      total_products: mockProducts.length,
      argentine_products: mockProducts.filter(p => p.country_code === 'AR').length,
      verified_products: mockProducts.filter(p => p.is_verified).length,
      active_products: mockProducts.filter(p => p.is_active).length,
      average_quality_score: mockProducts.reduce((acc, p) => acc + p.quality_score, 0) / mockProducts.length
    });
    
    setLoading(false);
  }, []);

  // Aplicar filtros cuando cambien los productos
  useEffect(() => {
    if (products.length > 0) {
      applyFiltersAndPagination(criteriaState.criteria);
    }
  }, [products, criteriaState.criteria, applyFiltersAndPagination]);

  // Columnas para la tabla con componentes shared-ui
  const columns: ColumnDef<GlobalCatalogProduct>[] = useMemo(() => [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Producto
        </Button>
      ),
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden">
              {product.images && product.images[0] ? (
                <img 
                  src={product.images[0]} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="h-5 w-5 text-gray-400" />
                </div>
              )}
            </div>
            <div>
              <div className="font-medium">{product.name}</div>
              <div className="text-sm text-muted-foreground">{product.brand}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'gtin',
      header: 'GTIN',
      cell: ({ row }) => (
        <Badge variant="outline" className="font-mono">
          {row.original.gtin}
        </Badge>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Categoría',
      cell: ({ row }) => (
        <span className="text-sm">{row.original.category || 'Sin categoría'}</span>
      ),
    },
    {
      accessorKey: 'country_code',
      header: 'País',
      cell: ({ row }) => (
        <Badge variant={row.original.country_code === 'AR' ? 'success' : 'secondary'}>
          {row.original.country_code}
        </Badge>
      ),
    },
    {
      accessorKey: 'is_verified',
      header: 'Verificación',
      cell: ({ row }) => {
        return row.original.is_verified ? (
          <Badge variant="success">
            <CheckCircle className="h-3 w-3 mr-1" />
            Verificado
          </Badge>
        ) : (
          <Badge variant="secondary">
            No verificado
          </Badge>
        );
      },
    },
    {
      accessorKey: 'quality_score',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Calidad
        </Button>
      ),
      cell: ({ row }) => {
        const score = Math.round(row.original.quality_score * 100);
        return (
          <div className="flex items-center space-x-2">
            <div className="text-sm font-medium">{score}%</div>
            <div className="w-16 bg-gray-200 rounded-full h-2">
              <div 
                className={cn(
                  "h-2 rounded-full",
                  score >= 80 ? "bg-green-600" : score >= 60 ? "bg-yellow-600" : "bg-red-600"
                )}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const product = row.original;
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => router.push(`/global-catalog/view/${product.id}`)}>
                <Eye className="mr-2 h-4 w-4" />
                Ver detalles
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/global-catalog/edit/${product.id}`)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600 dark:text-red-400">
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ], [router]);

  // Filtros configurables
  const productFilters: FilterType[] = useMemo(() => [
    {
      type: 'select',
      key: 'is_verified',
      placeholder: 'Estado de verificación',
      value: criteriaState.criteria.is_verified || 'all',
      options: [
        { value: 'all', label: 'Todos' },
        { value: 'true', label: 'Verificados' },
        { value: 'false', label: 'No verificados' }
      ],
      onChange: (value) => criteriaState.handleFilterChange('is_verified', value === 'all' ? undefined : value)
    },
    {
      type: 'select',
      key: 'country_code',
      placeholder: 'País',
      value: criteriaState.criteria.country_code || 'all',
      options: [
        { value: 'all', label: 'Todos los países' },
        { value: 'AR', label: 'Argentina' },
        { value: 'US', label: 'Estados Unidos' }
      ],
      onChange: (value) => criteriaState.handleFilterChange('country_code', value === 'all' ? undefined : value)
    }
  ], [criteriaState]);

  // Estadísticas con componentes shared-ui
  const renderStats = () => (
    <div className="grid gap-4 md:grid-cols-5 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.total_products.toLocaleString()}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Productos AR</CardTitle>
          <Globe className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.argentine_products.toLocaleString()}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Verificados</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.verified_products.toLocaleString()}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Activos</CardTitle>
          <TrendingUp className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.active_products.toLocaleString()}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Calidad Promedio</CardTitle>
          <BarChart3 className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {Math.round(summary.average_quality_score * 100)}%
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="container mx-auto py-6">
      {renderStats()}
      
      <Tabs value={currentView} onValueChange={(v) => setCurrentView(v as 'table' | 'grid')}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="table">
              <List className="h-4 w-4 mr-2" />
              Vista de Tabla
            </TabsTrigger>
            <TabsTrigger value="grid">
              <Grid3X3 className="h-4 w-4 mr-2" />
              Vista de Grilla
            </TabsTrigger>
          </TabsList>
          
          <Button onClick={() => router.push('/global-catalog/create')}>
            <Package className="h-4 w-4 mr-2" />
            Nuevo Producto
          </Button>
        </div>

        <TabsContent value="table" className="space-y-4">
          <CriteriaDataTable
            data={criteriaResponse.data}
            columns={columns}
            totalCount={criteriaResponse.total_count}
            loading={loading}
            searchPlaceholder="Buscar por nombre, marca o GTIN..."
            filters={productFilters}
            criteriaState={criteriaState}
            showCreateButton={false}
          />
        </TabsContent>

        <TabsContent value="grid" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {criteriaResponse.data.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onView={() => router.push(`/global-catalog/view/${product.id}`)}
                onEdit={() => router.push(`/global-catalog/edit/${product.id}`)}
                onDelete={() => console.log('Delete:', product.id)}
              />
            ))}
          </div>
          
          {criteriaResponse.total_count > criteriaResponse.page_size && (
            <div className="mt-6">
              <CriteriaDataTable
                data={[]}
                columns={[]}
                totalCount={criteriaResponse.total_count}
                loading={false}
                criteriaState={criteriaState}
                hideTable={true}
              />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}