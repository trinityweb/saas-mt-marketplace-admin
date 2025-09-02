'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared-ui';
import { Badge } from '@/components/shared-ui';
import { Progress } from '@/components/shared-ui';
import { Button } from '@/components/shared-ui';
import {
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Loader2,
  Package,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScrapingJob {
  id: string;
  targetName: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  productsFound: number;
  progress?: number;
  errors: string[];
}

export function ScrapingMonitor() {
  const [jobs, setJobs] = useState<ScrapingJob[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/scraper/execute');
      const data = await response.json();
      
      if (data.executions) {
        const formattedJobs = data.executions.map((exec: any) => ({
          id: exec._id,
          targetName: exec.targetName,
          status: exec.status,
          startedAt: exec.startedAt,
          completedAt: exec.completedAt,
          productsFound: exec.productsFound || 0,
          progress: exec.progress || 0,
          errors: exec.errors || [],
        }));
        
        setJobs(formattedJobs);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 5000); // Actualizar cada 5 segundos
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: ScrapingJob['status']) => {
    switch (status) {
      case 'queued':
        return <Clock className="h-4 w-4" />;
      case 'running':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'failed':
        return <XCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: ScrapingJob['status']) => {
    switch (status) {
      case 'queued':
        return 'secondary';
      case 'running':
        return 'default';
      case 'completed':
        return 'success';
      case 'failed':
        return 'destructive';
    }
  };

  const getStatusText = (status: ScrapingJob['status']) => {
    switch (status) {
      case 'queued':
        return 'En cola';
      case 'running':
        return 'Ejecutando';
      case 'completed':
        return 'Completado';
      case 'failed':
        return 'Fallido';
    }
  };

  const formatDuration = (start: string, end?: string) => {
    const startTime = new Date(start).getTime();
    const endTime = end ? new Date(end).getTime() : Date.now();
    const duration = endTime - startTime;
    
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  const activeJobs = jobs.filter(job => job.status === 'running' || job.status === 'queued');
  const recentJobs = jobs.filter(job => job.status === 'completed' || job.status === 'failed').slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Jobs activos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              <CardTitle>Jobs Activos</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={fetchJobs}
              disabled={loading}
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {activeJobs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No hay jobs activos en este momento</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeJobs.map((job) => (
                <div key={job.id} className="space-y-2 p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(job.status)} className="gap-1">
                        {getStatusIcon(job.status)}
                        {getStatusText(job.status)}
                      </Badge>
                      <span className="font-medium">{job.targetName}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatDuration(job.startedAt)}
                    </span>
                  </div>
                  
                  {job.status === 'running' && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {job.productsFound} productos encontrados
                        </span>
                        <span className="text-muted-foreground">
                          {job.progress || 0}%
                        </span>
                      </div>
                      <Progress value={job.progress || 0} className="h-2" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Historial reciente */}
      <Card>
        <CardHeader>
          <CardTitle>Historial Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          {recentJobs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No hay ejecuciones recientes</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant={getStatusColor(job.status)} className="gap-1">
                      {getStatusIcon(job.status)}
                      {getStatusText(job.status)}
                    </Badge>
                    <div>
                      <p className="font-medium">{job.targetName}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(job.startedAt).toLocaleString('es-AR')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium flex items-center gap-1">
                      <Package className="h-3 w-3" />
                      {job.productsFound} productos
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {job.completedAt && formatDuration(job.startedAt, job.completedAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}