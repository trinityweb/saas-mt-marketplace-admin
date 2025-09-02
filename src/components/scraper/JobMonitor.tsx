'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared-ui';
import { Button } from '@/components/shared-ui';
import { Badge } from '@/components/shared-ui';
import { Progress } from '@/components/shared-ui';
import { 
  Play, 
  Pause, 
  X, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Package
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { scraperAPI, ScraperJob, ScraperTarget } from '@/lib/api/scraper/scraper-api';
import { useToast } from '@/hooks/use-toast';

interface JobMonitorProps {
  targets: ScraperTarget[];
  onJobComplete?: (job: ScraperJob) => void;
}

export function JobMonitor({ targets, onJobComplete }: JobMonitorProps) {
  const [jobs, setJobs] = useState<ScraperJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 3000); // Update every 3 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchJobs = async () => {
    try {
      const activeJobs = await scraperAPI.getActiveJobs();
      setJobs(activeJobs);
      
      // Check for completed jobs
      activeJobs.forEach(job => {
        if (job.status === 'completed' && onJobComplete) {
          onJobComplete(job);
        }
      });
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const startJob = async () => {
    if (!selectedTarget) {
      toast({
        title: 'Error',
        description: 'Por favor selecciona una fuente',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await scraperAPI.startScraping({
        target_name: selectedTarget,
      });

      toast({
        title: 'Job iniciado',
        description: `Scraping iniciado para ${selectedTarget}`,
      });

      setSelectedTarget('');
      await fetchJobs();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo iniciar el job',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const cancelJob = async (jobId: string) => {
    try {
      await scraperAPI.cancelJob(jobId);
      toast({
        title: 'Job cancelado',
        description: 'El job ha sido cancelado exitosamente',
      });
      await fetchJobs();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo cancelar el job',
        variant: 'destructive',
      });
    }
  };

  const getJobIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'default';
      case 'completed':
        return 'success';
      case 'failed':
        return 'destructive';
      case 'pending':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Monitor de Jobs</CardTitle>
          <div className="flex items-center gap-2">
            <select
              value={selectedTarget}
              onChange={(e) => setSelectedTarget(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
              disabled={loading}
            >
              <option value="">Seleccionar fuente...</option>
              {targets.map((target) => (
                <option key={target.name} value={target.name}>
                  {target.display_name}
                </option>
              ))}
            </select>
            <Button
              size="sm"
              onClick={startJob}
              disabled={loading || !selectedTarget}
            >
              <Play className="h-4 w-4 mr-2" />
              Iniciar Scraping
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {jobs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No hay jobs activos en este momento
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.job_id}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getJobIcon(job.status)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{job.target_name}</span>
                        <Badge variant={getStatusColor(job.status)}>
                          {job.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Job ID: {job.job_id.substring(0, 8)}...
                      </p>
                    </div>
                  </div>
                  {job.status === 'running' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => cancelJob(job.job_id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progreso</span>
                    <span>{job.progress}%</span>
                  </div>
                  <Progress value={job.progress} className="h-2" />
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Productos</p>
                    <p className="font-medium">{job.products_found}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Duplicados</p>
                    <p className="font-medium">{job.duplicates_detected}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Duración</p>
                    <p className="font-medium">
                      {formatDistanceToNow(new Date(job.started_at), {
                        locale: es,
                      })}
                    </p>
                  </div>
                </div>

                {job.errors && job.errors.length > 0 && (
                  <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                    {job.errors[0]}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}