'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ModernProductCard } from '@/components/shared/product-components/modern-product-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Package, 
  CheckCircle, 
  Star,
  Search,
  Eye,
  Edit,
  Trash2,
  Globe,
  Grid3X3,
  List,
  Filter,
  Plus,
  Download,
  Upload,
  TrendingUp,
  Award,
  BarChart3,
  SortAsc,
  SortDesc,
  Calendar,
  Tag
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface GlobalCatalogProduct {
  id: string;
  name: string;
  sku?: string;
  description?: string;
  brand?: string;
  category?: string;
  price?: number;
  image_url?: string;
  tags?: string[];
  quality_score?: number;
  is_verified?: boolean;
  source?: string;
  created_at: string;
  updated_at: string;
}

interface GlobalCatalogSummary {
  total_products: number;
  argentine_products: number;
  verified_products: number;
  high_quality_products: number;
  average_quality: number;
}

type ViewMode = 'grid' | 'list';
type SortField = 'name' | 'created_at' | 'quality_score' | 'price';
type SortOrder = 'asc' | 'desc';

export default function ModernGlobalCatalogPage() {
  const router = useRouter();
  const [products, setProducts] = useState<GlobalCatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState<string>('all');
  const [qualityFilter, setQualityFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [summary, setSummary] = useState<GlobalCatalogSummary | null>(null);

  // Cargar productos
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/global-catalog/products');
        
        if (!response.ok) {
          throw new Error('Error al cargar productos');
        }

        const data = await response.json();
        setProducts(data.products || []);
        setSummary(data.summary || null);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Filtrar y ordenar productos
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.sku?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesVerified = verifiedFilter === 'all' || 
                            (verifiedFilter === 'verified' && product.is_verified) ||
                            (verifiedFilter === 'unverified' && !product.is_verified);
      
      const matchesQuality = qualityFilter === 'all' || 
                           (qualityFilter === 'high' && product.quality_score && product.quality_score >= 8) ||
                           (qualityFilter === 'medium' && product.quality_score && product.quality_score >= 6 && product.quality_score < 8) ||
                           (qualityFilter === 'low' && product.quality_score && product.quality_score < 6);
      
      return matchesSearch && matchesVerified && matchesQuality;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'quality_score':
          aValue = a.quality_score || 0;
          bValue = b.quality_score || 0;
          break;
        case 'price':
          aValue = a.price || 0;
          bValue = b.price || 0;
          break;
        case 'created_at':
        default:
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleView = (id: string) => {
    router.push(`/global-catalog/view/${id}`);
  };

  const handleEdit = (id: string) => {
    router.push(`/global-catalog/edit/${id}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      return;
    }

    try {
      const response = await fetch(`/api/global-catalog/products/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar producto');
      }

      // Recargar productos
      window.location.reload();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleVerify = async (id: string) => {
    try {
      const response = await fetch(`/api/global-catalog/products/${id}/verify`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Error al verificar producto');
      }

      // Recargar productos
      window.location.reload();
    } catch (error) {
      console.error('Error verifying product:', error);
    }
  };

  const handleFavorite = (id: string) => {
    // TODO: Implementar funcionalidad de favoritos
    console.log('Favorite product:', id);
  };

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-gray-200 rounded-lg h-48 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header con estadísticas */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Catálogo Global</h1>
            <p className="text-gray-600">Gestiona el catálogo maestro de productos</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Importar
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Producto
            </Button>
          </div>
        </div>

        {/* Estadísticas */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{summary.total_products}</div>
              <div className="text-sm text-blue-600">Total</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{summary.verified_products}</div>
              <div className="text-sm text-green-600">Verificados</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{summary.high_quality_products}</div>
              <div className="text-sm text-yellow-600">Alta Calidad</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{summary.argentine_products}</div>
              <div className="text-sm text-purple-600">Argentinos</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{summary.average_quality.toFixed(1)}</div>
              <div className="text-sm text-orange-600">Calidad Promedio</div>
            </div>
          </div>
        )}
      </div>

      {/* Filtros y controles */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Búsqueda */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filtros */}
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Verificación
                  {verifiedFilter !== 'all' && (
                    <Badge variant="secondary" className="ml-2">
                      {verifiedFilter === 'verified' ? 'Verificados' : 'Sin verificar'}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setVerifiedFilter('all')}>
                  Todos
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setVerifiedFilter('verified')}>
                  Verificados
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setVerifiedFilter('unverified')}>
                  Sin verificar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Award className="w-4 h-4 mr-2" />
                  Calidad
                  {qualityFilter !== 'all' && (
                    <Badge variant="secondary" className="ml-2">
                      {qualityFilter === 'high' ? 'Alta' : 
                       qualityFilter === 'medium' ? 'Media' : 'Baja'}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setQualityFilter('all')}>
                  Todas las calidades
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setQualityFilter('high')}>
                  Alta calidad (8+)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setQualityFilter('medium')}>
                  Calidad media (6-7.9)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setQualityFilter('low')}>
                  Baja calidad (&lt;6)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  {sortOrder === 'asc' ? <SortAsc className="w-4 h-4 mr-2" /> : <SortDesc className="w-4 h-4 mr-2" />}
                  Ordenar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleSort('name')}>
                  <Tag className="w-4 h-4 mr-2" />
                  Nombre
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort('created_at')}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Fecha
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort('quality_score')}>
                  <Award className="w-4 h-4 mr-2" />
                  Calidad
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort('price')}>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Precio
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="h-8 w-8 p-0"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-8 w-8 p-0"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {loading ? (
          <LoadingSkeleton />
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No se encontraron productos
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || verifiedFilter !== 'all' || qualityFilter !== 'all'
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'No hay productos disponibles en el catálogo global'
              }
            </p>
          </div>
        ) : (
          <div className={cn(
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          )}>
            {filteredProducts.map((product) => (
              <ModernProductCard
                key={product.id}
                product={product}
                variant={viewMode === 'list' ? 'compact' : 'default'}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onVerify={handleVerify}
                onFavorite={handleFavorite}
              />
            ))}
          </div>
        )}
      </div>

      {/* Paginación */}
      {filteredProducts.length > 20 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Mostrando {filteredProducts.length} de {products.length} productos
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                Anterior
              </Button>
              <Button variant="outline" size="sm" disabled>
                Siguiente
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 