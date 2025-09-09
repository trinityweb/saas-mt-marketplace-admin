'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shared-ui';
import { SmartRefreshTabs, SmartTabConfig } from '@/components/curation/organisms/smart-refresh-tabs';
import { CurationTable } from '@/components/curation/organisms/curation-table';
import { CurationFilters } from '@/components/curation/organisms/curation-filters';
import { CurationStats } from '@/components/curation/organisms/curation-stats';
import { BulkActionBar } from '@/components/curation/molecules/bulk-action-bar';
import { TabsContent } from '@/components/ui/tabs';
import {
  Clock,
  RefreshCw,
  Sparkles,
  Package,
  XCircle,
  Send,
} from 'lucide-react';
import { toast } from 'sonner';

// Interfaces
interface ScrapedProduct {
  _id: string;
  name: string;
  price: number;
  currency: string;
  image_url?: string;
  source_url: string;
  source_name: string;
  category?: string;
  brand?: string;
  description?: string;
  curation_status: string;
  ai_processing_status?: string;
  created_at: string;
  updated_at: string;
}

interface ProductCounts {
  total: number;
  pending: number;
  processing: number;
  curated: number;
  rejected: number;
  sent_to_pim: number;
}

interface CurationMetrics {
  totalAttempts: number;
  aiSuccesses: number;
  aiFaillures: number;
  simpleFallbacks: number;
  lastAIFailure?: string;
}

export default function OptimizedCurationPage() {
  // Estado principal
  const [products, setProducts] = useState<ScrapedProduct[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const pageSize = 20;
  
  // Tabs y filtros
  const [activeTab, setActiveTab] = useState('pending');
  const [globalFilters, setGlobalFilters] = useState({
    search: '',
    source: '',
    category: '',
    brand: '',
    dateFrom: '',
    dateTo: '',
  });

  // Conteos y métricas
  const [productCounts, setProductCounts] = useState<ProductCounts>({
    total: 0,
    pending: 0,
    processing: 0,
    curated: 0,
    rejected: 0,
    sent_to_pim: 0,
  });
  
  const [metrics, setMetrics] = useState<CurationMetrics>({
    totalAttempts: 0,
    aiSuccesses: 0,
    aiFaillures: 0,
    simpleFallbacks: 0,
  });

  // Estado para auto-refresh inteligente
  const [hasActiveJobs, setHasActiveJobs] = useState(false);
  const [lastDataChange, setLastDataChange] = useState<Date | null>(null);

  // ⚡ VERIFICAR JOBS ACTIVOS PARA REFRESH INTELIGENTE
  const checkActiveJobs = useCallback(async () => {
    try {
      const authToken = localStorage.getItem('iam_access_token');
      const tenantId = localStorage.getItem('tenant_id');
      
      if (!authToken || !tenantId) return;

      const response = await fetch('/api/scraper/jobs?status=processing', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'X-Tenant-ID': tenantId,
        }
      });

      if (response.ok) {
        const jobs = await response.json();
        const activeJobs = Array.isArray(jobs) ? jobs.filter(job => job.status === 'processing') : [];
        setHasActiveJobs(activeJobs.length > 0);
      }
    } catch (error) {
      console.error('Error checking active jobs:', error);
    }
  }, []);

  // 📊 CARGAR CONTEOS Y MÉTRICAS
  const loadCountsAndMetrics = useCallback(async () => {
    try {
      const authToken = localStorage.getItem('iam_access_token');
      const tenantId = localStorage.getItem('tenant_id');
      
      if (!authToken || !tenantId) return;

      const response = await fetch('/api/scraper/products/count', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'X-Tenant-ID': tenantId,
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.counts) {
          setProductCounts(data.counts);
        }
        if (data.metrics) {
          setMetrics(data.metrics);
        }
      }
    } catch (error) {
      console.error('Error loading counts and metrics:', error);
    }
  }, []);

  // 🔄 CARGAR PRODUCTOS
  const loadProducts = useCallback(async (resetPage = false) => {
    try {
      if (!refreshing) setLoading(true);
      
      const authToken = localStorage.getItem('iam_access_token');
      const tenantId = localStorage.getItem('tenant_id');
      
      if (!authToken || !tenantId) {
        toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        return;
      }

      const currentPage = resetPage ? 1 : page;
      if (resetPage) setPage(1);

      // Construir parámetros de filtro
      const params = new URLSearchParams({
        page: currentPage.toString(),
        page_size: pageSize.toString(),
      });

      // Filtro por tab activo
      if (activeTab !== 'all') {
        const statusMap: Record<string, string> = {
          'pending': 'pending_curation',
          'processing': 'processing',
          'curated': 'curated',
          'rejected': 'rejected',
          'sent_to_pim': 'sent_to_pim'
        };
        params.set('curation_status', statusMap[activeTab] || activeTab);
      }

      // Filtros adicionales
      Object.entries(globalFilters).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });

      const response = await fetch(`/api/scraper/products?${params}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'X-Tenant-ID': tenantId,
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(Array.isArray(data.items) ? data.items : []);
        setTotalProducts(data.total_count || 0);
        setLastDataChange(new Date());
      } else {
        toast.error('Error al cargar productos');
        setProducts([]);
        setTotalProducts(0);
      }

    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Error al cargar productos');
      setProducts([]);
      setTotalProducts(0);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab, page, globalFilters, pageSize, refreshing]);

  // 🎯 REFRESH INTELIGENTE PRINCIPAL
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      loadCountsAndMetrics(),
      loadProducts(true),
      checkActiveJobs()
    ]);
  }, [loadCountsAndMetrics, loadProducts, checkActiveJobs]);

  // 📑 CONFIGURACIÓN DE TABS
  const tabsConfig: SmartTabConfig[] = useMemo(() => [
    { id: 'pending', label: 'Pendientes', icon: Clock, count: productCounts.pending, variant: 'warning' },
    { id: 'processing', label: 'Procesando', icon: RefreshCw, count: productCounts.processing, variant: 'info' },
    { id: 'curated', label: 'Curados', icon: Sparkles, count: productCounts.curated, variant: 'success' },
    { id: 'all', label: 'Todos', icon: Package, count: productCounts.total, variant: 'default' },
    { id: 'rejected', label: 'Rechazados', icon: XCircle, count: productCounts.rejected, variant: 'error' },
    { id: 'sent_to_pim', label: 'Enviados a PIM', icon: Send, count: productCounts.sent_to_pim, variant: 'success' },
  ], [productCounts]);

  // EFFECTS
  useEffect(() => {
    // Carga inicial completa
    handleRefresh();
  }, []);

  useEffect(() => {
    // Recargar productos cuando cambie el tab o filtros
    loadProducts(true);
  }, [activeTab, globalFilters]);

  useEffect(() => {
    // Check periódico de jobs activos (cada minuto)
    const interval = setInterval(checkActiveJobs, 60000);
    return () => clearInterval(interval);
  }, [checkActiveJobs]);

  // HANDLERS
  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId);
    setSelectedProducts(new Set());
  }, []);

  const handleFiltersChange = useCallback((filters: typeof globalFilters) => {
    setGlobalFilters(filters);
    setSelectedProducts(new Set());
  }, []);

  const handleSelectProduct = useCallback((productId: string, selected: boolean) => {
    setSelectedProducts(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(productId);
      } else {
        newSet.delete(productId);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback((selected: boolean) => {
    if (selected) {
      setSelectedProducts(new Set(products.map(p => p._id)));
    } else {
      setSelectedProducts(new Set());
    }
  }, [products]);

  const handleCurateProduct = useCallback(async (productId: string) => {
    // Implementation for single product curation
    toast.info('Curación individual - en desarrollo');
  }, []);

  const handleBulkAction = useCallback(async (action: string, productIds: string[]) => {
    // Implementation for bulk actions
    toast.info(`Acción masiva: ${action} - en desarrollo`);
  }, []);

  const totalPages = Math.ceil(totalProducts / pageSize);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Panel de Curación Optimizado</h2>
          <p className="text-muted-foreground">
            Sistema inteligente con auto-refresh condicional y tabs semánticos
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <CurationStats 
        counts={productCounts}
        metrics={metrics}
        hasActiveJobs={hasActiveJobs}
        className="mb-6"
      />

      {/* Panel principal con tabs inteligentes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Curación Inteligente de Productos</CardTitle>
          <CardDescription>
            Tabs con auto-refresh inteligente que solo se actualiza cuando hay actividad real
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <SmartRefreshTabs
            tabs={tabsConfig}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onRefresh={handleRefresh}
            loading={loading}
            enableSmartRefresh={true}
            hasActiveJobs={hasActiveJobs}
            lastDataChange={lastDataChange}
          >
            {/* Filtros */}
            <div className="mb-4">
              <CurationFilters
                filters={globalFilters}
                onFiltersChange={handleFiltersChange}
                onRefresh={handleRefresh}
                loading={loading}
                showStatusFilter={activeTab === 'all'}
              />
            </div>

            {/* Content para cada tab */}
            {tabsConfig.map((tab) => (
              <TabsContent key={tab.id} value={tab.id}>
                {selectedProducts.size > 0 && (
                  <BulkActionBar
                    selectedCount={selectedProducts.size}
                    onBulkAction={(action) => handleBulkAction(action, Array.from(selectedProducts))}
                    onClearSelection={() => setSelectedProducts(new Set())}
                    className="mb-4"
                  />
                )}
                
                <CurationTable
                  products={products}
                  selectedProducts={selectedProducts}
                  onSelectProduct={handleSelectProduct}
                  onSelectAll={handleSelectAll}
                  onCurateProduct={handleCurateProduct}
                  loading={loading}
                />
              </TabsContent>
            ))}
          </SmartRefreshTabs>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Mostrando {((page - 1) * pageSize) + 1} a {Math.min(page * pageSize, totalProducts)} de {totalProducts} productos
              </p>
              
              <div className="flex gap-2">
                {/* Pagination controls - simplified for now */}
                <span className="text-sm text-muted-foreground">
                  Página {page} de {totalPages}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}