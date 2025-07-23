'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Plus, 
  Users,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Store,
  Utensils,
  Shirt,
  Smartphone,
  Car,
  Building,
  Briefcase,
  ShoppingBag,
  Heart,
  Leaf,
  LucideIcon,
  ArrowUpDown
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { useHeader } from '@/components/layout/admin-layout';
import { CriteriaDataTable, CriteriaResponse, SearchCriteria } from '@/components/ui/criteria-data-table';
import { useTableCriteria } from '@/hooks/use-table-criteria';
import { Filter as FilterType } from '@/components/ui/table-toolbar';
import { ColumnDef } from '@tanstack/react-table';
import { businessTypesApi, BusinessType, BusinessTypesFilters } from '@/lib/api/business-types';

export default function BusinessTypesPage() {
  const { token } = useAuth();
  const { setHeaderProps, clearHeaderProps } = useHeader();
  
  const [selectedBusinessType, setSelectedBusinessType] = useState<BusinessType | null>(null);

  // Hook para manejar criterios de búsqueda - MOVIDO ANTES DE useBusinessTypes
  const criteriaState = useTableCriteria({
    defaultPageSize: 20,
    onSearch: (criteria: SearchCriteria) => {
      // La búsqueda será manejada por useBusinessTypes
      console.log('Search criteria:', criteria);
    }
  });

  // Estado para datos de la tabla
  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [criteriaResponse, setCriteriaResponse] = useState<CriteriaResponse<BusinessType>>({
    data: [],
    total_count: 0,
    page: 1,
    page_size: 20
  });

  // Función para cargar datos directamente
  const loadBusinessTypes = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const filters: BusinessTypesFilters = {
        page: criteriaState.criteria.page,
        page_size: criteriaState.criteria.page_size,
        sort_by: criteriaState.criteria.sort_by,
        sort_dir: criteriaState.criteria.sort_dir,
        search: criteriaState.criteria.search,
        is_active: criteriaState.criteria.is_active === 'true' ? true : criteriaState.criteria.is_active === 'false' ? false : undefined,
      };

      console.log('🔄 Loading business types with criteria:', criteriaState.criteria);
      const response = await businessTypesApi.getBusinessTypes(filters);
      console.log('📦 Received response:', {
        items_count: response.items.length,
        total_count: response.total_count,
        page: response.page,
        first_item: response.items[0]?.name
      });

      setBusinessTypes(response.items);
      setCriteriaResponse({
        data: response.items,
        total_count: response.total_count,
        page: response.page,
        page_size: response.page_size
      });
    } catch (err: any) {
      console.error('Error loading business types:', err);
      setError(err.message || 'Error al cargar tipos de negocio');
      setBusinessTypes([]);
      setCriteriaResponse({
        data: [],
        total_count: 0,
        page: criteriaState.criteria.page || 1,
        page_size: criteriaState.criteria.page_size || 10
      });
    } finally {
      setLoading(false);
    }
  }, [criteriaState.criteria]);

  // Función para eliminar business type
  const deleteBusinessType = useCallback(async (id: string): Promise<boolean> => {
    try {
      await businessTypesApi.deleteBusinessType(id);
      await loadBusinessTypes(); // Recargar datos
      return true;
    } catch (err: any) {
      console.error('Error deleting business type:', err);
      setError(err.message || 'Error al eliminar tipo de negocio');
      return false;
    }
  }, [loadBusinessTypes]);

  // Icono memoizado para evitar recrear JSX
  const headerIcon = useMemo(() => <Users className="w-5 h-5 text-white" />, []);

  // Establecer header dinámico
  useEffect(() => {
    setHeaderProps({
      title: 'Tipos de Negocio',
      subtitle: 'Gestión de tipos de negocio para configuración quickstart',
      backUrl: '/',
      backLabel: 'Volver al Dashboard',
      icon: headerIcon
    });

    return () => {
      clearHeaderProps();
    };
  }, [setHeaderProps, clearHeaderProps, headerIcon]);

  // Cargar datos cuando cambien los criterios
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadBusinessTypes();
    }, 100); // Pequeño debounce para evitar múltiples llamadas

    return () => clearTimeout(timeoutId);
  }, [loadBusinessTypes]);

  // Filtros configurables para tipos de negocio
  const businessTypeFilters: FilterType[] = useMemo(() => [
    {
      type: 'select',
      key: 'is_active',
      placeholder: 'Estado',
      value: criteriaState.criteria.is_active || 'all',
      options: [
        { value: 'all', label: 'Todos los estados' },
        { value: 'true', label: 'Activos' },
        { value: 'false', label: 'Inactivos' }
      ],
      onChange: (value) => criteriaState.handleFilterChange('is_active', value === 'all' ? undefined : value)
    },
    {
      type: 'input',
      key: 'code',
      placeholder: 'Filtrar por código...',
      value: criteriaState.criteria.code || '',
      onChange: (value) => criteriaState.handleFilterChange('code', value)
    }
  ], [criteriaState]);

  // Función para obtener el color del badge de estado
  const getStatusBadgeColor = (isActive: boolean) => {
    return isActive 
      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
  };

  // Función para obtener el componente del icono basado en el nombre
  const getIconComponent = (iconName: string): LucideIcon => {
    const iconMap: Record<string, LucideIcon> = {
      'store': Store,
      'utensils': Utensils,
      'shirt': Shirt,
      'smartphone': Smartphone,
      'car': Car,
      'building': Building,
      'briefcase': Briefcase,
      'shopping-bag': ShoppingBag,
      'heart': Heart,
      'leaf': Leaf,
      'users': Users,
    };
    
    return iconMap[iconName] || Store; // Store como icono por defecto
  };

  // Columnas de la tabla
  const columns: ColumnDef<BusinessType>[] = useMemo(() => [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Nombre
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const businessType = row.original;
        const IconComponent = getIconComponent(businessType.icon || 'store');
        
        return (
          <div className="flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
              style={{ backgroundColor: businessType.color || '#3B82F6' }}
            >
              <IconComponent className="w-4 h-4" />
            </div>
            <div>
              <div className="font-medium">{businessType.name}</div>
              <div className="text-sm text-muted-foreground">{businessType.code}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'description',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Descripción
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="max-w-xs truncate">
          {row.original.description || 'Sin descripción'}
        </div>
      ),
    },
    {
      accessorKey: 'is_active',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Estado
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <Badge className={getStatusBadgeColor(row.original.is_active)}>
          {row.original.is_active ? (
            <>
              <CheckCircle className="w-3 h-3 mr-1" />
              Activo
            </>
          ) : (
            <>
              <XCircle className="w-3 h-3 mr-1" />
              Inactivo
            </>
          )}
        </Badge>
      ),
    },
    {
      accessorKey: 'sort_order',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Orden
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-sm font-mono">{row.original.sort_order}</span>
      ),
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => {
        const businessType = row.original;

        const handleDeleteBusinessType = async () => {
          if (window.confirm(`¿Estás seguro de que quieres eliminar el tipo de negocio "${businessType.name}"?`)) {
            const success = await deleteBusinessType(businessType.id);
            if (success) {
              console.log('Tipo de negocio eliminado exitosamente');
            }
          }
        };

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setSelectedBusinessType(businessType)}>
                <Eye className="mr-2 h-4 w-4" />
                Ver detalles
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/business-types/${businessType.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleDeleteBusinessType}
                className="text-red-600 dark:text-red-400"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ], [deleteBusinessType, getIconComponent, getStatusBadgeColor]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Error al cargar tipos de negocio</h3>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CriteriaDataTable
        columns={columns}
        data={criteriaResponse.data}
        totalCount={criteriaResponse.total_count}
        currentPage={criteriaResponse.page}
        pageSize={criteriaResponse.page_size}
        loading={loading}
        searchValue={criteriaState.criteria.search || ''}
        searchPlaceholder="Buscar tipos de negocio..."
        buttonText="Crear Tipo de Negocio"
        filters={businessTypeFilters}
        onCreateClick={() => console.log('Create clicked')}
        onSearchChange={criteriaState.handleSearchChange}
        onPageChange={criteriaState.handlePageChange}
        onPageSizeChange={criteriaState.handlePageSizeChange}
        onSortChange={criteriaState.handleSortChange}
        showSearch={true}
        fullWidth={true}
      />

      {/* Modal de detalles */}
      <Dialog open={!!selectedBusinessType} onOpenChange={() => setSelectedBusinessType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedBusinessType && (
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: selectedBusinessType.color || '#3B82F6' }}
                  >
                    {getIconComponent(selectedBusinessType.icon || 'store')({ className: 'w-4 h-4' })}
                  </div>
                  {selectedBusinessType.name}
                </div>
              )}
            </DialogTitle>
            <DialogDescription>
              Información detallada del tipo de negocio
            </DialogDescription>
          </DialogHeader>
          {selectedBusinessType && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Código</label>
                  <p className="text-sm text-muted-foreground">{selectedBusinessType.code}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Estado</label>
                  <div className="mt-1">
                    <Badge className={getStatusBadgeColor(selectedBusinessType.is_active)}>
                      {selectedBusinessType.is_active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Descripción</label>
                <p className="text-sm text-muted-foreground">
                  {selectedBusinessType.description || 'Sin descripción'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Orden</label>
                  <p className="text-sm text-muted-foreground">{selectedBusinessType.sort_order}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Creado</label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedBusinessType.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 