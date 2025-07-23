'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ModernProductCard } from '@/components/shared/product-components/modern-product-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { StatsCard } from '@/components/ui/stats-card';
import { Input } from '@/components/ui/input';
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
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  X,
  Check,
  Filter,
  Plus,
  Download,
  Upload
} from 'lucide-react';
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
              <div className="hidden absolute inset-0 flex items-center justify-center bg-muted">
                <ImageIcon className="h-12 w-12 text-muted-foreground" />
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <ImageIcon className="h-12 w-12 text-muted-foreground" />
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
              <div className="bg-muted rounded-lg h-48 mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
                <div className="flex space-x-2">
                  <div className="h-5 bg-muted rounded w-16"></div>
                  <div className="h-5 bg-muted rounded w-20"></div>
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

// Componente de filtro múltiple mejorado
interface MultiSelectFilterProps {
  label: string;
  placeholder: string;
  options: string[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  maxHeight?: string;
}

const MultiSelectFilter = ({ 
  label, 
  placeholder, 
  options, 
  selectedValues, 
  onChange, 
  maxHeight = "200px" 
}: MultiSelectFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(50); // Mostrar 50 elementos inicialmente

  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    return options.filter(option => 
      option.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  const visibleOptions = useMemo(() => {
    return filteredOptions.slice(0, visibleCount);
  }, [filteredOptions, visibleCount]);

  const handleToggleOption = (option: string) => {
    const newValues = selectedValues.includes(option)
      ? selectedValues.filter(v => v !== option)
      : [...selectedValues, option];
    onChange(newValues);
  };

  const handleClearAll = () => {
    onChange([]);
  };

  const handleSelectAll = () => {
    onChange(filteredOptions);
  };

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 20;
    
    if (isNearBottom && visibleCount < filteredOptions.length) {
      setVisibleCount(prev => Math.min(prev + 50, filteredOptions.length));
    }
  }, [visibleCount, filteredOptions.length]);

  // Reset visible count when search term changes
  useEffect(() => {
    setVisibleCount(50);
  }, [searchTerm]);

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-foreground mb-2">
        {label}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-full min-w-[200px] cursor-pointer rounded-md border border-input bg-background py-2.5 pl-3 pr-10 text-left text-sm shadow-sm transition-colors hover:bg-accent focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-20 force-card-visibility"
        >
          <span className="block truncate text-foreground">
            {selectedValues.length === 0 
              ? <span className="text-muted-foreground">{placeholder}</span>
              : <span className="text-foreground font-medium">
                  {selectedValues.length} seleccionado{selectedValues.length > 1 ? 's' : ''}
                </span>
            }
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </span>
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-1 w-full rounded-md bg-popover border border-border shadow-lg force-card-visibility multi-select-filter">
            {/* Header con búsqueda y acciones */}
            <div className="p-3 border-b border-border bg-muted/30">
              <div className="relative mb-3">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-20 focus:border-primary"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="flex-1 px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
                >
                  Seleccionar todos
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="flex-1 px-3 py-1.5 text-xs bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors font-medium"
                >
                  Limpiar
                </button>
              </div>
            </div>

            {/* Lista de opciones con scroll infinito */}
            <div 
              className="overflow-auto bg-popover" 
              style={{ maxHeight }}
              onScroll={handleScroll}
            >
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-3 text-sm text-muted-foreground text-center">
                  No se encontraron opciones
                </div>
              ) : (
                <>
                  {visibleOptions.map((option) => (
                    <div
                      key={option}
                      onClick={() => handleToggleOption(option)}
                      className="relative cursor-pointer select-none py-2.5 pl-10 pr-4 hover:bg-accent transition-colors"
                    >
                      <span className="block truncate text-sm text-foreground">
                        {option}
                      </span>
                      {selectedValues.includes(option) && (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                          <Check className="h-4 w-4 text-primary" />
                        </span>
                      )}
                    </div>
                  ))}
                  {visibleCount < filteredOptions.length && (
                    <div className="px-4 py-3 text-sm text-muted-foreground text-center bg-muted/50">
                      Mostrando {visibleCount} de {filteredOptions.length} opciones...
                      <br />
                      <span className="text-xs">Scroll para cargar más</span>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer con resumen */}
            {selectedValues.length > 0 && (
              <div className="p-3 border-t border-border bg-muted/30">
                <div className="flex flex-wrap gap-1">
                  {selectedValues.slice(0, 3).map((value) => (
                    <span
                      key={value}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-primary/10 text-primary rounded-md border border-primary/20"
                    >
                      {value.length > 15 ? `${value.substring(0, 15)}...` : value}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleOption(value);
                        }}
                        className="hover:bg-primary/20 rounded-sm p-0.5 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  {selectedValues.length > 3 && (
                    <span className="text-xs text-muted-foreground py-1">
                      +{selectedValues.length - 3} más
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Overlay para cerrar */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default function GlobalCatalogPage() {
  const router = useRouter();
  const { setHeaderProps, clearHeaderProps } = useHeader();
  
  const [products, setProducts] = useState<GlobalCatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [isStatsCollapsed, setIsStatsCollapsed] = useState(false);
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

  // Estados para filtros múltiples
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);

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
      
      // Paginación - usar page y page_size como espera el backend
      const page = criteria.page || 1;
      const pageSize = criteria.page_size || 20;
      params.append('page', page.toString());
      params.append('page_size', pageSize.toString());
      
      // Ordenamiento
      if (criteria.sort_by) {
        params.append('sort_by', criteria.sort_by);
      }
      if (criteria.sort_dir) {
        params.append('sort_dir', criteria.sort_dir);
      }
      
      // Filtros
      if (criteria.search) {
        params.append('search', criteria.search);
      }
      
      // Filtros múltiples - enviar como arrays separados
      if (selectedBrands.length > 0) {
        selectedBrands.forEach(brand => {
          params.append('brand', brand);
        });
      }
      
      if (selectedCategories.length > 0) {
        selectedCategories.forEach(category => {
          params.append('category', category);
        });
      }
      
      if (selectedSources.length > 0) {
        selectedSources.forEach(source => {
          params.append('source', source);
        });
      }
      
      // Filtros simples
      if (criteria.is_verified && criteria.is_verified !== 'all') {
        params.append('is_verified', criteria.is_verified);
      }
      if (criteria.is_argentine && criteria.is_argentine !== 'all') {
        params.append('is_argentine', criteria.is_argentine);
      }

      const response = await fetch(`/api/pim/global-catalog?${params.toString()}`);
      const data = await response.json();
      
      // El backend devuelve: { items: [...], total_count: X, page: Y, page_size: Z, total_pages: W }
      const products = (data.items || []) as GlobalCatalogProduct[];
      setProducts(products);
      
      setCriteriaResponse({
        data: products,
        total_count: data.total_count || 0,
        page: data.page || page,
        page_size: data.page_size || pageSize
      });
      
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
      setCriteriaResponse({
        data: [],
        total_count: 0,
        page: 1,
        page_size: 20
      });
    } finally {
      setLoading(false);
    }
  }, [selectedBrands, selectedCategories, selectedSources]);

  // Función para obtener opciones de filtros dinámicos
  const fetchFilterOptions = useCallback(async () => {
    try {
      console.log('🔄 Cargando opciones de filtros...');
      
      // Agregar timestamp para evitar cache
      const timestamp = Date.now();
      
      // Obtener marcas del marketplace usando el endpoint correcto
      const brandsPromise = fetch(`/api/pim/marketplace-brands?limit=500&sort_by=name&sort_dir=asc&_t=${timestamp}`, {
        headers: {
          'Content-Type': 'application/json',
          'X-User-Role': 'marketplace_admin'
        }
      });

      // Obtener categorías del marketplace usando el endpoint correcto
      const categoriesPromise = fetch(`/api/pim/marketplace-categories?limit=500&sort_by=name&sort_dir=asc&_t=${timestamp}`, {
        headers: {
          'Content-Type': 'application/json',
          'X-User-Role': 'marketplace_admin'
        }
      });

      // Obtener sources desde productos (mantener comportamiento actual para sources)
      const productsPromise = fetch(`/api/pim/global-catalog?limit=100&_t=${timestamp}`);

      const [brandsResponse, categoriesResponse, productsResponse] = await Promise.all([
        brandsPromise,
        categoriesPromise,
        productsPromise
      ]);

      // Procesar brands
      const brandsData = await brandsResponse.json();
      console.log('📊 Respuesta de marcas:', { 
        total: brandsData.pagination?.total || 0,
        received: brandsData.brands?.length || 0,
        first5: brandsData.brands?.slice(0, 5).map((b: any) => b.name) || []
      });
      
      const brands = (brandsData.brands || [])
        .map((brand: { name: string }) => brand.name)
        .filter(Boolean)
        .sort() as string[];

      // Procesar categories
      const categoriesData = await categoriesResponse.json();
      console.log('📊 Respuesta de categorías:', { 
        total: categoriesData.pagination?.total || 0,
        received: categoriesData.categories?.length || 0,
        first5: categoriesData.categories?.slice(0, 5).map((c: any) => c.name) || []
      });
      
      const categories = (categoriesData.categories || [])
        .map((category: { name: string }) => category.name)
        .filter(Boolean)
        .sort() as string[];

      // Procesar sources desde productos (mantener lógica original)
      const productsData = await productsResponse.json();
      const products = (productsData.items || []) as GlobalCatalogProduct[];
      const sources = [...new Set(products.map(p => p.source).filter(Boolean))].sort() as string[];
      
      console.log('✅ Opciones de filtros cargadas:', {
        brands: brands.length,
        categories: categories.length,
        sources: sources.length,
        firstBrands: brands.slice(0, 10),
        firstCategories: categories.slice(0, 10),
        firstSources: sources.slice(0, 5)
      });
      
      setAvailableBrands(brands);
      setAvailableCategories(categories);
      setAvailableSources(sources);
      
    } catch (error) {
      console.error('❌ Error fetching filter options:', error);
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

  // Recargar productos cuando cambien los filtros múltiples
  useEffect(() => {
    if (availableBrands.length > 0 || availableCategories.length > 0 || availableSources.length > 0) {
      fetchProducts(criteriaState.criteria);
    }
  }, [selectedBrands, selectedCategories, selectedSources, fetchProducts, criteriaState.criteria]);

  // Funciones de manejo de acciones
  const handleViewProduct = useCallback((productId: string) => {
    router.push(`/global-catalog/view/${productId}`);
  }, [router]);

  const handleEditProduct = useCallback((productId: string) => {
    router.push(`/global-catalog/edit/${productId}`);
  }, [router]);

  // Filtros configurables para global catalog - solo mantener el filtro de verificación
  const globalCatalogFilters: FilterType[] = useMemo(() => [], []);

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
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div 
            className="max-w-[200px] truncate text-primary hover:text-primary/80 cursor-pointer hover:underline"
            onClick={() => handleViewProduct(product.id)}
          >
            {row.getValue('name')}
          </div>
        )
      },
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
          if (score >= 80) return 'text-green-600 dark:text-green-400';
          if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
          return 'text-red-600 dark:text-red-400';
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
              <DropdownMenuItem onClick={() => handleViewProduct(product.id)}>
                <Eye className="mr-2 h-4 w-4" />
                Ver detalles
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEditProduct(product.id)}>
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
                className="text-destructive"
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
        <div className="h-8 bg-muted rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded"></div>
          ))}
        </div>
        <div className="h-96 bg-muted rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards Colapsables */}
      <div className="bg-card rounded-lg border shadow-sm">
        <div 
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors rounded-t-lg"
          onClick={() => setIsStatsCollapsed(!isStatsCollapsed)}
          role="button"
          tabIndex={0}
          aria-expanded={!isStatsCollapsed}
          aria-controls="stats-content"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsStatsCollapsed(!isStatsCollapsed);
            }
          }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Estadísticas del Catálogo</h3>
              <p className="text-sm text-muted-foreground">
                {summary.total_products.toLocaleString()} productos totales
                {!isStatsCollapsed && (
                  <span className="ml-2 text-blue-600 dark:text-blue-400">• Expandido</span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {isStatsCollapsed ? 'Expandir' : 'Contraer'}
            </span>
            <Button variant="ghost" size="sm" className="hover:bg-muted/50">
              {isStatsCollapsed ? (
                <ChevronDown className="h-4 w-4 transition-transform duration-200" />
              ) : (
                <ChevronUp className="h-4 w-4 transition-transform duration-200" />
              )}
            </Button>
          </div>
        </div>
        
        {!isStatsCollapsed && (
          <div 
            id="stats-content"
            className="p-4 pt-0 transition-all duration-300 ease-in-out"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 transition-opacity duration-300 opacity-100">
              <StatsCard
                title="Total Productos"
                value={summary.total_products}
                description="Productos en el catálogo global"
                iconName="Package"
                iconColor="text-blue-600"
                className="force-card-visibility"
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
                className="force-card-visibility"
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
                className="force-card-visibility"
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
          </div>
        )}
      </div>

      {/* Contenido principal basado en el modo de vista */}
      {viewMode === 'table' ? (
        <div className="bg-card p-4 rounded-lg border shadow-sm">
          
          {/* Filtros múltiples mejorados */}
          <div className="mb-6 p-4 bg-card rounded-lg border border-border shadow-sm force-card-visibility">
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <Search className="h-4 w-4 text-primary" />
              Filtros de búsqueda
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MultiSelectFilter
                label="Marcas"
                placeholder="Seleccionar marcas..."
                options={availableBrands}
                selectedValues={selectedBrands}
                onChange={setSelectedBrands}
                maxHeight="250px"
              />
              
              <MultiSelectFilter
                label="Categorías"
                placeholder="Seleccionar categorías..."
                options={availableCategories}
                selectedValues={selectedCategories}
                onChange={setSelectedCategories}
                maxHeight="250px"
              />
              
              <MultiSelectFilter
                label="Fuentes"
                placeholder="Seleccionar fuentes..."
                options={availableSources}
                selectedValues={selectedSources}
                onChange={setSelectedSources}
                maxHeight="200px"
              />
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Estado verificación
                </label>
                <select
                  value={criteriaState.criteria.is_verified || 'all'}
                  onChange={(e) => criteriaState.handleFilterChange('is_verified', e.target.value === 'all' ? undefined : e.target.value)}
                  className="w-full rounded-md border border-input bg-background py-2.5 pl-3 pr-10 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-20"
                >
                  <option value="all">Todos los estados</option>
                  <option value="true">Verificados</option>
                  <option value="false">No verificados</option>
                </select>
              </div>
            </div>
            
            {/* Acciones de filtros */}
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-border">
              <div className="text-sm text-muted-foreground">
                {selectedBrands.length + selectedCategories.length + selectedSources.length > 0 && (
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    {selectedBrands.length + selectedCategories.length + selectedSources.length} filtros aplicados
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedBrands([]);
                    setSelectedCategories([]);
                    setSelectedSources([]);
                    criteriaState.handleFilterChange('is_verified', undefined);
                  }}
                  className="px-3 py-1.5 text-xs bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors font-medium"
                >
                  Limpiar filtros
                </button>
                <button
                  onClick={() => {
                    console.log('🔄 Refrescando filtros manualmente...');
                    fetchFilterOptions();
                  }}
                  className="px-3 py-1.5 text-xs bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors font-medium flex items-center gap-1"
                >
                  <Search className="h-3 w-3" />
                  Refrescar
                </button>
              </div>
            </div>
          </div>
          
          {/* Tabla de datos */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
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
                filters={[]} // Sin filtros aquí, los manejamos arriba
                fullWidth={true}
                onCreateClick={() => router.push('/global-catalog/create')}
                onSearchChange={criteriaState.handleSearchChange}
                onPageChange={criteriaState.handlePageChange}
                onPageSizeChange={criteriaState.handlePageSizeChange}
                onSortChange={criteriaState.handleSortChange}
              />
            </div>
            
            {/* Controles de vista */}
            <div className="flex lg:flex-col items-center gap-2">
              <div className="flex items-center border rounded-md">
                <Button
                  variant={viewMode === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className="rounded-r-none"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={(viewMode as ViewMode) === 'cards' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('cards')}
                  className="rounded-l-none"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Vista de Cards */
        <div className="space-y-6">
          {/* Filtros múltiples mejorados para vista de cards */}
          <div className="p-4 bg-card rounded-lg border border-border shadow-sm force-card-visibility">
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <Search className="h-4 w-4 text-primary" />
              Filtros de búsqueda
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MultiSelectFilter
                label="Marcas"
                placeholder="Seleccionar marcas..."
                options={availableBrands}
                selectedValues={selectedBrands}
                onChange={setSelectedBrands}
                maxHeight="250px"
              />
              
              <MultiSelectFilter
                label="Categorías"
                placeholder="Seleccionar categorías..."
                options={availableCategories}
                selectedValues={selectedCategories}
                onChange={setSelectedCategories}
                maxHeight="250px"
              />
              
              <MultiSelectFilter
                label="Fuentes"
                placeholder="Seleccionar fuentes..."
                options={availableSources}
                selectedValues={selectedSources}
                onChange={setSelectedSources}
                maxHeight="200px"
              />
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Estado verificación
                </label>
                <select
                  value={criteriaState.criteria.is_verified || 'all'}
                  onChange={(e) => criteriaState.handleFilterChange('is_verified', e.target.value === 'all' ? undefined : e.target.value)}
                  className="w-full rounded-md border border-input bg-background py-2.5 pl-3 pr-10 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-20"
                >
                  <option value="all">Todos los estados</option>
                  <option value="true">Verificados</option>
                  <option value="false">No verificados</option>
                </select>
              </div>
            </div>
            
            {/* Acciones de filtros */}
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-border">
              <div className="text-sm text-muted-foreground">
                {selectedBrands.length + selectedCategories.length + selectedSources.length > 0 && (
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    {selectedBrands.length + selectedCategories.length + selectedSources.length} filtros aplicados
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedBrands([]);
                    setSelectedCategories([]);
                    setSelectedSources([]);
                    criteriaState.handleFilterChange('is_verified', undefined);
                  }}
                  className="px-3 py-1.5 text-xs bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors font-medium"
                >
                  Limpiar filtros
                </button>
                <button
                  onClick={() => {
                    console.log('🔄 Refrescando filtros manualmente...');
                    fetchFilterOptions();
                  }}
                  className="px-3 py-1.5 text-xs bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors font-medium flex items-center gap-1"
                >
                  <Search className="h-3 w-3" />
                  Refrescar
                </button>
              </div>
            </div>
          </div>
          
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
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      console.log('🔄 Refrescando filtros manualmente...');
                      fetchFilterOptions();
                    }}
                    className="whitespace-nowrap"
                  >
                    🔄 Refrescar
                  </Button>
                  <div className="flex items-center border rounded-md">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewMode('table')}
                      className="rounded-r-none"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setViewMode('cards')}
                      className="rounded-l-none"
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button onClick={() => router.push('/global-catalog/create')}>
                    <Package className="h-4 w-4 mr-2" />
                    Nuevo Producto
                  </Button>
                </div>
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
        </div>
      )}

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