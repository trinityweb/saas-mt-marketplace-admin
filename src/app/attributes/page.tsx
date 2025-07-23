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

import { Button } from '@/components/shared-ui/atoms/button';
import { Badge } from '@/components/shared-ui/atoms/badge';
import { Card } from '@/components/shared-ui/molecules/card';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/shared-ui/organisms/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/shared-ui/molecules/dropdown-menu';

import { marketplaceApi, TenantCustomAttribute, MarketplaceAttribute } from '@/lib/api';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { useHeader } from '@/components/layout/admin-layout';
import { CriteriaDataTable, CriteriaResponse, SearchCriteria } from '@/components/ui/criteria-data-table';
import { useTableCriteria } from '@/hooks/use-table-criteria';
import { Filter as FilterType } from '@/components/ui/table-toolbar';
import { ColumnDef } from '@tanstack/react-table';
import { useMarketplaceAttributes } from '@/hooks/use-marketplace-attributes';

export default function AttributesPage() {
  const { token } = useAuth();
  const { 
    attributes, 
    loading, 
    deleteAttribute
  } = useMarketplaceAttributes({ adminToken: token || undefined });
  const { setHeaderProps, clearHeaderProps } = useHeader();
  
  const [selectedAttribute, setSelectedAttribute] = useState<MarketplaceAttribute | null>(null);

  // Estado para paginación simulada
  const [criteriaResponse, setCriteriaResponse] = useState<CriteriaResponse<MarketplaceAttribute>>({
    data: [],
    total_count: 0,
    page: 1,
    page_size: 20
  });

  // Icono memoizado para evitar recrear JSX
  const headerIcon = useMemo(() => <Settings className="w-5 h-5 text-white" />, []);

  // Establecer header dinámico
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

  // Función para aplicar filtros y paginación a los datos
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
        attribute.name.toLowerCase().includes(searchTerm) ||
        attribute.type.toLowerCase().includes(searchTerm) ||
        (attribute.options?.some(val => val.toLowerCase().includes(searchTerm)) ?? false)
      );
    }

    // Aplicar filtro de estado activo
    if (criteria.is_active && criteria.is_active !== 'all') {
      const isActive = criteria.is_active === 'true';
      filtered = filtered.filter(attribute => attribute.is_active === isActive);
    }

    // Aplicar filtro de tipo de atributo
    if (criteria.marketplace_attribute_id) {
      const attributeType = criteria.marketplace_attribute_id.toLowerCase();
      filtered = filtered.filter(attribute => 
        attribute.type.toLowerCase().includes(attributeType) ||
        attribute.name.toLowerCase().includes(attributeType)
      );
    }

    // Aplicar ordenamiento
    if (criteria.sort_by) {
      filtered.sort((a, b) => {
        const sortKey = criteria.sort_by as string;
        
        // Verificar si la clave es válida para ordenar
        if (!Object.prototype.hasOwnProperty.call(a, sortKey) || !Object.prototype.hasOwnProperty.call(b, sortKey)) {
          return 0;
        }
        
        // Acceder a los valores de forma segura
        const aValue = (a as any)[sortKey];
        const bValue = (b as any)[sortKey];
        
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;
        
        // Manejar diferentes tipos de valores
        let comparison = 0;
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          comparison = aValue.localeCompare(bValue);
        } else if (typeof aValue === 'number' && typeof bValue === 'number') {
          comparison = aValue - bValue;
        } else if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
          comparison = aValue === bValue ? 0 : aValue ? 1 : -1;
        } else {
          // Para otros tipos, convertir a string y comparar
          comparison = String(aValue).localeCompare(String(bValue));
        }
        
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
      // Simular búsqueda y filtrado
      applyFiltersAndPagination(criteria);
    }
  });

  // Filtros configurables para atributos
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
      key: 'marketplace_attribute_id',
      placeholder: 'Filtrar por tipo de atributo...',
      value: criteriaState.criteria.marketplace_attribute_id || '',
      onChange: (value) => criteriaState.handleFilterChange('marketplace_attribute_id', value)
    }
  ], [criteriaState]);

  // Función para obtener el color del badge de estado
  const getStatusBadgeColor = (isActive: boolean) => {
    return isActive 
      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
  };

  // Columnas de la tabla
  const columns: ColumnDef<MarketplaceAttribute>[] = useMemo(() => [
    {
      accessorKey: 'type',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Tipo de Atributo
        </Button>
      ),
      cell: ({ row }) => {
        const attribute = row.original;
        return (
          <div className="font-medium">
            {attribute.type}
          </div>
        );
      },
    },
    {
      accessorKey: 'options',
      header: 'Valores Personalizados',
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
          <Badge className={getStatusBadgeColor(attribute.is_active)}>
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
            `¿Estás seguro de que quieres eliminar el atributo "${attribute.name || attribute.type}"?\n\nEsta acción no se puede deshacer.`
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
              <DropdownMenuItem onClick={() => setSelectedAttribute(attribute)}>
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
                className="text-red-600"
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
      {/* Tabla de atributos con filtros modernos */}
      <CriteriaDataTable<MarketplaceAttribute, unknown>
        data={criteriaResponse.data}
        columns={columns}
        totalCount={criteriaResponse.total_count}
        currentPage={criteriaResponse.page}
        pageSize={criteriaResponse.page_size}
        loading={loading}
        searchPlaceholder="Buscar atributos por tipo o valores..."
        searchValue={criteriaState.criteria.search || ''}
        onSearchChange={(value) => criteriaState.handleFilterChange('search', value)}
        onPageChange={(page) => criteriaState.handleFilterChange('page', page)}
        onPageSizeChange={(pageSize) => criteriaState.handleFilterChange('page_size', pageSize)}
        customActions={
          <Button asChild>
            <Link href="/attributes/create">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Atributo
            </Link>
          </Button>
        }
      />

      {/* Modal de detalle del atributo */}
      <Dialog open={!!selectedAttribute} onOpenChange={() => setSelectedAttribute(null)}>
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
                    <Badge className={getStatusBadgeColor(selectedAttribute.is_active)}>
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
                  )) || []}
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
                <Button variant="outline" onClick={() => setSelectedAttribute(null)}>
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