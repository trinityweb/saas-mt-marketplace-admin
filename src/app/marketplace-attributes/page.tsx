'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Settings,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  Filter,
  Tag,
  Hash,
  Check,
  X,
  ArrowUpDown
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { useAuth } from '@/hooks/use-auth';
import { useHeader } from '@/components/layout/admin-layout';
import { useMarketplaceAttributes } from '@/hooks/use-marketplace-attributes';
import { type MarketplaceAttribute } from '@/lib/api';
import { CriteriaDataTable } from '@/components/ui/criteria-data-table';
import { Filter as FilterType } from '@/components/ui/table-toolbar';
import { ColumnDef } from '@tanstack/react-table';

const attributeTypeLabels = {
  text: 'Texto',
  number: 'Número',
  select: 'Selección',
  multi_select: 'Selección Múltiple',
  boolean: 'Sí/No',
  date: 'Fecha'
};

const attributeTypeColors = {
  text: 'bg-blue-100 text-blue-800',
  number: 'bg-green-100 text-green-800',
  select: 'bg-purple-100 text-purple-800',
  multi_select: 'bg-pink-100 text-pink-800',
  boolean: 'bg-yellow-100 text-yellow-800',
  date: 'bg-indigo-100 text-indigo-800'
};

const attributeTypeIcons = {
  text: Hash,
  number: Hash,
  select: Filter,
  multi_select: Filter,
  boolean: Check,
  date: Hash
};

export default function MarketplaceAttributesPage() {
  const router = useRouter();
  const { token } = useAuth();
  const { setHeaderProps, clearHeaderProps } = useHeader();
  
  // Usar el hook personalizado
  const {
    attributes,
    loading,
    stats,
    pagination,
    filters,
    setFilters,
    loadPage,
    updateAttribute,
    deleteAttribute
  } = useMarketplaceAttributes({ adminToken: token });

  // Icono memoizado
  const headerIcon = useMemo(() => <Settings className="w-5 h-5 text-white" />, []);

  // Configurar header con información dinámica de paginación
  useEffect(() => {
    // Asegurar que tenemos datos válidos antes de calcular
    const safeOffset = pagination?.offset || 0;
    const safeLimit = pagination?.limit || 20;
    const safeTotal = pagination?.total || 0;
    
    const currentStart = safeTotal > 0 ? safeOffset + 1 : 0;
    const currentEnd = Math.min(safeOffset + safeLimit, safeTotal);
    
    setHeaderProps({
      title: 'Atributos del Marketplace',
      subtitle: `Gestión de atributos globales para productos (${currentStart}-${currentEnd} de ${safeTotal})`,
      icon: headerIcon
    });

    return () => {
      clearHeaderProps();
    };
  }, [setHeaderProps, clearHeaderProps, headerIcon, pagination]);

  // Obtener grupos únicos para filtros
  const groups = useMemo(() => {
    const uniqueGroups = [...new Set(attributes.map(attr => attr.group_name).filter(Boolean))];
    return uniqueGroups.sort();
  }, [attributes]);

  // Configuración de columnas para la tabla
  const columns: ColumnDef<MarketplaceAttribute>[] = useMemo(() => [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Atributo
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const attribute = row.original;
        return (
          <div className="flex items-center space-x-3">
            <div>
              <div className="font-medium">{attribute.name}</div>
              <div className="text-sm text-muted-foreground">
                Código: {attribute.code}
              </div>
              {attribute.description && (
                <div className="text-xs text-muted-foreground mt-1">
                  {attribute.description.substring(0, 60)}
                  {attribute.description.length > 60 && '...'}
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'type',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Tipo
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const attribute = row.original;
        const TypeIcon = attributeTypeIcons[attribute.type];
        return (
          <Badge className={attributeTypeColors[attribute.type]}>
            <TypeIcon className="w-3 h-3 mr-1" />
            {attributeTypeLabels[attribute.type]}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'group_name',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Grupo
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const attribute = row.original;
        return (
          <div className="flex items-center space-x-2">
            <Tag className="w-3 h-3 text-muted-foreground" />
            <span className="text-sm">{attribute.group_name || 'Sin grupo'}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'properties',
      header: 'Propiedades',
      cell: ({ row }) => {
        const attribute = row.original;
        const properties = [];
        
        if (attribute.is_required) properties.push('Requerido');
        if (attribute.is_filterable) properties.push('Filtrable');
        if (attribute.is_searchable) properties.push('Buscable');
        
        return (
          <div className="flex flex-wrap gap-1">
            {properties.map((prop, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {prop}
              </Badge>
            ))}
            {properties.length === 0 && (
              <span className="text-xs text-muted-foreground">Sin propiedades</span>
            )}
          </div>
        );
      },
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
        <span className="text-sm font-medium">{row.original.sort_order}</span>
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
        <Badge variant={row.original.is_active ? "default" : "secondary"}>
          {row.original.is_active ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => {
        const attribute = row.original;

        const handleView = () => {
          router.push(`/marketplace-attributes/${attribute.id}`);
        };

        const handleEdit = () => {
          router.push(`/marketplace-attributes/${attribute.id}/edit`);
        };

        const handleDelete = async () => {
          if (window.confirm(`¿Estás seguro de que deseas eliminar el atributo "${attribute.name}"?`)) {
            try {
              await deleteAttribute(attribute.id);
            } catch (error) {
              console.error('Error al eliminar atributo:', error);
              alert('Error al eliminar el atributo');
            }
          }
        };

        const handleToggleStatus = async () => {
          try {
            await updateAttribute(attribute.id, {
              is_active: !attribute.is_active
            });
          } catch (error) {
            console.error('Error al cambiar estado:', error);
            alert('Error al cambiar el estado del atributo');
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
              <DropdownMenuItem onClick={handleView}>
                <Eye className="mr-2 h-4 w-4" />
                Ver detalle
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleToggleStatus}>
                {attribute.is_active ? (
                  <>
                    <X className="mr-2 h-4 w-4" />
                    Desactivar
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Activar
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleDelete}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ], [router, updateAttribute, deleteAttribute]);

  // Configuración de filtros
  const tableFilters: FilterType[] = useMemo(() => [
    {
      type: 'select',
      key: 'type',
      placeholder: 'Tipo de atributo',
      value: filters.type || 'all',
      options: [
        { value: 'all', label: 'Todos los tipos' },
        { value: 'text', label: 'Texto' },
        { value: 'number', label: 'Número' },
        { value: 'select', label: 'Selección' },
        { value: 'multi_select', label: 'Selección Múltiple' },
        { value: 'boolean', label: 'Sí/No' },
        { value: 'date', label: 'Fecha' }
      ],
      onChange: (value: string) => setFilters({ type: value === 'all' ? undefined : value })
    },
    {
      type: 'select',
      key: 'group_name',
      placeholder: 'Grupo',
      value: filters.group_name || 'all',
      options: [
        { value: 'all', label: 'Todos los grupos' },
        ...groups.map(group => ({ value: group, label: group }))
      ],
      onChange: (value: string) => setFilters({ group_name: value === 'all' ? undefined : value })
    },
    {
      type: 'select',
      key: 'is_active',
      placeholder: 'Estado',
      value: filters.is_active === undefined ? 'all' : filters.is_active.toString(),
      options: [
        { value: 'all', label: 'Todos los estados' },
        { value: 'true', label: 'Activos' },
        { value: 'false', label: 'Inactivos' }
      ],
      onChange: (value: string) => setFilters({ 
        is_active: value === 'all' ? undefined : value === 'true' 
      })
    },
    {
      type: 'select',
      key: 'is_required',
      placeholder: 'Requerido',
      value: filters.is_required === undefined ? 'all' : filters.is_required.toString(),
      options: [
        { value: 'all', label: 'Requerido (Todos)' },
        { value: 'true', label: 'Requeridos' },
        { value: 'false', label: 'No requeridos' }
      ],
      onChange: (value: string) => setFilters({ 
        is_required: value === 'all' ? undefined : value === 'true' 
      })
    }
  ], [filters, groups, setFilters]);

  // Handlers para la tabla
  const handleCreateClick = () => {
    router.push('/marketplace-attributes/create');
  };

  const handleSearchChange = (value: string) => {
    setFilters({ search: value });
  };

  const handlePageChange = (page: number) => {
    loadPage(page, pagination.limit);
  };

  const handlePageSizeChange = (pageSize: number) => {
    loadPage(1, pageSize);
  };

  const handleSortChange = (sortBy: string, sortDir: 'asc' | 'desc') => {
    setFilters({ sort_by: sortBy, sort_dir: sortDir });
  };

  // Cards de estadísticas
  const statsCards = useMemo(() => [
    {
      title: 'Total de Atributos',
      value: stats.total,
      icon: Settings,
      color: 'bg-blue-500'
    },
    {
      title: 'Atributos Activos',
      value: stats.active,
      icon: Check,
      color: 'bg-green-500'
    },
    {
      title: 'Atributos Inactivos',
      value: stats.inactive,
      icon: X,
      color: 'bg-red-500'
    }
  ], [stats]);

  return (
    <div className="space-y-6">
      {/* Cards de estadísticas */}
      <div className="grid gap-4 md:grid-cols-3">
        {statsCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 text-white p-1 rounded ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabla principal */}
      <CriteriaDataTable
        columns={columns}
        data={attributes}
        totalCount={pagination.total}
        currentPage={pagination.page}
        pageSize={pagination.limit}
        loading={loading}
        searchValue={filters.search || ''}
        searchPlaceholder="Buscar atributos por nombre, código o descripción..."
        buttonText="Crear Atributo"
        filters={tableFilters}
        fullWidth={true}
        onCreateClick={handleCreateClick}
        onSearchChange={handleSearchChange}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onSortChange={handleSortChange}
        showSearch={true}
      />
    </div>
  );
} 