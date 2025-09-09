'use client'

import * as React from "react"
import { useState, useCallback } from "react"
import { Search, Filter, ChevronDown, ChevronUp, X, RefreshCw } from "lucide-react"
import { cn } from "../utils/cn"
import { Input } from "../atoms/input"
import { Button } from "../atoms/button"
import { Badge } from "../atoms/badge"
import { Label } from "../atoms/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../ui/popover"

// Import API-connected components
import { MarketplaceBrandSelect } from "../../forms/marketplace-brand-select"
import { SearchableSelect, type SearchableSelectOption } from "./searchable-select"

interface FilterOption {
  label: string
  value: string
}

interface FilterConfig {
  key: string
  label?: string
  placeholder?: string
  type: 'search' | 'select' | 'text' | 'brand-select' | 'api-select'
  options?: FilterOption[]
  value?: string
  onChange?: (value: string) => void
  // New API-related properties
  apiEndpoint?: string
  apiTransform?: (data: any[]) => SearchableSelectOption[]
  showActiveOnly?: boolean
  showVerifiedOnly?: boolean
}

interface FiltersOnlyBarProps {
  filters: FilterConfig[]
  variant?: 'compact' | 'full'
  className?: string
  groupByType?: boolean
  // New collapsible properties
  collapsible?: boolean
  defaultExpanded?: boolean
  expandedFiltersBreakpoint?: number
  // Callbacks
  onRefresh?: () => void
  loading?: boolean
}

/**
 * Componente especializado para páginas con MUCHOS filtros
 * 
 * CASO DE USO PRINCIPAL:
 * - Páginas complejas con 5+ filtros (como global-catalog)
 * - Análisis y reportes avanzados
 * - Búsquedas especializadas
 * - Los botones van en otro componente separado
 * 
 * NUEVAS CARACTERÍSTICAS v2.0:
 * - ✅ Colapsable/expandible para aprovechar espacio
 * - ✅ Componentes conectados a APIs reales (marcas, categorías)
 * - ✅ Filtros activos con chips removibles
 * - ✅ Refresh automático y manual
 */
export const FiltersOnlyBar = React.forwardRef<
  HTMLDivElement,
  FiltersOnlyBarProps
>(({ 
  filters,
  variant = 'full',
  className,
  groupByType = true,
  collapsible = true,
  defaultExpanded = false,
  expandedFiltersBreakpoint = 2,
  onRefresh,
  loading = false,
  ...props 
}, ref) => {
  const [expanded, setExpanded] = useState(defaultExpanded)
  
  // Calculate active filters for chips
  const activeFilters = filters.filter(f => f.value && f.value !== '')
  const activeFiltersCount = activeFilters.length

  // Determine which filters to show in collapsed state
  const primaryFilters = groupByType 
    ? filters.filter(f => f.type === 'search').slice(0, expandedFiltersBreakpoint)
    : filters.slice(0, expandedFiltersBreakpoint)
    
  const secondaryFilters = groupByType 
    ? filters.filter(f => f.type !== 'search')
    : filters.slice(expandedFiltersBreakpoint)

  const filtersToShow = expanded ? filters : primaryFilters

  const clearFilter = useCallback((filterKey: string) => {
    const filter = filters.find(f => f.key === filterKey)
    if (filter?.onChange) {
      filter.onChange('')
    }
  }, [filters])

  const clearAllFilters = useCallback(() => {
    filters.forEach(filter => {
      if (filter.onChange && filter.value) {
        filter.onChange('')
      }
    })
  }, [filters])

  const renderFilter = (filter: FilterConfig) => {
    if (filter.type === 'search') {
      return (
        <div key={filter.key} className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={filter.placeholder || "Buscar..."}
            value={filter.value || ""}
            onChange={(e) => filter.onChange?.(e.target.value)}
            className="pl-8 w-full"
          />
          {filter.value && (
            <button
              onClick={() => filter.onChange?.('')}
              className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )
    }
    
    // ✅ NEW: Brand selector connected to API
    if (filter.type === 'brand-select') {
      return (
        <div key={filter.key} className="flex-1 min-w-[180px]">
          {filter.label && (
            <Label className="text-sm font-medium text-muted-foreground mb-1">
              {filter.label}
            </Label>
          )}
          <MarketplaceBrandSelect
            value={filter.value || ""}
            onValueChange={(value) => filter.onChange?.(value)}
            placeholder={filter.placeholder || "Seleccionar marca..."}
            showActiveOnly={filter.showActiveOnly ?? true}
            showVerifiedOnly={filter.showVerifiedOnly ?? false}
            className="w-full"
          />
        </div>
      )
    }

    // ✅ NEW: Generic API selector
    if (filter.type === 'api-select') {
      return (
        <div key={filter.key} className="flex-1 min-w-[160px]">
          {filter.label && (
            <Label className="text-sm font-medium text-muted-foreground mb-1">
              {filter.label}
            </Label>
          )}
          <SearchableSelect
            options={filter.options?.map(opt => ({
              value: opt.value,
              label: opt.label
            })) || []}
            value={filter.value || ""}
            onValueChange={(value) => filter.onChange?.(value)}
            placeholder={filter.placeholder || "Seleccionar..."}
            allowClear={true}
            className="w-full"
          />
        </div>
      )
    }
    
    if (filter.type === 'select') {
      return (
        <div key={filter.key} className="flex-1 min-w-[160px]">
          {filter.label && (
            <Label className="text-sm font-medium text-muted-foreground mb-1">
              {filter.label}
            </Label>
          )}
          <select
            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={filter.value || ""}
            onChange={(e) => filter.onChange?.(e.target.value)}
          >
            {filter.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )
    }

    if (filter.type === 'text') {
      return (
        <div key={filter.key} className="flex-1 min-w-[150px]">
          {filter.label && (
            <Label className="text-sm font-medium text-muted-foreground mb-1">
              {filter.label}
            </Label>
          )}
          <Input
            placeholder={filter.placeholder || filter.label}
            value={filter.value || ""}
            onChange={(e) => filter.onChange?.(e.target.value)}
          />
        </div>
      )
    }

    return null
  }

  const renderFilters = () => {
    const filtersToRender = expanded ? filters : primaryFilters

    if (groupByType) {
      const searchFilters = filtersToRender.filter(f => f.type === 'search')
      const apiFilters = filtersToRender.filter(f => f.type === 'brand-select' || f.type === 'api-select')  
      const selectFilters = filtersToRender.filter(f => f.type === 'select')
      const textFilters = filtersToRender.filter(f => f.type === 'text')

      return (
        <div className="space-y-4">
          {/* Primary row: Search filters (always visible) */}
          {searchFilters.length > 0 && (
            <div className="flex flex-wrap gap-4">
              {searchFilters.map(renderFilter)}
              
              {/* Expand/Collapse toggle */}
              {collapsible && secondaryFilters.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExpanded(!expanded)}
                  className="ml-auto flex items-center gap-2"
                >
                  {expanded ? (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      Menos filtros
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      Más filtros ({secondaryFilters.length})
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
          
          {/* Secondary rows: API selectors and other filters */}
          {(expanded || !collapsible) && (apiFilters.length > 0 || selectFilters.length > 0 || textFilters.length > 0) && (
            <div className={cn(
              "grid gap-4",
              variant === 'compact' 
                ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            )}>
              {apiFilters.map(renderFilter)}
              {selectFilters.map(renderFilter)}
              {textFilters.map(renderFilter)}
            </div>
          )}
        </div>
      )
    }

    return (
      <div className={cn(
        "flex flex-wrap gap-4",
        variant === 'compact' && "gap-2"
      )}>
        {filtersToRender.map(renderFilter)}
        
        {/* Expand/Collapse toggle for non-grouped */}
        {collapsible && secondaryFilters.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2"
          >
            {expanded ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Menos
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Más filtros
              </>
            )}
          </Button>
        )}
      </div>
    )
  }

  return (
    <div
      ref={ref}
      className={cn(
        "bg-background border rounded-lg",
        className
      )}
      {...props}
    >
      {/* Filter controls header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-medium">Filtros</h3>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {activeFiltersCount} activo{activeFiltersCount !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Refresh button */}
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
              className="h-7 w-7 p-0"
            >
              <RefreshCw className={cn(
                'h-3 w-3',
                loading && 'animate-spin'
              )} />
            </Button>
          )}
          
          {/* Clear all filters */}
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Limpiar todo
            </Button>
          )}
        </div>
      </div>

      {/* Main filters */}
      <div className="p-4">
        {renderFilters()}
      </div>

      {/* Active filter chips */}
      {activeFiltersCount > 0 && (
        <div className="px-4 pb-4 border-t bg-muted/20">
          <div className="flex items-center gap-2 flex-wrap pt-3">
            <span className="text-xs text-muted-foreground">Filtros activos:</span>
            
            {activeFilters.map((filter) => {
              // Find display label for the value
              let displayValue = filter.value
              if (filter.options) {
                const option = filter.options.find(opt => opt.value === filter.value)
                displayValue = option?.label || filter.value
              }
              
              return (
                <Badge 
                  key={filter.key}
                  variant="secondary" 
                  className="gap-1 pr-1 cursor-pointer hover:bg-secondary/80 text-xs"
                  onClick={() => clearFilter(filter.key)}
                >
                  {filter.label ? `${filter.label}: ` : ''}{displayValue}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
})

FiltersOnlyBar.displayName = "FiltersOnlyBar"

export type { FilterConfig, FiltersOnlyBarProps }
