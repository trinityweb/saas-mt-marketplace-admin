'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  TreePine,
  Layers,
  CheckCircle,
  XCircle
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { MarketplaceCategory, MarketplaceCategoryFilters, marketplaceApi } from '@/lib/api';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { useHeader } from '@/components/layout/admin-layout';
import { CriteriaDataTable, CriteriaResponse } from '@/components/ui/criteria-data-table';
import { Filter as FilterType } from '@/components/ui/table-toolbar';
import { ColumnDef } from '@tanstack/react-table';
import { useTableCriteria } from '@/hooks/use-table-criteria';

export default function TaxonomyPageOriginal() {
  const { token } = useAuth();
  const { setHeaderProps, clearHeaderProps } = useHeader();
  
  const [selectedCategory, setSelectedCategory] = useState<MarketplaceCategory | null>(null);

  // Hook para manejar criterios de búsqueda
  const criteriaState = useTableCriteria({
    defaultPageSize: 20,
    onSearch: (criteria) => {
      console.log('Search criteria:', criteria);
    }
  });

  // Estado para datos de la tabla
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [criteriaResponse, setCriteriaResponse] = useState<CriteriaResponse<MarketplaceCategory>>({
    data: [],
    total_count: 0,
    page: 1,
    page_size: 20
  });

  // Función para cargar datos directamente
  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const filters: MarketplaceCategoryFilters = {
        page: criteriaState.criteria.page,
        page_size: criteriaState.criteria.page_size,
        sort_by: criteriaState.criteria.sort_by,
        sort_dir: criteriaState.criteria.sort_dir,
        search: criteriaState.criteria.search,
        is_active: criteriaState.criteria.is_active === 'true' ? true : criteriaState.criteria.is_active === 'false' ? false : undefined,
        parent_id: criteriaState.criteria.parent_id,
      };

      console.log('🔄 Loading marketplace categories with criteria:', criteriaState.criteria);
      const response = await marketplaceApi.getAllMarketplaceCategories(filters, token || undefined);
      
      if (response.error) {
        throw new Error(response.error);
      }

      console.log('📦 Received categories response:', {
        categories_count: response.data?.categories?.length || 0,
        total: response.data?.pagination?.total || 0,
        page: criteriaState.criteria.page,
        first_category: response.data?.categories?.[0]?.name,
        first_3_categories: response.data?.categories?.slice(0, 3)?.map(c => c.name)
      });

      const categories = response.data?.categories || [];
      const pagination = response.data?.pagination || { total: 0, offset: 0, limit: 20, has_next: false, has_prev: false, total_pages: 0 };

      // Solo actualizar criteriaResponse, no categories separado
      setCriteriaResponse({
        data: categories,
        total_count: pagination.total,
        page: criteriaState.criteria.page,
        page_size: criteriaState.criteria.page_size
      });
    } catch (err: any) {
      console.error('Error loading marketplace categories:', err);
      setError(err.message || 'Error al cargar categorías');
      setCriteriaResponse({
        data: [],
        total_count: 0,
        page: criteriaState.criteria.page,
        page_size: criteriaState.criteria.page_size
      });
    } finally {
      setLoading(false);
    }
  }, [criteriaState.criteria, token]);

  // Función para eliminar categoría
  const deleteCategory = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/pim/marketplace-categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error al eliminar categoría: ${response.status}`);
      }

      await loadCategories(); // Recargar datos
      return true;
    } catch (err: any) {
      console.error('Error deleting category:', err);
      setError(err.message || 'Error al eliminar categoría');
      return false;
    }
  }, [loadCategories, token]);

  // Icono memoizado para evitar recrear JSX
  const headerIcon = useMemo(() => <Layers className="w-5 h-5 text-white" />, []);

  // Establecer header dinámico
  useEffect(() => {
    const currentStart = criteriaResponse.total_count > 0 ? ((criteriaResponse.page - 1) * criteriaResponse.page_size + 1) : 0;
    const currentEnd = Math.min(criteriaResponse.page * criteriaResponse.page_size, criteriaResponse.total_count);

    setHeaderProps({
      title: 'Taxonomía Marketplace',
      subtitle: `Gestión de categorías globales del marketplace (${currentStart}-${currentEnd} de ${criteriaResponse.total_count})`,
      backUrl: '/',
      backLabel: 'Volver al Dashboard',
      icon: headerIcon
    });

    return () => {
      clearHeaderProps();
    };
  }, [setHeaderProps, clearHeaderProps, headerIcon, criteriaResponse]);

  // Cargar datos cuando cambien los criterios
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadCategories();
    }, 100); // Pequeño debounce para evitar múltiples llamadas

    return () => clearTimeout(timeoutId);
  }, [loadCategories]);

  const getCategoryPath = useCallback((category: MarketplaceCategory): string => {
    if (!category.parent_id) return category.name;

    const parent = criteriaResponse.data.find(c => c.id === category.parent_id);
    if (!parent) return category.name;

    return `${getCategoryPath(parent)} > ${category.name}`;
  }, [criteriaResponse.data]);

  const getLevelBadgeColor = (level: number) => {
    switch (level) {
      case 0: return 'bg-blue-100 text-blue-800';
      case 1: return 'bg-green-100 text-green-800';
      case 2: return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDeleteCategory = useCallback(async (categoryId: string) => {
    const category = criteriaResponse.data.find(c => c.id === categoryId);
    if (!category) return;

    const confirmed = window.confirm(
      `¿Estás seguro de que quieres eliminar la categoría "${category.name}"?\n\nEsta acción no se puede deshacer.`
    );

    if (!confirmed) return;

    const success = await deleteCategory(categoryId);
    if (success) {
      console.log('Category deleted successfully');
    } else {
      console.error('Failed to delete category');
    }
  }, [criteriaResponse.data, deleteCategory]);

  const categoryFilters: FilterType[] = useMemo(() => [
    {
      type: 'select',
      key: 'is_active',
      placeholder: 'Estado',
      value: criteriaState.criteria.is_active || 'all',
      onChange: (value) => criteriaState.handleFilterChange('is_active', value === 'all' ? undefined : value),
      options: [
        { value: 'all', label: 'Todos los estados' },
        { value: 'true', label: 'Activas' },
        { value: 'false', label: 'Inactivas' }
      ]
    },
    {
      type: 'input',
      key: 'parent_id',
      placeholder: 'Filtrar por ID de padre...',
      value: criteriaState.criteria.parent_id || '',
      onChange: (value) => criteriaState.handleFilterChange('parent_id', value)
    }
  ], [criteriaState]);

  const columns: ColumnDef<MarketplaceCategory>[] = useMemo(() => [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Categoría
        </Button>
      ),
      cell: ({ row }) => {
        const category = row.original;
        return (
          <div className="flex items-center gap-3">
            <TreePine className="w-4 h-4 text-muted-foreground" />
            <div>
              <div className="font-medium">{category.name}</div>
              {category.description && (
                <div className="text-sm text-muted-foreground">
                  {category.description}
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'path',
      header: 'Ruta',
      cell: ({ row }) => {
        const category = row.original;
        return (
          <div className="text-sm text-muted-foreground">
            {getCategoryPath(category)}
          </div>
        );
      },
    },
    {
      accessorKey: 'level',
      header: 'Nivel',
      cell: ({ row }) => {
        const category = row.original;
        return (
          <Badge className={getLevelBadgeColor(category.level)}>
            Nivel {category.level}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'slug',
      header: 'Slug',
      cell: ({ row }) => (
        <code className="text-sm bg-muted px-1.5 py-0.5 rounded">
          {row.original.slug}
        </code>
      ),
    },
    {
      accessorKey: 'is_active',
      header: 'Estado',
      cell: ({ row }) => {
        const category = row.original;
        return (
          <Badge variant={category.is_active ? "default" : "secondary"}>
            {category.is_active ? (
              <>
                <CheckCircle className="w-3 h-3 mr-1" />
                Activa
              </>
            ) : (
              <>
                <XCircle className="w-3 h-3 mr-1" />
                Inactiva
              </>
            )}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => {
        const category = row.original;

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
                Ver detalles
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/taxonomy/${category.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => handleDeleteCategory(category.id)}
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
  ], [getCategoryPath, getLevelBadgeColor, handleDeleteCategory]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Error al cargar categorías</h3>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  // Debug: Log antes de renderizar
  console.log('🎯 About to render CriteriaDataTable with:', {
    data_count: criteriaResponse.data.length,
    first_3_items: criteriaResponse.data.slice(0, 3).map(c => c.name),
    page: criteriaResponse.page,
    total: criteriaResponse.total_count
  });

  return (
    <div className="container mx-auto py-6">
      <CriteriaDataTable
        key={`${criteriaResponse.page}-${criteriaResponse.data.length}-${criteriaResponse.data[0]?.id || 'empty'}`}
        columns={columns}
        data={criteriaResponse.data}
        totalCount={criteriaResponse.total_count}
        currentPage={criteriaResponse.page}
        pageSize={criteriaResponse.page_size}
        loading={loading}
        searchValue={criteriaState.criteria.search || ''}
        searchPlaceholder="Buscar categorías..."
        buttonText="Nueva Categoría"
        filters={categoryFilters}
        onCreateClick={() => window.location.href = '/taxonomy/create'}
        onSearchChange={criteriaState.handleSearchChange}
        onPageChange={criteriaState.handlePageChange}
        onPageSizeChange={criteriaState.handlePageSizeChange}
        onSortChange={criteriaState.handleSortChange}
        showSearch={true}
      />

      {/* Modal de detalles */}
      <Dialog open={!!selectedCategory} onOpenChange={() => setSelectedCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedCategory && (
                <div className="flex items-center gap-3">
                  <TreePine className="w-5 h-5" />
                  {selectedCategory.name}
                </div>
              )}
            </DialogTitle>
            <DialogDescription>
              Información detallada de la categoría
            </DialogDescription>
          </DialogHeader>
          {selectedCategory && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Slug</label>
                  <p className="text-sm text-muted-foreground">{selectedCategory.slug}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Nivel</label>
                  <div className="mt-1">
                    <Badge className={getLevelBadgeColor(selectedCategory.level)}>
                      Nivel {selectedCategory.level}
                    </Badge>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Descripción</label>
                <p className="text-sm text-muted-foreground">
                  {selectedCategory.description || 'Sin descripción'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Ruta completa</label>
                <p className="text-sm text-muted-foreground">
                  {getCategoryPath(selectedCategory)}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Estado</label>
                  <div className="mt-1">
                    <Badge variant={selectedCategory.is_active ? "default" : "secondary"}>
                      {selectedCategory.is_active ? 'Activa' : 'Inactiva'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Creado</label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedCategory.created_at).toLocaleDateString()}
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