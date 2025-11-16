'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shared-ui';
import { CollapsibleStatsPanel } from '@/components/curation/organisms/collapsible-stats-panel';
import { OptimizedCurationTabs, OptimizedTabConfig } from '@/components/curation/organisms/optimized-curation-tabs';
import {
  Clock,
  RefreshCw,
  Sparkles,
  Package,
  XCircle,
  Send,
} from 'lucide-react';
import { toast } from 'sonner';
import { ScrapedProduct } from '@/types/curation';

// Interfaces

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

// Función para configurar autenticación de desarrollo (ADMIN - sin tenant-id)
const setupDevelopmentAuth = async () => {
  console.log('[CurationPage] Setting up ADMIN development authentication...');
  
  // Crear un JWT válido para ADMIN (sin tenant-id)
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    user_id: 'marketplace-admin-001',
    role_id: 'marketplace_admin',
    role: 'marketplace_admin',
    email: 'admin@marketplace.com',
    scope: 'global_admin', // Admin global, no tenant específico
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // Expira en 24 horas
    iat: Math.floor(Date.now() / 1000),
    iss: 'marketplace-admin-service'
  };
  
  // Codificar el JWT (formato básico pero válido para desarrollo)
  const base64Header = btoa(JSON.stringify(header));
  const base64Payload = btoa(JSON.stringify(payload));
  const mockAccessToken = `${base64Header}.${base64Payload}.admin-dev-signature`;
  
  const mockRefreshToken = 'admin-mock-refresh-token';

  // Guardar en localStorage (ADMIN no necesita tenant_id)
  localStorage.setItem('iam_access_token', mockAccessToken);
  localStorage.setItem('iam_refresh_token', mockRefreshToken);
  // NO guardar tenant_id para admin
  localStorage.removeItem('tenant_id');
  localStorage.removeItem('current_tenant_id');
  
  console.log('[CurationPage] ADMIN development auth configured successfully');
};

export default function OptimizedCurationPage() {
  // Estado principal
  const [products, setProducts] = useState<ScrapedProduct[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const pageSize = 20;
  
  // Tabs y filtros
  const [activeTab, setActiveTab] = useState('all');
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

  // Stats para el componente CurationStats
  const [curationStats, setCurationStats] = useState({
    total_products: 0,
    pending: 0,
    processing: 0,
    curated: 0,
    rejected: 0,
    published: 0,
    avg_confidence: 0,
    today_curated: 0,
    week_curated: 0,
    month_curated: 0,
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
      
      // ADMIN solo requiere token, NO tenant-id
      if (!authToken) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[CurationPage] Development mode: setting up admin auto-auth for stats');
          await setupDevelopmentAuth();
          // Reintentar después de configurar auth
          setTimeout(() => loadCountsAndMetrics(), 500);
          return;
        } else {
          console.log('[CurationPage] No admin auth token, skipping stats load');
          return;
        }
      }

      // Usar el endpoint de stats que retorna la estructura correcta
      console.log('[CurationPage] Loading stats...');
      // ADMIN headers - sin X-Tenant-ID
      const response = await fetch('/api/scraper/products/stats', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
          // NO incluir X-Tenant-ID para admin
        }
      });

      console.log('[CurationPage] Stats response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('[CurationPage] Stats data:', data);
        
        // Actualizar productCounts con la estructura esperada
        const counts = {
          total: data.total || 0,
          pending: data.pending || 0,
          processing: data.processing || 0,
          curated: data.curated || 0,
          rejected: data.rejected || 0,
          sent_to_pim: data.published || 0,
        };
        setProductCounts(counts);
        
        // Actualizar curationStats para el componente CurationStats
        setCurationStats({
          total_products: data.total || 0,
          pending: data.pending || 0,
          processing: data.processing || 0,
          curated: data.curated || 0,
          rejected: data.rejected || 0,
          published: data.published || 0,
          avg_confidence: 75, // Valor por defecto
          today_curated: 0, // Se puede calcular o obtener de metrics
          week_curated: 0, // Se puede calcular o obtener de metrics
          month_curated: 0, // Se puede calcular o obtener de metrics
        });
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
      
      console.log('[CurationPage] Auth check:', { 
        hasToken: !!authToken, 
        hasTenant: !!tenantId,
        tokenPrefix: authToken?.substring(0, 20) + '...'
      });
      
      // ADMIN solo requiere token, NO tenant-id
      if (!authToken) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[CurationPage] Development mode: setting up admin auto-auth');
          // Configurar autenticación automática para desarrollo
          await setupDevelopmentAuth();
          // Reintentar después de configurar auth
          setTimeout(() => loadProducts(resetPage), 500);
          return;
        } else {
          console.error('[CurationPage] Missing admin auth token');
          toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.');
          return;
        }
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
          'pending': 'pending',
          'processing': 'processing',
          'curated': 'curated', // Los productos curados tienen estado 'curated'
          'rejected': 'rejected',
          'sent_to_pim': 'published' // Los productos enviados a PIM tienen estado 'published'
        };
        params.set('curation_status', statusMap[activeTab] || activeTab);
      }

      // Filtros adicionales
      Object.entries(globalFilters).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });

      const apiUrl = `/api/scraper/products?${params}`;
      console.log('[CurationPage] API call:', { 
        url: apiUrl, 
        activeTab,
        params: Object.fromEntries(params.entries())
      });
      
      // ADMIN headers - sin X-Tenant-ID
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
          // NO incluir X-Tenant-ID para admin
        }
      });
      
      console.log('[CurationPage] API response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('[CurationPage] API Response:', data);
        
        // El endpoint retorna data.products, no data.items
        const productsArray = data.products || data.items || [];
        
        // Mapear _id a id para compatibilidad con la interfaz ScrapedProduct
        const mappedProducts = Array.isArray(productsArray) 
          ? productsArray.map((product: any) => ({
              ...product,
              id: product._id || product.id,
              images: product.images || (product.image_url ? [product.image_url] : [])
            }))
          : [];
        
        console.log('[CurationPage] Mapped products:', mappedProducts);
        setProducts(mappedProducts);
        setTotalProducts(data.total_count || data.total || 0);
        setLastDataChange(new Date());
      } else {
        const errorText = await response.text();
        console.error('[CurationPage] Error response:', response.status, errorText);
        toast.error(`Error al cargar productos: ${response.status}`);
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

  // 📑 CONFIGURACIÓN DE TABS OPTIMIZADA
  const tabsConfig: OptimizedTabConfig[] = useMemo(() => [
    { 
      id: 'pending', 
      label: 'Pendientes', 
      icon: Clock, 
      count: productCounts.pending, 
      variant: 'warning',
      description: 'Productos esperando curación manual o automática'
    },
    { 
      id: 'processing', 
      label: 'Procesando', 
      icon: RefreshCw, 
      count: productCounts.processing, 
      variant: 'info',
      description: 'Productos en proceso de curación por IA'
    },
    { 
      id: 'curated', 
      label: 'Curados', 
      icon: Sparkles, 
      count: productCounts.curated, 
      variant: 'success',
      description: 'Productos curados listos para revisión'
    },
    { 
      id: 'all', 
      label: 'Todos', 
      icon: Package, 
      count: productCounts.total, 
      variant: 'default',
      description: 'Vista completa de todos los productos scrapeados'
    },
    { 
      id: 'rejected', 
      label: 'Rechazados', 
      icon: XCircle, 
      count: productCounts.rejected, 
      variant: 'error',
      description: 'Productos rechazados que requieren atención'
    },
    { 
      id: 'sent_to_pim', 
      label: 'En PIM', 
      icon: Send, 
      count: productCounts.sent_to_pim, 
      variant: 'success',
      description: 'Productos enviados al catálogo global'
    },
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
    setSelectedIds([]);
  }, []);

  const handleFiltersChange = useCallback((filters: typeof globalFilters) => {
    setGlobalFilters(filters);
    setSelectedIds([]);
  }, []);

  const handleSelectionChange = useCallback((ids: string[]) => {
    setSelectedIds(ids);
  }, []);

  const handleBulkAction = useCallback(async (action: string, productIds: string[], data?: any) => {
    console.log(`[BulkAction] ${action} for ${productIds.length} products`, { action, productIds, data });
    
    if (productIds.length === 0) {
      toast.error('No hay productos seleccionados');
      return;
    }
    
    try {
      const authToken = localStorage.getItem('iam_access_token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      
      let response: Response;
      let endpoint: string;
      let requestBody: any = { product_ids: productIds };
      
      switch (action) {
        case 'approve':
          endpoint = '/api/scraper/products/bulk-approve';
          requestBody.notes = 'Approved via bulk action';
          toast.info(`Aprobando ${productIds.length} productos...`);
          break;
          
        case 'reject':
          endpoint = '/api/scraper/products/bulk-reject';
          requestBody.notes = 'Rejected via bulk action';
          toast.info(`Rechazando ${productIds.length} productos...`);
          break;
          
        case 'send_to_ai':
          endpoint = '/api/scraper/products/curate';
          requestBody = { product_ids: productIds };
          toast.info(`Iniciando curación de ${productIds.length} productos...`);
          break;
          
        case 'delete':
          endpoint = '/api/scraper/products/bulk-delete';
          requestBody.confirm = true;
          toast.info(`Eliminando ${productIds.length} productos...`);
          break;
          
        case 'change_brand':
        case 'change_category':
          toast.info(`${action} - Funcionalidad en desarrollo`);
          return;
          
        default:
          toast.error(`Acción desconocida: ${action}`);
          return;
      }
      
      response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        if (action === 'send_to_ai' && result.job_id) {
          // Curación asíncrona - iniciar polling
          toast.success(`Job ${result.job_id} iniciado. Procesando en segundo plano...`);
          pollCurationJob(result.job_id);
        } else {
          // Otras acciones síncronas
          const { results } = result;
          if (results) {
            toast.success(
              `✅ ${results.successful_count}/${results.total_count} productos procesados correctamente`
            );
            if (results.failed_count > 0) {
              toast.warning(`⚠️ ${results.failed_count} productos fallaron`);
            }
          } else {
            toast.success(result.message || 'Acción completada exitosamente');
          }
        }
      } else {
        throw new Error(result.error || 'Error en la operación');
      }
      
      // Limpiar selección después de la acción
      setSelectedIds([]);
      
      // Recargar datos y estadísticas
      await Promise.all([
        loadProducts(),
        loadCountsAndMetrics()
      ]);
      
    } catch (error) {
      console.error(`Error en acción masiva ${action}:`, error);
      toast.error(`Error al ejecutar ${action}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, [loadProducts, loadCountsAndMetrics, setSelectedIds]);

  const handleCurateProduct = useCallback(async (productId: string) => {
    // Implementation for manual curation with AI assistance
    toast.info('Curación manual con asistencia AI - en desarrollo');
    // TODO: Abrir modal de curación manual con sugerencias de AI
  }, []);

  const pollCurationJob = useCallback(async (jobId: string) => {
    const interval = setInterval(async () => {
      try {
        const authToken = localStorage.getItem('iam_access_token');
        const headers: HeadersInit = {};
        
        if (authToken) {
          headers['Authorization'] = `Bearer ${authToken}`;
        }
        
        const status = await fetch(`/api/scraper/products/curation-jobs/${jobId}`, {
          headers
        });
        const data = await status.json();
        
        if (data.job.status === 'completed') {
          clearInterval(interval);
          toast.success('Curación completada!');
          fetchProducts(); // Refrescar lista
          fetchStats(); // Refrescar estadísticas
        } else if (data.job.status === 'failed') {
          clearInterval(interval);
          toast.error('Curación falló: ' + data.job.error_message);
        }
      } catch (error) {
        console.error('Error polling curation job:', error);
        clearInterval(interval);
        toast.error('Error al verificar estado de curación');
      }
    }, 3000); // Polling cada 3 segundos
    
    // Limpiar interval después de 5 minutos máximo
    setTimeout(() => clearInterval(interval), 5 * 60 * 1000);
  }, []);

  const handleSendToAI = useCallback(async (productId: string) => {
    // Send single product to AI for automatic processing
    await handleBulkAction('send_to_ai', [productId]);
  }, [handleBulkAction]);

  const totalPages = Math.ceil(totalProducts / pageSize);

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Panel de Curación Optimizado</h2>
          <p className="text-muted-foreground">
            Sistema inteligente con estadísticas colapsables y gestión optimizada de espacio
          </p>
        </div>
      </div>

      {/* Estadísticas Colapsables */}
      <CollapsibleStatsPanel 
        stats={curationStats}
        className="transition-all duration-300"
      />

      {/* Tabs Optimizados sin duplicados */}
      <OptimizedCurationTabs
        tabs={tabsConfig}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onRefresh={handleRefresh}
        loading={loading}
        products={products}
        selectedIds={selectedIds}
        onSelectionChange={handleSelectionChange}
        onProductUpdate={() => {}} // TODO: Implementar
        onProductSave={() => {}} // TODO: Implementar
        onCurateProduct={handleCurateProduct}
        onSendToAI={handleSendToAI}
        globalFilters={globalFilters}
        onFiltersChange={handleFiltersChange}
        onBulkAction={handleBulkAction}
        totalProducts={totalProducts}
        page={page}
        pageSize={pageSize}
        className="flex-1"
      />
    </div>
  );
}