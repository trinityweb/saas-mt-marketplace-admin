'use client';

import { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/shared-ui';
import { Button } from '@/components/shared-ui';
import { RefreshCw, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export interface TabConfig {
  id: string;
  label: string;
  variant: 'default' | 'success' | 'warning' | 'error' | 'info';
  count_endpoint?: string;
}

interface AutoRefreshTabsProps {
  tabs: TabConfig[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  refreshInterval?: number; // segundos
  className?: string;
  children: React.ReactNode;
  onRefresh?: () => void;
  loading?: boolean;
}

interface TabCount {
  [key: string]: number;
}

export function AutoRefreshTabs({
  tabs,
  activeTab,
  onTabChange,
  refreshInterval = 30,
  className,
  children,
  onRefresh,
  loading = false
}: AutoRefreshTabsProps) {
  const [tabCounts, setTabCounts] = useState<TabCount>({});
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshLoading, setRefreshLoading] = useState(false);

  // Función para obtener conteos de tabs
  const fetchTabCounts = useCallback(async () => {
    try {
      setRefreshLoading(true);
      
      const counts: TabCount = {};
      
      // Obtener conteos para cada tab que tenga endpoint
      const countPromises = tabs
        .filter(tab => tab.count_endpoint)
        .map(async (tab) => {
          try {
            const authToken = localStorage.getItem('iam_access_token');
            const tenantId = localStorage.getItem('tenant_id');
            
            if (!authToken || !tenantId) {
              throw new Error('Token o tenant ID faltante');
            }

            const response = await fetch(tab.count_endpoint!, {
              headers: {
                'Authorization': `Bearer ${authToken}`,
                'X-Tenant-ID': tenantId,
                'Content-Type': 'application/json'
              }
            });

            if (response.ok) {
              const data = await response.json();
              counts[tab.id] = data.count || data.total || 0;
            } else {
              console.warn(`Error fetching count for ${tab.id}:`, response.status);
              counts[tab.id] = 0;
            }
          } catch (error) {
            console.warn(`Error fetching count for ${tab.id}:`, error);
            counts[tab.id] = 0;
          }
        });

      await Promise.allSettled(countPromises);
      
      setTabCounts(counts);
      setLastUpdated(new Date());
      
    } catch (error) {
      console.error('Error fetching tab counts:', error);
      toast.error('Error al actualizar contadores');
    } finally {
      setRefreshLoading(false);
    }
  }, [tabs]);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;

    // Fetch inicial
    fetchTabCounts();

    // Intervalo de auto-refresh
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchTabCounts();
      }
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [fetchTabCounts, refreshInterval, autoRefresh]);

  // Manual refresh
  const handleManualRefresh = useCallback(async () => {
    await fetchTabCounts();
    if (onRefresh) {
      onRefresh();
    }
  }, [fetchTabCounts, onRefresh]);

  // Toggle auto-refresh
  const toggleAutoRefresh = useCallback(() => {
    setAutoRefresh(!autoRefresh);
    if (!autoRefresh) {
      fetchTabCounts();
    }
  }, [autoRefresh, fetchTabCounts]);

  const getVariantColor = (variant: TabConfig['variant']) => {
    switch (variant) {
      case 'success': return 'bg-green-100 text-green-800 border-green-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatLastUpdated = () => {
    if (!lastUpdated) return '';
    return `Última actualización: ${lastUpdated.toLocaleTimeString()}`;
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header con controles */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {lastUpdated && (
            <>
              <Clock className="h-4 w-4" />
              {formatLastUpdated()}
            </>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleAutoRefresh}
            className={cn(
              'text-xs',
              autoRefresh ? 'bg-green-50 text-green-700' : 'text-gray-500'
            )}
          >
            Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            disabled={refreshLoading || loading}
            className="text-xs"
          >
            <RefreshCw className={cn(
              'h-3 w-3 mr-1',
              refreshLoading && 'animate-spin'
            )} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Tabs optimizados */}
      <Tabs value={activeTab} onValueChange={onTabChange}>
        <TabsList className="grid w-full grid-cols-6 mb-6">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex items-center gap-2 relative"
            >
              <span>{tab.label}</span>
              {tabCounts[tab.id] !== undefined && (
                <Badge
                  variant="secondary"
                  className={cn(
                    'text-xs px-2 py-0',
                    getVariantColor(tab.variant)
                  )}
                >
                  {tabCounts[tab.id].toLocaleString()}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Content */}
        {children}
      </Tabs>
    </div>
  );
}
