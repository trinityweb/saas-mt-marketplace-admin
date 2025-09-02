'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Save, 
  Layers, 
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';

import { Button } from '@/components/shared-ui';
import { Input } from '@/components/shared-ui';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/shared-ui';
import { Badge } from '@/components/shared-ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';

import { MarketplaceCategory, CreateMarketplaceCategoryRequest } from '@/lib/api';
import { useMarketplaceCategories } from '@/hooks/use-marketplace-categories';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/hooks/use-auth';

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

export default function CreateCategoryPage() {
  const router = useRouter();
  const { token } = useAuth();
  const { categories, createCategory } = useMarketplaceCategories({ adminToken: token || undefined });
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    parent_id: '',
    slug: '',
    is_active: true,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [slugGenerated, setSlugGenerated] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generar slug automáticamente desde el nombre
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remover acentos
      .replace(/[^a-z0-9\s-]/g, '') // Solo letras, números, espacios y guiones
      .replace(/\s+/g, '-') // Espacios a guiones
      .replace(/-+/g, '-') // Múltiples guiones a uno solo
      .trim()
      .replace(/^-|-$/g, ''); // Remover guiones al inicio y final
  };

  const handleNameChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      name: value,
      slug: slugGenerated ? generateSlug(value) : prev.slug
    }));
    
    // Limpiar error de nombre si existe
    if (errors.name) {
      setErrors(prev => ({ ...prev, name: undefined }));
    }
  };

  const handleSlugChange = (value: string) => {
    setSlugGenerated(false);
    setFormData(prev => ({ ...prev, slug: value }));
    
    // Limpiar error de slug si existe
    if (errors.slug) {
      setErrors(prev => ({ ...prev, slug: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validar nombre
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    } else if (formData.name.length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    } else if (formData.name.length > 100) {
      newErrors.name = 'El nombre no puede exceder 100 caracteres';
    }

    // Validar slug
    if (!formData.slug.trim()) {
      newErrors.slug = 'El slug es obligatorio';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'El slug solo puede contener letras minúsculas, números y guiones';
    } else if (formData.slug.length < 2) {
      newErrors.slug = 'El slug debe tener al menos 2 caracteres';
    }

    // Validar descripción (opcional pero con límite)
    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'La descripción no puede exceder 500 caracteres';
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
      const categoryData: CreateMarketplaceCategoryRequest = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        parent_id: formData.parent_id || null,
        slug: formData.slug.trim(),
      };
      
      const success = await createCategory(categoryData);
      
      if (success) {
        // Redirigir a la lista con mensaje de éxito
        router.push('/taxonomy?created=true');
      } else {
        setErrors({ general: 'Error al crear la categoría' });
      }
      
    } catch (error) {
      setErrors({ 
        general: error instanceof Error ? error.message : 'Error al crear la categoría' 
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/taxonomy">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver a Taxonomía
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Layers className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold">Crear Nueva Categoría</h1>
                  <p className="text-sm text-muted-foreground">
                    Agregar una nueva categoría a la taxonomía marketplace
                  </p>
                </div>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-8">
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
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-4">Información Básica</h2>
              </div>

              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Nombre de la Categoría <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ej: Electrónicos, Ropa Femenina, Deportes..."
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
                      Auto-generado
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

              {/* Description Field */}
              <div className="space-y-2">
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
            </div>
          </Card>

          {/* Hierarchy Configuration */}
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-4">Configuración de Jerarquía</h2>
              </div>

              {/* Parent Category Selector */}
              <div className="space-y-2">
                <Label htmlFor="parent_id">Categoría Padre</Label>
                <Select 
                  value={formData.parent_id || "none"} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, parent_id: value === "none" ? "" : value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría padre (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Ninguna (Categoría Raíz)</SelectItem>
                    {categories.map((category) => (
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
                <p className="text-xs text-muted-foreground">
                  Selecciona una categoría padre si esta categoría debe ser una subcategoría
                </p>
              </div>

              {/* Hierarchy Preview */}
              {formData.parent_id && (
                <div className="bg-muted rounded-lg p-4">
                  <h4 className="text-sm font-medium mb-2">Vista Previa de Jerarquía:</h4>
                  <div className="text-sm text-muted-foreground">
                    {getParentCategory(formData.parent_id)?.name} 
                    <span className="mx-2">{'>'}</span>
                    <span className="font-medium text-foreground">{formData.name || 'Nueva Categoría'}</span>
                  </div>
                  <div className="mt-2">
                    <Badge className="bg-blue-100 text-blue-800">
                      Nivel {getExpectedLevel()}
                    </Badge>
                  </div>
                </div>
              )}

              {!formData.parent_id && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium text-blue-900">Categoría Raíz</span>
                  </div>
                  <p className="text-sm text-blue-700 mt-1">
                    Esta categoría será una categoría principal (nivel 0)
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Status Configuration */}
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-4">Estado</h2>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="is_active">Categoría Activa</Label>
                  <p className="text-sm text-muted-foreground">
                    Las categorías activas son visibles para los tenants
                  </p>
                </div>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t">
            <Link href="/taxonomy">
              <Button variant="outline" disabled={isSubmitting}>
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Crear Categoría
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
} 