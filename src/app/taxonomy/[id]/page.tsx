'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { 
  TreePine,
  Edit,
  Trash2,
  ArrowLeft,
  Check,
  X,
  Hash,
  BarChart3,
  Calendar,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';

import { Button } from '@/components/shared-ui';
import { Badge } from '@/components/shared-ui';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/shared-ui';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/shared-ui';

import { useAuth } from '@/hooks/use-auth';
import { useHeader } from '@/components/layout/admin-layout';

interface Category {
  id: string;
  name: string;
  description: string;
  level: number;
  parent_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function CategoryViewPage() {
  const router = useRouter();
  const params = useParams();
  const { token } = useAuth();
  const { setHeaderProps, clearHeaderProps } = useHeader();
  
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Icono memoizado
  const headerIcon = useMemo(() => <TreePine className="w-5 h-5 text-white" />, []);

  // ID de la categoría
  const categoryId = params.id as string;

  // Función para cargar la categoría
  const fetchCategory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/pim/marketplace-categories/${categoryId}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setCategory(data);
      
    } catch (err) {
      console.error('Error fetching category:', err);
      setError('Error al cargar la categoría: ' + (err instanceof Error ? err.message : 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  // Cargar categoría al montar
  useEffect(() => {
    if (categoryId) {
      fetchCategory();
    }
  }, [categoryId]);

  // Configurar header
  useEffect(() => {
    if (category) {
      setHeaderProps({
        title: `${category.name}`,
        subtitle: 'Detalles de la categoría del marketplace',
        backUrl: '/taxonomy',
        backLabel: 'Volver a Taxonomía',
        icon: headerIcon,
        actions: (
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => router.push(`/taxonomy/${categoryId}/edit`)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar categoría?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción eliminará permanentemente la categoría "{category.name}" del marketplace. 
                    Esta acción no se puede deshacer.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => {
                      // TODO: Implementar eliminación
                      console.log('Eliminar categoría:', categoryId);
                      router.push('/taxonomy');
                    }}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )
      });
    }

    return () => {
      clearHeaderProps();
    };
  }, [setHeaderProps, clearHeaderProps, headerIcon, category, categoryId, router]);

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-300 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-300 rounded"></div>
            <div className="h-64 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-medium text-destructive mb-2">Error al cargar</h3>
              <p className="text-muted-foreground mb-4">
                {error || 'No se pudo encontrar la categoría solicitada.'}
              </p>
              <div className="flex justify-center space-x-2">
                <Button onClick={() => fetchCategory()}>Reintentar</Button>
                <Button variant="outline" onClick={() => router.push('/taxonomy')}>
                  Volver a Taxonomía
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Información Principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Información Básica */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TreePine className="h-5 w-5" />
              <span>Información General</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Nombre y nivel */}
            <div>
              <h2 className="text-2xl font-bold">{category.name}</h2>
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant={category.level > 0 ? 'secondary' : 'default'}>
                  Nivel {category.level}
                </Badge>
                {category.parent_id && (
                  <Badge variant="outline">
                    <ChevronRight className="h-3 w-3 mr-1" />
                    Subcategoría
                  </Badge>
                )}
              </div>
            </div>

            <Separator />

            {/* Detalles */}
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center space-x-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">ID: {category.id}</span>
              </div>
              
              {category.parent_id && (
                <div className="flex items-center space-x-2">
                  <TreePine className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Categoría Padre: {category.parent_id}</span>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Creada: {new Date(category.created_at).toLocaleDateString('es-ES')}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Actualizada: {new Date(category.updated_at).toLocaleDateString('es-ES')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estado */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Estado y Configuración</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Estado activo */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Estado</span>
              <Badge variant={category.is_active ? "default" : "secondary"}>
                {category.is_active ? (
                  <>
                    <Check className="h-3 w-3 mr-1" />
                    Activa
                  </>
                ) : (
                  <>
                    <X className="h-3 w-3 mr-1" />
                    Inactiva
                  </>
                )}
              </Badge>
            </div>

            <Separator />

            {/* Nivel jerárquico */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Nivel Jerárquico</span>
              <Badge variant={category.level === 0 ? "default" : "secondary"}>
                {category.level === 0 ? 'Categoría Raíz' : `Nivel ${category.level}`}
              </Badge>
            </div>

            <Separator />

            {/* Tipo de categoría */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Tipo</span>
              <Badge variant="outline">
                {category.parent_id ? 'Subcategoría' : 'Categoría Principal'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Descripción */}
      {category.description && (
        <Card>
          <CardHeader>
            <CardTitle>Descripción</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              {category.description}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Acciones rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline"
              onClick={() => router.push(`/taxonomy/${categoryId}/edit`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar Categoría
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => {
                // TODO: Implementar activar/desactivar
                console.log('Toggle status:', categoryId);
              }}
            >
              {category.is_active ? (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Desactivar
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Activar
                </>
              )}
            </Button>

            <Button 
              variant="outline"
              onClick={() => router.push('/taxonomy')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Lista
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 