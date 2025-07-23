'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Package, 
  CheckCircle, 
  Star, 
  Calendar, 
  Tag, 
  Globe,
  Award,
  ShoppingCart,
  ArrowLeft,
  Edit,
  Trash2,
  VerifiedIcon
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared-ui/molecules/card';
import { Badge } from '@/components/shared-ui/atoms/badge';
import { Button } from '@/components/shared-ui/atoms/button';
import { Separator } from '@/components/shared-ui/atoms/separator';
import { ProductViewProps, BaseProduct } from './types';

export function ProductView({ 
  product, 
  mode = 'view',
  onSave,
  onCancel,
  showVerificationBadge = true,
  showQualityScore = true,
  showSource = true,
  readonly = false
}: ProductViewProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Formatear precio
  const formatPrice = (price?: number) => {
    if (!price) return 'No especificado';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price);
  };

  // Obtener color del badge de calidad
  const getQualityBadgeVariant = (score?: number) => {
    if (!score) return 'secondary';
    if (score >= 4.5) return 'default';
    if (score >= 3.5) return 'secondary';
    return 'outline';
  };

  // Manejar edición
  const handleEdit = () => {
    const editPath = window.location.pathname.includes('/global-catalog') 
      ? `/global-catalog/edit/${product.id}`
      : `/dashboard/pim/products/edit/${product.id}`;
    router.push(editPath);
  };

  // Manejar eliminación
  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      return;
    }

    setLoading(true);
    try {
      const deleteEndpoint = window.location.pathname.includes('/global-catalog')
        ? `/api/pim/global-catalog/${product.id}`
        : `/api/pim/products/${product.id}`;

      const response = await fetch(deleteEndpoint, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Simple notification - marketplace admin might not have toast
        alert('Producto eliminado exitosamente');
        router.back();
      } else {
        throw new Error('Error al eliminar el producto');
      }
    } catch (error) {
      alert('No se pudo eliminar el producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{product.name}</h1>
              <p className="text-muted-foreground">
                {window.location.pathname.includes('/global-catalog') 
                  ? 'Producto del Catálogo Global' 
                  : 'Producto del Tenant'
                }
              </p>
            </div>
          </div>
          
          {!readonly && mode === 'view' && (
            <div className="flex space-x-2">
              <Button onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={loading}>
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Datos Básicos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Información Básica</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.ean && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">EAN</label>
                    <p className="text-lg font-mono">{product.ean}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">ID</label>
                  <p className="text-sm font-mono text-muted-foreground">{product.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Marca</label>
                  <p>{product.brand || 'Sin marca'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Categoría</label>
                  <p>{product.category || 'Sin categoría'}</p>
                </div>
                {product.price && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Precio</label>
                    <p className="text-lg font-semibold">{formatPrice(product.price)}</p>
                  </div>
                )}
              </div>

              {product.description && (
                <div className="mt-4">
                  <label className="text-sm font-medium text-muted-foreground">Descripción</label>
                  <p className="mt-1 text-sm leading-relaxed">{product.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Metadatos y Tags */}
          {(product.tags && product.tags.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Tag className="h-5 w-5" />
                  <span>Tags</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Información Lateral */}
        <div className="space-y-6">
          {/* Estado y Verificación */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Estado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Estado</span>
                <Badge variant={product.is_active ? 'default' : 'secondary'}>
                  {product.is_active ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>

              {showVerificationBadge && typeof product.is_verified === 'boolean' && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Verificado</span>
                  <Badge variant={product.is_verified ? 'default' : 'outline'}>
                    {product.is_verified ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verificado
                      </>
                    ) : (
                      'No verificado'
                    )}
                  </Badge>
                </div>
              )}

              {showQualityScore && product.quality_score && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Calidad</span>
                  <Badge variant={getQualityBadgeVariant(product.quality_score)}>
                    <Star className="h-3 w-3 mr-1" />
                    {product.quality_score.toFixed(1)}/5.0
                  </Badge>
                </div>
              )}

              {showSource && product.source && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Fuente</span>
                  <Badge variant="outline">
                    <Globe className="h-3 w-3 mr-1" />
                    {product.source}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Fechas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información Temporal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Creado</label>
                <p className="text-sm flex items-center mt-1">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatDate(product.created_at)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Actualizado</label>
                <p className="text-sm flex items-center mt-1">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatDate(product.updated_at)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Imagen del producto */}
          {product.image_url && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Imagen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img 
                    src={product.image_url} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 