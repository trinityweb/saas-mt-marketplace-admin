'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Star, Calendar, ExternalLink, Package, Loader2, ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { GlobalCatalogProduct } from '@/lib/api/pim';

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Componente de Galería de Imágenes
function ImageGallery({ 
  primaryImage, 
  additionalImages, 
  productName 
}: { 
  primaryImage?: string; 
  additionalImages?: string[] | null; 
  productName: string; 
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState<Set<number>>(new Set());

  // Combinar todas las imágenes disponibles
  const allImages = [
    ...(primaryImage ? [primaryImage] : []),
    ...(additionalImages || [])
  ].filter(Boolean);

  // Si no hay imágenes, mostrar placeholder
  if (allImages.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ImageIcon className="h-5 w-5" />
            <span>Imágenes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Sin imágenes disponibles</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleImageError = (index: number) => {
    setImageError(prev => new Set([...prev, index]));
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ImageIcon className="h-5 w-5" />
            <span>Imágenes</span>
          </div>
          {allImages.length > 1 && (
            <Badge variant="secondary">
              {currentImageIndex + 1} de {allImages.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Imagen Principal */}
        <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group">
          {!imageError.has(currentImageIndex) ? (
            <img
              src={allImages[currentImageIndex]}
              alt={`${productName} - Imagen ${currentImageIndex + 1}`}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
              onError={() => handleImageError(currentImageIndex)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Error al cargar imagen</p>
              </div>
            </div>
          )}
          
          {/* Controles de navegación para múltiples imágenes */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Imagen anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Imagen siguiente"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}
        </div>

        {/* Miniaturas */}
        {allImages.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {allImages.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`aspect-square rounded-md overflow-hidden border-2 transition-all ${
                  index === currentImageIndex 
                    ? 'border-blue-500 ring-2 ring-blue-200' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {!imageError.has(index) ? (
                  <img
                    src={image}
                    alt={`${productName} - Miniatura ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={() => handleImageError(index)}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <ImageIcon className="h-4 w-4 text-gray-400" />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ViewGlobalCatalogProductPage({ params }: ProductPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<GlobalCatalogProduct | null>(null);

  // Cargar datos del producto
  useEffect(() => {
    const loadProduct = async () => {
      try {
        const response = await fetch(`/api/pim/global-catalog/${resolvedParams.id}`);
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const productData = await response.json();
        setProduct(productData);
      } catch (error) {
        console.error('Error loading product:', error);
        toast({
          title: '❌ Error',
          description: 'No se pudo cargar el producto',
          variant: 'destructive',
        });
        router.push('/global-catalog');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [resolvedParams.id, router, toast]);

  const getQualityColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getQualityLabel = (score: number) => {
    if (score >= 80) return 'Alta';
    if (score >= 60) return 'Media';
    return 'Baja';
  };

  if (loading) {
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

  if (!product) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Producto no encontrado</h2>
          <p className="text-muted-foreground mb-4">El producto que buscas no existe o fue eliminado.</p>
          <Button onClick={() => router.push('/global-catalog')}>
            Volver al Catálogo
          </Button>
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
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-muted-foreground">
              Detalles del producto en el catálogo global
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => router.push(`/global-catalog/edit/${product.id}`)}
              className="flex items-center space-x-2"
            >
              <Edit className="h-4 w-4" />
              <span>Editar</span>
            </Button>
          </div>
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
                <div>
                  <label className="text-sm font-medium text-muted-foreground">EAN</label>
                  <p className="text-lg font-mono">{product.ean}</p>
                </div>
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
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tipo de negocio</label>
                  <p className="capitalize">{product.business_type || 'General'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Precio</label>
                  <p className="text-lg font-semibold">
                    {product.price ? `$${product.price.toLocaleString('es-AR')}` : 'No especificado'}
                  </p>
                </div>
              </div>
              
              {product.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Descripción</label>
                  <p className="mt-1">{product.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Información de Origen */}
          <Card>
            <CardHeader>
              <CardTitle>Información de Origen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Fuente</label>
                  <Badge variant="outline" className="mt-1">
                    {product.source}
                  </Badge>
                </div>
                {product.source_url && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">URL de origen</label>
                    <div className="mt-1">
                      <a
                        href={product.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                      >
                        <span className="truncate max-w-xs">{product.source_url}</span>
                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                      </a>
                    </div>
                  </div>
                )}
                {product.created_at && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Creado</label>
                    <p className="flex items-center space-x-1 mt-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(product.created_at).toLocaleDateString('es-AR')}</span>
                    </p>
                  </div>
                )}
                {product.updated_at && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Actualizado</label>
                    <p className="flex items-center space-x-1 mt-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(product.updated_at).toLocaleDateString('es-AR')}</span>
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panel Lateral */}
        <div className="space-y-6">
          {/* Galería de Imágenes */}
          <ImageGallery
            primaryImage={product.image_url}
            additionalImages={product.image_urls}
            productName={product.name}
          />

          {/* Estado y Calidad */}
          <Card>
            <CardHeader>
              <CardTitle>Estado y Calidad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Verificado</span>
                <Badge variant={product.is_verified ? 'default' : 'secondary'}>
                  {product.is_verified ? 'Sí' : 'No'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Activo</span>
                <Badge variant={product.is_active ? 'default' : 'destructive'}>
                  {product.is_active ? 'Sí' : 'No'}
                </Badge>
              </div>

              {typeof product.quality_score === 'number' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Calidad</span>
                    <Badge 
                      variant="outline" 
                      className={getQualityColor(product.quality_score)}
                    >
                      <Star className="h-3 w-3 mr-1" />
                      {product.quality_score}% - {getQualityLabel(product.quality_score)}
                    </Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        product.quality_score >= 80
                          ? 'bg-green-500'
                          : product.quality_score >= 60
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${product.quality_score}%` }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Metadatos */}
          {product.metadata && Object.keys(product.metadata).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Metadatos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {Object.entries(product.metadata).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-muted-foreground capitalize">
                        {key.replace(/_/g, ' ')}:
                      </span>
                      <span className="font-medium truncate ml-2">
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
