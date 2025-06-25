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
  ChevronUp
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { categoriesApi, Category } from '@/lib/api/categories';
import { useAuth } from '@/hooks/use-auth';
import { useHeader } from '@/components/layout/admin-layout';
import { CriteriaDataTable, CriteriaResponse, SearchCriteria } from '@/components/ui/criteria-data-table';
import { Filter as FilterType } from '@/components/ui/table-toolbar';
import { ColumnDef } from '@tanstack/react-table';

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
            <Badge variant={category.is_active ? 'default' : 'destructive'}>
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

  // Ref para debounce
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Icono memoizado para evitar recrear JSX
  const headerIcon = useMemo(() => <TreePine className="w-5 h-5 text-white" />, []);

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

  // Función para obtener categorías
  const fetchCategories = async (page = currentPage, size = pageSize, search = searchValue, activeFilter = isActiveFilter) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching categories with params:', { page, size, search, activeFilter });
      
      const params = new URLSearchParams();
      
      // Para vista de árbol, obtener todas las categorías
      if (activeView === 'tree') {
        params.append('limit', '1000'); // Obtener todas para el árbol
        params.append('offset', '0');
      } else {
        // Paginación normal para tabla
        const offset = (page - 1) * size;
        params.append('offset', offset.toString());
        params.append('limit', size.toString());
      }
      
      // Filtros
      if (search.trim()) {
        params.append('search', search.trim());
      }
      if (activeFilter !== 'all') {
        params.append('is_active', activeFilter);
      }

      const apiUrl = `/api/pim/marketplace-categories?${params.toString()}`;
      console.log('🌐 API URL:', apiUrl);

      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📦 API Response:', data);
      
      // Usar la estructura correcta: categories en lugar de data
      const categoriesData = data.categories || [];
      setCategories(categoriesData);
      
      // Calcular estadísticas desde los datos reales
      const totalCategories = data.pagination?.total || 0;
      const activeCategories = categoriesData.filter((cat: any) => cat.is_active).length;
      const inactiveCategories = categoriesData.filter((cat: any) => !cat.is_active).length;
      const rootCategories = categoriesData.filter((cat: any) => !cat.parent_id).length;
      
      console.log('📊 Stats:', { totalCategories, activeCategories, inactiveCategories, rootCategories });
      
      setSummary({
        total_categories: totalCategories,
        active_count: activeCategories,
        inactive_count: inactiveCategories,
        root_categories: rootCategories
      });
      
      setTotalCount(totalCategories);
      
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

  // Recargar cuando cambia la vista activa
  useEffect(() => {
    if (activeView === 'tree') {
      console.log('🌳 Switching to tree view - loading all categories');
      fetchCategories(1, 1000, searchValue, isActiveFilter);
    } else {
      console.log('📋 Switching to table view - loading paginated');
      fetchCategories(currentPage, pageSize, searchValue, isActiveFilter);
    }
  }, [activeView]);

  // Refrescar datos cuando cambia la vista
  useEffect(() => {
    fetchCategories(currentPage, pageSize, searchValue, isActiveFilter);
  }, [activeView]);

  // Función con debounce para búsqueda
  const debouncedSearch = (newSearchValue: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      console.log('🔍 Debounced search triggered:', newSearchValue);
      fetchCategories(1, pageSize, newSearchValue, isActiveFilter);
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
    console.log('📄 Page changed:', page);
    setCurrentPage(page);
    fetchCategories(page, pageSize, searchValue, isActiveFilter);
  };

  const handlePageSizeChange = (size: number) => {
    console.log('📏 Page size changed:', size);
    setPageSize(size);
    setCurrentPage(1);
    fetchCategories(1, size, searchValue, isActiveFilter);
  };

  const handleFilterChange = (value: string) => {
    console.log('🔄 Filter changed:', value);
    setIsActiveFilter(value);
    setCurrentPage(1);
    fetchCategories(1, pageSize, searchValue, value);
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
      await fetchCategories(currentPage, pageSize, searchValue, isActiveFilter);
      
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
      header: 'Nombre',
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
      header: 'Descripción',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.getValue('description') || 'Sin descripción'}
        </span>
      )
    },
    {
      accessorKey: 'level',
      header: 'Nivel',
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
      header: 'Estado',
      cell: ({ row }) => {
        const category = row.original;
        return (
          <Badge variant={category.is_active ? 'default' : 'destructive'}>
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
      <div className="container mx-auto py-8">
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
    <div className="container mx-auto py-8 space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{summary.total_categories}</p>
              <p className="text-sm text-muted-foreground">Total Categorías</p>
            </div>
            <TreePine className="h-8 w-8 text-primary" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-green-600">{summary.active_count}</p>
              <p className="text-sm text-muted-foreground">Categorías Activas</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-blue-600">{summary.root_categories}</p>
              <p className="text-sm text-muted-foreground">Categorías Raíz</p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-600" />
          </div>
        </Card>
      </div>

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
            onSortChange={(sort) => {
              console.log('🔀 Sort changed:', sort);
              // TODO: implementar ordenamiento
            }}
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

      {/* Resumen de Estadísticas */}
      <div className="text-center text-sm text-muted-foreground space-x-4">
        <span>📊 Total: {summary.total_categories}</span>
        <span>✅ Activas: {summary.active_count}</span>
        <span>❌ Inactivas: {summary.inactive_count}</span>
        <span>🌳 Raíz: {summary.root_categories}</span>
      </div>
    </div>
  );
} 