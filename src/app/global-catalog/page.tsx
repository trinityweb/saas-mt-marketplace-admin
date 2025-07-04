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
  BarChart3,
  ArrowUpDown
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { StatsCard } from '@/components/ui/stats-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

// Componente de paginación mejorada
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({ currentPage, totalPages, totalCount, pageSize, onPageChange }: PaginationProps) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 7;
    
    if (totalPages <= maxVisiblePages) {
      // Si hay pocas páginas, mostrar todas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Siempre mostrar la primera página
      pages.push(1);
      
      if (currentPage <= 4) {
        // Estamos cerca del inicio
        for (let i = 2; i <= Math.min(5, totalPages - 1); i++) {
          pages.push(i);
        }
        if (totalPages > 5) {
          pages.push('ellipsis-end');
          pages.push(totalPages);
        }
      } else if (currentPage >= totalPages - 3) {
        // Estamos cerca del final
        if (totalPages > 5) {
          pages.push('ellipsis-start');
        }
        for (let i = Math.max(totalPages - 4, 2); i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Estamos en el medio
        pages.push('ellipsis-start');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis-end');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-muted-foreground">
        Mostrando {startItem}-{endItem} de {totalCount} productos
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          Anterior
        </Button>
        
        {getPageNumbers().map((page, index) => (
          page === 'ellipsis-start' || page === 'ellipsis-end' ? (
            <span key={page} className="px-2 text-muted-foreground">...</span>
          ) : (
            <Button
              key={`page-${page}`}
              variant={currentPage === page ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPageChange(page as number)}
              className="w-10 h-8"
            >
              {page}
            </Button>
          )
        ))}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
};

import { GlobalCatalogProduct } from '@/lib/api/pim';
import { useHeader } from '@/components/layout/admin-layout';
import { CriteriaDataTable, CriteriaResponse, SearchCriteria } from '@/components/ui/criteria-data-table';
import { useTableCriteria } from '@/hooks/use-table-criteria';
import { Filter as FilterType } from '@/components/ui/table-toolbar';
import { ColumnDef } from '@tanstack/react-table';

// Interfaces para la respuesta del backend
interface GlobalCatalogSummary {
  total_products: number;
  argentine_products: number;
  verified_products: number;
  high_quality_products: number;
  average_quality: number;
}

interface GlobalCatalogBackendResponse {
  products: GlobalCatalogProduct[];
  pagination: {
    offset: number;
    limit: number;
    total: number;
    has_next: boolean;
    has_prev: boolean;
    total_pages: number;
  };
  summary: GlobalCatalogSummary;
}

// Tipos para la vista
type ViewMode = 'table' | 'cards';

// Componente para una card de producto
interface ProductCardProps {
  product: GlobalCatalogProduct;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onVerify: (id: string) => void;
  onDelete: (id: string) => void;
}

const ProductCard = ({ product, onView, onEdit, onVerify, onDelete }: ProductCardProps) => {

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.style.display = 'none';
    target.nextElementSibling?.classList.remove('hidden');
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-gray-200 hover:border-gray-300">
      <CardContent>
        {/* Imagen del producto */}
        <div className="relative mb-4 bg-gray-50 rounded-lg overflow-hidden" style={{ aspectRatio: '1/1', height: '180px' }}>
          {product.image_url ? (
            <>
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                onError={handleImageError}
              />
              <div className="hidden absolute inset-0 flex items-center justify-center bg-gray-100">
                <ImageIcon className="h-12 w-12 text-gray-400" />
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <ImageIcon className="h-12 w-12 text-gray-400" />
            </div>
          )}
          
          {/* Badge de verificación */}
          {product.is_verified && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-green-500 text-white">
                <CheckCircle className="h-3 w-3 mr-1" />
                Verificado
              </Badge>
            </div>
          )}
        </div>

        {/* Información del producto */}
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-sm line-clamp-2 flex-1">{product.name}</h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onView(product.id)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver detalles
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(product.id)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onVerify(product.id)}
                  className="text-green-600"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  {product.is_verified ? 'Desverificar' : 'Verificar'}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete(product.id)}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* EAN */}
          <p className="text-xs text-muted-foreground font-mono">{product.ean}</p>

          {/* Marca y Categoría */}
          <div className="flex flex-wrap gap-1">
            {product.brand && (
              <Badge variant="outline" className="text-xs">
                {product.brand}
              </Badge>
            )}
            {product.category && (
              <Badge variant="secondary" className="text-xs">
                {product.category}
              </Badge>
            )}
          </div>

          {/* Precio y Calidad */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {product.price && (
                <span className="font-semibold text-sm">
                  ${product.price}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-1">
              <Star className="h-3 w-3 text-yellow-400 fill-current" />
              <span className="text-xs text-muted-foreground">
                {Math.round(product.quality_score * 100)}%
              </span>
            </div>
          </div>

          {/* Fuente e información adicional */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Fuente: {product.source || 'Manual'}</span>
            {product.is_verified && (
              <Badge variant="outline" className="text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />
                Verificado
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Componente para vista de cards
interface ProductCardsViewProps {
  products: GlobalCatalogProduct[];
  loading: boolean;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onVerify: (id: string) => void;
  onDelete: (id: string) => void;
}

const ProductCardsView = ({ products, loading, onView, onEdit, onVerify, onDelete }: ProductCardsViewProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent>
              <div className="bg-gray-200 rounded-lg h-48 mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="flex space-x-2">
                  <div className="h-5 bg-gray-200 rounded w-16"></div>
                  <div className="h-5 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No se encontraron productos</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onView={onView}
          onEdit={onEdit}
          onVerify={onVerify}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default function GlobalCatalogPage() {
  const router = useRouter();
  const { setHeaderProps, clearHeaderProps } = useHeader();
  
  const [products, setProducts] = useState<GlobalCatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [summary, setSummary] = useState<GlobalCatalogSummary>({
    total_products: 0,
    argentine_products: 0,
    verified_products: 0,
    high_quality_products: 0,
    average_quality: 0
  });

  // Estados para filtros dinámicos
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availableSources, setAvailableSources] = useState<string[]>([]);

  // Estado para paginación
  const [criteriaResponse, setCriteriaResponse] = useState<CriteriaResponse<GlobalCatalogProduct>>({
    data: [],
    total_count: 0,
    page: 1,
    page_size: 20
  });

  // Icono memoizado para evitar recrear JSX
  const headerIcon = useMemo(() => <Globe className="w-5 h-5 text-white" />, []);

  // Establecer header dinámico
  useEffect(() => {
    setHeaderProps({
      title: 'Catálogo Global',
      subtitle: 'Gestión de productos del catálogo global del marketplace',
      backUrl: '/',
      backLabel: 'Volver al Dashboard',
      icon: headerIcon
    });

    return () => {
      clearHeaderProps();
    };
  }, [setHeaderProps, clearHeaderProps, headerIcon]);

  // Función para obtener productos
  const fetchProducts = useCallback(async (criteria: SearchCriteria) => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      
      // Paginación - ajustar para vista de cards
      const pageSize = viewMode === 'cards' ? (criteria.page_size || 20) : (criteria.page_size || 20);
      const offset = ((criteria.page || 1) - 1) * pageSize;
      params.append('offset', offset.toString());
      params.append('limit', pageSize.toString());
      
      // Filtros
      if (criteria.search) {
        params.append('search', criteria.search);
      }
      if (criteria.brand && criteria.brand !== 'all') {
        params.append('brand', criteria.brand);
      }
      if (criteria.category && criteria.category !== 'all') {
        params.append('category', criteria.category);
      }
      if (criteria.is_verified && criteria.is_verified !== 'all') {
        params.append('is_verified', criteria.is_verified);
      }
      if (criteria.source && criteria.source !== 'all') {
        params.append('source', criteria.source);
      }
      if (criteria.is_argentine && criteria.is_argentine !== 'all') {
        params.append('is_argentine', criteria.is_argentine);
      }

      const response = await fetch(`/api/pim/global-catalog?${params.toString()}`);
      const data: GlobalCatalogBackendResponse = await response.json();
      
      setProducts(data.products || []);
      setSummary(data.summary || {
        total_products: 0,
        argentine_products: 0,
        verified_products: 0,
        high_quality_products: 0,
        average_quality: 0
      });
      
      setCriteriaResponse({
        data: data.products || [],
        total_count: data.pagination?.total || 0,
        page: criteria.page || 1,
        page_size: pageSize
      });
      
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [viewMode]);

  // Función para obtener opciones de filtros dinámicos
  const fetchFilterOptions = useCallback(async () => {
    try {
      // Hacer una petición con límite alto para obtener más datos para filtros
      const response = await fetch('/api/pim/global-catalog?limit=100');
      const data: GlobalCatalogBackendResponse = await response.json();
      
      const products = data.products || [];
      
      // Extraer valores únicos para filtros
      const brands = [...new Set(products.map(p => p.brand).filter(Boolean))].sort();
      const categories = [...new Set(products.map(p => p.category).filter(Boolean))].sort();
      const sources = [...new Set(products.map(p => p.source).filter(Boolean))].sort();
      
      setAvailableBrands(brands);
      setAvailableCategories(categories);
      setAvailableSources(sources);
      
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  }, []);

  // Hook para manejar criterios de búsqueda
  const criteriaState = useTableCriteria({
    defaultPageSize: 20,
    onSearch: fetchProducts
  });

  // Cargar datos iniciales
  useEffect(() => {
    fetchFilterOptions();
    fetchProducts(criteriaState.criteria);
  }, [fetchFilterOptions, fetchProducts, criteriaState.criteria]);

  // Funciones de manejo de acciones
  const handleViewProduct = useCallback((productId: string) => {
    router.push(`/global-catalog/view/${productId}`);
  }, [router]);

  const handleEditProduct = useCallback((productId: string) => {
    router.push(`/global-catalog/edit/${productId}`);
  }, [router]);

  // Filtros configurables para global catalog
  const globalCatalogFilters: FilterType[] = useMemo(() => [
    {
      type: 'select',
      key: 'brand',
      placeholder: 'Filtrar por marca',
      value: criteriaState.criteria.brand || 'all',
      options: [
        { value: 'all', label: 'Todas las marcas' },
        ...availableBrands.map(brand => ({ value: brand, label: brand }))
      ],
      onChange: (value) => criteriaState.handleFilterChange('brand', value === 'all' ? undefined : value)
    },
    {
      type: 'select',
      key: 'category',
      placeholder: 'Filtrar por categoría',
      value: criteriaState.criteria.category || 'all',
      options: [
        { value: 'all', label: 'Todas las categorías' },
        ...availableCategories.map(category => ({ value: category, label: category }))
      ],
      onChange: (value) => criteriaState.handleFilterChange('category', value === 'all' ? undefined : value)
    },
    {
      type: 'select',
      key: 'is_verified',
      placeholder: 'Estado verificación',
      value: criteriaState.criteria.is_verified || 'all',
      options: [
        { value: 'all', label: 'Todos los estados' },
        { value: 'true', label: 'Verificados' },
        { value: 'false', label: 'No verificados' }
      ],
      onChange: (value) => criteriaState.handleFilterChange('is_verified', value === 'all' ? undefined : value)
    },
    {
      type: 'select',
      key: 'source',
      placeholder: 'Filtrar por fuente',
      value: criteriaState.criteria.source || 'all',
      options: [
        { value: 'all', label: 'Todas las fuentes' },
        ...availableSources.map(source => ({ value: source, label: source }))
      ],
      onChange: (value) => criteriaState.handleFilterChange('source', value === 'all' ? undefined : value)
    }
  ], [criteriaState, availableBrands, availableCategories, availableSources]);

  // Función para verificar producto
  const handleVerifyProduct = useCallback(async (productId: string) => {
    try {
      const response = await fetch(`/api/pim/global-catalog/${productId}/verify`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Recargar datos
        await fetchProducts(criteriaState.criteria);
      }
    } catch (error) {
      console.error('Error verifying product:', error);
    }
  }, [fetchProducts, criteriaState.criteria]);

  // Función para eliminar producto
  const handleDeleteProduct = useCallback(async (productId: string) => {
    try {
      const response = await fetch(`/api/pim/global-catalog/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Recargar datos
        await fetchProducts(criteriaState.criteria);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  }, [fetchProducts, criteriaState.criteria]);

  // Columnas de la tabla
  const columns: ColumnDef<GlobalCatalogProduct>[] = useMemo(() => [
    {
      accessorKey: 'ean',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          EAN
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-mono text-sm">
          {row.getValue('ean') || 'N/A'}
        </div>
      ),
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Nombre
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate">
          {row.getValue('name')}
        </div>
      ),
    },
    {
      accessorKey: 'brand',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Marca
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.getValue('brand') || 'Sin marca'}
        </Badge>
      ),
    },
    {
      accessorKey: 'category',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Categoría
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {row.getValue('category') || 'Sin categoría'}
        </div>
      ),
    },
    {
      accessorKey: 'price',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Precio
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const price = row.getValue('price') as number;
        return price ? (
          <div className="text-sm font-medium">
            ${price.toLocaleString('es-AR')}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">N/A</div>
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
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const score = row.getValue('quality_score') as number;
        const getQualityColor = (score: number) => {
          if (score >= 80) return 'text-green-600';
          if (score >= 60) return 'text-yellow-600';
          return 'text-red-600';
        };
        
        return (
          <div className={`text-sm font-medium ${getQualityColor(score)}`}>
            {score}%
          </div>
        );
      },
    },
    {
      accessorKey: 'is_verified',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Verificado
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const isVerified = row.getValue('is_verified') as boolean;
        return (
          <Badge variant={isVerified ? 'default' : 'secondary'}>
            {isVerified ? 'Sí' : 'No'}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'source',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Fuente
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.getValue('source')}
        </Badge>
      ),
    },
    {
      id: 'actions',
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
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(product.id)}>
                Copiar ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push(`/global-catalog/view/${product.id}`)}>
                <Eye className="mr-2 h-4 w-4" />
                Ver detalles
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/global-catalog/edit/${product.id}`)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              {!product.is_verified && (
                <DropdownMenuItem onClick={() => handleVerifyProduct(product.id)}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Verificar
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600"
                onClick={() => handleDeleteProduct(product.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ], [handleVerifyProduct, handleDeleteProduct, router]);

  if (loading && products.length === 0) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
        <div className="h-96 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards Mejoradas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total Productos"
          value={summary.total_products}
          description="Productos en el catálogo global"
          iconName="Package"
          iconColor="text-blue-600"
          trend={{
            value: 12,
            label: "Desde el mes pasado",
            type: 'up'
          }}
          progress={{
            value: summary.total_products,
            max: 10000,
            color: 'blue'
          }}
        />
        
        <StatsCard
          title="Verificados"
          value={summary.verified_products}
          description="Productos verificados y validados"
          iconName="CheckCircle"
          iconColor="text-green-600"
          trend={{
            value: 8,
            label: "Nuevos verificados esta semana",
            type: 'up'
          }}
          progress={{
            value: summary.verified_products,
            max: summary.total_products,
            color: 'green'
          }}
          badge={{
            text: `${Math.round((summary.verified_products / summary.total_products) * 100)}%`,
            variant: 'default'
          }}
        />
        
        <StatsCard
          title="Alta Calidad"
          value={summary.high_quality_products}
          description="Productos con calidad superior al 80%"
          iconName="Award"
          iconColor="text-yellow-600"
          trend={{
            value: 15,
            label: "Mejora en calidad promedio",
            type: 'up'
          }}
          progress={{
            value: summary.high_quality_products,
            max: summary.total_products,
            color: 'yellow'
          }}
          badge={{
            text: `${summary.average_quality}% promedio`,
            variant: 'secondary'
          }}
        />
      </div>

      {/* Solapas para alternar entre vistas */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="table" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Vista de Tabla
          </TabsTrigger>
          <TabsTrigger value="cards" className="flex items-center gap-2">
            <Grid3X3 className="h-4 w-4" />
            Vista de Cards
          </TabsTrigger>
        </TabsList>

        {/* Vista de Tabla */}
        <TabsContent value="table" className="space-y-6">
          <CriteriaDataTable
            columns={columns}
            data={criteriaResponse.data}
            totalCount={criteriaResponse.total_count}
            currentPage={criteriaResponse.page}
            pageSize={criteriaResponse.page_size}
            loading={loading}
            searchValue={criteriaState.criteria.search || ''}
            searchPlaceholder="Buscar productos por EAN, nombre, marca..."
            buttonText="Nuevo Producto"
            filters={globalCatalogFilters}
            fullWidth={true}
            onCreateClick={() => router.push('/global-catalog/create')}
            onSearchChange={criteriaState.handleSearchChange}
            onPageChange={criteriaState.handlePageChange}
            onPageSizeChange={criteriaState.handlePageSizeChange}
            onSortChange={criteriaState.handleSortChange}
          />
        </TabsContent>

        {/* Vista de Cards */}
        <TabsContent value="cards" className="space-y-6">
          <Card>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-4">
                  <div className="relative max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pl-8"
                      placeholder="Buscar productos por EAN, nombre, marca..."
                      value={criteriaState.criteria.search || ''}
                      onChange={(e) => criteriaState.handleSearchChange(e.target.value)}
                    />
                  </div>
                  {globalCatalogFilters.map((filter) => {
                    if (filter.type === 'select' && 'options' in filter) {
                      return (
                        <select
                          key={filter.key}
                          value={filter.value}
                          onChange={(e) => filter.onChange(e.target.value)}
                          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-w-[180px]"
                        >
                          {filter.options.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      );
                    }
                    return null;
                  })}
                </div>
                <Button onClick={() => router.push('/global-catalog/create')}>
                  <Package className="h-4 w-4 mr-2" />
                  Nuevo Producto
                </Button>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted-foreground mt-4">Cargando productos...</p>
                </div>
              ) : (
                <ProductCardsView
                  products={criteriaResponse.data}
                  loading={loading}
                  onView={handleViewProduct}
                  onEdit={handleEditProduct}
                  onVerify={handleVerifyProduct}
                  onDelete={handleDeleteProduct}
                />
              )}

              {/* Paginación para vista de cards */}
              {criteriaResponse.total_count > 0 && (
                <div className="mt-6">
                  <Pagination
                    currentPage={criteriaResponse.page}
                    totalPages={Math.ceil(criteriaResponse.total_count / criteriaResponse.page_size)}
                    totalCount={criteriaResponse.total_count}
                    pageSize={criteriaResponse.page_size}
                    onPageChange={criteriaState.handlePageChange}
                  />
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Stats Summary */}
      <div className="text-center text-sm text-muted-foreground space-y-1">
        <div className="flex justify-center items-center gap-6 flex-wrap">
          <span className="flex items-center gap-1">
            ✅ Verificados: {summary.verified_products}
          </span>
          <span className="flex items-center gap-1">
            ⭐ Alta calidad: {summary.high_quality_products}
          </span>
          <span className="flex items-center gap-1">
            📊 Calidad promedio: {summary.average_quality}%
          </span>
        </div>
      </div>
    </div>
  );
}