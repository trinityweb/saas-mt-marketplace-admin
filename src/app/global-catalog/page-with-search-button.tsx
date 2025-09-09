'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SearchWithButton } from '@/components/ui/search-with-button';
import { useSearchWithFilters } from '@/hooks/use-search-with-filters';
import { CriteriaDataTable } from '@/components/ui/criteria-data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Eye, Edit2, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Product {
  id: string;
  name: string;
  sku?: string;
  brand?: string;
  price?: number;
  quality_score?: number;
  is_verified: boolean;
  is_argentine_product?: boolean;
  created_at: string;
  image_url?: string;
}

interface ProductsResponse {
  items: Product[];
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export default function GlobalCatalogPageWithSearchButton() {
  const router = useRouter();
  const [data, setData] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  // API call function
  const fetchProducts = async (filters: any): Promise<void> => {
    console.log('🔍 Fetching products with filters:', filters);
    
    try {
      const params = new URLSearchParams();
      
      // Agregar parámetros de filtros
      if (filters.search) params.append('search', filters.search);
      if (filters.brand) params.append('brand', filters.brand);
      if (filters.is_verified !== undefined) params.append('is_verified', filters.is_verified);
      if (filters.is_argentine_product !== undefined) params.append('is_argentine_product', filters.is_argentine_product);
      if (filters.min_quality) params.append('min_quality', filters.min_quality);
      
      // Paginación
      params.append('page', String(filters.page || 1));
      params.append('page_size', String(filters.page_size || 20));
      
      // Ordenamiento
      if (filters.sort_by) params.append('sort_by', filters.sort_by);
      if (filters.sort_dir) params.append('sort_dir', filters.sort_dir);

      const response = await fetch(`/api/pim/global-catalog?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result: ProductsResponse = await response.json();
      
      setData(result.items || []);
      setTotalCount(result.total_count || 0);
      
      console.log('✅ Products loaded:', result.items?.length || 0);
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      setData([]);
      setTotalCount(0);
    }
  };

  // Use search hook
  const {
    filters,
    tempFilters,
    loading,
    updateTempFilters,
    executeSearch,
    handlePageChange,
    handlePageSizeChange,
    handleSortChange,
    hasChanges
  } = useSearchWithFilters({
    initialFilters: { search: '', page: 1, page_size: 20 },
    onSearch: fetchProducts
  });

  // Load initial data
  useEffect(() => {
    executeSearch(false);
  }, []);

  // Handlers
  const handleSearchSubmit = (searchTerm: string) => {
    updateTempFilters({ search: searchTerm });
    executeSearch(true); // Reset to page 1
  };

  const handleViewProduct = (productId: string) => {
    router.push(`/global-catalog/view/${productId}`);
  };

  const handleEditProduct = (productId: string) => {
    router.push(`/global-catalog/edit/${productId}`);
  };

  const handleDeleteProduct = async (productId: string) => {
    console.log('Delete product:', productId);
    // Implementar lógica de eliminación
  };

  // Table columns
  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "name",
      header: "Producto",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
              {product.image_url ? (
                <img 
                  src={product.image_url} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs text-gray-400">IMG</span>
              )}
            </div>
            <div>
              <div className="font-medium text-gray-900">{product.name}</div>
              {product.sku && (
                <div className="text-sm text-gray-500">SKU: {product.sku}</div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "brand",
      header: "Marca",
      cell: ({ row }) => (
        <div className="text-sm text-gray-900">
          {row.getValue("brand") || "Sin marca"}
        </div>
      ),
    },
    {
      accessorKey: "price",
      header: "Precio",
      cell: ({ row }) => {
        const price = row.getValue("price") as number;
        return price ? (
          <div className="text-sm font-medium text-gray-900">
            ${price.toLocaleString('es-AR')}
          </div>
        ) : (
          <span className="text-sm text-gray-400">Sin precio</span>
        );
      },
    },
    {
      accessorKey: "quality_score",
      header: "Calidad",
      cell: ({ row }) => {
        const score = row.getValue("quality_score") as number;
        if (!score) return <span className="text-sm text-gray-400">N/A</span>;
        
        const getScoreColor = (score: number) => {
          if (score >= 8) return 'bg-green-100 text-green-800';
          if (score >= 6) return 'bg-yellow-100 text-yellow-800';
          return 'bg-red-100 text-red-800';
        };
        
        return (
          <Badge className={`text-xs ${getScoreColor(score)}`}>
            {score.toFixed(1)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "is_verified",
      header: "Verificado",
      cell: ({ row }) => {
        const isVerified = row.getValue("is_verified");
        return (
          <Badge variant={isVerified ? "default" : "secondary"}>
            {isVerified ? "Verificado" : "Sin verificar"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "is_argentine_product",
      header: "Origen",
      cell: ({ row }) => {
        const isArgentine = row.getValue("is_argentine_product");
        return (
          <Badge variant={isArgentine ? "outline" : "secondary"}>
            {isArgentine ? "🇦🇷 Argentina" : "Internacional"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
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
              <DropdownMenuItem onClick={() => handleViewProduct(product.id)}>
                <Eye className="mr-2 h-4 w-4" />
                Ver detalles
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEditProduct(product.id)}>
                <Edit2 className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
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
  ];

  // Filtros para el componente CriteriaDataTable
  const productFilters = [
    {
      key: 'is_verified',
      label: 'Verificación',
      options: [
        { value: 'all', label: 'Todos' },
        { value: 'true', label: 'Verificados' },
        { value: 'false', label: 'Sin verificar' }
      ],
      value: tempFilters.is_verified || 'all',
      onChange: (value: string) => {
        updateTempFilters({ 
          is_verified: value === 'all' ? undefined : value === 'true' 
        });
      }
    },
    {
      key: 'is_argentine_product',
      label: 'Origen',
      options: [
        { value: 'all', label: 'Todos' },
        { value: 'true', label: 'Argentina' },
        { value: 'false', label: 'Internacional' }
      ],
      value: tempFilters.is_argentine_product || 'all',
      onChange: (value: string) => {
        updateTempFilters({ 
          is_argentine_product: value === 'all' ? undefined : value === 'true' 
        });
      }
    },
    {
      key: 'min_quality',
      label: 'Calidad Mínima',
      options: [
        { value: 'all', label: 'Todas' },
        { value: '8', label: 'Alta (8+)' },
        { value: '6', label: 'Media (6+)' },
        { value: '4', label: 'Baja (4+)' }
      ],
      value: tempFilters.min_quality || 'all',
      onChange: (value: string) => {
        updateTempFilters({ 
          min_quality: value === 'all' ? undefined : parseInt(value) 
        });
      }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Catálogo Global</h1>
          <p className="text-gray-600">
            Gestiona el catálogo global de productos ({totalCount} productos)
          </p>
        </div>
        <Button onClick={() => router.push('/global-catalog/create')}>
          Agregar Producto
        </Button>
      </div>

      {/* Search with Button */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="space-y-4">
          <SearchWithButton
            value={tempFilters.search || ''}
            placeholder="Buscar productos por nombre, marca o SKU..."
            onSearch={handleSearchSubmit}
            loading={loading}
          />
          
          {hasChanges && (
            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                Tienes filtros sin aplicar. Haz clic en "Buscar" para aplicarlos.
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => executeSearch(true)}
                disabled={loading}
              >
                Aplicar Filtros
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Results Table */}
      <CriteriaDataTable
        columns={columns}
        data={data}
        totalCount={totalCount}
        currentPage={filters.page || 1}
        pageSize={filters.page_size || 20}
        loading={loading}
        searchValue={filters.search || ''}
        searchPlaceholder="Buscar productos..."
        buttonText="Nuevo Producto"
        filters={productFilters}
        onCreateClick={() => router.push('/global-catalog/create')}
        onSearchChange={() => {}} // Deshabilitado - usamos el botón
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onSortChange={handleSortChange}
        showSearch={false} // Deshabilitamos la búsqueda automática
      />
    </div>
  );
}
