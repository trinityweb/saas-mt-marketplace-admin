'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared-ui';
import { Badge } from '@/components/shared-ui';
import { Progress } from '@/components/shared-ui';
import { Button } from '@/components/shared-ui';
import { scraperAPI } from '@/lib/api/scraper/scraper-api';
import { useScraperWebSocket, ScraperEvent } from '@/hooks/scraper/useScraperWebSocket';
import { 
  RefreshCw, 
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Loader2,
  Package,
  TrendingUp,
  Wifi,
  WifiOff
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface ScrapingJob {
  job_id: string;
  source_id: string;
  source_name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  products_found: number;
  products_processed: number;
  errors_count: number;
  started_at: string;
  updated_at?: string;
  completed_at?: string;
  estimated_duration?: number;
  current_url?: string;
  urls_total?: number;
  urls_processed?: number;
}

export function ActiveJobsPanel() {
  const [jobs, setJobs] = useState<ScrapingJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  // WebSocket para actualizaciones en tiempo real
  const { isConnected, lastEvent } = useScraperWebSocket({
    onMessage: (event: ScraperEvent) => {
      // Actualizar jobs basado en eventos WebSocket
      if (event.type === 'job_progress' && event.job_id) {
        setJobs(prevJobs => 
          prevJobs.map(job => 
            job.job_id === event.job_id 
              ? { 
                  ...job, 
                  progress: event.progress || job.progress,
                  products_found: event.products_found || job.products_found,
                  status: 'running' as const
                }
              : job
          )
        );
      } else if (event.type === 'job_completed' && event.job_id) {
        setJobs(prevJobs => 
          prevJobs.map(job => 
            job.job_id === event.job_id 
              ? { ...job, status: 'completed' as const, progress: 100 }
              : job
          )
        );
      } else if (event.type === 'job_started') {
        // Recargar la lista de jobs cuando se inicia uno nuevo
        fetchJobs();
      }
    },
  });

  const fetchJobs = async () => {
    try {
      // Intentar obtener jobs activos primero
      let jobsData = [];
      
      // Obtener historial reciente ya que el endpoint de jobs parece no funcionar
      const historyResponse = await fetch('http://localhost:8001/scraper/api/v1/scraping/history', {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        
        // Mapear el historial al formato de jobs
        jobsData = historyData.map((item: any) => ({
          job_id: item.job_id,
          source_id: item.source || 'unknown',
          source_name: item.source || 'Desconocido',
          status: item.status || 'pending',
          progress: item.status === 'completed' ? 100 : item.status === 'failed' ? 0 : 50,
          products_found: item.products_scraped || 0,
          products_processed: item.products_scraped || 0,
          errors_count: item.errors || 0,
          started_at: item.created_at,
          updated_at: item.updated_at,
          completed_at: item.completed_at,
          duration_seconds: item.duration_seconds,
          urls_processed: item.urls_processed || 0,
        }));
      }
      
      setJobs(jobsData);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    
    if (autoRefresh) {
      const interval = setInterval(fetchJobs, 3000); // Actualizar cada 3 segundos
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'running':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary' as const;
      case 'running':
        return 'default' as const;
      case 'completed':
        return 'success' as const;
      case 'failed':
        return 'destructive' as const;
      case 'cancelled':
        return 'outline' as const;
      default:
        return 'secondary' as const;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'running':
        return 'En Progreso';
      case 'completed':
        return 'Completado';
      case 'failed':
        return 'Fallido';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const calculateEstimatedTime = (job: ScrapingJob) => {
    if (job.completed_at) {
      return null;
    }
    
    if (job.estimated_duration) {
      const elapsed = Date.now() - new Date(job.started_at).getTime();
      const remaining = Math.max(0, job.estimated_duration * 1000 - elapsed);
      
      if (remaining > 0) {
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        return `${minutes}m ${seconds}s restantes`;
      }
    }
    
    return 'Calculando...';
  };

  const activeJobs = jobs.filter(job => job.status === 'running' || job.status === 'pending');
  const recentJobs = jobs.filter(job => job.status === 'completed' || job.status === 'failed')
    .slice(0, 3);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            Cargando trabajos...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Panel de Jobs Activos */}
      {activeJobs.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                Trabajos en Progreso ({activeJobs.length})
              </CardTitle>
              <div className="flex items-center gap-2">
                {/* Indicador de WebSocket */}
                <Badge 
                  variant={isConnected ? "default" : "secondary"} 
                  className="flex items-center gap-1"
                >
                  {isConnected ? (
                    <>
                      <Wifi className="h-3 w-3" />
                      <span className="text-xs">Tiempo real</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="h-3 w-3" />
                      <span className="text-xs">Polling</span>
                    </>
                  )}
                </Badge>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={cn(autoRefresh && "border-green-500")}
                >
                  <RefreshCw className={cn("h-4 w-4", autoRefresh && "animate-spin text-green-500")} />
                  <span className="ml-2">{autoRefresh ? 'Auto' : 'Manual'}</span>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeJobs.map((job) => (
              <div key={job.job_id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(job.status)}
                    <div>
                      <div className="font-medium">{job.source_name || job.source_id}</div>
                      <div className="text-sm text-muted-foreground">
                        ID: {job.job_id.slice(0, 8)}...
                      </div>
                    </div>
                  </div>
                  <Badge variant={getStatusBadgeVariant(job.status)}>
                    {getStatusText(job.status)}
                  </Badge>
                </div>

                {/* Barra de Progreso */}
                {job.status === 'running' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progreso</span>
                      <span className="font-medium">{Math.round(job.progress)}%</span>
                    </div>
                    <Progress value={job.progress} className="h-2" />
                    {job.current_url && (
                      <div className="text-xs text-muted-foreground truncate">
                        Procesando: {job.current_url}
                      </div>
                    )}
                  </div>
                )}

                {/* Estadísticas */}
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Package className="h-3 w-3 text-muted-foreground" />
                    <span>
                      <span className="font-medium">{job.products_found}</span> productos
                    </span>
                  </div>
                  {job.urls_total && (
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-3 w-3 text-muted-foreground" />
                      <span>
                        <span className="font-medium">{job.urls_processed || 0}</span>/{job.urls_total} URLs
                      </span>
                    </div>
                  )}
                  {job.errors_count > 0 && (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-3 w-3 text-red-500" />
                      <span className="text-red-500">
                        {job.errors_count} errores
                      </span>
                    </div>
                  )}
                </div>

                {/* Tiempo */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>
                      Iniciado {formatDistanceToNow(new Date(job.started_at), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </span>
                  </div>
                  {job.status === 'running' && (
                    <span>{calculateEstimatedTime(job)}</span>
                  )}
                </div>

                {/* Acciones */}
                {job.status === 'running' && (
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // TODO: Implementar cancelación
                        console.log('Cancel job:', job.job_id);
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Panel de Jobs Recientes */}
      {recentJobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Trabajos Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentJobs.map((job) => (
                <div key={job.job_id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(job.status)}
                    <div>
                      <div className="text-sm font-medium">{job.source_name || job.source_id}</div>
                      <div className="text-xs text-muted-foreground">
                        {job.products_found} productos • {' '}
                        {formatDistanceToNow(new Date(job.completed_at || job.started_at), {
                          addSuffix: true,
                          locale: es,
                        })}
                      </div>
                    </div>
                  </div>
                  <Badge variant={getStatusBadgeVariant(job.status)} className="text-xs">
                    {getStatusText(job.status)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estado vacío */}
      {jobs.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No hay trabajos de scraping activos</p>
            <p className="text-sm text-muted-foreground mt-2">
              Los trabajos aparecerán aquí cuando inicies un proceso de scraping
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}