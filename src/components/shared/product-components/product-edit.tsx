'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, X, Package, Info, Image as ImageIcon } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared-ui/molecules/card';
import { Button } from '@/components/shared-ui/atoms/button';
import { Input } from '@/components/shared-ui/atoms/input';
import { Label } from '@/components/shared-ui/atoms/label';
import { Textarea } from '@/components/shared-ui/atoms/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/shared-ui/molecules/select';
import { Badge } from '@/components/shared-ui/atoms/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shared-ui/atoms/tabs';
import { ProductEditProps, ProductFormData, LoadingState } from './types';

export function ProductEdit({
  product,
  onSave,
  onCancel,
  brands,
  categories,
  readonly = false,
  mode = 'edit'
}: ProductEditProps) {
  const router = useRouter();
  
  const [formData, setFormData] = useState<ProductFormData>({
    name: product?.name || '',
    description: product?.description || '',
    brand: product?.brand || '',
    category: product?.category || '',
    ean: product?.ean || '',
    price: product?.price || 0,
    status: product?.is_active ? 'active' : 'inactive',
    tags: product?.tags || [],
    weight: '',
    dimensions: '',
    quality_score: product?.quality_score || 0,
    is_verified: product?.is_verified || false,
    source: product?.source || ''
  });

  const [loadingState, setLoadingState] = useState<LoadingState>({
    loading: false,
    error: null,
    success: null
  });

  const [newTag, setNewTag] = useState('');

  // Manejar cambios en el formulario
  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Agregar tag
  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  // Remover tag
  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Manejar envío del formulario
  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      alert('El nombre del producto es obligatorio.');
      return;
    }

    setLoadingState({ loading: true, error: null, success: null });

    try {
      await onSave(formData);
      setLoadingState({ 
        loading: false, 
        error: null, 
        success: `Producto ${mode === 'create' ? 'creado' : 'actualizado'} exitosamente` 
      });
      
      alert(`Producto ${mode === 'create' ? 'creado' : 'actualizado'} exitosamente.`);

      // Redirigir después de guardar
      setTimeout(() => {
        router.back();
      }, 1000);

    } catch (error: any) {
      setLoadingState({ 
        loading: false, 
        error: error.message || 'Error al guardar el producto', 
        success: null 
      });
      
      alert(error.message || 'Error al guardar el producto.');
    }
  };

  // Detectar si estamos en marketplace admin
  const isMarketplaceAdmin = typeof window !== 'undefined' && 
    window.location.pathname.includes('/global-catalog');

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-2xl font-bold">
                {mode === 'create' ? 'Crear Producto' : 'Editar Producto'}
              </h1>
              <p className="text-muted-foreground">
                {isMarketplaceAdmin 
                  ? 'Catálogo Global del Marketplace' 
                  : 'Catálogo del Tenant'
                }
              </p>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button variant="outline" onClick={onCancel || (() => router.back())} disabled={loadingState.loading}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={loadingState.loading || readonly}>
              <Save className="h-4 w-4 mr-2" />
              {loadingState.loading ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </div>
      </div>

      {/* Mensajes de estado */}
      {loadingState.error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {loadingState.error}
        </div>
      )}

      {loadingState.success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          {loadingState.success}
        </div>
      )}

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Información Básica</TabsTrigger>
          <TabsTrigger value="details">Detalles</TabsTrigger>
          <TabsTrigger value="preview">Vista Previa</TabsTrigger>
        </TabsList>
        
        {/* Solapa 1: Información Básica */}
        <TabsContent value="basic" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Columna izquierda - Información principal */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Package className="h-5 w-5" />
                    <span>Información del Producto</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nombre *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Nombre del producto"
                      disabled={readonly}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Descripción del producto..."
                      rows={3}
                      disabled={readonly}
                      className="mt-1"
                    />
                  </div>

                  {formData.ean !== undefined && (
                    <div>
                      <Label htmlFor="ean">EAN</Label>
                      <Input
                        id="ean"
                        value={formData.ean}
                        onChange={(e) => handleInputChange('ean', e.target.value)}
                        placeholder="Código EAN del producto"
                        disabled={readonly}
                        className="mt-1"
                      />
                    </div>
                  )}

                  {formData.price !== undefined && (
                    <div>
                      <Label htmlFor="price">Precio</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        disabled={readonly}
                        className="mt-1"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Columna derecha - Categorización y estado */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Categorización</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="brand">Marca</Label>
                    <Select 
                      value={formData.brand} 
                      onValueChange={(value) => handleInputChange('brand', value)}
                      disabled={readonly}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Seleccionar marca" />
                      </SelectTrigger>
                      <SelectContent>
                        {brands.map((brand) => (
                          <SelectItem key={brand.id} value={brand.name}>
                            {brand.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="category">Categoría</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => handleInputChange('category', value)}
                      disabled={readonly}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="status">Estado</Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(value) => handleInputChange('status', value)}
                      disabled={readonly}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Activo</SelectItem>
                        <SelectItem value="inactive">Inactivo</SelectItem>
                        <SelectItem value="draft">Borrador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Tags */}
              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Agregar tag"
                      disabled={readonly}
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    />
                    <Button 
                      type="button" 
                      onClick={addTag}
                      disabled={readonly || !newTag.trim()}
                    >
                      Agregar
                    </Button>
                  </div>
                  
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="gap-1">
                          {tag}
                          {!readonly && (
                            <button 
                              onClick={() => removeTag(tag)}
                              className="ml-1 text-xs hover:text-red-600"
                            >
                              ×
                            </button>
                          )}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Solapa 2: Detalles */}
        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Info className="h-5 w-5" />
                <span>Detalles Adicionales</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isMarketplaceAdmin && (
                <>
                  <div>
                    <Label htmlFor="quality_score">Puntuación de Calidad</Label>
                    <Input
                      id="quality_score"
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={formData.quality_score}
                      onChange={(e) => handleInputChange('quality_score', parseFloat(e.target.value) || 0)}
                      disabled={readonly}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="source">Fuente</Label>
                    <Input
                      id="source"
                      value={formData.source}
                      onChange={(e) => handleInputChange('source', e.target.value)}
                      placeholder="Fuente del producto"
                      disabled={readonly}
                      className="mt-1"
                    />
                  </div>
                </>
              )}

              <div>
                <Label htmlFor="weight">Peso</Label>
                <Input
                  id="weight"
                  value={formData.weight}
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                  placeholder="1.5 kg"
                  disabled={readonly}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="dimensions">Dimensiones</Label>
                <Input
                  id="dimensions"
                  value={formData.dimensions}
                  onChange={(e) => handleInputChange('dimensions', e.target.value)}
                  placeholder="20x15x10 cm"
                  disabled={readonly}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Solapa 3: Vista Previa */}
        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ImageIcon className="h-5 w-5" />
                <span>Vista Previa del Producto</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-white border rounded-lg p-6 space-y-4">
                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center max-w-sm">
                  <div className="text-center text-gray-400">
                    <Package className="w-16 h-16 mx-auto mb-2" />
                    <p className="text-sm">Sin imagen</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">
                    {formData.name || 'Nombre del producto'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {formData.description || 'Descripción del producto...'}
                  </p>
                  
                  {formData.price && formData.price > 0 && (
                    <p className="text-xl font-bold text-green-600">
                      ${formData.price.toLocaleString('es-AR')}
                    </p>
                  )}

                  <div className="space-y-1 text-xs">
                    {formData.brand && (
                      <div>
                        <span className="text-gray-600">Marca:</span>{' '}
                        <span className="font-medium">{formData.brand}</span>
                      </div>
                    )}
                    {formData.category && (
                      <div>
                        <span className="text-gray-600">Categoría:</span>{' '}
                        <span className="font-medium">{formData.category}</span>
                      </div>
                    )}
                  </div>

                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {formData.tags.slice(0, 5).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 