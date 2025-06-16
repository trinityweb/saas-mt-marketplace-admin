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

import { BusinessType } from '@/lib/api';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { useHeader } from '@/components/layout/admin-layout';
import { CriteriaDataTable, CriteriaResponse, SearchCriteria } from '@/components/ui/criteria-data-table';
import { useTableCriteria } from '@/hooks/use-table-criteria';
import { Filter as FilterType } from '@/components/ui/table-toolbar';
import { ColumnDef } from '@tanstack/react-table';
import { useBusinessTypes } from '@/hooks/use-business-types';

export default function BusinessTypesPage() {
  const { token } = useAuth();
  const { 
    businessTypes, 
    loading, 
    deleteBusinessType
  } = useBusinessTypes({ adminToken: token || 'dev-marketplace-admin' });
  

  const { setHeaderProps, clearHeaderProps } = useHeader();
  
  const [selectedBusinessType, setSelectedBusinessType] = useState<BusinessType | null>(null);

  // Estado para paginación simulada
  const [criteriaResponse, setCriteriaResponse] = useState<CriteriaResponse<BusinessType>>({
    data: [],
    total_count: 0,
    page: 1,
    page_size: 20
  });

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

  // Función para aplicar filtros y paginación a los datos
  const applyFiltersAndPagination = useCallback((criteria: SearchCriteria) => {
    if (!businessTypes) {
      setCriteriaResponse({
        data: [],
        total_count: 0,
        page: 1,
        page_size: 20
      });
      return;
    }
    
    let filtered = [...businessTypes];

    // Aplicar filtro de búsqueda
    if (criteria.search) {
      const searchTerm = criteria.search.toLowerCase();
      filtered = filtered.filter(businessType =>
        businessType.name.toLowerCase().includes(searchTerm) ||
        businessType.description.toLowerCase().includes(searchTerm) ||
        businessType.code.toLowerCase().includes(searchTerm)
      );
    }

    // Aplicar filtro de estado activo
    if (criteria.is_active && criteria.is_active !== 'all') {
      const isActive = criteria.is_active === 'true';
      filtered = filtered.filter(businessType => businessType.is_active === isActive);
    }

    // Aplicar filtro de código
    if (criteria.code) {
      const codeFilter = criteria.code.toLowerCase();
      filtered = filtered.filter(businessType => 
        businessType.code.toLowerCase().includes(codeFilter)
      );
    }

    // Aplicar ordenamiento
    if (criteria.sort_by) {
      filtered.sort((a, b) => {
        const aValue = a[criteria.sort_by as keyof BusinessType];
        const bValue = b[criteria.sort_by as keyof BusinessType];
        
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
  }, [businessTypes]);

  // Hook para manejar criterios de búsqueda
  const criteriaState = useTableCriteria({
    defaultPageSize: 20,
    onSearch: (criteria: SearchCriteria) => {
      // Simular búsqueda y filtrado
      applyFiltersAndPagination(criteria);
    }
  });

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
        </Button>
      ),
      cell: ({ row }) => {
        const businessType = row.original;
        const IconComponent = getIconComponent(businessType.icon);
        
        return (
          <div className="flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
              style={{ backgroundColor: businessType.color }}
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
      cell: ({ row }) => {
        const businessType = row.original;
        return (
          <div className="max-w-xs">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {businessType.description}
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: 'is_active',
      header: 'Estado',
      cell: ({ row }) => {
        const businessType = row.original;
        return (
          <Badge className={getStatusBadgeColor(businessType.is_active)}>
            {businessType.is_active ? (
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
        const businessType = row.original;
        return (
          <div className="text-sm text-muted-foreground">
            {new Date(businessType.updated_at).toLocaleDateString()}
          </div>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const businessType = row.original;

        const handleDeleteBusinessType = async () => {
          const confirmed = window.confirm(
            `¿Estás seguro de que quieres eliminar el tipo de negocio "${businessType.name}"?\n\nEsta acción no se puede deshacer.`
          );

          if (!confirmed) return;

          const success = await deleteBusinessType(businessType.id);
          if (success) {
            console.log('Business type deleted successfully');
          } else {
            console.error('Failed to delete business type');
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
                Ver detalle
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
  ], [deleteBusinessType]);

  // Actualizar datos cuando cambien los tipos de negocio
  useEffect(() => {
    if (businessTypes && businessTypes.length >= 0) {
      applyFiltersAndPagination(criteriaState.criteria);
    }
  }, [businessTypes, criteriaState.criteria, applyFiltersAndPagination]);

  // Actualizar tabla cuando cambien los business types
  useEffect(() => {
    applyFiltersAndPagination(criteriaState.criteria);
  }, [businessTypes, applyFiltersAndPagination, criteriaState.criteria]);

  return (
    <div className="space-y-6">
      {/* Tabla de tipos de negocio con filtros modernos */}
      <CriteriaDataTable
        data={criteriaResponse.data}
        columns={columns}
        totalCount={criteriaResponse.total_count}
        loading={loading}
        searchPlaceholder="Buscar tipos de negocio por nombre, código o descripción..."
        filters={businessTypeFilters}
        criteriaState={criteriaState}
        customActions={
          <Button asChild>
            <Link href="/business-types/create">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Tipo de Negocio
            </Link>
          </Button>
        }
      />

      {/* Modal de detalle del tipo de negocio */}
      <Dialog open={!!selectedBusinessType} onOpenChange={() => setSelectedBusinessType(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalle del Tipo de Negocio</DialogTitle>
            <DialogDescription>
              Información completa del tipo de negocio
            </DialogDescription>
          </DialogHeader>
          
          {selectedBusinessType && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div 
                  className="w-16 h-16 rounded-lg flex items-center justify-center text-white"
                  style={{ backgroundColor: selectedBusinessType.color }}
                >
                  {(() => {
                    const IconComponent = getIconComponent(selectedBusinessType.icon);
                    return <IconComponent className="w-8 h-8" />;
                  })()}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{selectedBusinessType.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedBusinessType.code}</p>
                  <div className="mt-2">
                    <Badge className={getStatusBadgeColor(selectedBusinessType.is_active)}>
                      {selectedBusinessType.is_active ? (
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
                  Descripción
                </label>
                <p className="mt-1 text-sm">{selectedBusinessType.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Icono
                  </label>
                  <p className="text-sm">{selectedBusinessType.icon}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Color
                  </label>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: selectedBusinessType.color }}
                    />
                    <span className="text-sm">{selectedBusinessType.color}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Creado
                  </label>
                  <p>{new Date(selectedBusinessType.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Actualizado
                  </label>
                  <p>{new Date(selectedBusinessType.updated_at).toLocaleString()}</p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setSelectedBusinessType(null)}>
                  Cerrar
                </Button>
                <Button asChild>
                  <Link href={`/business-types/${selectedBusinessType.id}/edit`}>
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