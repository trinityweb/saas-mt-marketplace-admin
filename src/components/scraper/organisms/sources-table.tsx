'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/shared-ui';
import { Badge } from '@/components/shared-ui';
import {
  CheckCircle,
  Eye,
  Pause,
  Play,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

// Interfaces
export interface ScrapingSource {
  _id: string;
  source_id: string;
  name: string;
  display_name?: string;
  category: string;
  engine: string;
  status: 'active' | 'inactive' | 'error';
  is_active: boolean;
  health_score: number;
  last_run?: string;
  products_count: number;
  success_rate: number;
  total_products: number;
  failed_scrapes: number;
  successful_scrapes: number;
  created_at: string;
  updated_at: string;
}

export interface ScrapingJob {
  job_id: string;
  source_id: string;
  source_name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  products_scraped: number;
}

interface SourcesTableProps {
  sources: ScrapingSource[];
  jobs: ScrapingJob[];
  loading?: boolean;
  onToggleSource: (sourceId: string, isActive: boolean) => Promise<void>;
  onExecuteSource: (sourceId: string) => Promise<void>;
  onViewDetails?: (source: ScrapingSource) => void;
  className?: string;
}

export function SourcesTable({
  sources,
  jobs,
  loading = false,
  onToggleSource,
  onExecuteSource,
  onViewDetails,
  className
}: SourcesTableProps) {

  const getStatusBadge = useCallback((source: ScrapingSource) => {
    const isRunning = jobs.some(j => j.source_id === source.source_id && j.status === 'processing');
    
    if (isRunning) {
      return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Ejecutando</Badge>;
    }
    
    switch (source.status) {
      case 'active':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Activa</Badge>;
      case 'inactive':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Inactiva</Badge>;
      case 'error':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Error</Badge>;
      default:
        return <Badge variant="secondary">Desconocido</Badge>;
    }
  }, [jobs]);

  const getCategoryBadge = useCallback((category: string) => {
    const colors: Record<string, string> = {
      'supermercados': 'bg-green-100 text-green-800',
      'tecnologia': 'bg-blue-100 text-blue-800',
      'hogar': 'bg-yellow-100 text-yellow-800',
      'farmacia': 'bg-pink-100 text-pink-800',
      'moda': 'bg-purple-100 text-purple-800',
      'deportes': 'bg-orange-100 text-orange-800',
      'varios': 'bg-gray-100 text-gray-800',
    };

    return (
      <Badge variant="secondary" className={colors[category] || 'bg-gray-100 text-gray-800'}>
        {category}
      </Badge>
    );
  }, []);

  const handleToggle = useCallback(async (sourceId: string, isActive: boolean) => {
    try {
      await onToggleSource(sourceId, isActive);
    } catch (error) {
      console.error('Error toggling source:', error);
    }
  }, [onToggleSource]);

  const handleExecute = useCallback(async (sourceId: string) => {
    try {
      await onExecuteSource(sourceId);
    } catch (error) {
      console.error('Error executing source:', error);
    }
  }, [onExecuteSource]);

  return (
    <div className={cn('rounded-md border', className)}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fuente</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Productos</TableHead>
            <TableHead>Éxito</TableHead>
            <TableHead>Última Ejecución</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-12">
                <div className="flex items-center justify-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Cargando fuentes...
                </div>
              </TableCell>
            </TableRow>
          ) : sources.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                No se encontraron fuentes con los filtros aplicados
              </TableCell>
            </TableRow>
          ) : (
            sources.map((source) => {
              const isRunning = jobs.some(j => j.source_id === source.source_id && j.status === 'processing');
              const runningJob = jobs.find(j => j.source_id === source.source_id && j.status === 'processing');
              
              return (
                <TableRow key={source._id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{source.display_name || source.name}</div>
                      <div className="text-sm text-muted-foreground">{source.source_id}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getCategoryBadge(source.category)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(source)}
                  </TableCell>
                  <TableCell>
                    <div className="text-right">
                      <div className="font-medium">{(source.total_products || 0).toLocaleString()}</div>
                      {runningJob && (
                        <div className="text-xs text-blue-600">
                          +{runningJob.products_scraped} ahora
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <div className={cn(
                        'w-2 h-2 rounded-full',
                        source.success_rate > 0.8 ? 'bg-green-500' : 
                        source.success_rate > 0.5 ? 'bg-yellow-500' : 'bg-red-500'
                      )} />
                      <span className="text-sm">
                        {Math.round((source.success_rate || 0) * 100)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {source.last_run 
                        ? formatDistanceToNow(new Date(source.last_run), { addSuffix: true, locale: es })
                        : 'Nunca'
                      }
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* Toggle activo/inactivo */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggle(source.source_id, source.is_active)}
                        className="h-8 w-8 p-0"
                        title={source.is_active ? 'Desactivar fuente' : 'Activar fuente'}
                      >
                        {source.is_active ? (
                          <Pause className="h-4 w-4 text-orange-600" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                      </Button>

                      {/* Ejecutar scraping */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleExecute(source.source_id)}
                        disabled={!source.is_active || isRunning}
                        className="h-8 w-8 p-0"
                        title={isRunning ? 'Ejecutándose...' : 'Ejecutar scraping'}
                      >
                        <Play className={cn(
                          'h-4 w-4',
                          isRunning ? 'text-blue-600 animate-pulse' : 'text-green-600'
                        )} />
                      </Button>

                      {/* Ver detalles */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDetails?.(source)}
                        className="h-8 w-8 p-0"
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4 text-gray-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
