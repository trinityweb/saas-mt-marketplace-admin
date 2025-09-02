'use client';

import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Loader2, Download, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/shared-ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shared-ui';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/shared-ui';
import { CurationFilter } from '@/types/curation';
import { CurationFilters } from '@/components/curation/organisms/curation-filters';
import { ConfidenceBadge } from '@/components/curation/atoms/confidence-badge';
import { CurationStatusBadge } from '@/components/curation/atoms/curation-status-badge';
import { useAuth } from '@/hooks/use-auth';
import { formatCurrency } from '@/lib/utils';

interface CurationHistoryItem {
  id: string;
  product_name: string;
  product_id: string;
  action: 'approved' | 'rejected' | 'edited' | 'ai_curated';
  performed_by: string;
  performed_at: string;
  confidence_before?: number;
  confidence_after?: number;
  changes?: {
    field: string;
    old_value: any;
    new_value: any;
  }[];
  notes?: string;
}

// Mock API - replace with real API calls
const mockApi = {
  getCurationHistory: async (filters: CurationFilter): Promise<CurationHistoryItem[]> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return [
      {
        id: 'history-1',
        product_name: 'Coca Cola 600ml',
        product_id: 'prod-1',
        action: 'ai_curated',
        performed_by: 'AI System',
        performed_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        confidence_before: 65,
        confidence_after: 95,
        changes: [
          { field: 'brand', old_value: 'Coca Cola', new_value: 'Coca-Cola' },
          { field: 'category', old_value: 'Bebidas', new_value: 'Bebidas > Refrescos' }
        ]
      },
      {
        id: 'history-2',
        product_name: 'Sabritas Original 45g',
        product_id: 'prod-2',
        action: 'approved',
        performed_by: 'admin@tiendavecina.com',
        performed_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        confidence_before: 88,
        confidence_after: 100,
        notes: 'Producto verificado manualmente'
      },
      {
        id: 'history-3',
        product_name: 'Producto Desconocido',
        product_id: 'prod-3',
        action: 'rejected',
        performed_by: 'admin@tiendavecina.com',
        performed_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        confidence_before: 35,
        notes: 'Información insuficiente, imágenes de baja calidad'
      },
      {
        id: 'history-4',
        product_name: 'Bimbo Pan Blanco',
        product_id: 'prod-4',
        action: 'edited',
        performed_by: 'curator@tiendavecina.com',
        performed_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        confidence_before: 78,
        confidence_after: 92,
        changes: [
          { field: 'description', old_value: 'Pan blanco', new_value: 'Pan blanco rebanado Bimbo, 680g' },
          { field: 'price', old_value: 35.00, new_value: 38.00 }
        ]
      }
    ];
  },

  exportHistory: async (filters: CurationFilter): Promise<Blob> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    // Simulate CSV export
    const csv = 'id,product_name,action,performed_by,performed_at\n';
    return new Blob([csv], { type: 'text/csv' });
  }
};

export default function CurationHistoryPage() {
  const { token } = useAuth();
  const [history, setHistory] = useState<CurationHistoryItem[]>([]);
  const [filters, setFilters] = useState<CurationFilter>({});
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      const data = await mockApi.getCurationHistory(filters);
      setHistory(data);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleExport = async () => {
    try {
      setExporting(true);
      const blob = await mockApi.exportHistory(filters);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `curation-history-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting history:', error);
    } finally {
      setExporting(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'edited': return <Eye className="h-4 w-4 text-blue-600" />;
      case 'ai_curated': return <Clock className="h-4 w-4 text-purple-600" />;
      default: return null;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'approved': return 'Aprobado';
      case 'rejected': return 'Rechazado';
      case 'edited': return 'Editado';
      case 'ai_curated': return 'Curado con AI';
      default: return action;
    }
  };

  // Calculate stats
  const stats = {
    total: history.length,
    approved: history.filter(h => h.action === 'approved').length,
    rejected: history.filter(h => h.action === 'rejected').length,
    edited: history.filter(h => h.action === 'edited').length,
    ai_curated: history.filter(h => h.action === 'ai_curated').length,
    avgConfidenceIncrease: history.reduce((acc, h) => {
      if (h.confidence_before && h.confidence_after) {
        return acc + (h.confidence_after - h.confidence_before);
      }
      return acc;
    }, 0) / history.filter(h => h.confidence_before && h.confidence_after).length || 0
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Historial de Curación</h1>
          <p className="text-muted-foreground">
            Registro de todas las acciones de curación realizadas
          </p>
        </div>
        <Button
          onClick={handleExport}
          disabled={exporting || history.length === 0}
        >
          {exporting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Exportando...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </>
          )}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Acciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Aprobados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Rechazados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Curados con AI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.ai_curated}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Mejora Promedio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              +{stats.avgConfidenceIncrease.toFixed(0)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <CurationFilters
        filters={filters}
        onFiltersChange={setFilters}
        onRefresh={loadHistory}
        loading={loading}
      />

      {/* History Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Acción</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead>Realizado por</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Confianza</TableHead>
                <TableHead>Cambios</TableHead>
                <TableHead>Notas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No hay historial de curación
                  </TableCell>
                </TableRow>
              ) : (
                history.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getActionIcon(item.action)}
                        <Badge variant="outline">
                          {getActionLabel(item.action)}
                        </Badge>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="font-medium">{item.product_name}</div>
                      <div className="text-xs text-muted-foreground">
                        ID: {item.product_id}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-sm">{item.performed_by}</div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-sm">
                        {format(new Date(item.performed_at), 'dd MMM yyyy', { locale: es })}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(item.performed_at), 'HH:mm')}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      {item.confidence_before !== undefined && (
                        <div className="flex items-center gap-2">
                          <ConfidenceBadge score={item.confidence_before} size="sm" />
                          {item.confidence_after !== undefined && (
                            <>
                              <span className="text-muted-foreground">→</span>
                              <ConfidenceBadge score={item.confidence_after} size="sm" />
                            </>
                          )}
                        </div>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      {item.changes && item.changes.length > 0 && (
                        <div className="space-y-1">
                          {item.changes.map((change, idx) => (
                            <div key={idx} className="text-xs">
                              <span className="font-medium">{change.field}:</span>{' '}
                              <span className="text-muted-foreground line-through">
                                {typeof change.old_value === 'number' 
                                  ? formatCurrency(change.old_value, 'MXN')
                                  : change.old_value}
                              </span>{' '}
                              →{' '}
                              <span className="text-green-600">
                                {typeof change.new_value === 'number'
                                  ? formatCurrency(change.new_value, 'MXN')
                                  : change.new_value}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      {item.notes && (
                        <div className="text-xs text-muted-foreground max-w-xs">
                          {item.notes}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}