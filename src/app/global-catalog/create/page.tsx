'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Plus, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CreateProductForm {
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
}

export default function CreateGlobalCatalogProductPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const [form, setForm] = useState<CreateProductForm>({
    ean: '',
    name: '',
    description: '',
    brand: '',
    category: '',
    price: '',
    image_url: '',
    business_type: '',
    source: 'manual',
    source_url: '',
    tags: []
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

  const handleInputChange = (field: keyof CreateProductForm, value: string) => {
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
        tags: form.tags.length > 0 ? form.tags : undefined
      };

      const response = await fetch('/api/pim/global-catalog', {
        method: 'POST',
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
        title: '✅ Producto creado',
        description: `${result.name} se creó exitosamente en el catálogo global`,
      });

      router.push('/global-catalog');
    } catch (error) {
      console.error('Error creating product:', error);
      toast({
        title: '❌ Error',
        description: error instanceof Error ? error.message : 'Error al crear el producto',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Crear Producto</h1>
          <p className="text-muted-foreground">
            Agregar un nuevo producto al catálogo global
          </p>
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
              <div className="space-y-2">
                <Label htmlFor="ean">Código EAN *</Label>
                <Input
                  id="ean"
                  value={form.ean}
                  onChange={(e) => handleInputChange('ean', e.target.value)}
                  placeholder="1234567890123"
                  maxLength={13}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Código EAN-13 de 13 dígitos
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Producto *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Coca Cola 600ml"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Descripción detallada del producto..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand">Marca</Label>
                <Input
                  id="brand"
                  value={form.brand}
                  onChange={(e) => handleInputChange('brand', e.target.value)}
                  placeholder="Coca Cola"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Precio (ARS)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="150.50"
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
              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <Select value={form.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
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

              <div className="space-y-2">
                <Label htmlFor="business_type">Tipo de Negocio</Label>
                <Select value={form.business_type} onValueChange={(value) => handleInputChange('business_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo de negocio" />
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

              <div className="space-y-2">
                <Label htmlFor="image_url">URL de Imagen</Label>
                <Input
                  id="image_url"
                  value={form.image_url}
                  onChange={(e) => handleInputChange('image_url', e.target.value)}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  type="url"
                />
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>Etiquetas</Label>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Agregar etiqueta"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddTag} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {form.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {form.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => handleRemoveTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Metadatos de Origen */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Metadatos de Origen</CardTitle>
              <CardDescription>
                Información sobre la fuente del producto
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="source">Fuente</Label>
                <Select value={form.source} onValueChange={(value) => handleInputChange('source', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="scraping">Web Scraping</SelectItem>
                    <SelectItem value="api">API Externa</SelectItem>
                    <SelectItem value="partnership">Partnership</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="source_url">URL de Origen</Label>
                <Input
                  id="source_url"
                  value={form.source_url}
                  onChange={(e) => handleInputChange('source_url', e.target.value)}
                  placeholder="https://ejemplo.com/producto"
                  type="url"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Botones de Acción */}
        <div className="flex justify-end gap-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creando...' : 'Crear Producto'}
          </Button>
        </div>
      </form>
    </div>
  );
} 