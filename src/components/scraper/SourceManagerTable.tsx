'use client';

import React, { useState, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/shared-ui';
import { Badge } from '@/components/shared-ui';
import { Switch } from '@/components/ui/switch';
import { CriteriaDataTable } from '@/components/ui/criteria-data-table';
import { useTableCriteria } from '@/hooks/use-table-criteria';
import { 
  RefreshCw, 
  Globe, 
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowUpDown,
  Play,
  Settings
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useScraperTargets } from '@/hooks/scraper/useScraperTargets';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';

// Extender la interfaz para incluir campos adicionales con valores por defecto
interface ExtendedScraperTarget {
  name: string;
  display_name: string;
  enabled: boolean;
  is_active?: boolean;
  url: string;
  last_run?: string;
  products_count: number;
  success_rate: number;
  frequency: 'daily' | 'every_2_days' | 'every_3_days' | 'weekly';
  priority: 'high' | 'medium' | 'low';
  category?: string;
  engine?: string;
}

// Funciones helper para determinar categoría y engine basado en el nombre/URL
function getTargetCategory(displayName: string): string {
  const name = displayName.toLowerCase();
  if (name.includes('jumbo') || name.includes('coto') || name.includes('dia') || name.includes('carrefour')) {
    return 'retail';
  }
  if (name.includes('mercado') || name.includes('amazon')) {
    return 'marketplace';
  }
  if (name.includes('fravega') || name.includes('garbarino') || name.includes('musimundo')) {
    return 'ecommerce';
  }
  return 'general';
}

function getTargetEngine(url: string): string {
  const urlLower = url.toLowerCase();
  if (urlLower.includes('api')) {
    return 'api';
  }
  if (urlLower.includes('feed') || urlLower.includes('xml')) {
    return 'feed';
  }
  return 'scraper';
}

export function SourceManagerTable() {
  const { targets: rawTargets, loading, toggleTarget, refreshTarget } = useScraperTargets();
  const [loadingTarget, setLoadingTarget] = useState<string | null>(null);
  
  // Mapear targets con valores por defecto para campos opcionales
  const targets: ExtendedScraperTarget[] = useMemo(() => {
    if (!rawTargets || !Array.isArray(rawTargets)) {
      return [];
    }
    
    return rawTargets
      .filter(target => target != null)
      .map(target => ({
        ...target,
        is_active: target.enabled, // Usar enabled como is_active
        category: target.display_name ? getTargetCategory(target.display_name) : 'general',
        engine: target.url ? getTargetEngine(target.url) : 'scraper',
      }));
  }, [rawTargets]);
  
  // Hook para manejar estado de tabla
  const {
    searchValue,
    currentPage,
    pageSize,
    sortBy,
    sortDir,
    filters,
    setSearchValue,
    setCurrentPage,
    setPageSize,
    setSortBy,
    setSortDir,
    setFilters,
    resetFilters,
  } = useTableCriteria({
    defaultPageSize: 10,
    defaultSortBy: 'display_name',
    defaultSortDir: 'asc',
  });

  const handleRefresh = async (targetName: string) => {
    setLoadingTarget(targetName);
    try {
      await refreshTarget(targetName);
    } finally {
      setLoadingTarget(null);
    }
  };

  const getHealthStatus = (successRate: number) => {
    if (successRate >= 0.95) {
      return { 
        icon: <CheckCircle className="h-4 w-4" />, 
        color: 'text-green-500',
        variant: 'default' as const
      };
    } else if (successRate >= 0.8) {
      return { 
        icon: <AlertCircle className="h-4 w-4" />, 
        color: 'text-yellow-500',
        variant: 'warning' as const
      };
    } else {
      return { 
        icon: <AlertCircle className="h-4 w-4" />, 
        color: 'text-red-500',
        variant: 'destructive' as const
      };
    }
  };

  // Definir columnas de la tabla
  const columns: ColumnDef<ExtendedScraperTarget>[] = useMemo(() => [
    {
      id: 'status',
      header: 'Estado',
      cell: ({ row }) => {
        const target = row.original;
        return (
          <Switch
            checked={target.is_active || target.enabled}
            onCheckedChange={(checked) => toggleTarget(target.name, checked)}
            aria-label={`Toggle ${target.display_name}`}
          />
        );
      },
    },
    {
      accessorKey: 'display_name',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Fuente
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const target = row.original;
        return (
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-medium">{target.display_name}</div>
              <div className="text-xs text-muted-foreground">{target.url}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'category',
      header: 'Categoría',
      cell: ({ row }) => {
        const category = row.getValue('category') as string | undefined;
        return category ? (
          <Badge variant="outline">
            {category}
          </Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
    },
    {
      accessorKey: 'engine',
      header: 'Motor',
      cell: ({ row }) => {
        const engine = row.getValue('engine') as string | undefined;
        return engine ? (
          <Badge variant="secondary">
            {engine}
          </Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
    },
    {
      accessorKey: 'products_count',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Productos
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const count = row.getValue('products_count') as number;
        return (
          <div className="font-medium">
            {new Intl.NumberFormat('es-AR').format(count)}
          </div>
        );
      },
    },
    {
      accessorKey: 'success_rate',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Tasa de Éxito
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const rate = row.getValue('success_rate') as number;
        const health = getHealthStatus(rate);
        return (
          <div className="flex items-center gap-2">
            <span className={cn(health.color)}>{health.icon}</span>
            <span className="font-medium">{(rate * 100).toFixed(1)}%</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'last_run',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Última Ejecución
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const lastRun = row.getValue('last_run') as string | undefined;
        if (!lastRun) {
          return <span className="text-muted-foreground">Nunca</span>;
        }
        return (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span>
              {formatDistanceToNow(new Date(lastRun), {
                addSuffix: true,
                locale: es,
              })}
            </span>
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => {
        const target = row.original;
        const isExecuting = loadingTarget === target.name;
        
        return (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleRefresh(target.name)}
              disabled={isExecuting || (!target.is_active && !target.enabled)}
              className="h-8"
            >
              {isExecuting ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              <span className="ml-2 hidden lg:inline">Ejecutar</span>
            </Button>
            
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
                  onClick={() => handleRefresh(target.name)}
                  disabled={isExecuting || (!target.is_active && !target.enabled)}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Ejecutar ahora
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Calendar className="mr-2 h-4 w-4" />
                  Programar
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Configurar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => toggleTarget(target.name, !(target.is_active || target.enabled))}
                >
                  {(target.is_active || target.enabled) ? 'Desactivar' : 'Activar'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ], [loadingTarget, toggleTarget]);

  // Filtrar datos basado en búsqueda y filtros
  const filteredData = useMemo(() => {
    // Verificar que targets existe y es un array
    if (!targets || !Array.isArray(targets)) {
      return [];
    }
    
    let filtered = targets.filter(target => target != null);
    
    // Aplicar búsqueda
    if (searchValue) {
      filtered = filtered.filter(target => {
        if (!target) return false;
        return (
          target.display_name?.toLowerCase().includes(searchValue.toLowerCase()) ||
          target.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
          (target.category && target.category.toLowerCase().includes(searchValue.toLowerCase()))
        );
      });
    }
    
    // Aplicar filtros adicionales
    if (filters.category) {
      filtered = filtered.filter(target => 
        target && target.category === filters.category
      );
    }
    
    if (filters.engine) {
      filtered = filtered.filter(target => 
        target && target.engine === filters.engine
      );
    }
    
    if (filters.status) {
      const isActive = filters.status === 'active';
      filtered = filtered.filter(target => 
        target && (target.is_active || target.enabled) === isActive
      );
    }
    
    // Aplicar ordenamiento
    if (sortBy) {
      filtered.sort((a, b) => {
        if (!a || !b) return 0;
        
        const aValue = a[sortBy as keyof ExtendedScraperTarget];
        const bValue = b[sortBy as keyof ExtendedScraperTarget];
        
        if (aValue === undefined || aValue === null) return 1;
        if (bValue === undefined || bValue === null) return -1;
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortDir === 'asc' 
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortDir === 'asc' 
            ? aValue - bValue
            : bValue - aValue;
        }
        
        return 0;
      });
    }
    
    return filtered;
  }, [targets, searchValue, filters, sortBy, sortDir]);

  // Calcular datos paginados
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filteredData.slice(start, end);
  }, [filteredData, currentPage, pageSize]);

  // Filtros para la tabla
  const tableFilters = [
    {
      id: 'category',
      label: 'Categoría',
      type: 'select' as const,
      options: [
        { label: 'Todas', value: '' },
        { label: 'Retail', value: 'retail' },
        { label: 'E-commerce', value: 'ecommerce' },
        { label: 'Marketplace', value: 'marketplace' },
      ],
    },
    {
      id: 'engine',
      label: 'Motor',
      type: 'select' as const,
      options: [
        { label: 'Todos', value: '' },
        { label: 'Scraper', value: 'scraper' },
        { label: 'API', value: 'api' },
        { label: 'Crawler', value: 'crawler' },
      ],
    },
    {
      id: 'status',
      label: 'Estado',
      type: 'select' as const,
      options: [
        { label: 'Todos', value: '' },
        { label: 'Activos', value: 'active' },
        { label: 'Inactivos', value: 'inactive' },
      ],
    },
  ];

  return (
    <CriteriaDataTable
      data={paginatedData}
      columns={columns}
      totalCount={filteredData.length}
      currentPage={currentPage}
      pageSize={pageSize}
      loading={loading}
      searchPlaceholder="Buscar fuentes..."
      filters={tableFilters}
      fullWidth={true}
      onSearchChange={setSearchValue}
      onPageChange={setCurrentPage}
      onPageSizeChange={setPageSize}
      onSortChange={(newSortBy, newSortDir) => {
        setSortBy(newSortBy);
        setSortDir(newSortDir);
      }}
      onFilterChange={(filterId, value) => {
        setFilters(prev => ({ ...prev, [filterId]: value }));
      }}
    />
  );
}