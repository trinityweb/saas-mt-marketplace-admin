'use client';

import { useState, useEffect, useCallback } from 'react';
import { scraperAPI, ScraperDashboardMetrics, ScraperJob } from '@/lib/api/scraper/scraper-api';
import { useToast } from '@/hooks/use-toast';

export function useScraperDashboard() {
  const [metrics, setMetrics] = useState<ScraperDashboardMetrics | null>(null);
  const [activeJobs, setActiveJobs] = useState<ScraperJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<number>(5000); // 5 seconds
  const { toast } = useToast();

  const fetchDashboardData = useCallback(async () => {
    try {
      // Use our new API route that connects to real MongoDB data
      const response = await fetch('/api/scraper/mongodb-stats');
      if (!response.ok) {
        throw new Error('Failed to fetch scraper stats');
      }
      
      const metricsData = await response.json();
      setMetrics(metricsData);
      setActiveJobs([]); // TODO: Implement active jobs from scraper service
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch dashboard data';
      setError(errorMessage);
      // Only show toast if we already had data (not on initial load)
      if (metrics !== null) {
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  }, [toast, metrics]);

  useEffect(() => {
    fetchDashboardData();

    const interval = setInterval(() => {
      fetchDashboardData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [fetchDashboardData, refreshInterval]);

  const startScraping = useCallback(async (targetName: string, options?: {
    urls?: string[];
    force?: boolean;
  }) => {
    try {
      const response = await scraperAPI.startScraping({
        target_name: targetName,
        ...options,
      });

      toast({
        title: 'Scraping iniciado',
        description: `Job ${response.job_id} iniciado para ${targetName}`,
      });

      // Refresh data immediately
      await fetchDashboardData();

      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start scraping';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  }, [fetchDashboardData, toast]);

  const cancelJob = useCallback(async (jobId: string) => {
    try {
      await scraperAPI.cancelJob(jobId);
      
      toast({
        title: 'Job cancelado',
        description: `Job ${jobId} ha sido cancelado`,
      });

      // Refresh data immediately
      await fetchDashboardData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel job';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  }, [fetchDashboardData, toast]);

  return {
    metrics,
    activeJobs,
    loading,
    error,
    refreshInterval,
    setRefreshInterval,
    refresh: fetchDashboardData,
    startScraping,
    cancelJob,
  };
}