'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Progress } from '@/components/shared-ui';
import { Skeleton } from '@/components/ui/skeleton';
import {
  FileSearch,
  Database,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  Package,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/shared-ui';

interface CurationStage {
  name: string;
  icon: React.ReactNode;
  count: number;
  percentage: number;
  status: 'pending' | 'processing' | 'completed';
  description: string;
}

interface CurationStats {
  totalScraped: number;
  totalCurated: number;
  totalGlobal: number;
  inCurationQueue: number;
  readyToSync: number;
}

export function CurationStatus() {
  const [stats, setStats] = useState<CurationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/scraper/curation-stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar estadísticas');
      console.error('Error fetching curation stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Actualizar cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  if (loading && !stats) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Estado del Flujo de Curación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalScrapedProducts = stats?.totalScraped || 0;
  const totalCuratedProducts = stats?.totalCurated || 0;
  const totalGlobalProducts = stats?.totalGlobal || 0;
  
  const stages: CurationStage[] = [
    {
      name: 'Productos Scrapeados',
      icon: <FileSearch className="h-5 w-5" />,
      count: totalScrapedProducts,
      percentage: 100,
      status: 'completed',
      description: 'En MongoDB (scraper_products)'
    },
    {
      name: 'En Proceso de Curación',
      icon: <Sparkles className="h-5 w-5" />,
      count: totalScrapedProducts - totalCuratedProducts,
      percentage: ((totalScrapedProducts - totalCuratedProducts) / totalScrapedProducts) * 100,
      status: 'processing',
      description: 'Pendientes de AI Gateway'
    },
    {
      name: 'Productos Curados',
      icon: <CheckCircle2 className="h-5 w-5" />,
      count: totalCuratedProducts,
      percentage: (totalCuratedProducts / totalScrapedProducts) * 100,
      status: 'completed',
      description: 'En MongoDB (curated_products)'
    },
    {
      name: 'Catálogo Global',
      icon: <Database className="h-5 w-5" />,
      count: totalGlobalProducts,
      percentage: (totalGlobalProducts / totalCuratedProducts) * 100,
      status: 'pending',
      description: 'En PostgreSQL (global_products)'
    }
  ];

  const getStatusColor = (status: CurationStage['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-500';
      case 'processing':
        return 'text-yellow-500';
      case 'pending':
        return 'text-gray-400';
    }
  };


  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Estado del Flujo de Curación
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchStats}
            disabled={loading}
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Flujo visual */}
          <div className="flex items-center justify-between gap-4">
            {stages.map((stage, index) => (
              <React.Fragment key={stage.name}>
                <div className="flex-1">
                  <div className={cn(
                    "flex items-center gap-2 mb-2",
                    getStatusColor(stage.status)
                  )}>
                    {stage.icon}
                    <span className="font-medium text-sm">{stage.name}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-bold">{stage.count.toLocaleString('es-AR')}</span>
                      <Badge variant={stage.status === 'completed' ? 'success' : 
                               stage.status === 'processing' ? 'warning' : 'secondary'}>
                        {stage.percentage.toFixed(0)}%
                      </Badge>
                    </div>
                    <Progress 
                      value={stage.percentage} 
                      className="h-2"
                    />
                    <p className="text-xs text-muted-foreground">
                      {stage.description}
                    </p>
                  </div>
                </div>
                {index < stages.length - 1 && (
                  <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Alertas y acciones */}
          <div className="space-y-3 pt-4 border-t">
            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900 dark:text-red-100">
                    {error}
                  </p>
                </div>
              </div>
            )}
            
            {stats && stats.inCurationQueue > 20 && (
              <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                    {stats.inCurationQueue} productos pendientes de curación
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                    El proceso de AI Gateway está procesando los productos nuevos
                  </p>
                </div>
              </div>
            )}

            {stats && stats.readyToSync > 10 && (
              <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Clock className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    {stats.readyToSync} productos listos para sincronizar
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    Estos productos ya están curados y pueden agregarse al catálogo global
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}