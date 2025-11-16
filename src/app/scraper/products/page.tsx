'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/shared-ui';
import { Input } from '@/components/shared-ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/shared-ui';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared-ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Eye, 
  RefreshCw,
  Download,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Package
} from 'lucide-react';

interface ScrapedProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  original_price?: number;
  discount_percentage?: number;
  url: string;
  image_url: string;
  source: string;
  category: string;
  brand: string;
  sku?: string;
  ean?: string;
  in_stock: boolean;
  curation_status: 'pending' | 'curated' | 'rejected';
  scraped_at: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

interface ProductsResponse {
  products: ScrapedProduct[];
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
}

interface SourceStats {
  source: string;
  total: number;
  curated: number;
  pending: number;
  rejected: number;
  avg_price: number;
  min_price: number;
  max_price: number;
  last_scraped: string;
  categories: string[];
  brands: string[];
}

export default function ScraperProductsPage() {
  const [products, setProducts] = useState<ScrapedProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  // Filtros
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  
  // Estadísticas
  const [sourceStats, setSourceStats] = useState<SourceStats[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);
  
  // Use refs to prevent re-renders
  const isLoadingRef = useRef(false);
  const isLoadingStatsRef = useRef(false);

  // Cargar productos
  const fetchProducts = async () => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    setLoading(true);
    
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        page_size: pageSize.toString(),
        sort_by: 'scraped_at',
        sort_dir: 'desc'
      });

      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (sourceFilter !== 'all') params.append('source', sourceFilter);
      if (searchTerm) params.append('search', searchTerm);
      if (priceRange.min) params.append('min_price', priceRange.min);
      if (priceRange.max) params.append('max_price', priceRange.max);

      const response = await fetch(`/api/scraper/products?${params}`);
      const data = await response.json();

      if (response.ok) {
        setProducts(data.products || []);
        setTotalCount(data.total_count || 0);
        setTotalPages(data.total_pages || 1);
      } else {
        toast.error('Error al cargar productos');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  };

  // Cargar estadísticas
  const fetchStats = async () => {
    if (isLoadingStatsRef.current) return;
    isLoadingStatsRef.current = true;
    setLoadingStats(true);
    
    try {
      const response = await fetch('/api/scraper/statistics/by-source');
      const data = await response.json();

      if (response.ok) {
        setSourceStats(data.source_stats || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoadingStats(false);
      isLoadingStatsRef.current = false;
    }
  };

  // Actualizar estado de curación
  const updateCurationStatus = async (productId: string, status: 'curated' | 'rejected') => {
    try {
      const response = await fetch(`/api/scraper/products/${productId}/curation-status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        toast.success(`Producto ${status === 'curated' ? 'curado' : 'rechazado'}`);
        fetchProducts(); // Recargar lista
        fetchStats(); // Actualizar estadísticas
      } else {
        toast.error('Error al actualizar estado');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al actualizar estado');
    }
  };

  // Curar producto al catálogo global
  const curateToGlobalCatalog = async (productId: string) => {
    try {
      const response = await fetch(`/api/scraper/products/curate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          product_ids: [productId],
          curation_notes: 'Producto curado desde el marketplace admin' 
        })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        if (data.job_id) {
          toast.success(`Job ${data.job_id} iniciado. Procesando en segundo plano...`);
          pollCurationJob(data.job_id);
        } else {
          toast.success('Producto agregado al catálogo global');
          fetchProducts(); // Recargar lista
          fetchStats(); // Actualizar estadísticas
        }
      } else {
        toast.error(data.error || 'Error al curar producto');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al curar producto al catálogo global');
    }
  };

  // Función de polling para jobs de curación
  const pollCurationJob = async (jobId: string) => {
    const interval = setInterval(async () => {
      try {
        const status = await fetch(`/api/scraper/products/curation-jobs/${jobId}`);
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
  };

  // Curación masiva al catálogo global
  const bulkCurateToGlobal = async () => {
    // Obtener todos los productos pendientes de la página actual
    const pendingProducts = products.filter(p => p.curation_status === 'pending');
    
    if (pendingProducts.length === 0) {
      toast.warning('No hay productos pendientes para curar');
      return;
    }

    if (!confirm(`¿Curar ${pendingProducts.length} productos al catálogo global?`)) {
      return;
    }

    try {
      const response = await fetch('/api/scraper/products/curate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          product_ids: pendingProducts.map(p => p.id)
        })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        if (data.job_id) {
          toast.success(`Job ${data.job_id} iniciado. Procesando ${pendingProducts.length} productos en segundo plano...`);
          pollCurationJob(data.job_id);
        } else {
          toast.success(`${data.successful || pendingProducts.length} productos curados exitosamente`);
          if (data.failed > 0) {
            toast.warning(`${data.failed} productos fallaron`);
          }
          fetchProducts(); // Recargar lista
          fetchStats(); // Actualizar estadísticas
        }
      } else {
        toast.error(data.error || 'Error en curación masiva');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error en curación masiva');
    }
  };

  // Carga inicial
  useEffect(() => {
    fetchProducts();
    fetchStats();
  }, []); // Solo en el montaje

  // Recargar cuando cambien filtros o página
  useEffect(() => {
    fetchProducts();
  }, [currentPage, statusFilter, sourceFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'curated':
        return <Badge className="bg-green-500">Curado</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500">Rechazado</Badge>;
      default:
        return <Badge className="bg-yellow-500">Pendiente</Badge>;
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: currency || 'ARS'
    }).format(price);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Productos Scrapeados</h1>
          <p className="text-muted-foreground">
            Gestiona y cura los productos recolectados del marketplace
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={bulkCurateToGlobal} variant="default">
            <Package className="mr-2 h-4 w-4" />
            Curar Pendientes al Catálogo
          </Button>
          <Button onClick={() => { fetchProducts(); fetchStats(); }} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">Productos</TabsTrigger>
          <TabsTrigger value="statistics">Estadísticas</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          {/* Filtros integrados */}
          <div className="flex gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchProducts()}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="curated">Curados</SelectItem>
                <SelectItem value="rejected">Rechazados</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Fuente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {sourceStats.map(stat => (
                  <SelectItem key={stat.source} value={stat.source}>
                    {stat.source} ({stat.total})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Precio min"
                value={priceRange.min}
                onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && fetchProducts()}
                className="w-[120px]"
              />
              <Input
                type="number"
                placeholder="Precio max"
                value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && fetchProducts()}
                className="w-[120px]"
              />
            </div>
          </div>

          {/* Tabla de productos */}
          <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Imagen</TableHead>
                      <TableHead>Producto</TableHead>
                      <TableHead>Precio</TableHead>
                      <TableHead>Fuente</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin inline" />
                          Cargando productos...
                        </TableCell>
                      </TableRow>
                    ) : products.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No se encontraron productos
                        </TableCell>
                      </TableRow>
                    ) : (
                      products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <img
                              src={product.image_url}
                              alt={product.title}
                              className="w-16 h-16 object-cover rounded"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRTVFN0VCIi8+CjxwYXRoIGQ9Ik01MCA1MEgxMDBWMTAwSDUwVjUwWiIgZmlsbD0iIzlDQTNCRiIvPgo8Y2lyY2xlIGN4PSI2NS4yNSIgY3k9IjY1LjI1IiByPSI3LjUiIGZpbGw9IiNFNUU3RUIiLz4KPHBhdGggZD0iTTUwIDgwTDY1IDY1TDc1IDc1TDkwIDYwTDEwMCA3MFYxMDBINTBWODBaIiBmaWxsPSIjNkI3MjgwIi8+Cjwvc3ZnPg==';
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs">
                              <p className="font-medium truncate">{product.title}</p>
                              <p className="text-sm text-muted-foreground">{product.brand}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{formatPrice(product.price, product.currency)}</p>
                              {product.discount_percentage && (
                                <p className="text-sm text-green-600">-{product.discount_percentage}%</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{product.source}</TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell>{getStatusBadge(product.curation_status)}</TableCell>
                          <TableCell>
                            <p className="text-sm">
                              {new Date(product.scraped_at).toLocaleDateString('es-AR')}
                            </p>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => window.open(product.url, '_blank')}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {product.curation_status === 'pending' && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-blue-600"
                                    onClick={() => curateToGlobalCatalog(product.id)}
                                    title="Curar al catálogo global"
                                  >
                                    <ShoppingBag className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-green-600"
                                    onClick={() => updateCurationStatus(product.id, 'curated')}
                                    title="Marcar como curado"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-red-600"
                                    onClick={() => updateCurationStatus(product.id, 'rejected')}
                                    title="Rechazar producto"
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
          </div>

          {/* Paginación */}
          <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Mostrando {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, totalCount)} de {totalCount}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="flex items-center px-3 text-sm">
                    Página {currentPage} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
              </div>
          </div>
        </TabsContent>

        <TabsContent value="statistics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {loadingStats ? (
              <Card className="col-span-3">
                <CardContent className="flex items-center justify-center py-8">
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Cargando estadísticas...
                </CardContent>
              </Card>
            ) : (
              sourceStats.map((stat) => (
                <Card key={stat.source}>
                  <CardHeader>
                    <CardTitle className="text-lg">{stat.source}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Última actualización: {new Date(stat.last_scraped).toLocaleDateString('es-AR')}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-2xl font-bold">{stat.total}</p>
                        <p className="text-xs text-muted-foreground">Total</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-600">{stat.curated}</p>
                        <p className="text-xs text-muted-foreground">Curados</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-yellow-600">{stat.pending}</p>
                        <p className="text-xs text-muted-foreground">Pendientes</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t">
                      <p className="text-sm font-medium mb-1">Precio promedio</p>
                      <p className="text-lg font-bold">{formatPrice(stat.avg_price, 'ARS')}</p>
                    </div>

                    <div className="pt-3 border-t">
                      <p className="text-sm font-medium mb-1">Categorías principales</p>
                      <div className="flex flex-wrap gap-1">
                        {stat.categories.slice(0, 3).map((cat) => (
                          <Badge key={cat} variant="secondary" className="text-xs">
                            {cat}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t">
                      <p className="text-sm font-medium mb-1">Marcas principales</p>
                      <div className="flex flex-wrap gap-1">
                        {stat.brands.slice(0, 3).map((brand) => (
                          <Badge key={brand} variant="outline" className="text-xs">
                            {brand}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}