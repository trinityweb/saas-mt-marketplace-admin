import { useState, useEffect, useCallback } from 'react';
import { marketplaceApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export interface ScraperJob {
  id: string;
  name: string;
  source: string;
  status: 'idle' | 'running' | 'completed' | 'failed' | 'scheduled' | 'disabled';
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

export function useScraperJobs() {
  const { toast } = useToast();
  const [jobs, setJobs] = useState<ScraperJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data para desarrollo - después se reemplazará con API real
  const mockJobs: ScraperJob[] = [
    {
      id: '1',
      name: 'Almacén Natural',
      source: 'almacennatural.com',
      status: 'running',
      progress: 65,
      lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      productsFound: 1234,
      duplicatesFound: 45,
      successRate: 0.98,
      duration: '12m 34s'
    },
    {
      id: '2',
      name: 'Blaisten',
      source: 'blaisten.com.ar',
      status: 'completed',
      lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      nextRun: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
      productsFound: 2567,
      duplicatesFound: 123,
      successRate: 0.95,
    },
    {
      id: '3',
      name: 'Carrefour',
      source: 'carrefour.com.ar',
      status: 'failed',
      lastRun: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      productsFound: 0,
      successRate: 0,
      error: 'Error de conexión: timeout después de 30s'
    },
    {
      id: '4',
      name: 'Ceba Store',
      source: 'cebastore.com',
      status: 'scheduled',
      nextRun: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      lastRun: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      productsFound: 890,
      successRate: 0.92,
    },
    {
      id: '5',
      name: 'Cetrogar',
      source: 'cetrogar.com.ar',
      status: 'idle',
      lastRun: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
      productsFound: 3456,
      duplicatesFound: 234,
      successRate: 0.89,
    },
    {
      id: '6',
      name: 'CompraGamer',
      source: 'compragamer.com',
      status: 'idle',
      productsFound: 0,
    }
  ];

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch real targets from MongoDB
      const response = await fetch('/api/scraper/targets');
      if (!response.ok) {
        throw new Error('Failed to fetch scraper targets');
      }
      
      const data = await response.json();
      
      // Transform targets to jobs format
      const transformedJobs: ScraperJob[] = data.targets.map((target: any) => ({
        id: target.id,
        name: target.name,
        source: target.source,
        status: target.enabled ? 'idle' : 'disabled',
        productsFound: target.productsFound,
        lastRun: target.lastRun,
        successRate: target.successRate,
        duration: '0s'
      }));
      
      setJobs(transformedJobs);
      setError(null);
    } catch (err) {
      setError('Error al cargar los scrapers');
      console.error('Error fetching scraper jobs:', err);
      
      // Fall back to mock data
      setJobs(mockJobs);
    } finally {
      setLoading(false);
    }
  }, []);

  const startJob = useCallback(async (jobId: string) => {
    try {
      // TODO: Llamada real a la API
      // await marketplaceApi.startScraperJob(jobId);
      
      toast({
        title: 'Scraper iniciado',
        description: 'El proceso de scraping ha comenzado',
      });
      
      // Actualizar estado local
      setJobs(prev => prev.map(job => 
        job.id === jobId 
          ? { ...job, status: 'running' as const, progress: 0 }
          : job
      ));
      
      // Simular progreso
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
          clearInterval(interval);
          setJobs(prev => prev.map(job => 
            job.id === jobId 
              ? { 
                  ...job, 
                  status: 'completed' as const, 
                  progress: 100,
                  lastRun: new Date().toISOString(),
                  productsFound: Math.floor(Math.random() * 2000) + 500,
                  duplicatesFound: Math.floor(Math.random() * 100),
                  successRate: 0.9 + Math.random() * 0.1
                }
              : job
          ));
          toast({
            title: 'Scraper completado',
            description: 'El proceso ha finalizado exitosamente',
          });
        } else {
          setJobs(prev => prev.map(job => 
            job.id === jobId 
              ? { ...job, progress: Math.min(progress, 100) }
              : job
          ));
        }
      }, 1000);
      
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo iniciar el scraper',
      });
      console.error('Error starting job:', err);
    }
  }, [toast]);

  const stopJob = useCallback(async (jobId: string) => {
    try {
      // TODO: Llamada real a la API
      // await marketplaceApi.stopScraperJob(jobId);
      
      toast({
        title: 'Scraper detenido',
        description: 'El proceso se ha detenido correctamente',
      });
      
      setJobs(prev => prev.map(job => 
        job.id === jobId 
          ? { ...job, status: 'idle' as const, progress: undefined }
          : job
      ));
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo detener el scraper',
      });
      console.error('Error stopping job:', err);
    }
  }, [toast]);

  const refreshJob = useCallback(async (jobId: string) => {
    try {
      // TODO: Llamada real a la API para obtener estado actualizado
      // const jobStatus = await marketplaceApi.getScraperJobStatus(jobId);
      
      toast({
        title: 'Estado actualizado',
        description: 'La información se ha actualizado correctamente',
      });
      
      // Por ahora solo refrescamos todos
      await fetchJobs();
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo actualizar el estado',
      });
      console.error('Error refreshing job:', err);
    }
  }, [fetchJobs, toast]);

  const viewJobLogs = useCallback(async (jobId: string) => {
    try {
      // TODO: Implementar vista de logs
      toast({
        title: 'Próximamente',
        description: 'La vista de logs estará disponible pronto',
      });
    } catch (err) {
      console.error('Error viewing logs:', err);
    }
  }, [toast]);

  useEffect(() => {
    fetchJobs();
    
    // Auto-refresh cada 10 segundos si hay jobs activos
    const interval = setInterval(() => {
      if (jobs.some(job => job.status === 'running')) {
        fetchJobs();
      }
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    jobs,
    loading,
    error,
    startJob,
    stopJob,
    refreshJob,
    viewJobLogs,
    refresh: fetchJobs,
  };
}