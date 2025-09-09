'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/shared-ui';
import { Button } from '@/components/shared-ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, RefreshCw, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrapingSource } from './sources-table';

interface SourcesFiltersProps {
  sources: ScrapingSource[];
  searchTerm: string;
  statusFilter: string;
  categoryFilter: string;
  onSearchChange: (term: string) => void;
  onStatusFilterChange: (status: string) => void;
  onCategoryFilterChange: (category: string) => void;
  onRefresh: () => void;
  autoRefresh: boolean;
  onToggleAutoRefresh: () => void;
  refreshing: boolean;
  className?: string;
}

export function SourcesFilters({
  sources,
  searchTerm,
  statusFilter,
  categoryFilter,
  onSearchChange,
  onStatusFilterChange,
  onCategoryFilterChange,
  onRefresh,
  autoRefresh,
  onToggleAutoRefresh,
  refreshing,
  className
}: SourcesFiltersProps) {

  // Generar opciones de categorías dinámicamente
  const categoryOptions = useMemo(() => {
    const categories = [...new Set(sources.map(s => s.category))].sort();
    return [
      { value: 'all', label: 'Todas las categorías' },
      ...categories.map(cat => ({ 
        value: cat, 
        label: cat.charAt(0).toUpperCase() + cat.slice(1)
      }))
    ];
  }, [sources]);

  const hasFilters = searchTerm || statusFilter !== 'all' || categoryFilter !== 'all';

  const clearFilters = () => {
    onSearchChange('');
    onStatusFilterChange('all');
    onCategoryFilterChange('all');
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header con controles principales */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium">Filtros</h3>
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-7 px-2 text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Limpiar
            </Button>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleAutoRefresh}
            className={cn(
              'text-xs h-8',
              autoRefresh ? 'bg-green-50 text-green-700 border-green-200' : 'text-gray-500'
            )}
          >
            Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={refreshing}
            className="h-8"
          >
            <RefreshCw className={cn('h-3 w-3 mr-1', refreshing && 'animate-spin')} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Controles de filtro */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Búsqueda */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, ID o categoría..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 h-9"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSearchChange('')}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
        
        {/* Filtro por estado */}
        <div className="sm:w-40">
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="active">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  Activas
                </div>
              </SelectItem>
              <SelectItem value="inactive">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-500 rounded-full" />
                  Inactivas
                </div>
              </SelectItem>
              <SelectItem value="error">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  Con Error
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filtro por categoría */}
        <div className="sm:w-48">
          <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Resumen de filtros aplicados */}
      {hasFilters && (
        <div className="text-xs text-muted-foreground bg-muted/30 px-3 py-2 rounded-md">
          <span>Filtros activos:</span>
          {searchTerm && <span className="ml-2 font-medium">"{searchTerm}"</span>}
          {statusFilter !== 'all' && (
            <span className="ml-2">
              Estado: <span className="font-medium">{statusFilter}</span>
            </span>
          )}
          {categoryFilter !== 'all' && (
            <span className="ml-2">
              Categoría: <span className="font-medium">{categoryFilter}</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
