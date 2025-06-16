'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  TreePine,
  ArrowLeft,
  Layers,
  CheckCircle,
  XCircle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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

import { MarketplaceCategory } from '@/lib/api';
import Link from 'next/link';
import { CategoryTree } from '@/components/category-tree';
import { useMarketplaceCategories } from '@/hooks/use-marketplace-categories';
import { useAuth } from '@/hooks/use-auth';
import { useHeader } from '@/components/layout/admin-layout';

export default function TaxonomyPageOriginal() {
  const { token } = useAuth();
  const { 
    categories, 
    loading, 
    deleteCategory
  } = useMarketplaceCategories({ adminToken: token || undefined });
  const { setHeaderProps, clearHeaderProps } = useHeader();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MarketplaceCategory | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'tree'>('table');

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

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryPath = (category: MarketplaceCategory): string => {
    if (!category.parent_id) return category.name;
    
    const parent = categories.find(c => c.id === category.parent_id);
    if (!parent) return category.name;
    
    return `${getCategoryPath(parent)} > ${category.name}`;
  };

  const getLevelBadgeColor = (level: number) => {
    switch (level) {
      case 0: return 'bg-blue-100 text-blue-800';
      case 1: return 'bg-green-100 text-green-800';
      case 2: return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
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
  };

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

      {/* Filters and Search */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar categorías..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
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
            <Link href="/taxonomy/create">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nueva Categoría
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Categories Content */}
      {viewMode === 'table' ? (
        <Card>
          <div className="p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Ruta</TableHead>
                  <TableHead>Nivel</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Creada</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{category.name}</div>
                        {category.description && (
                          <div className="text-sm text-muted-foreground">
                            {category.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {getCategoryPath(category)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getLevelBadgeColor(category.level)}>
                        Nivel {category.level}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {category.slug}
                      </code>
                    </TableCell>
                    <TableCell>
                      {category.is_active ? (
                        <Badge className="bg-green-100 text-green-800">
                          Activa
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800">
                          Inactiva
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(category.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => setSelectedCategory(category)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Ver Detalles
                          </DropdownMenuItem>
                          <Link href={`/taxonomy/edit/${category.id}`}>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                          </Link>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteCategory(category.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredCategories.length === 0 && (
              <div className="text-center py-8">
                <Layers className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No hay categorías</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? 'No se encontraron categorías con ese término' : 'Comienza creando tu primera categoría'}
                </p>
                {!searchTerm && (
                  <Link href="/taxonomy/create">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Crear Primera Categoría
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        </Card>
      ) : (
        <Card className="p-6">
          <CategoryTree 
            categories={filteredCategories}
            onViewDetails={setSelectedCategory}
            onDelete={handleDeleteCategory}
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