'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared-ui';
import { Button } from '@/components/shared-ui';
import { Badge } from '@/components/shared-ui';
import { Input } from '@/components/shared-ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Search, 
  Download, 
  Calendar,
  Clock,
  Package,
  AlertCircle,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { scraperAPI, ScrapingHistory as ScrapingHistoryType } from '@/lib/api/scraper/scraper-api';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function ScrapingHistory() {
  const [history, setHistory] = useState<ScrapingHistoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    target: 'all',
    dateFrom: '',
    dateTo: '',
  });
  const { toast } = useToast();

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        page_size: 20,
      };

      if (filters.search) {
        params.target_name = filters.search;
      }
      if (filters.status !== 'all') {
        params.status = filters.status;
      }
      if (filters.dateFrom) {
        params.from_date = filters.dateFrom;
      }
      if (filters.dateTo) {
        params.to_date = filters.dateTo;
      }

      const response = await scraperAPI.getHistory(params);
      setHistory(response.items);
      setTotalPages(response.total_pages);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo cargar el historial',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [page, filters, toast]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'failed':
        return <XCircle className="h-4 w-4" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      case 'cancelled':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds}s`;
    } else if (seconds < 3600) {
      return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }
  };

  const exportHistory = () => {
    // TODO: Implement CSV export
    toast({
      title: 'Exportación iniciada',
      description: 'El archivo CSV se descargará en breve',
    });
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Filtros</CardTitle>
            <Button size="sm" variant="outline" onClick={exportHistory}>
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por fuente..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10"
              />
            </div>
            
            <Select 
              value={filters.status} 
              onValueChange={(value) => setFilters({ ...filters, status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="completed">Completado</SelectItem>
                <SelectItem value="failed">Fallido</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              placeholder="Desde"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
            />

            <Input
              type="date"
              placeholder="Hasta"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* History table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estado</TableHead>
                <TableHead>Fuente</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Productos</TableHead>
                <TableHead className="text-right">Duplicados</TableHead>
                <TableHead className="text-right">Duración</TableHead>
                <TableHead>Job ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Clock className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : history.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No se encontraron registros
                  </TableCell>
                </TableRow>
              ) : (
                history.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className={cn("flex items-center gap-2", getStatusColor(item.status))}>
                        {getStatusIcon(item.status)}
                        <span className="capitalize">{item.status}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.target_name}</p>
                        {item.error_message && (
                          <p className="text-xs text-red-600 mt-1">{item.error_message}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm">
                          {format(new Date(item.started_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(item.started_at), { 
                            addSuffix: true, 
                            locale: es 
                          })}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Package className="h-3 w-3 text-muted-foreground" />
                        <span>{item.products_found}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {item.duplicates_detected}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatDuration(item.duration_seconds)}
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-1 py-0.5 rounded">
                        {item.job_id.substring(0, 8)}...
                      </code>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {page} de {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}