'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '../molecules/card';
import { Button } from '../atoms/button';
import { Badge } from '../atoms/badge';
import { Progress } from '../atoms/progress';
import { ScrollArea } from '../atoms/scroll-area';
import { Separator } from '../atoms/separator';
import { Alert, AlertDescription } from '../atoms/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../atoms/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table';
import {
  Play,
  Pause,
  Square,
  RefreshCw,
  Activity,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Terminal,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Zap,
  Database,
  Globe,
  Cpu,
  MemoryStick,
  Timer,
  Server
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '../utils/cn';
import { useRealTimeScraperMonitor } from '../../../hooks/scraper/useRealTimeScraperMonitor';

interface ScraperSource {
  id: string;
  name: string;
  url: string;
  status: 'idle' | 'running' | 'paused' | 'completed' | 'failed' | 'scheduled';
  health: 'healthy' | 'degraded' | 'unhealthy';
  lastRun?: string;
  nextRun?: string;
  stats: {
    totalProducts: number;
    newProducts: number;
    updatedProducts: number;
    failedProducts: number;
    successRate: number;
    avgResponseTime: number;
    errorRate: number;
  };
  performance: {
    cpuUsage: number;
    memoryUsage: number;
    requestsPerSecond: number;
    bytesProcessed: number;
  };
  currentJob?: {
    id: string;
    progress: number;
    itemsProcessed: number;
    totalItems: number;
    startTime: string;
    estimatedEndTime?: string;
    currentUrl?: string;
    errors: number;
  };
  logs: LogEntry[];
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  metadata?: Record<string, any>;
}

interface RealTimeScraperMonitorProps {
  className?: string;
}

export function RealTimeScraperMonitor({ className }: RealTimeScraperMonitorProps) {
  const {
    sources,
    loading,
    error,
    connected,
    startScraper,
    stopScraper,
    pauseScraper,
    resumeScraper,
    clearLogs,
    metrics,
    refresh
  } = useRealTimeScraperMonitor();

  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [sources, autoScroll]);

  const toggleLogExpansion = (sourceId: string) => {
    setExpandedLogs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sourceId)) {
        newSet.delete(sourceId);
      } else {
        newSet.add(sourceId);
      }
      return newSet;
    });
  };

  const getStatusIcon = (status: ScraperSource['status']) => {
    switch (status) {
      case 'idle':
        return <Clock className="h-4 w-4" />;
      case 'running':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'paused':
        return <Pause className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'failed':
        return <XCircle className="h-4 w-4" />;
      case 'scheduled':
        return <Clock className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: ScraperSource['status']) => {
    switch (status) {
      case 'idle':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      case 'running':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'scheduled':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getHealthIcon = (health: ScraperSource['health']) => {
    switch (health) {
      case 'healthy':
        return <Activity className="h-4 w-4 text-green-500" />;
      case 'degraded':
        return <Activity className="h-4 w-4 text-yellow-500" />;
      case 'unhealthy':
        return <Activity className="h-4 w-4 text-red-500" />;
    }
  };

  const getLogLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'info':
        return 'text-blue-600 dark:text-blue-400';
      case 'warn':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      case 'debug':
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  const renderMetricsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Scrapers Activos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.activeSources}</div>
          <p className="text-xs text-muted-foreground">
            de {metrics.totalSources} totales
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Database className="h-4 w-4" />
            Productos Procesados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {new Intl.NumberFormat('es-AR').format(metrics.totalProductsProcessed)}
          </div>
          <div className="flex items-center gap-1 text-xs">
            {metrics.productsTrend > 0 ? (
              <TrendingUp className="h-3 w-3 text-green-500" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-500" />
            )}
            <span className={metrics.productsTrend > 0 ? 'text-green-500' : 'text-red-500'}>
              {Math.abs(metrics.productsTrend)}% vs última hora
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Tasa de Éxito
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {(metrics.avgSuccessRate * 100).toFixed(1)}%
          </div>
          <Progress 
            value={metrics.avgSuccessRate * 100} 
            className="h-1 mt-2"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Timer className="h-4 w-4" />
            Tiempo de Respuesta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics.avgResponseTime.toFixed(0)}ms
          </div>
          <p className="text-xs text-muted-foreground">
            promedio últimos 5 min
          </p>
        </CardContent>
      </Card>
    </div>
  );

  const renderSourceTable = () => (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Fuentes de Scraping</CardTitle>
            <CardDescription>
              Monitor en tiempo real de todas las fuentes de datos
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {!connected && (
              <Badge variant="destructive" className="gap-1">
                <AlertCircle className="h-3 w-3" />
                Desconectado
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              disabled={loading}
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
              Actualizar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Fuente</TableHead>
                <TableHead className="w-[100px]">Estado</TableHead>
                <TableHead className="w-[80px]">Salud</TableHead>
                <TableHead className="w-[200px]">Progreso</TableHead>
                <TableHead className="w-[150px]">Productos</TableHead>
                <TableHead className="w-[120px]">Rendimiento</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sources.map((source) => (
                <React.Fragment key={source.id}>
                  <TableRow 
                    className={cn(
                      "cursor-pointer transition-colors",
                      selectedSource === source.id && "bg-muted/50"
                    )}
                    onClick={() => setSelectedSource(
                      selectedSource === source.id ? null : source.id
                    )}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLogExpansion(source.id);
                          }}
                        >
                          {expandedLogs.has(source.id) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                        <div>
                          <div className="font-medium">{source.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {source.url}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={cn("gap-1", getStatusColor(source.status))}
                      >
                        {getStatusIcon(source.status)}
                        {source.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getHealthIcon(source.health)}
                    </TableCell>
                    <TableCell>
                      {source.currentJob ? (
                        <div className="space-y-1">
                          <Progress 
                            value={source.currentJob.progress} 
                            className="h-2"
                          />
                          <div className="text-xs text-muted-foreground">
                            {source.currentJob.itemsProcessed}/{source.currentJob.totalItems} items
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <div className="text-sm font-medium">
                          {new Intl.NumberFormat('es-AR').format(source.stats.totalProducts)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          +{source.stats.newProducts} nuevos
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1 text-xs">
                          <Cpu className="h-3 w-3" />
                          {source.performance.cpuUsage.toFixed(0)}%
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <MemoryStick className="h-3 w-3" />
                          {source.performance.memoryUsage.toFixed(0)}%
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        {source.status === 'idle' || source.status === 'failed' ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              startScraper(source.id);
                            }}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        ) : source.status === 'running' ? (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                pauseScraper(source.id);
                              }}
                            >
                              <Pause className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                stopScraper(source.id);
                              }}
                            >
                              <Square className="h-4 w-4" />
                            </Button>
                          </>
                        ) : source.status === 'paused' ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              resumeScraper(source.id);
                            }}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                  
                  {/* Logs expandibles */}
                  {expandedLogs.has(source.id) && (
                    <TableRow>
                      <TableCell colSpan={7} className="p-0">
                        <div className="bg-muted/20 p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium flex items-center gap-2">
                              <Terminal className="h-4 w-4" />
                              Logs en vivo
                            </h4>
                            <div className="flex items-center gap-2">
                              <label className="flex items-center gap-2 text-sm">
                                <input
                                  type="checkbox"
                                  checked={autoScroll}
                                  onChange={(e) => setAutoScroll(e.target.checked)}
                                  className="rounded border-gray-300"
                                />
                                Auto-scroll
                              </label>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => clearLogs(source.id)}
                              >
                                Limpiar
                              </Button>
                            </div>
                          </div>
                          <ScrollArea className="h-48 w-full rounded-md border bg-black/90 p-4">
                            <div className="font-mono text-xs space-y-1">
                              {source.logs.map((log) => (
                                <div
                                  key={log.id}
                                  className={cn(
                                    "flex items-start gap-2",
                                    getLogLevelColor(log.level)
                                  )}
                                >
                                  <span className="text-gray-500 dark:text-gray-400">
                                    {format(new Date(log.timestamp), 'HH:mm:ss')}
                                  </span>
                                  <span className="font-semibold">
                                    [{log.level.toUpperCase()}]
                                  </span>
                                  <span className="text-gray-200 flex-1">
                                    {log.message}
                                  </span>
                                </div>
                              ))}
                              <div ref={logsEndRef} />
                            </div>
                          </ScrollArea>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );

  const renderPerformanceMetrics = () => {
    const selectedSourceData = sources.find(s => s.id === selectedSource);
    
    if (!selectedSourceData) {
      return (
        <Card>
          <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
            Selecciona una fuente para ver métricas detalladas
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Métricas de Rendimiento - {selectedSourceData.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">CPU</p>
              <div className="flex items-center gap-2">
                <Progress 
                  value={selectedSourceData.performance.cpuUsage} 
                  className="flex-1"
                />
                <span className="text-sm font-medium">
                  {selectedSourceData.performance.cpuUsage.toFixed(0)}%
                </span>
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Memoria</p>
              <div className="flex items-center gap-2">
                <Progress 
                  value={selectedSourceData.performance.memoryUsage} 
                  className="flex-1"
                />
                <span className="text-sm font-medium">
                  {selectedSourceData.performance.memoryUsage.toFixed(0)}%
                </span>
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Requests/s</p>
              <p className="text-2xl font-bold">
                {selectedSourceData.performance.requestsPerSecond.toFixed(1)}
              </p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Datos Procesados</p>
              <p className="text-2xl font-bold">
                {formatBytes(selectedSourceData.performance.bytesProcessed)}
              </p>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Estadísticas de Productos</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total procesados</span>
                  <span className="font-medium">
                    {new Intl.NumberFormat('es-AR').format(selectedSourceData.stats.totalProducts)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Nuevos</span>
                  <span className="font-medium text-green-600">
                    +{selectedSourceData.stats.newProducts}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Actualizados</span>
                  <span className="font-medium text-blue-600">
                    {selectedSourceData.stats.updatedProducts}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Fallidos</span>
                  <span className="font-medium text-red-600">
                    {selectedSourceData.stats.failedProducts}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Rendimiento</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tasa de éxito</span>
                  <span className="font-medium">
                    {(selectedSourceData.stats.successRate * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tiempo respuesta</span>
                  <span className="font-medium">
                    {selectedSourceData.stats.avgResponseTime.toFixed(0)}ms
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tasa de error</span>
                  <span className="font-medium">
                    {(selectedSourceData.stats.errorRate * 100).toFixed(1)}%
                  </span>
                </div>
                {selectedSourceData.currentJob && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tiempo estimado</span>
                    <span className="font-medium">
                      {selectedSourceData.currentJob.estimatedEndTime
                        ? formatDistanceToNow(
                            new Date(selectedSourceData.currentJob.estimatedEndTime),
                            { addSuffix: true, locale: es }
                          )
                        : 'Calculando...'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (error) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {renderMetricsCards()}
      {renderSourceTable()}
      {renderPerformanceMetrics()}
    </div>
  );
}