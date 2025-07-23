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

// Importaciones desde shared-ui
import { 
  Button,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Separator,
  cn
} from '@/components/shared-ui';

import { categoriesApi, Category } from '@/lib/api/categories';
import { useAuth } from '@/hooks/use-auth';
import { useHeader } from '@/components/layout/admin-layout';
import { CriteriaDataTable, CriteriaResponse, SearchCriteria } from '@/components/ui/criteria-data-table';
import { Filter as FilterType } from '@/components/ui/table-toolbar';
import { ColumnDef } from '@tanstack/react-table';

// Componente para la vista de árbol con shared-ui
const CategoryTreeView = ({ 
  categories, 
  onEditCategory, 
  onDeleteCategory 
}: { 
  categories: Category[], 
  onEditCategory: (id: string) => void,
  onDeleteCategory: (id: string) => void
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const toggleNode = (categoryId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedNodes(newExpanded);
  };

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

  const collapseAll = () => {
    setExpandedNodes(new Set());
  };

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
      <div key={category.id} className={cn("", level > 0 && `ml-${level * 4}`)}>
        <Card className="mb-2">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {hasChildren ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleNode(category.id)}
                      className="h-6 w-6 p-0"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  ) : (
                    <div className="w-6 h-6" />
                  )}
                  
                  <TreePine className={cn(
                    "h-4 w-4",
                    level === 0 ? "text-primary" : "text-muted-foreground"
                  )} />
                  <span className="font-medium">{category.name}</span>
                </div>
                <Badge variant={level > 0 ? 'secondary' : 'default'}>
                  Nivel {category.level}
                </Badge>
                <Badge variant={category.is_active ? 'success' : 'destructive'}>
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
                      className="text-red-600 dark:text-red-400"
                      onClick={() => onDeleteCategory(category.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
        
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
      <Card>
        <CardContent className="text-center py-12">
          <TreePine className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No hay categorías para mostrar</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent>
          <div className="flex items-center justify-between">
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
              >
                <ChevronDown className="h-3 w-3 mr-1" />
                Expandir Todo
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={collapseAll}
              >
                <ChevronRight className="h-3 w-3 mr-1" />
                Colapsar Todo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {tree.map(category => renderCategoryNode(category))}
    </div>
  );
};

export default function TaxonomyPageRefactored() {
  const { token } = useAuth();
  const router = useRouter();
  const { setHeaderProps, clearHeaderProps } = useHeader();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState({
    total_categories: 0,
    active_count: 0,
    inactive_count: 0,
    root_categories: 0
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [searchValue, setSearchValue] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState<string>('all');
  const [activeView, setActiveView] = useState<'table' | 'tree'>('table');

  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Icono memoizado
  const headerIcon = useMemo(() => <Tags className="w-5 h-5 text-white" />, []);

  // Configurar header
  useEffect(() => {
    setHeaderProps({
      title: 'Taxonomía',
      subtitle: `Gestión de categorías del marketplace (${summary.total_categories} total)`,
      icon: headerIcon
    });

    return () => {
      clearHeaderProps();
    };
  }, [setHeaderProps, clearHeaderProps, headerIcon, summary.total_categories]);

  // Cargar datos
  const loadCategories = async (page = 1, search = '', filter = 'all') => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const filters: any = {};
      if (search) {
        filters.search = search;
      }
      if (filter !== 'all') {
        filters.is_active = filter === 'active';
      }

      const response = await categoriesApi.getCategories({
        adminToken: token,
        page,
        page_size: pageSize,
        filters
      });

      setCategories(response.data);
      setTotalCount(response.total_count);
      
      // Calcular resumen
      const allCategories = response.data;
      setSummary({
        total_categories: allCategories.length,
        active_count: allCategories.filter(c => c.is_active).length,
        inactive_count: allCategories.filter(c => !c.is_active).length,
        root_categories: allCategories.filter(c => !c.parent_id).length
      });
      
    } catch (err) {
      setError('Error al cargar las categorías');
      console.error('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories(currentPage, searchValue, isActiveFilter);
  }, [token, currentPage, pageSize, searchValue, isActiveFilter]);

  // Columnas para la vista de tabla con componentes shared-ui
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
      accessorKey: 'parent_id',
      header: 'Categoría Padre',
      cell: ({ row }) => {
        const category = row.original;
        const parent = categories.find(c => c.id === category.parent_id);
        return parent ? (
          <Badge variant="outline">{parent.name}</Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
    },
    {
      accessorKey: 'level',
      header: 'Nivel',
      cell: ({ row }) => (
        <Badge variant={row.original.level > 0 ? 'secondary' : 'default'}>
          Nivel {row.original.level}
        </Badge>
      ),
    },
    {
      accessorKey: 'is_active',
      header: 'Estado',
      cell: ({ row }) => (
        <Badge variant={row.original.is_active ? 'success' : 'destructive'}>
          {row.original.is_active ? (
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
      ),
    },
    {
      accessorKey: 'description',
      header: 'Descripción',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.description || 'Sin descripción'}
        </span>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const category = row.original;
        
        const handleDelete = async () => {
          if (!window.confirm(`¿Estás seguro de eliminar la categoría "${category.name}"?`)) {
            return;
          }
          
          try {
            await categoriesApi.deleteCategory(category.id, token!);
            await loadCategories(currentPage, searchValue, isActiveFilter);
          } catch (error) {
            console.error('Error deleting category:', error);
          }
        };

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => router.push(`/taxonomy/${category.id}`)}>
                <Eye className="mr-2 h-4 w-4" />
                Ver detalles
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/taxonomy/${category.id}/edit`)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} className="text-red-600 dark:text-red-400">
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ], [categories, token, currentPage, searchValue, isActiveFilter, router]);

  // Estadísticas con componentes shared-ui
  const renderStats = () => (
    <div className="grid gap-4 md:grid-cols-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Categorías</CardTitle>
          <Tags className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.total_categories}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Activas</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.active_count}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Inactivas</CardTitle>
          <XCircle className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.inactive_count}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Categorías Raíz</CardTitle>
          <TreePine className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.root_categories}</div>
        </CardContent>
      </Card>
    </div>
  );

  // Filtros
  const categoryFilters: FilterType[] = [
    {
      type: 'select',
      key: 'is_active',
      placeholder: 'Estado',
      value: isActiveFilter,
      options: [
        { value: 'all', label: 'Todos' },
        { value: 'active', label: 'Activas' },
        { value: 'inactive', label: 'Inactivas' }
      ],
      onChange: (value) => {
        setIsActiveFilter(value);
        setCurrentPage(1);
      }
    }
  ];

  return (
    <div className="container mx-auto py-6">
      {renderStats()}
      
      <Tabs value={activeView} onValueChange={(v) => setActiveView(v as 'table' | 'tree')}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="table">
              <List className="h-4 w-4 mr-2" />
              Vista de Tabla
            </TabsTrigger>
            <TabsTrigger value="tree">
              <Network className="h-4 w-4 mr-2" />
              Vista de Árbol
            </TabsTrigger>
          </TabsList>
          
          <Button onClick={() => router.push('/taxonomy/create')}>
            <TreePine className="h-4 w-4 mr-2" />
            Nueva Categoría
          </Button>
        </div>

        <TabsContent value="table" className="space-y-4">
          <CriteriaDataTable
            columns={columns}
            data={categories}
            totalCount={totalCount}
            currentPage={currentPage}
            pageSize={pageSize}
            loading={loading}
            searchValue={searchValue}
            searchPlaceholder="Buscar categorías..."
            filters={categoryFilters}
            onSearchChange={(value) => {
              if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
              }
              searchTimeoutRef.current = setTimeout(() => {
                setSearchValue(value);
                setCurrentPage(1);
              }, 300);
            }}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
            showCreateButton={false}
          />
        </TabsContent>

        <TabsContent value="tree" className="space-y-4">
          <CategoryTreeView
            categories={categories}
            onEditCategory={(id) => router.push(`/taxonomy/${id}/edit`)}
            onDeleteCategory={async (id) => {
              if (window.confirm('¿Estás seguro de eliminar esta categoría?')) {
                try {
                  await categoriesApi.deleteCategory(id, token!);
                  await loadCategories(currentPage, searchValue, isActiveFilter);
                } catch (error) {
                  console.error('Error deleting category:', error);
                }
              }
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}