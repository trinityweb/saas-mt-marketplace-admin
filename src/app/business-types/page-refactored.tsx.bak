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
  LucideIcon
} from 'lucide-react';

// Importaciones desde shared-ui
import { 
  Button, 
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  FormField,
  Input,
  Label,
  Separator
} from '@/shared-ui';

// Importaciones locales que aún no están en shared-ui
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { useHeader } from '@/components/layout/admin-layout';
import { CriteriaDataTable, CriteriaResponse, SearchCriteria } from '@/components/ui/criteria-data-table';
import { useTableCriteria } from '@/hooks/use-table-criteria';
import { Filter as FilterType } from '@/components/ui/table-toolbar';
import { ColumnDef } from '@tanstack/react-table';
import { businessTypesApi, BusinessType, BusinessTypesFilters } from '@/lib/api/business-types';

export default function BusinessTypesPageRefactored() {
  const { token } = useAuth();
  const { setHeaderProps, clearHeaderProps } = useHeader();
  
  const [selectedBusinessType, setSelectedBusinessType] = useState<BusinessType | null>(null);

  // Hook para manejar criterios de búsqueda
  const criteriaState = useTableCriteria({
    defaultPageSize: 20,
    onSearch: (criteria: SearchCriteria) => {
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

  // Función para cargar datos
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

      const response = await businessTypesApi.getBusinessTypes(filters);
      
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
        page: criteriaState.criteria.page,
        page_size: criteriaState.criteria.page_size
      });
    } finally {
      setLoading(false);
    }
  }, [criteriaState.criteria]);

  // Función para eliminar business type
  const deleteBusinessType = useCallback(async (id: string): Promise<boolean> => {
    try {
      await businessTypesApi.deleteBusinessType(id);
      await loadBusinessTypes();
      return true;
    } catch (err: any) {
      console.error('Error deleting business type:', err);
      setError(err.message || 'Error al eliminar tipo de negocio');
      return false;
    }
  }, [loadBusinessTypes]);

  // Icono memoizado
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
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [loadBusinessTypes]);

  // Filtros configurables
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

  // Función para obtener el componente del icono
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
    
    return iconMap[iconName] || Store;
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
      header: 'Descripción',
      cell: ({ row }) => (
        <div className="max-w-xs truncate">
          {row.original.description || 'Sin descripción'}
        </div>
      ),
    },
    {
      accessorKey: 'is_active',
      header: 'Estado',
      cell: ({ row }) => (
        <Badge variant={row.original.is_active ? 'success' : 'danger'}>
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
      header: 'Orden',
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
  ], [deleteBusinessType, getIconComponent]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="text-center">
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold">Error al cargar tipos de negocio</h3>
              <p className="text-muted-foreground mt-2">{error}</p>
              <Button 
                onClick={loadBusinessTypes} 
                className="mt-4"
                variant="outline"
              >
                Reintentar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
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
      />

      {/* Modal de detalles usando Dialog (aún no migrado) */}
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
                <FormField label="Código">
                  <p className="text-sm text-muted-foreground">{selectedBusinessType.code}</p>
                </FormField>
                <FormField label="Estado">
                  <Badge variant={selectedBusinessType.is_active ? 'success' : 'danger'}>
                    {selectedBusinessType.is_active ? 'Activo' : 'Inactivo'}
                  </Badge>
                </FormField>
              </div>
              <FormField label="Descripción">
                <p className="text-sm text-muted-foreground">
                  {selectedBusinessType.description || 'Sin descripción'}
                </p>
              </FormField>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Orden">
                  <p className="text-sm text-muted-foreground">{selectedBusinessType.sort_order}</p>
                </FormField>
                <FormField label="Creado">
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedBusinessType.created_at).toLocaleDateString()}
                  </p>
                </FormField>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}