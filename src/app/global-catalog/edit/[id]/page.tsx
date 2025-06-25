'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { X, Plus, ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EditProductForm {
  id: string;
  ean: string;
  name: string;
  description: string;
  brand: string;
  category: string;
  price: string;
  image_url: string;
  business_type: string;
  source: string;
  source_url: string;
  tags: string[];
  is_verified: boolean;
  is_active: boolean;
  quality_score: number;
}

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditGlobalCatalogProductPage({ params }: ProductPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [tagInput, setTagInput] = useState('');

  const [form, setForm] = useState<EditProductForm>({
    id: resolvedParams.id,
    ean: '',
    name: '',
    description: '',
    brand: '',
    category: '',
    price: '',
    image_url: '',
    business_type: '',
    source: '',
    source_url: '',
    tags: [],
    is_verified: false,
    is_active: true,
    quality_score: 0
  });

  const businessTypes = [
    { value: 'supermercado', label: 'Supermercado' },
    { value: 'farmacia', label: 'Farmacia' },
    { value: 'ferreteria', label: 'Ferretería' },
    { value: 'tecnologia', label: 'Tecnología' },
    { value: 'moda', label: 'Moda' },
    { value: 'deportes', label: 'Deportes' },
    { value: 'hogar', label: 'Hogar' },
    { value: 'automotriz', label: 'Automotriz' }
  ];

  const categories = [
    'Alimentos y Bebidas',
    'Tecnología',
    'Moda e Indumentaria',
    'Hogar y Decoración',
    'Deportes y Fitness',
    'Salud y Belleza',
    'Construcción',
    'Automotriz',
    'Libros y Entretenimiento',
    'Mascotas'
  ];

  // Cargar datos del producto
  useEffect(() => {
    const loadProduct = async () => {
      try {
        const response = await fetch(`/api/pim/global-catalog/${resolvedParams.id}`);
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const product = await response.json();
        
        setForm({
          id: product.id,
          ean: product.ean || '',
          name: product.name || '',
          description: product.description || '',
          brand: product.brand || '',
          category: product.category || '',
          price: product.price ? product.price.toString() : '',
          image_url: product.image_url || '',
          business_type: product.business_type || '',
          source: product.source || 'manual',
          source_url: product.source_url || '',
          tags: product.tags || [],
          is_verified: product.is_verified || false,
          is_active: product.is_active !== false,
          quality_score: product.quality_score || 0
        });
      } catch (error) {
        console.error('Error loading product:', error);
        toast({
          title: '❌ Error',
          description: 'No se pudo cargar el producto',
          variant: 'destructive',
        });
        router.push('/global-catalog');
      } finally {
        setInitialLoading(false);
      }
    };

    loadProduct();
  }, [resolvedParams.id, router, toast]);

  const handleInputChange = (field: keyof EditProductForm, value: string | boolean | number) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validar EAN
      if (form.ean.length !== 13 || !/^\d+$/.test(form.ean)) {
        throw new Error('El EAN debe tener exactamente 13 dígitos');
      }

      const payload = {
        ean: form.ean,
        name: form.name,
        description: form.description || undefined,
        brand: form.brand || undefined,
        category: form.category || undefined,
        price: form.price ? parseFloat(form.price) : undefined,
        image_url: form.image_url || undefined,
        business_type: form.business_type || undefined,
        source: form.source,
        source_url: form.source_url || undefined,
        tags: form.tags.length > 0 ? form.tags : undefined,
        is_verified: form.is_verified,
        is_active: form.is_active
      };

      const response = await fetch(`/api/pim/global-catalog/${resolvedParams.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(errorData.error || `Error ${response.status}`);
      }

      const result = await response.json();
      
      toast({
        title: '✅ Producto actualizado',
        description: `${result.name} se actualizó exitosamente`,
        variant: 'default',
      });

      router.push('/global-catalog');
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: '❌ Error',
        description: error instanceof Error ? error.message : 'Error al actualizar el producto',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Cargando producto...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/global-catalog')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al Catálogo Global
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Editar Producto</h1>
            <p className="text-muted-foreground">
              Modifica los datos del producto en el catálogo global
            </p>
          </div>
          <Badge variant="outline" className="text-sm">
            ID: {form.id}
          </Badge>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Información Básica */}
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
              <CardDescription>
                Datos principales del producto
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="ean">EAN (13 dígitos) *</Label>
                <Input
                  id="ean"
                  value={form.ean}
                  onChange={(e) => handleInputChange('ean', e.target.value)}
                  placeholder="1234567890123"
                  maxLength={13}
                  required
                />
              </div>

              <div>
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Nombre del producto"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Descripción del producto"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="brand">Marca</Label>
                <Input
                  id="brand"
                  value={form.brand}
                  onChange={(e) => handleInputChange('brand', e.target.value)}
                  placeholder="Marca del producto"
                />
              </div>

              <div>
                <Label htmlFor="price">Precio de Referencia</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </CardContent>
          </Card>

          {/* Categorización */}
          <Card>
            <CardHeader>
              <CardTitle>Categorización</CardTitle>
              <CardDescription>
                Clasificación y organización del producto
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="category">Categoría</Label>
                <Select
                  value={form.category}
                  onValueChange={(value) => handleInputChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="business_type">Tipo de Negocio</Label>
                <Select
                  value={form.business_type}
                  onValueChange={(value) => handleInputChange('business_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el tipo de negocio" />
                  </SelectTrigger>
                  <SelectContent>
                    {businessTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="image_url">URL de Imagen</Label>
                <Input
                  id="image_url"
                  type="url"
                  value={form.image_url}
                  onChange={(e) => handleInputChange('image_url', e.target.value)}
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>

              {/* Tags */}
              <div>
                <Label>Etiquetas</Label>
                <div className="flex space-x-2 mb-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Agregar etiqueta"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddTag}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Origen y Metadatos */}
          <Card>
            <CardHeader>
              <CardTitle>Origen y Metadatos</CardTitle>
              <CardDescription>
                Información sobre el origen y calidad del producto
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="source">Fuente</Label>
                <Select
                  value={form.source}
                  onValueChange={(value) => handleInputChange('source', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="scraping">Scraping</SelectItem>
                    <SelectItem value="api">API</SelectItem>
                    <SelectItem value="import">Importación</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="source_url">URL de Origen</Label>
                <Input
                  id="source_url"
                  type="url"
                  value={form.source_url}
                  onChange={(e) => handleInputChange('source_url', e.target.value)}
                  placeholder="https://fuente.com/producto"
                />
              </div>

              <div>
                <Label>Puntuación de Calidad: {form.quality_score}</Label>
                <div className="text-sm text-muted-foreground mb-2">
                  Calidad automática basada en completitud de datos
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${form.quality_score}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estado y Configuración */}
          <Card>
            <CardHeader>
              <CardTitle>Estado y Configuración</CardTitle>
              <CardDescription>
                Configuración de visibilidad y verificación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="is_active">Producto Activo</Label>
                  <div className="text-sm text-muted-foreground">
                    El producto está disponible en el catálogo
                  </div>
                </div>
                <Switch
                  id="is_active"
                  checked={form.is_active}
                  onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="is_verified">Producto Verificado</Label>
                  <div className="text-sm text-muted-foreground">
                    El producto ha sido revisado y verificado
                  </div>
                </div>
                <Switch
                  id="is_verified"
                  checked={form.is_verified}
                  onCheckedChange={(checked) => handleInputChange('is_verified', checked)}
                />
              </div>

              {form.is_verified && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center">
                    <div className="text-green-600 text-sm font-medium">
                      ✅ Producto Verificado
                    </div>
                  </div>
                  <div className="text-green-600 text-sm">
                    Este producto ha sido revisado y aprobado para el marketplace
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Botones de Acción */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/global-catalog')}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading || !form.name || !form.ean}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Actualizando...
              </>
            ) : (
              'Actualizar Producto'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
} 