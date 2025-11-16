'use client';

import { useCallback, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/shared-ui';
import { Button } from '@/components/shared-ui';
import { Card, CardContent } from '@/components/shared-ui';
import { CurationFilters } from './curation-filters';
import { CurationTable } from './curation-table';
import { BulkActionBar } from '../molecules/bulk-action-bar';
import {
  Clock,
  RefreshCw,
  Sparkles,
  Package,
  XCircle,
  Send,
  RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface OptimizedTabConfig {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count: number;
  variant: 'default' | 'warning' | 'info' | 'success' | 'error';
  description?: string;
}

interface OptimizedCurationTabsProps {
  tabs: OptimizedTabConfig[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onRefresh: () => void;
  loading?: boolean;
  products: any[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onProductUpdate: (productId: string, updates: any) => void;
  onProductSave: (productId: string) => void;
  onCurateProduct?: (productId: string) => void;
  onSendToAI?: (productId: string) => void;
  globalFilters: any;
  onFiltersChange: (filters: any) => void;
  onBulkAction: (action: string, productIds: string[]) => void;
  totalProducts: number;
  page: number;
  pageSize: number;
  className?: string;
}

export function OptimizedCurationTabs({
  tabs,
  activeTab,
  onTabChange,
  onRefresh,
  loading = false,
  products,
  selectedIds,
  onSelectionChange,
  onProductUpdate,
  onProductSave,
  onCurateProduct,
  onSendToAI,
  globalFilters,
  onFiltersChange,
  onBulkAction,
  totalProducts,
  page,
  pageSize,
  className
}: OptimizedCurationTabsProps) {
  
  const getVariantColor = useCallback((variant: string) => {
    switch (variant) {
      case 'warning': return 'text-yellow-600 bg-yellow-100 hover:bg-yellow-200';
      case 'info': return 'text-blue-600 bg-blue-100 hover:bg-blue-200';
      case 'success': return 'text-green-600 bg-green-100 hover:bg-green-200';
      case 'error': return 'text-red-600 bg-red-100 hover:bg-red-200';
      default: return 'text-gray-600 bg-gray-100 hover:bg-gray-200';
    }
  }, []);

  const currentTab = useMemo(() => 
    tabs.find(tab => tab.id === activeTab) || tabs[0], 
    [tabs, activeTab]
  );

  const totalPages = Math.ceil(totalProducts / pageSize);

  return (
    <Card className={cn('', className)}>
      <CardContent className="pt-6 space-y-4">
        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
          {/* Tabs List Optimizada */}
          <div className="flex items-center justify-between mb-4">
            <TabsList className="grid w-fit grid-cols-6 gap-1 bg-muted/50 p-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 text-sm transition-all',
                      'data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
                      getVariantColor(tab.variant)
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <Badge 
                      variant="secondary" 
                      className="ml-1 h-5 px-1.5 text-xs font-medium"
                    >
                      {tab.count.toLocaleString()}
                    </Badge>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {/* Información de paginación y controles */}
            <div className="flex items-center gap-4">
              {totalProducts > 0 && (
                <div className="text-sm text-muted-foreground">
                  Mostrando {((page - 1) * pageSize) + 1} a {Math.min(page * pageSize, totalProducts)} de{' '}
                  <span className="font-medium">{totalProducts.toLocaleString()}</span> productos
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={loading}
                className="gap-2"
              >
                <RotateCcw className={cn('h-4 w-4', loading && 'animate-spin')} />
                Actualizar
              </Button>
            </div>
          </div>

          {/* Filtros */}
          <div className="mb-4">
            <CurationFilters
              filters={globalFilters}
              onFiltersChange={onFiltersChange}
              onRefresh={onRefresh}
              loading={loading}
              showStatusFilter={activeTab === 'all'}
            />
          </div>

          {/* Contenido de cada tab */}
          {tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="mt-0">
              <div className="space-y-4">
                {/* Barra de acciones masivas */}
                {selectedIds.length > 0 && (
                  <BulkActionBar
                    selectedCount={selectedIds.length}
                    onApprove={() => onBulkAction && onBulkAction('approve', selectedIds)}
                    onReject={() => onBulkAction && onBulkAction('reject', selectedIds)}
                    onSendToAI={() => onBulkAction && onBulkAction('send_to_ai', selectedIds)}
                    onChangeBrand={(brandId, brand) => onBulkAction && onBulkAction('change_brand', selectedIds, { brandId, brand })}
                    onChangeCategory={(categoryId, category) => onBulkAction && onBulkAction('change_category', selectedIds, { categoryId, category })}
                    onDelete={() => onBulkAction && onBulkAction('delete', selectedIds)}
                    className="mb-4"
                  />
                )}
                
                {/* Tabla de productos */}
                <div className="rounded-md border">
                  <CurationTable
                    products={products}
                    selectedIds={selectedIds}
                    onSelectionChange={onSelectionChange}
                    onProductUpdate={onProductUpdate}
                    onProductSave={onProductSave}
                    onCurateProduct={onCurateProduct}
                    onProductSendToAI={onSendToAI}
                    onProductApprove={(productId) => onBulkAction && onBulkAction('approve', [productId])}
                    onProductReject={(productId) => onBulkAction && onBulkAction('reject', [productId])}
                    loading={loading}
                  />
                </div>

                {/* Paginación mejorada */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4">
                    <div className="text-sm text-muted-foreground">
                      {selectedIds.length > 0 && (
                        <span className="mr-4">
                          {selectedIds.length} producto{selectedIds.length !== 1 ? 's' : ''} seleccionado{selectedIds.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page <= 1}
                        onClick={() => {/* TODO: Implementar navegación */}}
                      >
                        Anterior
                      </Button>
                      <span className="text-sm text-muted-foreground px-2">
                        Página {page} de {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page >= totalPages}
                        onClick={() => {/* TODO: Implementar navegación */}}
                      >
                        Siguiente
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
