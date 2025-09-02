'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Loader2, Clock, Send, AlertCircle } from 'lucide-react';
import { Button } from '@/components/shared-ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shared-ui';
import { Progress } from '@/components/shared-ui';
import { CurationTable } from '@/components/curation/organisms/curation-table';
import { BulkActionBar } from '@/components/curation/molecules/bulk-action-bar';
import { ScrapedProduct, CurationJob } from '@/types/curation';
import { useAuth } from '@/hooks/use-auth';

// Mock API - replace with real API calls
const mockApi = {
  getCurationQueue: async (): Promise<{
    products: ScrapedProduct[];
    jobs: CurationJob[];
  }> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      products: [
        {
          id: '4',
          external_id: 'WM-567890',
          source: 'walmart',
          name: 'Doritos Nacho',
          price: 22.50,
          currency: 'MXN',
          images: [],
          scraped_at: new Date().toISOString(),
          status: 'pending',
          confidence_score: 68,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '5',
          external_id: 'ML-234567',
          source: 'mercadolibre',
          name: 'Agua Bonafont 1L',
          price: 12.00,
          currency: 'MXN',
          images: ['https://example.com/water.jpg'],
          scraped_at: new Date().toISOString(),
          status: 'pending',
          confidence_score: 75,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ],
      jobs: [
        {
          id: 'job-1',
          type: 'ai_curation',
          status: 'running',
          product_count: 50,
          processed_count: 35,
          success_count: 33,
          error_count: 2,
          started_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          created_by: 'system',
          created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString()
        }
      ]
    };
  },

  processQueue: async (productIds: string[]): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
};

export default function CurationQueuePage() {
  const { token } = useAuth();
  const [products, setProducts] = useState<ScrapedProduct[]>([]);
  const [jobs, setJobs] = useState<CurationJob[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  const loadQueue = useCallback(async () => {
    try {
      setLoading(true);
      const data = await mockApi.getCurationQueue();
      setProducts(data.products);
      setJobs(data.jobs);
    } catch (error) {
      console.error('Error loading queue:', error);
      toast.error('Error al cargar la cola de curación');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQueue();
    // Refrescar cada 30 segundos
    const interval = setInterval(loadQueue, 30000);
    return () => clearInterval(interval);
  }, [loadQueue]);

  const handleProcessQueue = async () => {
    try {
      setProcessing(true);
      const idsToProcess = selectedIds.length > 0 ? selectedIds : products.map(p => p.id);
      await mockApi.processQueue(idsToProcess);
      toast.success(`${idsToProcess.length} productos enviados a curación`);
      setSelectedIds([]);
      await loadQueue();
    } catch (error) {
      console.error('Error processing queue:', error);
      toast.error('Error al procesar la cola');
    } finally {
      setProcessing(false);
    }
  };

  const handleProductUpdate = async (productId: string, updates: Partial<ScrapedProduct>) => {
    setProducts(prev => prev.map(p => 
      p.id === productId ? { ...p, ...updates } : p
    ));
  };

  const handleProductSave = async (productId: string) => {
    toast.success('Producto actualizado en la cola');
  };

  const activeJob = jobs.find(j => j.status === 'running');
  const progress = activeJob 
    ? (activeJob.processed_count / activeJob.product_count) * 100
    : 0;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cola de Curación</h1>
        <p className="text-muted-foreground">
          Productos pendientes de curación automática con AI
        </p>
      </div>

      {/* Job Status */}
      {activeJob && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Procesando Curación con AI
            </CardTitle>
            <CardDescription>
              {activeJob.processed_count} de {activeJob.product_count} productos procesados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-sm">
              <span className="text-green-600">
                ✓ {activeJob.success_count} exitosos
              </span>
              <span className="text-red-600">
                ✗ {activeJob.error_count} errores
              </span>
              <span className="text-muted-foreground">
                {activeJob.product_count - activeJob.processed_count} pendientes
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Queue Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Productos en Cola
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{products.length}</span>
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Tiempo Estimado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">
                {Math.ceil(products.length * 2 / 60)} min
              </span>
              <AlertCircle className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Trabajos Activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">
                {jobs.filter(j => j.status === 'running').length}
              </span>
              <Send className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            onClick={handleProcessQueue}
            disabled={processing || products.length === 0}
          >
            {processing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Procesar {selectedIds.length > 0 ? `${selectedIds.length} Seleccionados` : 'Toda la Cola'}
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={loadQueue}
            disabled={loading}
          >
            Refrescar
          </Button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <>
          {selectedIds.length > 0 && (
            <BulkActionBar
              selectedCount={selectedIds.length}
              onSendToAI={() => handleProcessQueue()}
              loading={processing}
            />
          )}
          
          <CurationTable
            products={products}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            onProductUpdate={handleProductUpdate}
            onProductSave={handleProductSave}
          />
        </>
      )}
    </div>
  );
}