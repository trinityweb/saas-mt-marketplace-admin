'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  Settings,
  CheckCircle,
  XCircle,
  ArrowUpDown,
  Database
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { Filter } from '@/components/ui/table-toolbar';
import { ColumnDef } from '@tanstack/react-table';

// Mock interface para attributes
interface Attribute {
  id: string;
  name: string;
  type: 'text' | 'number' | 'boolean' | 'date' | 'select' | 'multiselect';
  description?: string;
  is_required: boolean;
  is_filterable: boolean;
  is_searchable: boolean;
  default_value?: string;
  options?: string[];
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// Mock data para attributes
const mockAttributes: Attribute[] = [
  {
    id: '1',
    name: 'Color',
    type: 'select',
    description: 'Color principal del producto',
    is_required: false,
    is_filterable: true,
    is_searchable: true,
    options: ['Rojo', 'Azul', 'Verde', 'Negro', 'Blanco'],
    sort_order: 1,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    name: 'Tamaño',
    type: 'select',
    description: 'Tamaño del producto',
    is_required: true,
    is_filterable: true,
    is_searchable: false,
    options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    sort_order: 2,
    created_at: '2024-01-15T10:05:00Z',
    updated_at: '2024-01-15T10:05:00Z',
  },
  {
    id: '3',
    name: 'Material',
    type: 'text',
    description: 'Material principal del producto',
    is_required: false,
    is_filterable: true,
    is_searchable: true,
    sort_order: 3,
    created_at: '2024-01-15T10:10:00Z',
    updated_at: '2024-01-15T10:10:00Z',
  },
  {
    id: '4',
    name: 'Peso',
    type: 'number',
    description: 'Peso del producto en gramos',
    is_required: false,
    is_filterable: true,
    is_searchable: false,
    default_value: '0',
    sort_order: 4,
    created_at: '2024-01-15T10:15:00Z',
    updated_at: '2024-01-15T10:15:00Z',
  },
  {
    id: '5',
    name: 'Es Orgánico',
    type: 'boolean',
    description: 'Indica si el producto es orgánico',
    is_required: false,
    is_filterable: true,
    is_searchable: false,
    default_value: 'false',
    sort_order: 5,
    created_at: '2024-01-15T10:20:00Z',
    updated_at: '2024-01-15T10:20:00Z',
  },
];

export default function AttributesModernPage() {
  const { token } = useAuth();
  const { setHeaderProps, clearHeaderProps } = useHeader();

  // Estado para paginación simulada
  const [criteriaResponse, setCriteriaResponse] = useState<CriteriaResponse<Attribute>>({
    data: [],
    total_count: 0,
    page: 1,
    page_size: 20
  });

  const [loading, setLoading] = useState(false);

  // Icono memoizado para evitar recrear JSX
  const headerIcon = useMemo(() => <Settings className="w-5 h-5 text-white" />, []);

  // Establecer header dinámico
  useEffect(() => {
    setHeaderProps({
      title: 'Atributos de Producto',
      subtitle: 'Gestión de atributos con filtros y paginado avanzado',
      backUrl: '/',
      backLabel: 'Volver al Dashboard',
      icon: headerIcon
    });

    return () => {
      clearHeaderProps();
    };
  }, [setHeaderProps, clearHeaderProps, headerIcon]);

  // Función para aplicar filtros y paginación a los datos
  const applyFiltersAndPagination = (criteria: SearchCriteria) => {
    let filtered = [...mockAttributes];

    // Aplicar filtro de búsqueda
    if (criteria.search) {
      const searchTerm = criteria.search.toLowerCase();
      filtered = filtered.filter(attribute =>
        attribute.name.toLowerCase().includes(searchTerm) ||
        attribute.description?.toLowerCase().includes(searchTerm) ||
        attribute.type.toLowerCase().includes(searchTerm)
      );
    }

    // Aplicar filtro de tipo
    if (criteria.type && criteria.type !== 'all') {
      filtered = filtered.filter(attribute => attribute.type === criteria.type);
    }

    // Aplicar filtro de requerido
    if (criteria.is_required && criteria.is_required !== 'all') {
      const isRequired = criteria.is_required === 'true';
      filtered = filtered.filter(attribute => attribute.is_required === isRequired);
    }

    // Aplicar filtro de filterable
    if (criteria.is_filterable && criteria.is_filterable !== 'all') {
      const isFilterable = criteria.is_filterable === 'true';
      filtered = filtered.filter(attribute => attribute.is_filterable === isFilterable);
    }

    // Aplicar ordenamiento
    if (criteria.sort_by) {
      filtered.sort((a, b) => {
        const aValue = a[criteria.sort_by as keyof Attribute];
        const bValue = b[criteria.sort_by as keyof Attribute];
        
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
  };

  // Hook para manejar criterios de búsqueda
  const criteriaState = useTableCriteria({
    defaultPageSize: 20,
    onSearch: (criteria: SearchCriteria) => {
      // Simular búsqueda y filtrado
      applyFiltersAndPagination(criteria);
    }
  });

  // Filtros configurables para attributes
  const attributeFilters: Filter[] = useMemo(() => [
    {
      type: 'select',
      key: 'type',
      placeholder: 'Filtrar por tipo',
      value: criteriaState.criteria.type || 'all',
      options: [
        { value: 'all', label: 'Todos los tipos' },
        { value: 'text', label: 'Texto' },
        { value: 'number', label: 'Número' },
        { value: 'boolean', label: 'Booleano' },
        { value: 'date', label: 'Fecha' },
        { value: 'select', label: 'Selección' },
        { value: 'multiselect', label: 'Selección Múltiple' }
      ],
      onChange: (value) => criteriaState.handleFilterChange('type', value === 'all' ? undefined : value)
    },
    {
      type: 'select',
      key: 'is_required',
      placeholder: 'Requerido',
      value: criteriaState.criteria.is_required || 'all',
      options: [
        { value: 'all', label: 'Todos' },
        { value: 'true', label: 'Requeridos' },
        { value: 'false', label: 'Opcionales' }
      ],
      onChange: (value) => criteriaState.handleFilterChange('is_required', value === 'all' ? undefined : value)
    },
    {
      type: 'select',
      key: 'is_filterable',
      placeholder: 'Filtrable',
      value: criteriaState.criteria.is_filterable || 'all',
      options: [
        { value: 'all', label: 'Todos' },
        { value: 'true', label: 'Filtrables' },
        { value: 'false', label: 'No filtrables' }
      ],
      onChange: (value) => criteriaState.handleFilterChange('is_filterable', value === 'all' ? undefined : value)
    }
  ], [criteriaState]);

  // Columnas de la tabla
  const columns: ColumnDef<Attribute>[] = useMemo(() => [
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
        const attribute = row.original;
        return (
          <div className="flex flex-col">
            <span className="font-medium">{attribute.name}</span>
            <span className="text-sm text-muted-foreground">ID: {attribute.id}</span>
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
        const type = row.getValue('type') as string;
        const typeColors = {
          text: 'bg-blue-100 text-blue-800',
          number: 'bg-green-100 text-green-800',
          boolean: 'bg-purple-100 text-purple-800',
          date: 'bg-orange-100 text-orange-800',
          select: 'bg-yellow-100 text-yellow-800',
          multiselect: 'bg-pink-100 text-pink-800',
        };

        return (
          <Badge className={typeColors[type as keyof typeof typeColors] || 'bg-gray-100 text-gray-800'}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'description',
      header: 'Descripción',
      cell: ({ row }) => (
        <div className="max-w-[300px] truncate">
          {row.getValue('description') || '-'}
        </div>
      ),
    },
    {
      accessorKey: 'is_required',
      header: 'Requerido',
      cell: ({ row }) => {
        const isRequired = row.getValue('is_required') as boolean;
        return isRequired ? (
          <Badge className="bg-red-100 text-red-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Sí
          </Badge>
        ) : (
          <Badge className="bg-gray-100 text-gray-800">
            <XCircle className="w-3 h-3 mr-1" />
            No
          </Badge>
        );
      },
    },
    {
      accessorKey: 'is_filterable',
      header: 'Filtrable',
      cell: ({ row }) => {
        const isFilterable = row.getValue('is_filterable') as boolean;
        return isFilterable ? (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Sí
          </Badge>
        ) : (
          <Badge className="bg-gray-100 text-gray-800">
            <XCircle className="w-3 h-3 mr-1" />
            No
          </Badge>
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
        <div className="text-sm">
          {row.getValue('sort_order')}
        </div>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const attribute = row.original;

        const handleDeleteAttribute = async () => {
          const confirmed = window.confirm(
            `¿Estás seguro de que quieres eliminar el atributo "${attribute.name}"?\n\nEsta acción no se puede deshacer.`
          );

          if (!confirmed) return;

          // Aquí iría la lógica de eliminación
          console.log('Deleting attribute:', attribute.id);
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
              <DropdownMenuItem asChild>
                <Link href={`/attributes/view/${attribute.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver detalle
                </Link>
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
  ], []);

  // Actualizar datos cuando se carga la página
  useEffect(() => {
    applyFiltersAndPagination(criteriaState.criteria);
  }, []);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <Database className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total Atributos</p>
              <p className="text-2xl font-semibold">{mockAttributes.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-red-500" />
            <div>
              <p className="text-sm text-muted-foreground">Requeridos</p>
              <p className="text-2xl font-semibold">
                {mockAttributes.filter(a => a.is_required).length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <Settings className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Filtrables</p>
              <p className="text-2xl font-semibold">
                {mockAttributes.filter(a => a.is_filterable).length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <Eye className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-sm text-muted-foreground">Buscables</p>
              <p className="text-2xl font-semibold">
                {mockAttributes.filter(a => a.is_searchable).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabla moderna con filtros y paginado */}
      <CriteriaDataTable
        columns={columns}
        data={criteriaResponse.data}
        totalCount={criteriaResponse.total_count}
        currentPage={criteriaResponse.page}
        pageSize={criteriaResponse.page_size}
        loading={loading}
        searchValue={criteriaState.criteria.search || ''}
        searchPlaceholder="Buscar atributos por nombre, descripción o tipo..."
        buttonText="Nuevo Atributo"
        filters={attributeFilters}
        onCreateClick={() => window.location.href = '/attributes/create'}
        onSearchChange={criteriaState.handleSearchChange}
        onPageChange={criteriaState.handlePageChange}
        onPageSizeChange={criteriaState.handlePageSizeChange}
        onSortChange={criteriaState.handleSortChange}
      />
    </div>
  );
} 