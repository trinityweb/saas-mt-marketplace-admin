'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { 
  TreePine, 
  Tags, 
  CheckCircle, 
  XCircle, 
  BarChart3,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  List,
  Network,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ArrowUpDown
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/shared-ui/atoms/button';
import { Badge } from '@/components/shared-ui/atoms/badge';
import { Card } from '@/components/shared-ui/molecules/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shared-ui/atoms/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/shared-ui/molecules/dropdown-menu';

import { categoriesApi, Category } from '@/lib/api/categories';
import { useAuth } from '@/hooks/use-auth';
import { useHeader } from '@/components/layout/admin-layout';
import { useMarketplaceOverview } from '@/hooks/use-marketplace-overview';
import { CriteriaDataTable, CriteriaResponse, SearchCriteria } from '@/components/ui/criteria-data-table';
import { Filter as FilterType } from '@/components/ui/table-toolbar';
import { ColumnDef } from '@tanstack/react-table';
import { StatsOverview, StatsMetric } from '@/components/shared-ui/organisms/stats-overview';

// Componente para la vista de árbol
const CategoryTreeView = ({ 
  categories, 
  onEditCategory, 
  onDeleteCategory 
}: { 
  categories: Category[], 
  onEditCategory: (id: string) => void,
  onDeleteCategory: (id: string) => void
}) => {
  // Estado para controlar qué nodos están expandidos
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Función para alternar expansión de un nodo
  const toggleNode = (categoryId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedNodes(newExpanded);
  };

  // Función para expandir todos los nodos
  const expandAll = () => {
    const allIds = new Set<string>();
    const collectIds = (cats: Category[]) => {
      cats.forEach(cat => {
        allIds.add(cat.id);
        const children = categories.filter(c => c.parent_id === cat.id);
        if (children.length > 0) {
          collectIds(children);
        }
      });
    };
    collectIds(categories.filter(cat => !cat.parent_id));
    setExpandedNodes(allIds);
  };

  // Función para colapsar todos los nodos
  const collapseAll = () => {
    setExpandedNodes(new Set());
  };

  // Organizar categorías en estructura de árbol
  const buildCategoryTree = (categories: Category[]) => {
    const rootCategories = categories.filter(cat => !cat.parent_id);
    
    const buildChildren = (parentId: string): Category[] => {
      return categories
        .filter(cat => cat.parent_id === parentId)
        .map(cat => ({
          ...cat,
          children: buildChildren(cat.id)
        }));
    };

    return rootCategories.map(cat => ({
      ...cat,
      children: buildChildren(cat.id)
    }));
  };

  const tree = buildCategoryTree(categories);

  const renderCategoryNode = (category: Category & { children?: Category[] }, level = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedNodes.has(category.id);

    return (
      <div key={category.id} className={`pl-${level * 4}`}>
        <div className="flex items-center justify-between p-3 border rounded-lg mb-2 bg-background hover:bg-accent/50 transition-colors">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {/* Botón de colapsar/expandir */}
              {hasChildren ? (
                <button
                  onClick={() => toggleNode(category.id)}
                  className="p-1 hover:bg-accent rounded transition-colors"
                  title={isExpanded ? 'Colapsar' : 'Expandir'}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              ) : (
                <div className="w-6 h-6" /> // Espaciador para alineación
              )}
              
              <TreePine className={`h-4 w-4 ${level === 0 ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className="font-medium">{category.name}</span>
            </div>
            <Badge variant={category.level > 0 ? 'secondary' : 'default'}>
              Nivel {category.level}
            </Badge>
            <Badge variant={category.is_active ? 'default' : 'danger'}>
              {category.is_active ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Activa
                </>
              ) : (
                <>
                  <XCircle className="h-3 w-3 mr-1" />
                  Inactiva
                </>
              )}
            </Badge>
            {hasChildren && (
              <Badge variant="outline" className="text-xs">
                {category.children?.length} subcategoría{category.children?.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              {category.description || 'Sin descripción'}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver detalles
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEditCategory(category.id)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                {hasChildren && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => toggleNode(category.id)}>
                      {isExpanded ? (
                        <>
                          <ChevronUp className="mr-2 h-4 w-4" />
                          Colapsar
                        </>
                      ) : (
                        <>
                          <ChevronDown className="mr-2 h-4 w-4" />
                          Expandir
                        </>
                      )}
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive"
                  onClick={() => onDeleteCategory(category.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Renderizar subcategorías solo si está expandido */}
        {hasChildren && isExpanded && (
          <div className="ml-6 border-l-2 border-muted pl-4">
            {category.children?.map(child => renderCategoryNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (tree.length === 0) {
    return (
      <div className="text-center py-12">
        <TreePine className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No hay categorías para mostrar</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controles para expandir/colapsar todo */}
      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
        <div className="flex items-center space-x-2">
          <TreePine className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {tree.length} categoría{tree.length !== 1 ? 's' : ''} raíz encontrada{tree.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={expandAll}
            className="text-xs"
          >
            <ChevronDown className="h-3 w-3 mr-1" />
            Expandir Todo
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={collapseAll}
            className="text-xs"
          >
            <ChevronRight className="h-3 w-3 mr-1" />
            Colapsar Todo
          </Button>
        </div>
      </div>

      {/* Árbol de categorías */}
      {tree.map(category => renderCategoryNode(category))}
    </div>
  );
};

export default function TaxonomyPage() {
  const { token } = useAuth();
  const router = useRouter();
  const { setHeaderProps, clearHeaderProps } = useHeader();
  
  // Hook para overview de taxonomía
  const { 
    data: overviewData, 
    loading: overviewLoading, 
    error: overviewError 
  } = useMarketplaceOverview({ 
    sections: ['taxonomy'], 
    includeStats: true 
  });
  
  // Estado para datos de categorías
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState({
    total_categories: 0,
    active_count: 0,
    inactive_count: 0,
    root_categories: 0
  });

  // Estado para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [searchValue, setSearchValue] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState<string>('all');

  // Estado para vista activa
  const [activeView, setActiveView] = useState<'table' | 'tree'>('table');

  // Generar métricas para el componente de estadísticas
  const taxonomyMetrics: StatsMetric[] = useMemo(() => [
    {
      id: 'total-categories',
      title: 'Total Categorías',
      value: summary.total_categories,
      description: 'Categorías en el sistema',
      icon: TreePine,
      progress: {
        current: summary.total_categories,
        total: 100,
        label: 'Capacidad'
      },
      trend: {
        value: '+5%',
        label: 'Nuevas categorías este mes',
        direction: 'up' as const
      },
      color: 'blue' as const
    },
    {
      id: 'active-categories',
      title: 'Categorías Activas',
      value: summary.active_count,
      description: 'Categorías activas y disponibles',
      icon: CheckCircle,
      progress: {
        current: summary.active_count,
        total: summary.total_categories || 1,
        label: 'Activación'
      },
      trend: {
        value: '+12%',
        label: 'Mejora en activación',
        direction: 'up' as const
      },
      color: 'green' as const,
      badge: overviewData?.taxonomy ? {
        text: 'Overview',
        variant: 'success' as const
      } : undefined
    },
    {
      id: 'root-categories',
      title: 'Categorías Raíz',
      value: summary.root_categories,
      description: 'Categorías principales del árbol',
      icon: BarChart3,
      trend: {
        value: '+8%',
        label: 'Organización mejorada',
        direction: 'up' as const
      },
      color: 'purple' as const
    },
    {
      id: 'inactive-categories',
      title: 'Categorías Inactivas',
      value: summary.inactive_count,
      description: 'Categorías deshabilitadas',
      icon: XCircle,
      trend: {
        value: '-15%',
        label: 'Reducción este mes',
        direction: 'down' as const
      },
      color: 'red' as const
    }
  ], [summary, overviewData]);
  
  // Estado para ordenamiento
  const [sortBy, setSortBy] = useState<string>('sort_order');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Ref para debounce
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Icono memoizado para evitar recrear JSX
  const headerIcon = useMemo(() => <TreePine className="w-5 h-5 text-white" />, []);

  // Establecer header dinámico
  useEffect(() => {
    setHeaderProps({
      title: 'Taxonomía Marketplace',
      subtitle: 'Gestión de categorías globales del marketplace',
      icon: headerIcon
    });

    return () => {
      clearHeaderProps();
    };
  }, [setHeaderProps, clearHeaderProps, headerIcon]);

  // Función para obtener categorías
  const fetchCategories = async (
    page = currentPage, 
    size = pageSize, 
    search = searchValue, 
    activeFilter = isActiveFilter,
    orderBy = sortBy,
    orderDir = sortDir
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching categories with params:', { page, size, search, activeFilter, activeView });
      
      // Para vista de árbol, obtener TODAS las categorías con múltiples llamadas
      if (activeView === 'tree') {
        console.log('🌳 Tree view: fetching ALL categories with multiple requests');
        
        // Primero obtener el total
        const firstCallParams = new URLSearchParams();
        firstCallParams.append('page', '1');
        firstCallParams.append('page_size', '20');
        if (search.trim()) firstCallParams.append('search', search.trim());
        if (activeFilter !== 'all') firstCallParams.append('is_active', activeFilter);
        firstCallParams.append('_t', Date.now().toString());
        
        const firstResponse = await fetch(`/api/pim/marketplace-categories?${firstCallParams.toString()}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        });
        
        if (!firstResponse.ok) {
          throw new Error(`Error ${firstResponse.status}: ${firstResponse.statusText}`);
        }
        
        const firstData = await firstResponse.json();
        const totalCategories = firstData.pagination?.total || 0;
        
        console.log('📊 Total categories to fetch:', totalCategories);
        
        if (totalCategories === 0) {
          setCategories([]);
          setSummary({ total_categories: 0, active_count: 0, inactive_count: 0, root_categories: 0 });
          setTotalCount(0);
          return;
        }
        
        // Si hay más de 20 categorías, hacer llamadas adicionales
        let allCategories = firstData.categories || [];
        const pageSize = 20; // El backend parece limitado a 20
        const totalPages = Math.ceil(totalCategories / pageSize);
        
        console.log('📄 Total pages needed:', totalPages);
        
        // Hacer llamadas paralelas para las páginas restantes
        if (totalPages > 1) {
          const additionalRequests = [];
          
          for (let pageNum = 2; pageNum <= totalPages; pageNum++) {
            const params = new URLSearchParams();
            params.append('page', pageNum.toString());
            params.append('page_size', pageSize.toString());
            if (search.trim()) params.append('search', search.trim());
            if (activeFilter !== 'all') params.append('is_active', activeFilter);
            params.append('_t', Date.now().toString());
            
            additionalRequests.push(
              fetch(`/api/pim/marketplace-categories?${params.toString()}`, {
                cache: 'no-store',
                headers: { 'Cache-Control': 'no-cache' }
              })
            );
          }
          
          console.log('🚀 Making', additionalRequests.length, 'additional requests');
          
          const additionalResponses = await Promise.all(additionalRequests);
          
          for (const response of additionalResponses) {
            if (response.ok) {
              const data = await response.json();
              if (data.categories) {
                allCategories = allCategories.concat(data.categories);
              }
            }
          }
        }
        
        console.log('🎯 Tree view - Total categories fetched:', allCategories.length);
        setCategories(allCategories);
        
        // Calcular estadísticas desde todos los datos
        const activeCategories = allCategories.filter((cat: any) => cat.is_active).length;
        const inactiveCategories = allCategories.filter((cat: any) => !cat.is_active).length;
        const rootCategories = allCategories.filter((cat: any) => !cat.parent_id).length;
        
        // Combinar estadísticas locales con datos del overview
        const overviewTaxonomy = overviewData?.taxonomy || {};
        setSummary({
          total_categories: overviewTaxonomy.total_categories || totalCategories,
          active_count: overviewTaxonomy.active_categories || activeCategories,
          inactive_count: (overviewTaxonomy.total_categories - overviewTaxonomy.active_categories) || inactiveCategories,
          root_categories: overviewTaxonomy.root_categories || rootCategories
        });
        
        setTotalCount(totalCategories);
        
      } else {
        // Vista tabla - paginación normal
        console.log('📋 Table view: normal pagination');
        
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('page_size', size.toString());
        
        // Filtros
        if (search.trim()) {
          params.append('search', search.trim());
        }
        if (activeFilter !== 'all') {
          params.append('is_active', activeFilter);
        }
        
        // Ordenamiento
        params.append('sort_by', orderBy);
        params.append('sort_dir', orderDir);

        // Agregar timestamp para evitar cache
        params.append('_t', Date.now().toString());
        
        const apiUrl = `/api/pim/marketplace-categories?${params.toString()}`;
        console.log('🌐 API URL:', apiUrl);

        const response = await fetch(apiUrl, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('📦 Table view API Response:', {
          categories_count: data.categories?.length || 0,
          pagination: data.pagination,
          first_category: data.categories?.[0]?.name
        });
        
        // Usar la estructura correcta: categories en lugar de data
        const categoriesData = data.categories || [];
        console.log('🎯 Setting categories to state:', {
          count: categoriesData.length,
          first_3_names: categoriesData.slice(0, 3).map((c: any) => c.name),
          page: page
        });
        setCategories(categoriesData);
        
        // Calcular estadísticas desde los datos reales
        const totalCategories = data.pagination?.total || 0;
        const activeCategories = categoriesData.filter((cat: any) => cat.is_active).length;
        const inactiveCategories = categoriesData.filter((cat: any) => !cat.is_active).length;
        const rootCategories = categoriesData.filter((cat: any) => !cat.parent_id).length;
        
        console.log('📊 Stats:', { totalCategories, activeCategories, inactiveCategories, rootCategories });
        
        // Combinar estadísticas locales con datos del overview
        const overviewTaxonomy = overviewData?.taxonomy || {};
        setSummary({
          total_categories: overviewTaxonomy.total_categories || totalCategories,
          active_count: overviewTaxonomy.active_categories || activeCategories,
          inactive_count: (overviewTaxonomy.total_categories - overviewTaxonomy.active_categories) || inactiveCategories,
          root_categories: overviewTaxonomy.root_categories || rootCategories
        });
        
        setTotalCount(totalCategories);
      }
      
    } catch (err) {
      console.error('❌ Error loading categories:', err);
      setError('Error al cargar las categorías: ' + (err instanceof Error ? err.message : 'Error desconocido'));
      setCategories([]);
      setSummary({
        total_categories: 0,
        active_count: 0,
        inactive_count: 0,
        root_categories: 0
      });
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos iniciales - SOLO UNA VEZ
  useEffect(() => {
    console.log('🚀 Initial load...');
    fetchCategories(1, 20, '', 'all');
  }, []); // Sin dependencias

  // Recargar cuando cambia la vista activa (SOLO cuando cambia la vista)
  useEffect(() => {
    if (activeView === 'tree') {
      console.log('🌳 Switching to tree view - loading all categories');
      fetchCategories(1, 1000, searchValue, isActiveFilter, sortBy, sortDir);
    } else {
      console.log('📋 Switching to table view - loading paginated');
      // Al cambiar a vista tabla, usar página 1 para evitar conflictos
      setCurrentPage(1);
      fetchCategories(1, pageSize, searchValue, isActiveFilter, sortBy, sortDir);
    }
  }, [activeView]); // SOLO cuando cambia activeView

  // Función con debounce para búsqueda
  const debouncedSearch = (newSearchValue: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      console.log('🔍 Debounced search triggered:', newSearchValue);
      fetchCategories(1, pageSize, newSearchValue, isActiveFilter, sortBy, sortDir);
    }, 300);
  };

  // Handlers
  const handleSearchChange = (value: string) => {
    console.log('🔍 Search input changed:', value);
    setSearchValue(value);
    setCurrentPage(1);
    debouncedSearch(value);
  };

  const handlePageChange = (page: number) => {
    console.log('📄 Page changed:', page, 'Current activeView:', activeView);
    setCurrentPage(page);
    // Solo hacer fetch si estamos en vista tabla
    if (activeView === 'table') {
      fetchCategories(page, pageSize, searchValue, isActiveFilter, sortBy, sortDir);
    }
  };

  const handlePageSizeChange = (size: number) => {
    console.log('📏 Page size changed:', size);
    setPageSize(size);
    setCurrentPage(1);
    fetchCategories(1, size, searchValue, isActiveFilter, sortBy, sortDir);
  };

  const handleFilterChange = (value: string) => {
    console.log('🔄 Filter changed:', value);
    setIsActiveFilter(value);
    setCurrentPage(1);
    fetchCategories(1, pageSize, searchValue, value, sortBy, sortDir);
  };

  const handleEditCategory = (id: string) => {
    router.push(`/taxonomy/${id}/edit`);
  };

  const handleDeleteCategory = async (id: string) => {
    const category = categories.find(cat => cat.id === id);
    if (!category) return;

    const confirmed = confirm(`¿Estás seguro de que quieres eliminar la categoría "${category.name}"? Esta acción no se puede deshacer.`);
    if (!confirmed) return;

    try {
      console.log('🗑️ Deleting category:', id);
      
      const response = await fetch(`/api/pim/marketplace-categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      // Recargar las categorías después de eliminar
      await fetchCategories(currentPage, pageSize, searchValue, isActiveFilter, sortBy, sortDir);
      
      console.log('✅ Category deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting category:', error);
      alert('Error al eliminar la categoría. Por favor, inténtalo de nuevo.');
    }
  };

  // Filtros configurables para taxonomía
  const taxonomyFilters: FilterType[] = [
    {
      type: 'select',
      key: 'is_active',
      placeholder: 'Estado',
      value: isActiveFilter,
      options: [
        { value: 'all', label: 'Todos los estados' },
        { value: 'true', label: 'Activas' },
        { value: 'false', label: 'Inactivas' }
      ],
      onChange: handleFilterChange
    }
  ];

  // Columnas de la tabla
  const columns: ColumnDef<Category>[] = useMemo(() => [
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
          <div className="flex items-center space-x-2">
            <TreePine className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{category.name}</span>
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
        <span className="text-sm text-muted-foreground">
          {row.getValue('description') || 'Sin descripción'}
        </span>
      )
    },
    {
      accessorKey: 'level',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Nivel
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const category = row.original;
        return (
          <Badge variant={category.level > 0 ? 'secondary' : 'default'}>
            Nivel {category.level}
          </Badge>
        );
      }
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
        const category = row.original;
        return (
          <Badge variant={category.is_active ? 'default' : 'danger'}>
            {category.is_active ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                Activa
              </>
            ) : (
              <>
                <XCircle className="h-3 w-3 mr-1" />
                Inactiva
              </>
            )}
          </Badge>
        );
      }
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
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Eye className="mr-2 h-4 w-4" />
                Ver detalles
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEditCategory(category.id)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive"
                onClick={() => handleDeleteCategory(category.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }
    }
  ], [router]);

  // Cleanup del timeout cuando se desmonte el componente
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  if (error) {
    return (
      <div className="py-8">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => fetchCategories(1, 20, '', 'all')} className="mt-4">
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Status */}
      {overviewError && (
        <div className="rounded-md bg-yellow-50 p-3 border border-yellow-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <TrendingUp className="h-4 w-4 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-xs text-yellow-800">
                Overview no disponible - Usando datos locales: {overviewError}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Estadísticas de Taxonomía */}
      <StatsOverview
        title="Estadísticas de Taxonomía"
        subtitle={`${summary.total_categories} categorías totales`}
        metrics={taxonomyMetrics}
        variant="detailed"
        defaultExpanded={true}
        className="mb-6"
      />

      {/* Solapas para alternar entre vistas */}
      <Tabs value={activeView} onValueChange={(value) => setActiveView(value as 'table' | 'tree')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="table" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Vista de Tabla
          </TabsTrigger>
          <TabsTrigger value="tree" className="flex items-center gap-2">
            <Network className="h-4 w-4" />
            Vista de Árbol
          </TabsTrigger>
        </TabsList>

        {/* Vista de Tabla */}
        <TabsContent value="table" className="space-y-6">
          <CriteriaDataTable
            columns={columns}
            data={categories}
            totalCount={totalCount}
            currentPage={currentPage}
            pageSize={pageSize}
            loading={loading}
            searchValue={searchValue}
            searchPlaceholder="Buscar categorías por nombre, descripción..."
            buttonText="Nueva Categoría"
            filters={taxonomyFilters}
            onCreateClick={() => router.push('/taxonomy/create')}
            onSearchChange={handleSearchChange}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onSortChange={(newSortBy, newSortDir) => {
              console.log('🔀 Sort changed:', { sortBy: newSortBy, sortDir: newSortDir });
              setSortBy(newSortBy || 'sort_order');
              setSortDir(newSortDir || 'asc');
              setCurrentPage(1);
              fetchCategories(1, pageSize, searchValue, isActiveFilter, newSortBy || 'sort_order', newSortDir || 'asc');
            }}
            fullWidth={true}
          />
        </TabsContent>

        {/* Vista de Árbol */}
        <TabsContent value="tree" className="space-y-6">
          <Card>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-4">
                  <div className="relative max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pl-8"
                      placeholder="Buscar categorías por nombre..."
                      value={searchValue}
                      onChange={(e) => handleSearchChange(e.target.value)}
                    />
                  </div>
                  <select
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-w-[160px]"
                    value={isActiveFilter}
                    onChange={(e) => handleFilterChange(e.target.value)}
                  >
                    <option value="all">Todos los estados</option>
                    <option value="true">Activas</option>
                    <option value="false">Inactivas</option>
                  </select>
                </div>
                <Button onClick={() => router.push('/taxonomy/create')}>
                  <TreePine className="h-4 w-4 mr-2" />
                  Nueva Categoría
                </Button>
              </div>
              
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted-foreground mt-4">Cargando categorías...</p>
                </div>
              ) : (
                <CategoryTreeView
                  categories={categories}
                  onEditCategory={handleEditCategory}
                  onDeleteCategory={handleDeleteCategory}
                />
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>


    </div>
  );
} 