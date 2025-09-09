'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shared-ui';
import { StatsOverview, StatsMetric } from '@/components/shared-ui/organisms/stats-overview';
import { SourcesTable, ScrapingSource, ScrapingJob } from '@/components/scraper/organisms/sources-table';
import { SourcesFilters } from '@/components/scraper/organisms/sources-filters';
import {
  Activity,
  CheckCircle,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export default function SourcesAdminPage() {
  // Estado principal
  const [sources, setSources] = useState<ScrapingSource[]>([]);
  const [jobs, setJobs] = useState<ScrapingJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Auto-refresh
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Cargar fuentes
  const loadSources = useCallback(async () => {
    try {
      if (!loading) setRefreshing(true);
      
      const authToken = localStorage.getItem('iam_access_token');
      const tenantId = localStorage.getItem('tenant_id');
      
      if (!authToken || !tenantId) {
        toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        return;
      }

      // Cargar fuentes desde targets (hardcoded) - API que sabemos que funciona
      const targetsResponse = await fetch('/api/scraper/targets', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'X-Tenant-ID': tenantId,
        }
      });

      if (!targetsResponse.ok) {
        throw new Error(`Error ${targetsResponse.status}: ${targetsResponse.statusText}`);
      }

      const targetsData = await targetsResponse.json();
      
      // Mapear targets a formato de fuentes
      const mappedSources: ScrapingSource[] = targetsData.map((target: any) => ({
        _id: target.id,
        source_id: target.id,
        name: target.name,
        display_name: target.display_name,
        category: target.category || 'general',
        engine: target.engine || 'scrapy',
        status: target.is_active ? 'active' : 'inactive',
        is_active: target.is_active ?? true,
        health_score: target.health_score || 1.0,
        last_run: target.last_run,
        products_count: target.products_count || 0,
        success_rate: target.success_rate || 1.0,
        total_products: target.products_count || 0,
        failed_scrapes: 0,
        successful_scrapes: 1,
        created_at: target.created_at || new Date().toISOString(),
        updated_at: target.updated_at || new Date().toISOString(),
      }));

      setSources(mappedSources);
      setLastUpdated(new Date());

    } catch (error) {
      console.error('Error loading sources:', error);
      toast.error('Error al cargar fuentes de scraping');
      setSources([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [loading]);

  // Cargar jobs activos
  const loadJobs = useCallback(async () => {
    try {
      const authToken = localStorage.getItem('iam_access_token');
      const tenantId = localStorage.getItem('tenant_id');
      
      if (!authToken || !tenantId) return;

      const response = await fetch('/api/scraper/jobs', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'X-Tenant-ID': tenantId,
        }
      });

      if (response.ok) {
        const jobsData = await response.json();
        setJobs(Array.isArray(jobsData) ? jobsData : []);
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
      // No mostrar error para jobs, es información adicional
    }
  }, []);

  // Auto-refresh effect
  useEffect(() => {
    loadSources();
    loadJobs();

    if (!autoRefresh) return;

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadSources();
        loadJobs();
      }
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [autoRefresh, loadSources, loadJobs]);

  // Filtros aplicados
  const filteredSources = useMemo(() => {
    return sources.filter(source => {
      const matchesSearch = source.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           source.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           source.source_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           source.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || source.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || source.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [sources, searchTerm, statusFilter, categoryFilter]);

  // Métricas para overview
  const overviewMetrics: StatsMetric[] = useMemo(() => {
    const activeSources = sources.filter(s => s.is_active).length;
    const totalProducts = sources.reduce((sum, s) => sum + (s.total_products || 0), 0);
    const avgSuccessRate = sources.length > 0 
      ? sources.reduce((sum, s) => sum + (s.success_rate || 0), 0) / sources.length 
      : 0;
    const runningJobs = jobs.filter(j => j.status === 'processing').length;

    return [
      {
        title: 'Fuentes Activas',
        value: activeSources,
        change: `${sources.length} total`,
        trend: activeSources > sources.length * 0.8 ? 'up' : 'neutral',
        icon: <Activity className="h-4 w-4" />
      },
      {
        title: 'Productos Totales',
        value: totalProducts.toLocaleString(),
        change: 'Desde el inicio',
        trend: 'up',
        icon: <TrendingUp className="h-4 w-4" />
      },
      {
        title: 'Tasa de Éxito Promedio',
        value: `${Math.round(avgSuccessRate * 100)}%`,
        change: 'Promedio general',
        trend: avgSuccessRate > 0.8 ? 'up' : avgSuccessRate > 0.5 ? 'neutral' : 'down',
        icon: <CheckCircle className="h-4 w-4" />
      },
      {
        title: 'Jobs en Ejecución',
        value: runningJobs,
        change: `${jobs.length} total hoy`,
        trend: runningJobs > 0 ? 'up' : 'neutral',
        icon: <Zap className="h-4 w-4" />
      }
    ];
  }, [sources, jobs]);

  // Handlers
  const handleToggleSource = useCallback(async (sourceId: string, isActive: boolean) => {
    try {
      const authToken = localStorage.getItem('iam_access_token');
      const tenantId = localStorage.getItem('tenant_id');
      
      if (!authToken || !tenantId) {
        toast.error('Sesión expirada');
        return;
      }

      const response = await fetch(`/api/scraper/sources/${sourceId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
          'X-Tenant-ID': tenantId,
        },
        body: JSON.stringify({ is_active: !isActive })
      });

      if (response.ok) {
        toast.success(`Fuente ${!isActive ? 'activada' : 'desactivada'}`);
        await loadSources();
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.detail || 'Error al cambiar estado de la fuente');
      }
    } catch (error) {
      console.error('Error toggling source:', error);
      toast.error('Error al cambiar estado');
    }
  }, [loadSources]);

  const handleExecuteSource = useCallback(async (sourceId: string) => {
    try {
      const authToken = localStorage.getItem('iam_access_token');
      const tenantId = localStorage.getItem('tenant_id');
      
      if (!authToken || !tenantId) {
        toast.error('Sesión expirada');
        return;
      }

      const response = await fetch(`/api/scraper/sources/${sourceId}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
          'X-Tenant-ID': tenantId,
        }
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`Scraping iniciado para ${result.source?.name || sourceId}`);
        setTimeout(() => {
          loadJobs(); // Recargar jobs después de un momento
        }, 2000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.detail || 'Error al ejecutar scraping');
      }
    } catch (error) {
      console.error('Error executing source:', error);
      toast.error('Error al ejecutar scraping');
    }
  }, [loadJobs]);

  const handleRefresh = useCallback(() => {
    loadSources();
    loadJobs();
  }, [loadSources, loadJobs]);

  const handleViewDetails = useCallback((source: ScrapingSource) => {
    // TODO: Abrir modal/drawer con detalles de la fuente
    toast.info(`Detalles de ${source.display_name || source.name} - Próximamente`);
  }, []);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Administración de Fuentes</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona las {sources.length} fuentes de scraping disponibles
            {lastUpdated && (
              <span className="ml-2">
                • Actualizado {formatDistanceToNow(lastUpdated, { addSuffix: true, locale: es })}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Métricas */}
      <StatsOverview 
        title="Resumen de Fuentes"
        metrics={overviewMetrics}
      />

      {/* Panel principal */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Fuentes de Scraping</CardTitle>
          <CardDescription>
            Administra las fuentes activas, ejecuta scraping manual y monitorea el estado
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Filtros */}
          <SourcesFilters
            sources={sources}
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            categoryFilter={categoryFilter}
            onSearchChange={setSearchTerm}
            onStatusFilterChange={setStatusFilter}
            onCategoryFilterChange={setCategoryFilter}
            onRefresh={handleRefresh}
            autoRefresh={autoRefresh}
            onToggleAutoRefresh={() => setAutoRefresh(!autoRefresh)}
            refreshing={refreshing}
          />

          {/* Resumen de resultados */}
          <div className="text-sm text-muted-foreground">
            Mostrando {filteredSources.length} de {sources.length} fuentes
          </div>

          {/* Tabla */}
          <SourcesTable
            sources={filteredSources}
            jobs={jobs}
            loading={loading}
            onToggleSource={handleToggleSource}
            onExecuteSource={handleExecuteSource}
            onViewDetails={handleViewDetails}
          />
        </CardContent>
      </Card>
    </div>
  );
}