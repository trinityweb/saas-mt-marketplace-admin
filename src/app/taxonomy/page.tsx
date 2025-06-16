'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Plus, 
  TreePine,
  Layers,
  CheckCircle,
  XCircle,
  ArrowUpDown,
  Table as TableIcon,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
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

import { MarketplaceCategory } from '@/lib/api';
import Link from 'next/link';
import { CategoryTree } from '@/components/category-tree';
import { useMarketplaceCategories } from '@/hooks/use-marketplace-categories';
import { useAuth } from '@/hooks/use-auth';
import { useHeader } from '@/components/layout/admin-layout';
import { CriteriaDataTable, CriteriaResponse, SearchCriteria } from '@/components/ui/criteria-data-table';
import { useTableCriteria } from '@/hooks/use-table-criteria';
import { Filter as FilterType } from '@/components/ui/table-toolbar';
import { ColumnDef } from '@tanstack/react-table';

export default function TaxonomyPage() {
  const { token } = useAuth();
  const { 
    categories, 
    loading, 
    deleteCategory
  } = useMarketplaceCategories({ adminToken: token || undefined });
  const { setHeaderProps, clearHeaderProps } = useHeader();
  
  const [selectedCategory, setSelectedCategory] = useState<MarketplaceCategory | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'tree'>('table');

  // Estado para paginación simulada
  const [criteriaResponse, setCriteriaResponse] = useState<CriteriaResponse<MarketplaceCategory>>({
    data: [],
    total_count: 0,
    page: 1,
    page_size: 20
  });

  // Icono memoizado para evitar recrear JSX
  const headerIcon = useMemo(() => <Layers className="w-5 h-5 text-white" />, []);

  // Establecer header dinámico
  useEffect(() => {
    setHeaderProps({
      title: 'Taxonomía Marketplace',
      subtitle: 'Gestión de categorías globales del marketplace',
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
    let filtered = [...categories];

    // Aplicar filtro de búsqueda
    if (criteria.search) {
      const searchTerm = criteria.search.toLowerCase();
      filtered = filtered.filter(category =>
        category.name.toLowerCase().includes(searchTerm) ||
        category.description?.toLowerCase().includes(searchTerm) ||
        category.slug.toLowerCase().includes(searchTerm)
      );
    }

    // Aplicar filtro de nivel
    if (criteria.level && criteria.level !== 'all') {
      const level = parseInt(criteria.level);
      filtered = filtered.filter(category => category.level === level);
    }

    // Aplicar filtro de estado activo
    if (criteria.is_active && criteria.is_active !== 'all') {
      const isActive = criteria.is_active === 'true';
      filtered = filtered.filter(category => category.is_active === isActive);
    }

    // Aplicar filtro de nombre padre
    if (criteria.parent_name) {
      const parentName = criteria.parent_name.toLowerCase();
      filtered = filtered.filter(category => {
        if (!category.parent_id) return false;
        const parent = categories.find(c => c.id === category.parent_id);
        return parent?.name.toLowerCase().includes(parentName);
      });
    }

    // Aplicar ordenamiento
    if (criteria.sort_by) {
      filtered.sort((a, b) => {
        const aValue = a[criteria.sort_by as keyof MarketplaceCategory];
        const bValue = b[criteria.sort_by as keyof MarketplaceCategory];
        
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
  }, [categories]);

  // Hook para manejar criterios de búsqueda
  const criteriaState = useTableCriteria({
    defaultPageSize: 20,
    onSearch: (criteria: SearchCriteria) => {
      // Simular búsqueda y filtrado
      applyFiltersAndPagination(criteria);
    }
  });

  // Filtros configurables para taxonomy
  const taxonomyFilters: FilterType[] = useMemo(() => [
    {
      type: 'select',
      key: 'level',
      placeholder: 'Filtrar por nivel',
      value: criteriaState.criteria.level || 'all',
      options: [
        { value: 'all', label: 'Todos los niveles' },
        { value: '0', label: 'Nivel 0 (Raíz)' },
        { value: '1', label: 'Nivel 1' },
        { value: '2', label: 'Nivel 2' },
        { value: '3', label: 'Nivel 3+' }
      ],
      onChange: (value) => criteriaState.handleFilterChange('level', value === 'all' ? undefined : value)
    },
    {
      type: 'select',
      key: 'is_active',
      placeholder: 'Estado',
      value: criteriaState.criteria.is_active || 'all',
      options: [
        { value: 'all', label: 'Todos los estados' },
        { value: 'true', label: 'Activas' },
        { value: 'false', label: 'Inactivas' }
      ],
      onChange: (value) => criteriaState.handleFilterChange('is_active', value === 'all' ? undefined : value)
    },
    {
      type: 'input',
      key: 'parent_name',
      placeholder: 'Filtrar por padre...',
      value: criteriaState.criteria.parent_name || '',
      onChange: (value) => criteriaState.handleFilterChange('parent_name', value)
    }
  ], [criteriaState]);

  // Columnas de la tabla
  const columns: ColumnDef<MarketplaceCategory>[] = useMemo(() => [
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
        const category = row.original;
        return (
          <div className="flex flex-col">
            <span className="font-medium">{category.name}</span>
            <span className="text-sm text-muted-foreground">{category.slug}</span>
          </div>
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
      accessorKey: 'parent_id',
      header: 'Categoría Padre',
      cell: ({ row }) => {
        const parentId = row.getValue('parent_id') as string;
        if (!parentId) return <span className="text-muted-foreground">-</span>;
        
        const parent = categories.find(c => c.id === parentId);
        return parent ? parent.name : <span className="text-muted-foreground">Sin padre</span>;
      },
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
      cell: ({ row }) => {
        const isActive = row.getValue('is_active') as boolean;
        return isActive ? (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Activa
          </Badge>
        ) : (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Inactiva
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const category = row.original;

        const handleDeleteCategory = async () => {
          const confirmed = window.confirm(
            `¿Estás seguro de que quieres eliminar la categoría "${category.name}"?\n\nEsta acción no se puede deshacer.`
          );

          if (!confirmed) return;

          const success = await deleteCategory(category.id);
          if (success) {
            console.log('Category deleted successfully');
          } else {
            console.error('Failed to delete category');
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
              <DropdownMenuItem onClick={() => setSelectedCategory(category)}>
                <Eye className="mr-2 h-4 w-4" />
                Ver detalle
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/taxonomy/edit/${category.id}`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDeleteCategory}
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
  ], [categories, deleteCategory]);

  // Actualizar datos cuando cambien las categorías
  useEffect(() => {
    if (categories.length > 0) {
      applyFiltersAndPagination(criteriaState.criteria);
    }
  }, [categories, criteriaState.criteria, applyFiltersAndPagination]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <Layers className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total Categorías</p>
              <p className="text-2xl font-semibold">{categories.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <TreePine className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Categorías Raíz</p>
              <p className="text-2xl font-semibold">
                {categories.filter(c => c.level === 0).length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Activas</p>
              <p className="text-2xl font-semibold">
                {categories.filter(c => c.is_active).length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <XCircle className="w-8 h-8 text-red-500" />
            <div>
              <p className="text-sm text-muted-foreground">Inactivas</p>
              <p className="text-2xl font-semibold">
                {categories.filter(c => !c.is_active).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Categories Content */}
      {viewMode === 'table' ? (
        /* Tabla moderna con filtros y paginado */
        <CriteriaDataTable
          columns={columns}
          data={criteriaResponse.data}
          totalCount={criteriaResponse.total_count}
          currentPage={criteriaResponse.page}
          pageSize={criteriaResponse.page_size}
          loading={loading}
          searchValue={criteriaState.criteria.search || ''}
          searchPlaceholder="Buscar categorías por nombre, descripción o slug..."
          buttonText="Nueva Categoría"
          filters={taxonomyFilters}
          onCreateClick={() => window.location.href = '/taxonomy/create'}
          onSearchChange={criteriaState.handleSearchChange}
          onPageChange={criteriaState.handlePageChange}
          onPageSizeChange={criteriaState.handlePageSizeChange}
          onSortChange={criteriaState.handleSortChange}
          customActions={
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                <TableIcon className="w-4 h-4 mr-2" />
                Tabla
              </Button>
              <Button
                variant={viewMode === 'tree' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('tree')}
              >
                <TreePine className="w-4 h-4 mr-2" />
                Árbol
              </Button>
            </div>
          }
        />
      ) : (
        <Card className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                <TableIcon className="w-4 h-4 mr-2" />
                Tabla
              </Button>
              <Button
                variant={viewMode === 'tree' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('tree')}
              >
                <TreePine className="w-4 h-4 mr-2" />
                Árbol
              </Button>
            </div>
            <Link href="/taxonomy/create">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nueva Categoría
              </Button>
            </Link>
          </div>
          <CategoryTree 
            categories={categories}
            onViewDetails={setSelectedCategory}
            onDelete={deleteCategory}
          />
        </Card>
      )}

      {/* Category Details Dialog */}
      {selectedCategory && (
        <Dialog open={!!selectedCategory} onOpenChange={() => setSelectedCategory(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Detalles de Categoría</DialogTitle>
              <DialogDescription>
                Información completa de la categoría seleccionada
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nombre</label>
                <p className="text-sm text-muted-foreground">{selectedCategory.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Slug</label>
                <p className="text-sm font-mono bg-muted px-2 py-1 rounded">{selectedCategory.slug}</p>
              </div>
              {selectedCategory.description && (
                <div>
                  <label className="text-sm font-medium">Descripción</label>
                  <p className="text-sm text-muted-foreground">{selectedCategory.description}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Nivel</label>
                  <p className="text-sm text-muted-foreground">{selectedCategory.level}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Estado</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedCategory.is_active ? 'Activa' : 'Inactiva'}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Creada</label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedCategory.created_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Actualizada</label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedCategory.updated_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

    </div>
  );
} 