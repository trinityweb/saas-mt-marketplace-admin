'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { 
  TreePine,
  Save,
  X,
  AlertTriangle,
  Loader2,
  Eye
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

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

interface CategoryFormData {
  name: string;
  description: string;
  parent_id: string | null;
  is_active: boolean;
}

export default function CategoryEditPage() {
  const router = useRouter();
  const params = useParams();
  const { token } = useAuth();
  const { setHeaderProps, clearHeaderProps } = useHeader();
  
  // Debug: Log inicial
  console.log('🚀 CategoryEditPage cargada, ID:', params.id);
  
  const [originalCategory, setOriginalCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    parent_id: null,
    is_active: true
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

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
      
      const data: Category = await response.json();
      setOriginalCategory(data);
      
      setFormData({
        name: data.name || '',
        description: data.description || '',
        parent_id: data.parent_id || null,
        is_active: data.is_active ?? true
      });
      
    } catch (err) {
      console.error('Error fetching category:', err);
      setError('Error al cargar la categoría: ' + (err instanceof Error ? err.message : 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  // Función para guardar cambios
  const handleSave = useCallback(async () => {
    try {
      setSaving(true);
      setError(null);
      
      // Debug: mostrar datos que se van a enviar
      console.log('🔄 Datos del formulario de categoría:', formData);
      console.log('🎯 URL:', `/api/pim/marketplace-categories/${categoryId}`);
      
      const response = await fetch(`/api/pim/marketplace-categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const responseData = await response.json();
      console.log('📥 Respuesta de la API de categoría:', responseData);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      // Mostrar éxito y redirigir
      console.log('✅ Categoría actualizada correctamente');
      router.push(`/taxonomy/${categoryId}`);
      
    } catch (err) {
      console.error('❌ Error saving category:', err);
      setError('Error al guardar la categoría: ' + (err instanceof Error ? err.message : 'Error desconocido'));
    } finally {
      setSaving(false);
    }
  }, [formData, categoryId, router]);

  // Cargar categoría al montar
  useEffect(() => {
    if (categoryId) {
      fetchCategory();
    }
  }, [categoryId]);

  // Configurar header
  useEffect(() => {
    if (originalCategory) {
      setHeaderProps({
        title: `Editar: ${originalCategory.name}`,
        subtitle: 'Modificar información de la categoría del marketplace',
        backUrl: `/taxonomy/${categoryId}`,
        backLabel: 'Volver a Detalles',
        icon: headerIcon,
        actions: (
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => router.push(`/taxonomy/${categoryId}`)}
            >
              <Eye className="w-4 h-4 mr-2" />
              Ver Detalles
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!hasChanges || saving}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Guardar Cambios
            </Button>
          </div>
        )
      });
    }

    return () => {
      clearHeaderProps();
    };
  }, [setHeaderProps, clearHeaderProps, headerIcon, originalCategory, categoryId, router, hasChanges, saving, handleSave]);

  // Detectar cambios en el formulario
  useEffect(() => {
    if (originalCategory) {
      const hasFormChanges = 
        formData.name !== (originalCategory.name || '') ||
        formData.description !== (originalCategory.description || '') ||
        formData.parent_id !== (originalCategory.parent_id || null) ||
        formData.is_active !== (originalCategory.is_active ?? true);
      
      // Debug: mostrar comparación de cambios
      console.log('🔍 Detectando cambios en categoría:');
      console.log('📋 Datos originales:', {
        name: originalCategory.name || '',
        description: originalCategory.description || '',
        parent_id: originalCategory.parent_id || null,
        is_active: originalCategory.is_active ?? true
      });
      console.log('✏️ Datos actuales del formulario:', formData);
      console.log('🔄 ¿Hay cambios?', hasFormChanges);
      
      setHasChanges(hasFormChanges);
    }
  }, [formData, originalCategory]);

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

  if (error && !originalCategory) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-medium text-destructive mb-2">Error al cargar</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
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
    <div className="space-y-6">
      {/* Error de guardado */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Card - Categoría que se está editando */}
      {originalCategory && (
        <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                  <TreePine className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-medium text-green-900 dark:text-green-100">
                    {originalCategory.name}
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    {originalCategory.parent_id ? `Subcategoría - Nivel ${originalCategory.level}` : 'Categoría Principal'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={originalCategory.is_active ? "default" : "secondary"}>
                  {originalCategory.is_active ? "Activa" : "Inactiva"}
                </Badge>
                <Badge variant="outline" className="text-green-600 border-green-300">
                  Nivel {originalCategory.level}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Información Básica */}
        <Card>
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
            <CardDescription>
              Datos principales de la categoría
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nombre de la categoría"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descripción de la categoría"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Configuración */}
        <Card>
          <CardHeader>
            <CardTitle>Configuración</CardTitle>
            <CardDescription>
              Configuración de jerarquía y estado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="parent_id">Categoría Padre</Label>
              <Select
                value={formData.parent_id || 'none'}
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  parent_id: value === 'none' ? null : value 
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría padre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin categoría padre (Raíz)</SelectItem>
                  {/* TODO: Cargar categorías disponibles */}
                </SelectContent>
              </Select>
              <div className="text-xs text-muted-foreground">
                Selecciona una categoría padre para crear una subcategoría
              </div>
            </div>

            <Separator />

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="is_active">Categoría activa</Label>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Información de solo lectura */}
      {originalCategory && (
        <Card>
          <CardHeader>
            <CardTitle>Información del Sistema</CardTitle>
            <CardDescription>
              Datos generados automáticamente (solo lectura)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium">ID</Label>
                <div className="text-sm text-muted-foreground">{originalCategory.id}</div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Nivel</Label>
                <div className="text-sm text-muted-foreground">Nivel {originalCategory.level}</div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Tipo</Label>
                <div className="text-sm text-muted-foreground">
                  {originalCategory.parent_id ? 'Subcategoría' : 'Categoría Principal'}
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Fecha de Creación</Label>
                <div className="text-sm text-muted-foreground">
                  {new Date(originalCategory.created_at).toLocaleString('es-ES')}
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Última Actualización</Label>
                <div className="text-sm text-muted-foreground">
                  {new Date(originalCategory.updated_at).toLocaleString('es-ES')}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Acciones */}
      <div className="flex justify-end gap-2">
        <Button 
          variant="outline" 
          onClick={() => router.push(`/taxonomy/${categoryId}`)}
        >
          Cancelar
        </Button>
        
        <Button 
          onClick={handleSave}
          disabled={!hasChanges || saving}
        >
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Guardar Cambios
        </Button>
      </div>
    </div>
  );
} 