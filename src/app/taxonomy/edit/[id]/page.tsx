'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, TreePine, Layers, AlertCircle, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

import Link from 'next/link';
import { useMarketplaceCategories } from '@/hooks/use-marketplace-categories';
import { useAuth } from '@/hooks/use-auth';
import { MarketplaceCategory } from '@/lib/api';
import { useHeader } from '@/components/layout/admin-layout';

interface FormData {
  name: string;
  description: string;
  parent_id: string;
  slug: string;
  is_active: boolean;
}

interface FormErrors {
  name?: string;
  description?: string;
  parent_id?: string;
  slug?: string;
  general?: string;
}

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id as string;
  const { token } = useAuth();
  const { categories, updateCategory } = useMarketplaceCategories({ adminToken: token || undefined });
  const { setHeaderProps, clearHeaderProps } = useHeader();
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    parent_id: '',
    slug: '',
    is_active: true,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [slugGenerated, setSlugGenerated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [category, setCategory] = useState<MarketplaceCategory | null>(null);

  // Icono memoizado para evitar recrear JSX
  const headerIcon = useMemo(() => <Layers className="w-5 h-5 text-white" />, []);

  // Cargar datos de la categoría
  useEffect(() => {
    if (categories.length > 0 && categoryId) {
      const foundCategory = categories.find(cat => cat.id === categoryId);
      if (foundCategory) {
        setCategory(foundCategory);
        setFormData({
          name: foundCategory.name,
          description: foundCategory.description || '',
          parent_id: foundCategory.parent_id || '',
          slug: foundCategory.slug,
          is_active: foundCategory.is_active,
        });
        setIsLoading(false);
      } else {
        setErrors({ general: 'Categoría no encontrada' });
        setIsLoading(false);
      }
    }
  }, [categories, categoryId]);

  // Establecer header cuando la categoría esté cargada
  useEffect(() => {
    if (category) {
      setHeaderProps({
        title: 'Editar Categoría',
        subtitle: `Modificar categoría: ${category.name}`,
        backUrl: '/taxonomy',
        backLabel: 'Volver a Taxonomía',
        icon: headerIcon
      });
    }
  }, [category, setHeaderProps, headerIcon]);

  // Limpiar header al desmontar
  useEffect(() => {
    return () => {
      clearHeaderProps();
    };
  }, [clearHeaderProps]);

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[áàäâ]/g, 'a')
      .replace(/[éèëê]/g, 'e')
      .replace(/[íìïî]/g, 'i')
      .replace(/[óòöô]/g, 'o')
      .replace(/[úùüû]/g, 'u')
      .replace(/[ñ]/g, 'n')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleNameChange = (value: string) => {
    setFormData(prev => ({ ...prev, name: value }));
    
    // Auto-generar slug solo si no se ha modificado manualmente
    if (slugGenerated || !formData.slug) {
      const newSlug = generateSlug(value);
      setFormData(prev => ({ ...prev, slug: newSlug }));
      setSlugGenerated(true);
    }
  };

  const handleSlugChange = (value: string) => {
    setFormData(prev => ({ ...prev, slug: value }));
    setSlugGenerated(false); // Marcar como modificado manualmente
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'El nombre no puede exceder 100 caracteres';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'El slug es requerido';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'El slug solo puede contener letras minúsculas, números y guiones';
    } else if (formData.slug.length < 2) {
      newErrors.slug = 'El slug debe tener al menos 2 caracteres';
    } else if (formData.slug.length > 100) {
      newErrors.slug = 'El slug no puede exceder 100 caracteres';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'La descripción no puede exceder 500 caracteres';
    }

    // Verificar que no sea su propio padre
    if (formData.parent_id === categoryId) {
      newErrors.parent_id = 'Una categoría no puede ser su propio padre';
    }

    // Verificar que el slug no esté en uso por otra categoría
    const existingCategory = categories.find(cat => 
      cat.slug === formData.slug.trim() && cat.id !== categoryId
    );
    if (existingCategory) {
      newErrors.slug = 'Este slug ya está en uso por otra categoría';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const updateData: Partial<MarketplaceCategory> = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        parent_id: formData.parent_id || null,
        slug: formData.slug.trim(),
        is_active: formData.is_active,
      };
      
      const success = await updateCategory(categoryId, updateData);
      
      if (success) {
        // Redirigir a la lista con mensaje de éxito
        router.push('/taxonomy?updated=true');
      } else {
        setErrors({ general: 'Error al actualizar la categoría' });
      }
      
    } catch (error) {
      setErrors({ 
        general: error instanceof Error ? error.message : 'Error al actualizar la categoría' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getParentCategory = (parentId: string): MarketplaceCategory | undefined => {
    return categories.find(cat => cat.id === parentId);
  };

  const getExpectedLevel = (): number => {
    if (!formData.parent_id) return 0;
    const parent = getParentCategory(formData.parent_id);
    return parent ? parent.level + 1 : 0;
  };

  // Filtrar categorías que no pueden ser padres (la misma categoría y sus descendientes)
  const getAvailableParentCategories = (): MarketplaceCategory[] => {
    return categories.filter(cat => {
      // No puede ser padre de sí misma
      if (cat.id === categoryId) return false;
      
      // No puede ser padre si es descendiente de la categoría actual
      // (esto requeriría una lógica más compleja para detectar ciclos)
      // Por simplicidad, solo excluimos la categoría actual
      return true;
    });
  };

  if (isLoading) {
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

  if (!category) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            No se pudo encontrar la categoría solicitada.
          </AlertDescription>
        </Alert>
        <Link href="/taxonomy">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Taxonomía
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Error Alert */}
        {errors.general && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errors.general}</AlertDescription>
          </Alert>
        )}

        {/* Basic Information */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Información Básica</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Nombre de la Categoría <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Ej: Electrónicos, Ropa Femenina..."
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Nombre descriptivo de la categoría que será visible para los usuarios
              </p>
            </div>

            {/* Slug Field */}
            <div className="space-y-2">
              <Label htmlFor="slug">
                Slug (URL) <span className="text-red-500">*</span>
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="ej: electronicos, ropa-femenina"
                  className={errors.slug ? 'border-red-500' : ''}
                />
                {slugGenerated && (
                  <Badge variant="secondary" className="text-xs">
                    Auto
                  </Badge>
                )}
              </div>
              {errors.slug && (
                <p className="text-sm text-red-500">{errors.slug}</p>
              )}
              <p className="text-xs text-muted-foreground">
                URL amigable para la categoría. Solo letras minúsculas, números y guiones
              </p>
            </div>
          </div>

          {/* Description Field - Full Width */}
          <div className="space-y-2 mt-6">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descripción detallada de la categoría (opcional)"
              rows={3}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                Descripción opcional que ayude a entender el alcance de la categoría
              </p>
              <span className="text-xs text-muted-foreground">
                {formData.description.length}/500
              </span>
            </div>
          </div>
        </Card>

        {/* Hierarchy Configuration */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Configuración de Jerarquía</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Parent Category Selector */}
            <div className="space-y-2">
              <Label htmlFor="parent_id">Categoría Padre</Label>
              <Select 
                value={formData.parent_id || "none"} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, parent_id: value === "none" ? "" : value }))}
              >
                <SelectTrigger className={errors.parent_id ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Seleccionar categoría padre (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Ninguna (Categoría Raíz)</SelectItem>
                  {getAvailableParentCategories().map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          Nivel {category.level}
                        </Badge>
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.parent_id && (
                <p className="text-sm text-red-500">{errors.parent_id}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Selecciona una categoría padre para crear una jerarquía. Deja vacío para categoría raíz.
              </p>
            </div>

            {/* Status Configuration */}
            <div className="space-y-4">
              <div>
                <Label>Estado</Label>
                <div className="flex items-center justify-between mt-2 p-3 border rounded-lg">
                  <div>
                    <span className="text-sm font-medium">Estado Activo</span>
                    <p className="text-xs text-muted-foreground">
                      Las categorías inactivas no serán visibles en el marketplace
                    </p>
                  </div>
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Hierarchy Preview */}
          {formData.parent_id && (
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h3 className="text-sm font-medium mb-2">Vista Previa de Jerarquía:</h3>
              <div className="flex items-center gap-2 text-sm">
                <TreePine className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {getParentCategory(formData.parent_id)?.name} 
                </span>
                <span className="text-muted-foreground">→</span>
                <span className="font-medium">{formData.name || 'Nueva Categoría'}</span>
                <Badge variant="outline" className="text-xs ml-2">
                  Nivel {getExpectedLevel()}
                </Badge>
              </div>
            </div>
          )}
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 p-6 bg-card rounded-lg">
          <Link href="/taxonomy">
            <Button variant="outline" disabled={isSubmitting}>
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Actualizando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Actualizar Categoría
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
} 