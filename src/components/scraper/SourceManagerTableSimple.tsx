'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/shared-ui';
import { Badge } from '@/components/shared-ui';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/shared-ui';
import { 
  RefreshCw, 
  Globe, 
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowUpDown,
  Play,
  Settings,
  Search,
  Loader2
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Ya no necesitamos estas funciones helper porque los datos vienen del backend

export function SourceManagerTableSimple() {
  const { targets: rawTargets, loading, toggleTarget, refreshTarget } = useScraperTargets();
  const [loadingTarget, setLoadingTarget] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [engineFilter, setEngineFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [activeJobs, setActiveJobs] = useState<Record<string, boolean>>({});

  // Obtener jobs activos periódicamente
  useEffect(() => {
    const fetchActiveJobs = async () => {
      try {
        const response = await fetch('/api/scraper/api/v1/scraping/jobs');
        if (response.ok) {
          const jobs = await response.json();
          const activeJobsMap: Record<string, boolean> = {};
          jobs.forEach((job: any) => {
            if (job.status === 'running' || job.status === 'pending') {
              activeJobsMap[job.source_id || job.target_name] = true;
            }
          });
          setActiveJobs(activeJobsMap);
        }
      } catch (error) {
        console.error('Error fetching active jobs:', error);
      }
    };

    fetchActiveJobs();
    const interval = setInterval(fetchActiveJobs, 3000); // Actualizar cada 3 segundos para más responsividad
    
    return () => clearInterval(interval);
  }, []);

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
      };
    } else if (successRate >= 0.8) {
      return { 
        icon: <AlertCircle className="h-4 w-4" />, 
        color: 'text-yellow-500',
      };
    } else {
      return { 
        icon: <AlertCircle className="h-4 w-4" />, 
        color: 'text-red-500',
      };
    }
  };

  // Procesar y filtrar datos
  const processedData = useMemo(() => {
    if (!rawTargets || !Array.isArray(rawTargets)) {
      return [];
    }

    // Los datos ya vienen con los campos correctos del backend
    let processed = rawTargets.map(target => ({
      ...target,
      // Mapear enabled para compatibilidad si existe
      enabled: target.is_active
    }));

    // Aplicar búsqueda
    if (searchValue) {
      processed = processed.filter(target =>
        target.display_name?.toLowerCase().includes(searchValue.toLowerCase()) ||
        target.name?.toLowerCase().includes(searchValue.toLowerCase())
      );
    }

    // Aplicar filtro de categoría
    if (categoryFilter) {
      processed = processed.filter(target => target.category === categoryFilter);
    }

    // Aplicar filtro de motor
    if (engineFilter) {
      processed = processed.filter(target => target.engine === engineFilter);
    }

    // Aplicar filtro de estado
    if (statusFilter) {
      const isActive = statusFilter === 'active';
      processed = processed.filter(target => target.is_active === isActive);
    }

    return processed;
  }, [rawTargets, searchValue, categoryFilter, engineFilter, statusFilter]);

  // Paginar datos
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return processedData.slice(start, end);
  }, [processedData, currentPage, pageSize]);

  const totalPages = Math.ceil(processedData.length / pageSize);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros integrados */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar fuentes..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={categoryFilter || 'all'} onValueChange={(value) => setCategoryFilter(value === 'all' ? '' : value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="supermercados">Supermercados</SelectItem>
            <SelectItem value="tecnologia">Tecnología</SelectItem>
            <SelectItem value="hogar">Hogar</SelectItem>
            <SelectItem value="moda">Moda</SelectItem>
            <SelectItem value="farmacia">Farmacia</SelectItem>
            <SelectItem value="deportes">Deportes</SelectItem>
            <SelectItem value="juguetes">Juguetes</SelectItem>
            <SelectItem value="libreria">Librería</SelectItem>
            <SelectItem value="varios">Varios</SelectItem>
          </SelectContent>
        </Select>

        <Select value={engineFilter || 'all'} onValueChange={(value) => setEngineFilter(value === 'all' ? '' : value)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="scrapy">Scrapy</SelectItem>
            <SelectItem value="selenium">Selenium</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter || 'all'} onValueChange={(value) => setStatusFilter(value === 'all' ? '' : value)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Activos</SelectItem>
            <SelectItem value="inactive">Inactivos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabla */}
      <div className="rounded-md border">
        <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Estado</TableHead>
                <TableHead>Fuente</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Motor</TableHead>
                <TableHead className="text-right">Productos</TableHead>
                <TableHead>Tasa de Éxito</TableHead>
                <TableHead>Última Ejecución</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <p className="text-muted-foreground">
                      No se encontraron fuentes que coincidan con los filtros
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((target) => {
                  const health = getHealthStatus(target.success_rate);
                  const isExecuting = loadingTarget === target.name;
                  const hasActiveJob = activeJobs[target.name] || activeJobs[target.id];
                  
                  return (
                    <TableRow key={target.name}>
                      <TableCell>
                        <Switch
                          checked={target.is_active}
                          onCheckedChange={(checked) => toggleTarget(target.name, checked)}
                          aria-label={`Toggle ${target.display_name}`}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{target.display_name}</span>
                              {hasActiveJob && (
                                <Badge variant="default" className="flex items-center gap-1 px-1.5 py-0.5">
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                  <span className="text-xs">Activo</span>
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">{target.url}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {target.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {target.engine}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {target.products_count > 0 
                          ? new Intl.NumberFormat('es-AR').format(target.products_count)
                          : <span className="text-muted-foreground">-</span>
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {target.success_rate > 0 ? (
                            <>
                              <span className={cn(health.color)}>{health.icon}</span>
                              <span className="font-medium">{(target.success_rate * 100).toFixed(1)}%</span>
                            </>
                          ) : (
                            <span className="text-muted-foreground">Sin datos</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {target.last_run ? (
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span>
                              {formatDistanceToNow(new Date(target.last_run), {
                                addSuffix: true,
                                locale: es,
                              })}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Nunca</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRefresh(target.name)}
                            disabled={isExecuting || !target.is_active}
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
                                disabled={isExecuting || !target.is_active}
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
                                onClick={() => toggleTarget(target.name, !target.is_active)}
                              >
                                {target.is_active ? 'Desactivar' : 'Activar'}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Mostrando {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, processedData.length)} de {processedData.length} fuentes
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <div className="text-sm">
              Página {currentPage} de {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}