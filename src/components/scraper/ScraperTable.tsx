'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/shared-ui';
import { Button } from '@/components/shared-ui';
import { Progress } from '@/components/shared-ui';
import { 
  Play, 
  Pause, 
  RotateCw, 
  Eye, 
  Activity,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  FileText,
  Calendar
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ScraperJob {
  id: string;
  name: string;
  source: string;
  status: 'idle' | 'running' | 'completed' | 'failed' | 'scheduled';
  progress?: number;
  lastRun?: string;
  nextRun?: string;
  productsFound?: number;
  duplicatesFound?: number;
  successRate?: number;
  duration?: string;
  error?: string;
  logs?: string[];
}

interface ScraperTableProps {
  jobs: ScraperJob[];
  onStart: (jobId: string) => void;
  onStop: (jobId: string) => void;
  onRefresh: (jobId: string) => void;
  onViewLogs: (jobId: string) => void;
  loading?: boolean;
}

export function ScraperTable({
  jobs,
  onStart,
  onStop,
  onRefresh,
  onViewLogs,
  loading = false,
}: ScraperTableProps) {
  const getStatusIcon = (status: ScraperJob['status']) => {
    switch (status) {
      case 'idle':
        return <Clock className="h-4 w-4" />;
      case 'running':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'failed':
        return <XCircle className="h-4 w-4" />;
      case 'scheduled':
        return <Calendar className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: ScraperJob['status']) => {
    switch (status) {
      case 'idle':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      case 'running':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getStatusText = (status: ScraperJob['status']) => {
    switch (status) {
      case 'idle':
        return 'Inactivo';
      case 'running':
        return 'En ejecución';
      case 'completed':
        return 'Completado';
      case 'failed':
        return 'Fallido';
      case 'scheduled':
        return 'Programado';
      default:
        return 'Desconocido';
    }
  };

  const formatNumber = (num?: number) => {
    if (num === undefined) return '-';
    return new Intl.NumberFormat('es-AR').format(num);
  };

  const formatPercentage = (rate?: number) => {
    if (rate === undefined) return '-';
    return `${(rate * 100).toFixed(1)}%`;
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Nombre / Fuente</TableHead>
              <TableHead className="w-[120px]">Estado</TableHead>
              <TableHead className="w-[180px]">Progreso</TableHead>
              <TableHead className="w-[160px]">Última Ejecución</TableHead>
              <TableHead className="w-[160px]">Próxima Ejecución</TableHead>
              <TableHead className="text-right w-[120px]">Productos</TableHead>
              <TableHead className="text-right w-[120px]">Tasa Éxito</TableHead>
              <TableHead className="w-[140px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No hay scrapers configurados
                </TableCell>
              </TableRow>
            ) : (
              jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{job.name}</div>
                      <div className="text-sm text-muted-foreground">{job.source}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge 
                            variant="secondary" 
                            className={cn("gap-1", getStatusColor(job.status))}
                          >
                            {getStatusIcon(job.status)}
                            {getStatusText(job.status)}
                          </Badge>
                        </TooltipTrigger>
                        {job.error && (
                          <TooltipContent className="max-w-xs">
                            <p className="text-sm">{job.error}</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell>
                    {job.status === 'running' && job.progress !== undefined ? (
                      <div className="space-y-1">
                        <Progress value={job.progress} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          {job.progress}% - {job.duration || 'calculando...'}
                        </p>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        {job.status === 'scheduled' ? 'Esperando...' : '-'}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {job.lastRun ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-sm cursor-help">
                              {formatDistanceToNow(new Date(job.lastRun), { 
                                addSuffix: true, 
                                locale: es 
                              })}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            {format(new Date(job.lastRun), "dd/MM/yyyy HH:mm:ss")}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <span className="text-sm text-muted-foreground">Nunca</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {job.nextRun ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-sm cursor-help">
                              {formatDistanceToNow(new Date(job.nextRun), { 
                                addSuffix: true, 
                                locale: es 
                              })}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            {format(new Date(job.nextRun), "dd/MM/yyyy HH:mm:ss")}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <span className="text-sm text-muted-foreground">No programado</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="space-y-0.5">
                      <div className="font-medium">{formatNumber(job.productsFound)}</div>
                      {job.duplicatesFound !== undefined && job.duplicatesFound > 0 && (
                        <div className="text-xs text-muted-foreground">
                          {formatNumber(job.duplicatesFound)} duplicados
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {job.successRate !== undefined ? (
                      <Badge variant={job.successRate >= 0.9 ? "default" : "secondary"}>
                        {formatPercentage(job.successRate)}
                      </Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {job.status === 'idle' || job.status === 'failed' ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => onStart(job.id)}
                                disabled={loading}
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Iniciar</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : job.status === 'running' ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => onStop(job.id)}
                                disabled={loading}
                              >
                                <Pause className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Detener</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : null}
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => onRefresh(job.id)}
                              disabled={loading || job.status === 'running'}
                            >
                              <RotateCw className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Actualizar</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => onViewLogs(job.id)}
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Ver logs</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Resumen estadístico */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Activity className="h-4 w-4" />
            {jobs.filter(j => j.status === 'running').length} en ejecución
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            {jobs.filter(j => j.status === 'completed').length} completados
          </span>
          <span className="flex items-center gap-1">
            <XCircle className="h-4 w-4 text-red-600" />
            {jobs.filter(j => j.status === 'failed').length} fallidos
          </span>
        </div>
        <div>
          Total: {jobs.length} scrapers
        </div>
      </div>
    </div>
  );
}