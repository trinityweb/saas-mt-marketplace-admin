'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared-ui';
import { Button } from '@/components/shared-ui';
import { Badge } from '@/components/shared-ui';
import { Progress } from '@/components/shared-ui';
import { ScrollArea } from '@/components/shared-ui';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  Zap,
  Database,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useScraperJobs } from '@/hooks/scraper/useScraperJobs';
import { useToast } from '@/hooks/use-toast';

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
}

export function RealTimeMonitor() {
  const { toast } = useToast();
  const {
    jobs,
    loading,
    error,
    startJob,
    stopJob,
    refreshJob,
  } = useScraperJobs();

  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  const [logs, setLogs] = useState<Record<string, LogEntry[]>>({});
  const [isConnected, setIsConnected] = useState(true);

  // Simulación de logs en tiempo real
  useEffect(() => {
    const interval = setInterval(() => {
      jobs.forEach(job => {
        if (job.status === 'running') {
          const newLog: LogEntry = {
            timestamp: new Date().toISOString(),
            level: Math.random() > 0.8 ? 'warning' : 'info',
            message: generateRandomLogMessage(job.name),
          };
          
          setLogs(prev => ({
            ...prev,
            [job.id]: [...(prev[job.id] || []).slice(-49), newLog],
          }));
        }
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [jobs]);

  const generateRandomLogMessage = (sourceName: string) => {
    const messages = [
      `Procesando página de categoría...`,
      `Extrayendo productos: encontrados 15 nuevos`,
      `Analizando precios y disponibilidad`,
      `Guardando imágenes de productos`,
      `Validando datos extraídos`,
      `Actualizando base de datos`,
      `Detectando duplicados: 3 encontrados`,
      `Aplicando transformaciones de datos`,
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const toggleLogs = (jobId: string) => {
    setExpandedLogs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
      } else {
        newSet.add(jobId);
      }
      return newSet;
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'idle':
        return <Clock className="h-4 w-4" />;
      case 'running':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'failed':
        return <XCircle className="h-4 w-4" />;
      case 'disabled':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'idle':
        return 'default';
      case 'running':
        return 'primary';
      case 'completed':
        return 'success';
      case 'failed':
        return 'destructive';
      case 'disabled':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getLogLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'info':
        return 'text-blue-400';
      case 'warning':
        return 'text-yellow-400';
      case 'error':
        return 'text-red-400';
      case 'success':
        return 'text-green-400';
    }
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const runningJobs = jobs.filter(j => j.status === 'running').length;
  const totalProducts = jobs.reduce((acc, job) => acc + (job.productsFound || 0), 0);
  const avgSuccessRate = jobs.length > 0 
    ? jobs.reduce((acc, job) => acc + (job.successRate || 0), 0) / jobs.length 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header con métricas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scrapers Activos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{runningJobs}/{jobs.length}</div>
            <p className="text-xs text-muted-foreground">
              {runningJobs > 0 ? 'En ejecución' : 'Todos inactivos'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos Totales</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts.toLocaleString('es-AR')}</div>
            <p className="text-xs text-muted-foreground">
              Recolectados hasta ahora
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Éxito</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(avgSuccessRate * 100).toFixed(1)}%</div>
            <Progress value={avgSuccessRate * 100} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estado Conexión</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className={cn(
                "h-3 w-3 rounded-full",
                isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
              )} />
              <span className="text-sm font-medium">
                {isConnected ? 'Conectado' : 'Desconectado'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Tiempo real activado
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla principal */}
      <Card>
        <CardHeader>
          <CardTitle>Monitor de Fuentes en Tiempo Real</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]"></TableHead>
                  <TableHead>Fuente</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Progreso</TableHead>
                  <TableHead className="text-right">Productos</TableHead>
                  <TableHead className="text-right">Éxito</TableHead>
                  <TableHead>Última Ejecución</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <React.Fragment key={job.id}>
                    <TableRow 
                      className={cn(
                        "cursor-pointer transition-colors",
                        selectedJob === job.id && "bg-muted/50"
                      )}
                      onClick={() => setSelectedJob(job.id)}
                    >
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLogs(job.id);
                          }}
                        >
                          {expandedLogs.has(job.id) ? 
                            <ChevronDown className="h-4 w-4" /> : 
                            <ChevronRight className="h-4 w-4" />
                          }
                        </Button>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div>
                          <div>{job.name}</div>
                          <div className="text-xs text-muted-foreground">{job.source}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(job.status)} className="gap-1">
                          {getStatusIcon(job.status)}
                          {job.status === 'running' ? 'Ejecutando' : 
                           job.status === 'completed' ? 'Completado' :
                           job.status === 'failed' ? 'Error' : 
                           job.status === 'disabled' ? 'Deshabilitado' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {job.status === 'running' && job.progress !== undefined ? (
                          <div className="w-[100px]">
                            <Progress value={job.progress} className="h-2" />
                            <p className="text-xs text-muted-foreground mt-1">
                              {job.progress}%
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {job.productsFound?.toLocaleString('es-AR') || '0'}
                      </TableCell>
                      <TableCell className="text-right">
                        {job.successRate ? `${(job.successRate * 100).toFixed(0)}%` : '-'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {job.lastRun ? 
                          formatDistanceToNow(new Date(job.lastRun), { 
                            addSuffix: true, 
                            locale: es 
                          }) : 'Nunca'
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {job.status === 'idle' || job.status === 'failed' ? (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                startJob(job.id);
                              }}
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          ) : job.status === 'running' ? (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                stopJob(job.id);
                              }}
                            >
                              <Square className="h-4 w-4" />
                            </Button>
                          ) : null}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              refreshJob(job.id);
                            }}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    {expandedLogs.has(job.id) && (
                      <TableRow>
                        <TableCell colSpan={8} className="p-0">
                          <div className="bg-slate-900 p-4">
                            <div className="flex items-center gap-2 mb-2 text-slate-400">
                              <Terminal className="h-4 w-4" />
                              <span className="text-sm font-mono">Logs - {job.name}</span>
                            </div>
                            <ScrollArea className="h-[200px] w-full">
                              <div className="font-mono text-xs space-y-1">
                                {(logs[job.id] || []).map((log, idx) => (
                                  <div key={idx} className="flex gap-2">
                                    <span className="text-slate-600">
                                      {new Date(log.timestamp).toLocaleTimeString()}
                                    </span>
                                    <span className={cn("uppercase", getLogLevelColor(log.level))}>
                                      [{log.level}]
                                    </span>
                                    <span className="text-slate-300">{log.message}</span>
                                  </div>
                                ))}
                                {!logs[job.id]?.length && (
                                  <div className="text-slate-600">No hay logs disponibles</div>
                                )}
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

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}