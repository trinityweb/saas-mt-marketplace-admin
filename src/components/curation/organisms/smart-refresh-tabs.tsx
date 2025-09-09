'use client';

import { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/shared-ui';
import { Button } from '@/components/shared-ui';
import { RefreshCw, Clock, Activity, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export interface SmartTabConfig {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  count?: number;
  variant: 'default' | 'success' | 'warning' | 'error' | 'info';
}

interface SmartRefreshTabsProps {
  tabs: SmartTabConfig[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onRefresh: () => void;
  children: React.ReactNode;
  loading?: boolean;
  className?: string;
  // Configuración inteligente
  enableSmartRefresh?: boolean;
  hasActiveJobs?: boolean; // Para decidir si hacer polling
  lastDataChange?: Date; // Última vez que cambió la data
}

export function SmartRefreshTabs({
  tabs,
  activeTab,
  onTabChange,
  onRefresh,
  children,
  loading = false,
  className,
  enableSmartRefresh = true,
  hasActiveJobs = false,
  lastDataChange,
}: SmartRefreshTabsProps) {
  
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false); // Desactivado por defecto
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 🧠 LÓGICA INTELIGENTE DE REFRESH
  const shouldAutoRefresh = useCallback(() => {
    if (!enableSmartRefresh || !autoRefresh) return false;
    
    // Solo hacer auto-refresh si hay jobs activos o processing
    if (hasActiveJobs) return true;
    
    // Si no hay jobs activos, solo refrescar una vez por hora como máximo
    if (lastRefresh) {
      const hoursSinceLastRefresh = (Date.now() - lastRefresh.getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastRefresh < 1) return false;
    }
    
    return false;
  }, [enableSmartRefresh, autoRefresh, hasActiveJobs, lastRefresh]);

  // 🔄 REFRESH INTELIGENTE
  const handleSmartRefresh = useCallback(async () => {
    if (isRefreshing) return;
    
    try {
      setIsRefreshing(true);
      await onRefresh();
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error in smart refresh:', error);
      toast.error('Error al actualizar datos');
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh, isRefreshing]);

  // ⏰ AUTO-REFRESH CONDICIONAL
  useEffect(() => {
    if (!shouldAutoRefresh()) return;

    // Si hay jobs activos: polling cada 30 segundos
    // Si no hay jobs activos: polling cada 10 minutos (como fallback)
    const interval = hasActiveJobs ? 30000 : 600000;
    
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible' && shouldAutoRefresh()) {
        handleSmartRefresh();
      }
    }, interval);

    return () => clearInterval(timer);
  }, [shouldAutoRefresh, hasActiveJobs, handleSmartRefresh]);

  // 🎯 REFRESH MANUAL
  const handleManualRefresh = useCallback(async () => {
    await handleSmartRefresh();
    toast.success('Datos actualizados');
  }, [handleSmartRefresh]);

  // 🔄 TOGGLE AUTO-REFRESH
  const toggleAutoRefresh = useCallback(() => {
    const newState = !autoRefresh;
    setAutoRefresh(newState);
    
    if (newState) {
      // Si se activa, hacer refresh inmediato
      handleSmartRefresh();
      toast.info('Auto-refresh activado (solo cuando hay actividad)');
    } else {
      toast.info('Auto-refresh desactivado');
    }
  }, [autoRefresh, handleSmartRefresh]);

  // 🎨 VARIANT COLORS
  const getVariantClass = (variant: SmartTabConfig['variant']) => {
    switch (variant) {
      case 'success': return 'bg-green-100 text-green-800 border-green-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // 📊 REFRESH STATUS
  const getRefreshStatus = () => {
    if (isRefreshing || loading) {
      return { icon: RefreshCw, className: 'animate-spin', text: 'Actualizando...' };
    }
    
    if (hasActiveJobs) {
      return { icon: Activity, className: 'text-blue-600 animate-pulse', text: 'Actividad detectada' };
    }
    
    if (autoRefresh) {
      return { icon: RefreshCw, className: 'text-green-600', text: 'Auto-refresh ON (inteligente)' };
    }
    
    return { icon: Pause, className: 'text-gray-500', text: 'Auto-refresh OFF' };
  };

  const refreshStatus = getRefreshStatus();

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="relative">
                {tab.icon && <tab.icon className="mr-2 h-4 w-4" />}
                {tab.label}
                {typeof tab.count === 'number' && (
                  <span className={cn(
                    "ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium",
                    getVariantClass(tab.variant)
                  )}>
                    {tab.count.toLocaleString()}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {children}
        </Tabs>

        {/* Controles inteligentes */}
        <div className="flex items-center space-x-2 ml-4">
          {/* Toggle auto-refresh inteligente */}
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={toggleAutoRefresh}
            className={cn(
              'h-8 text-xs',
              autoRefresh && hasActiveJobs && 'bg-green-600 hover:bg-green-700'
            )}
            title={`Auto-refresh ${autoRefresh ? 'activado' : 'desactivado'} (solo con actividad)`}
          >
            <refreshStatus.icon className={cn('h-3 w-3 mr-1', refreshStatus.className)} />
            {autoRefresh ? 'AUTO-ON' : 'AUTO-OFF'}
          </Button>

          {/* Refresh manual */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            disabled={isRefreshing || loading}
            className="h-8"
          >
            <RefreshCw className={cn('h-3 w-3 mr-1', (isRefreshing || loading) && 'animate-spin')} />
            Actualizar
          </Button>

          {/* Indicador de estado */}
          {(lastRefresh || hasActiveJobs) && (
            <div className="text-xs text-gray-500 flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {hasActiveJobs ? (
                <span className="text-blue-600 font-medium">Actividad en curso</span>
              ) : lastRefresh ? (
                `${lastRefresh.toLocaleTimeString()}`
              ) : (
                'Nunca'
              )}
            </div>
          )}
        </div>
      </div>

      {/* Indicador de modo inteligente */}
      {enableSmartRefresh && (
        <div className="text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-md flex items-center justify-between">
          <span>
            🧠 <strong>Modo Inteligente:</strong> {refreshStatus.text}
            {hasActiveJobs && <span className="ml-2 text-blue-600">• Jobs activos detectados</span>}
          </span>
          <span className="text-gray-400">
            {autoRefresh ? (
              hasActiveJobs ? 'Polling cada 30s' : 'Polling reducido (10min)'
            ) : (
              'Solo refresh manual'
            )}
          </span>
        </div>
      )}
    </div>
  );
}
