'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Plus, 
  Settings,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import Link from 'next/link';

// Importaciones desde shared-ui
import { 
  Button,
  Badge,
  Card,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  cn
} from '@/components/shared-ui';

import { marketplaceApi, MarketplaceAttribute } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { useHeader } from '@/components/layout/admin-layout';
import { CriteriaDataTable, CriteriaResponse, SearchCriteria } from '@/components/ui/criteria-data-table';
import { useTableCriteria } from '@/hooks/use-table-criteria';
import { Filter as FilterType } from '@/components/ui/table-toolbar';
import { ColumnDef } from '@tanstack/react-table';
import { useMarketplaceAttributes } from '@/hooks/use-marketplace-attributes';

export default function AttributesPageRefactored() {
  const { token } = useAuth();
  const { 
    attributes, 
    loading, 
    deleteAttribute
  } = useMarketplaceAttributes({ adminToken: token || undefined });
  const { setHeaderProps, clearHeaderProps } = useHeader();
  
  const [selectedAttribute, setSelectedAttribute] = useState<MarketplaceAttribute | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  // Estado para paginación simulada
  const [criteriaResponse, setCriteriaResponse] = useState<CriteriaResponse<MarketplaceAttribute>>({
    data: [],
    total_count: 0,
    page: 1,
    page_size: 20
  });

  // Icono memoizado
  const headerIcon = useMemo(() => <Settings className="w-5 h-5 text-white" />, []);

  // Configurar header
  useEffect(() => {
    setHeaderProps({
      title: 'Atributos Personalizados',
      subtitle: 'Gestión de valores personalizados para atributos del marketplace',
      backUrl: '/',
      backLabel: 'Volver al Dashboard',
      icon: headerIcon
    });

    return () => {
      clearHeaderProps();
    };
  }, [setHeaderProps, clearHeaderProps, headerIcon]);

  // Función para aplicar filtros y paginación
  const applyFiltersAndPagination = useCallback((criteria: SearchCriteria) => {
    if (!attributes) {
      setCriteriaResponse({
        data: [],
        total_count: 0,
        page: 1,
        page_size: 20
      });
      return;
    }
    
    let filtered = [...attributes];

    // Aplicar filtro de búsqueda
    if (criteria.search) {
      const searchTerm = criteria.search.toLowerCase();
      filtered = filtered.filter(attribute =>
        (attribute.code || '').toLowerCase().includes(searchTerm) ||
        (attribute.name || '').toLowerCase().includes(searchTerm) ||
        (attribute.options || []).some(val => val.toLowerCase().includes(searchTerm))
      );
    }

    // Aplicar filtro de estado activo
    if (criteria.is_active && criteria.is_active !== 'all') {
      const isActive = criteria.is_active === 'true';
      filtered = filtered.filter(attribute => attribute.is_active === isActive);
    }

    // Aplicar filtro de tipo de atributo
    if (criteria.type) {
      const attributeType = criteria.type.toLowerCase();
      filtered = filtered.filter(attribute => 
        (attribute.type || '').toLowerCase().includes(attributeType)
      );
    }

    // Aplicar ordenamiento
    if (criteria.sort_by) {
      filtered.sort((a, b) => {
        const aValue = a[criteria.sort_by as keyof MarketplaceAttribute];
        const bValue = b[criteria.sort_by as keyof MarketplaceAttribute];
        
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;
        
        const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        return criteria.sort_dir === 'desc' ? -comparison : comparison;
      });
    }

    // Aplicar paginación
    const page = criteria.page || 1;
    const pageSize = criteria.page_size || 20;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = filtered.slice(startIndex, endIndex);

    setCriteriaResponse({
      data: paginatedData,
      total_count: filtered.length,
      page,
      page_size: pageSize
    });
  }, [attributes]);

  // Hook para manejar criterios de búsqueda
  const criteriaState = useTableCriteria({
    defaultPageSize: 20,
    onSearch: (criteria: SearchCriteria) => {
      applyFiltersAndPagination(criteria);
    }
  });

  // Filtros configurables
  const attributeFilters: FilterType[] = useMemo(() => [
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
      key: 'type',
      placeholder: 'Filtrar por tipo de atributo...',
      value: criteriaState.criteria.type || '',
      onChange: (value) => criteriaState.handleFilterChange('type', value)
    }
  ], [criteriaState]);

  // Columnas de la tabla con componentes shared-ui
  const columns: ColumnDef<MarketplaceAttribute>[] = useMemo(() => [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Nombre del Atributo
        </Button>
      ),
      cell: ({ row }) => {
        const attribute = row.original;
        return (
          <div className="font-medium">
            {attribute.name || 'Sin nombre'}
          </div>
        );
      },
    },
    {
      accessorKey: 'type',
      header: 'Tipo',
      cell: ({ row }) => {
        const attribute = row.original;
        return (
          <Badge variant="outline" className="text-xs">
            {attribute.type}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'options',
      header: 'Opciones',
      cell: ({ row }) => {
        const attribute = row.original;
        const options = attribute.options || [];
        return (
          <div className="max-w-xs">
            <div className="flex flex-wrap gap-1">
              {options.slice(0, 3).map((value, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {value}
                </Badge>
              ))}
              {options.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{options.length - 3} más
                </Badge>
              )}
              {options.length === 0 && (
                <span className="text-muted-foreground text-xs">Sin opciones</span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'is_active',
      header: 'Estado',
      cell: ({ row }) => {
        const attribute = row.original;
        return (
          <Badge variant={attribute.is_active ? 'success' : 'secondary'}>
            {attribute.is_active ? (
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
        );
      },
    },
    {
      accessorKey: 'updated_at',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Actualizado
        </Button>
      ),
      cell: ({ row }) => {
        const attribute = row.original;
        return (
          <div className="text-sm text-muted-foreground">
            {new Date(attribute.updated_at).toLocaleDateString()}
          </div>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const attribute = row.original;

        const handleDeleteAttribute = async () => {
          const confirmed = window.confirm(
            `¿Estás seguro de que quieres eliminar el atributo "${attribute.name || 'Sin nombre'}"?\n\nEsta acción no se puede deshacer.`
          );

          if (!confirmed) return;

          try {
            await deleteAttribute(attribute.id);
            console.log('Attribute deleted successfully');
          } catch (error) {
            console.error('Failed to delete attribute:', error);
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
              <DropdownMenuItem onClick={() => {
                setSelectedAttribute(attribute);
                setShowDetailsDialog(true);
              }}>
                <Eye className="mr-2 h-4 w-4" />
                Ver detalle
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/attributes/edit/${attribute.id}`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDeleteAttribute}
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
  ], [deleteAttribute]);

  // Actualizar datos cuando cambien los atributos
  useEffect(() => {
    if (attributes && attributes.length >= 0) {
      applyFiltersAndPagination(criteriaState.criteria);
    }
  }, [attributes, criteriaState.criteria, applyFiltersAndPagination]);

  return (
    <div className="space-y-6">
      {/* Tabla de atributos con filtros */}
      <CriteriaDataTable
        columns={columns}
        data={criteriaResponse.data}
        totalCount={criteriaResponse.total_count}
        currentPage={criteriaResponse.page}
        pageSize={criteriaResponse.page_size}
        loading={loading}
        searchValue={criteriaState.criteria.search || ''}
        searchPlaceholder="Buscar atributos por tipo o valores..."
        buttonText="Nuevo Atributo"
        filters={attributeFilters}
        customActions={
          <Button asChild>
            <Link href="/attributes/create">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Atributo
            </Link>
          </Button>
        }
        onCreateClick={() => window.location.href = '/attributes/create'}
        onSearchChange={criteriaState.handleSearchChange}
        onPageChange={criteriaState.handlePageChange}
        onPageSizeChange={criteriaState.handlePageSizeChange}
        onSortChange={criteriaState.handleSortChange}
      />

      {/* Dialog de detalle usando shared-ui */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalle del Atributo</DialogTitle>
            <DialogDescription>
              Información completa del atributo personalizado
            </DialogDescription>
          </DialogHeader>
          
          {selectedAttribute && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Tipo de Atributo
                  </label>
                  <p className="text-sm font-medium">
                    {selectedAttribute.type}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Estado
                  </label>
                  <div className="mt-1">
                    <Badge variant={selectedAttribute.is_active ? 'success' : 'secondary'}>
                      {selectedAttribute.is_active ? (
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
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Valores Personalizados ({selectedAttribute.options?.length || 0})
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedAttribute.options?.map((value, index) => (
                    <Badge key={index} variant="outline">
                      {value}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Creado
                  </label>
                  <p>{new Date(selectedAttribute.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Actualizado
                  </label>
                  <p>{new Date(selectedAttribute.updated_at).toLocaleString()}</p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
                  Cerrar
                </Button>
                <Button asChild>
                  <Link href={`/attributes/edit/${selectedAttribute.id}`}>
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}