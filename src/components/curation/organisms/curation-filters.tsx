'use client';

import { useEffect, useState } from 'react';
import { Search, Filter, X, RefreshCw } from 'lucide-react';
import { Input } from '@/components/shared-ui';
import { Button } from '@/components/shared-ui';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/shared-ui';
import { CurationFilter } from '@/types/curation';
import { cn } from '@/lib/utils';
import { useMarketplaceBrands } from '@/hooks/use-marketplace-brands';
import { useMarketplaceCategories } from '@/hooks/use-marketplace-categories';

interface CurationFiltersProps {
  filters: CurationFilter;
  onFiltersChange: (filters: CurationFilter) => void;
  onRefresh?: () => void;
  loading?: boolean;
  className?: string;
  showStatusFilter?: boolean; // Para controlar si mostrar el filtro de estado
}

const sourceOptions = [
  { value: 'all', label: 'Todas las fuentes' },
  { value: 'walmart', label: 'Walmart' },
  { value: 'mercadolibre', label: 'MercadoLibre' },
  { value: 'amazon', label: 'Amazon' },
  { value: 'manual', label: 'Manual' },
];

export function CurationFilters({
  filters,
  onFiltersChange,
  onRefresh,
  loading = false,
  className,
  showStatusFilter = true
}: CurationFiltersProps) {
  const [searchValue, setSearchValue] = useState(filters?.search || '');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Cargar marcas y categorías del marketplace global
  const { brands, loading: brandsLoading } = useMarketplaceBrands({ 
    autoLoad: true,
    initialFilters: { page_size: 100, is_active: true }
  });
  
  const { categories, loading: categoriesLoading } = useMarketplaceCategories({ 
    autoLoad: true,
    initialFilters: { page_size: 100, is_active: true }
  });

  // Debounce para búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== filters?.search) {
        onFiltersChange({ ...filters, search: searchValue });
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchValue]);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const handleSourceChange = (value: string) => {
    onFiltersChange({ 
      ...filters, 
      source: value === 'all' ? undefined : value 
    });
  };

  const handleBrandChange = (value: string) => {
    onFiltersChange({ 
      ...filters, 
      brand: value === 'all' ? undefined : value 
    });
  };

  const handleCategoryChange = (value: string) => {
    onFiltersChange({ 
      ...filters, 
      category: value === 'all' ? undefined : value 
    });
  };

  const handleDateFromChange = (value: string) => {
    onFiltersChange({
      ...filters,
      date_from: value || undefined
    });
  };

  const handleDateToChange = (value: string) => {
    onFiltersChange({
      ...filters,
      date_to: value || undefined
    });
  };

  const clearFilters = () => {
    setSearchValue('');
    onFiltersChange({});
    setShowAdvanced(false);
  };

  const clearSpecificFilter = (key: keyof CurationFilter) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    if (key === 'search') {
      setSearchValue('');
    }
    onFiltersChange(newFilters);
  };

  // Contar filtros activos (excluyendo status ya que puede venir del tab)
  const activeFiltersCount = Object.keys(filters || {}).filter(
    key => filters?.[key as keyof CurationFilter] !== undefined && key !== 'status'
  ).length;

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-3">
        {/* Búsqueda */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar productos por nombre, SKU..."
              value={searchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchValue && (
              <button
                onClick={() => handleSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Fuente */}
        <Select 
          value={filters?.source || 'all'} 
          onValueChange={handleSourceChange}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Fuente" />
          </SelectTrigger>
          <SelectContent>
            {sourceOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Marca */}
        <Select 
          value={filters?.brand || 'all'} 
          onValueChange={handleBrandChange}
          disabled={brandsLoading}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Marca" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las marcas</SelectItem>
            {brands.map(brand => (
              <SelectItem key={brand.id} value={brand.id}>
                {brand.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Categoría */}
        <Select 
          value={filters?.category || 'all'} 
          onValueChange={handleCategoryChange}
          disabled={categoriesLoading}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {categories.map(category => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Filtros avanzados (fechas) */}
        <Popover open={showAdvanced} onOpenChange={setShowAdvanced}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="relative">
              <Filter className="h-4 w-4" />
              {(filters?.date_from || filters?.date_to) && (
                <div className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Filtros adicionales</h4>
              </div>

              {/* Rango de fechas */}
              <div className="space-y-2">
                <Label className="text-sm">Rango de fechas</Label>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={filters?.date_from || ''}
                    onChange={(e) => handleDateFromChange(e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="date"
                    value={filters?.date_to || ''}
                    onChange={(e) => handleDateToChange(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Botón limpiar fechas */}
              {(filters?.date_from || filters?.date_to) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleDateFromChange('');
                    handleDateToChange('');
                  }}
                  className="w-full"
                >
                  Limpiar fechas
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Botón refrescar */}
        {onRefresh && (
          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw className={cn(
              'h-4 w-4',
              loading && 'animate-spin'
            )} />
          </Button>
        )}

        {/* Botón limpiar todo */}
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            Limpiar filtros
          </Button>
        )}
      </div>

      {/* Chips de filtros activos */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Filtros activos:</span>
          
          {filters?.search && (
            <Badge 
              variant="secondary" 
              className="gap-1 pr-1 cursor-pointer hover:bg-secondary/80"
              onClick={() => clearSpecificFilter('search')}
            >
              Búsqueda: {filters.search}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          )}
          
          {filters?.source && (
            <Badge 
              variant="secondary"
              className="gap-1 pr-1 cursor-pointer hover:bg-secondary/80"
              onClick={() => clearSpecificFilter('source')}
            >
              Fuente: {sourceOptions.find(o => o.value === filters.source)?.label}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          )}
          
          {filters?.brand && (
            <Badge 
              variant="secondary"
              className="gap-1 pr-1 cursor-pointer hover:bg-secondary/80"
              onClick={() => clearSpecificFilter('brand')}
            >
              Marca: {brands.find(b => b.id === filters.brand)?.name || filters.brand}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          )}
          
          {filters?.category && (
            <Badge 
              variant="secondary"
              className="gap-1 pr-1 cursor-pointer hover:bg-secondary/80"
              onClick={() => clearSpecificFilter('category')}
            >
              Categoría: {categories.find(c => c.id === filters.category)?.name || filters.category}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          )}
          
          {(filters?.date_from || filters?.date_to) && (
            <Badge 
              variant="secondary"
              className="gap-1 pr-1 cursor-pointer hover:bg-secondary/80"
              onClick={() => {
                clearSpecificFilter('date_from');
                clearSpecificFilter('date_to');
              }}
            >
              Fecha: {filters.date_from || '...'} - {filters.date_to || '...'}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}