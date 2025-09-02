'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared-ui';
import { Button } from '@/components/shared-ui';
import { Badge } from '@/components/shared-ui';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/shared-ui';
import { 
  RefreshCw, 
  Globe, 
  Search,
  Calendar,
  TrendingUp,
  Package,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useScraperTargets } from '@/hooks/scraper/useScraperTargets';

export function SourceManager() {
  const { targets, loading, toggleTarget, refreshTarget } = useScraperTargets();
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingTarget, setLoadingTarget] = useState<string | null>(null);

  const filteredTargets = targets.filter(target =>
    target.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    target.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRefresh = async (targetName: string) => {
    setLoadingTarget(targetName);
    try {
      await refreshTarget(targetName);
    } finally {
      setLoadingTarget(null);
    }
  };


  const getHealthStatus = (successRate: number) => {
    if (successRate >= 0.95) {
      return { icon: <CheckCircle className="h-4 w-4" />, color: 'text-green-500' };
    } else if (successRate >= 0.8) {
      return { icon: <AlertCircle className="h-4 w-4" />, color: 'text-yellow-500' };
    } else {
      return { icon: <AlertCircle className="h-4 w-4" />, color: 'text-red-500' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar fuentes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Sources grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTargets.map((target) => {
          const health = getHealthStatus(target.success_rate);
          
          return (
            <Card key={target.name} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <CardTitle className="text-lg">{target.display_name}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {target.category}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {target.engine}
                      </Badge>
                    </div>
                  </div>
                  <Switch
                    checked={target.is_active}
                    onCheckedChange={(checked) => toggleTarget(target.name, checked)}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Package className="h-3 w-3" />
                      <span>Productos</span>
                    </div>
                    <p className="text-xl font-semibold">
                      {new Intl.NumberFormat('es-AR').format(target.products_count)}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className={cn(health.color)}>{health.icon}</span>
                      <span>Tasa de éxito</span>
                    </div>
                    <p className="text-xl font-semibold">
                      {(target.success_rate * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center gap-2">
                  <Badge variant={target.is_active ? "default" : "secondary"}>
                    {target.is_active ? "Activo" : "Inactivo"}
                  </Badge>
                  <Badge variant="outline">
                    Motor: {target.engine}
                  </Badge>
                </div>

                {/* Last run */}
                {target.last_run && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>
                      Última ejecución: {formatDistanceToNow(new Date(target.last_run), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRefresh(target.name)}
                    disabled={loadingTarget === target.name || !target.is_active}
                    className="flex-1"
                  >
                    <RefreshCw className={cn(
                      "h-4 w-4 mr-2",
                      loadingTarget === target.name && "animate-spin"
                    )} />
                    Ejecutar ahora
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {/* TODO: Open config modal */}}
                  >
                    <Calendar className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredTargets.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No se encontraron fuentes que coincidan con tu búsqueda
          </p>
        </div>
      )}
    </div>
  );
}