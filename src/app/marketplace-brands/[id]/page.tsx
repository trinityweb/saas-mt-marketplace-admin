'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { 
  Award,
  Edit,
  Trash2,
  ArrowLeft,
  Check,
  X,
  ExternalLink,
  Shield,
  ShieldCheck,
  AlertTriangle,
  Calendar,
  MapPin,
  Hash,
  Globe,
  Package,
  Star,
  TrendingUp,
  Users
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
} from '@/components/ui/alert-dialog';

import { useAuth } from '@/hooks/use-auth';
import { useHeader } from '@/components/layout/admin-layout';
import { type MarketplaceBrand } from '@/lib/api';

const verificationStatusLabels = {
  verified: 'Verificada',
  unverified: 'No verificada', 
  disputed: 'Disputada',
  pending: 'Pendiente'
};

const verificationStatusColors = {
  verified: 'bg-green-100 text-green-800 border-green-300',
  unverified: 'bg-gray-100 text-gray-800 border-gray-300',
  disputed: 'bg-red-100 text-red-800 border-red-300',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300'
};

const verificationStatusIcons = {
  verified: ShieldCheck,
  unverified: Shield,
  disputed: AlertTriangle,
  pending: Shield
};

export default function BrandViewPage() {
  const router = useRouter();
  const params = useParams();
  const { token } = useAuth();
  const { setHeaderProps, clearHeaderProps } = useHeader();
  
  const [brand, setBrand] = useState<MarketplaceBrand | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Icono memoizado
  const headerIcon = useMemo(() => <Award className="w-5 h-5 text-white" />, []);

  // ID de la marca
  const brandId = params.id as string;

  // Función para cargar la marca
  const fetchBrand = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/pim/marketplace-brands/${brandId}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setBrand(data);
      
    } catch (err) {
      console.error('Error fetching brand:', err);
      setError('Error al cargar la marca: ' + (err instanceof Error ? err.message : 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  // Cargar marca al montar
  useEffect(() => {
    if (brandId) {
      fetchBrand();
    }
  }, [brandId]);

  // Configurar header
  useEffect(() => {
    if (brand) {
      setHeaderProps({
        title: `${brand.name}`,
        subtitle: 'Detalles de la marca del marketplace',
        backUrl: '/marketplace-brands',
        backLabel: 'Volver a Marcas',
        icon: headerIcon,
        actions: (
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => router.push(`/marketplace-brands/${brandId}/edit`)}
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
                  <AlertDialogTitle>¿Eliminar marca?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción eliminará permanentemente la marca "{brand.name}" del marketplace. 
                    Esta acción no se puede deshacer.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => {
                      // TODO: Implementar eliminación
                      console.log('Eliminar marca:', brandId);
                      router.push('/marketplace-brands');
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
  }, [setHeaderProps, clearHeaderProps, headerIcon, brand, brandId, router]);

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

  if (error || !brand) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-medium text-destructive mb-2">Error al cargar</h3>
              <p className="text-muted-foreground mb-4">
                {error || 'No se pudo encontrar la marca solicitada.'}
              </p>
              <div className="flex justify-center space-x-2">
                <Button onClick={() => fetchBrand()}>Reintentar</Button>
                <Button variant="outline" onClick={() => router.push('/marketplace-brands')}>
                  Volver a Marcas
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Normalizar quality score
  const normalizedScore = brand.quality_score > 1 ? brand.quality_score / 10 : brand.quality_score;
  const qualityPercentage = Math.round(normalizedScore * 100);

  const StatusIcon = verificationStatusIcons[brand.verification_status];

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Información Principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Información Básica */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5" />
              <span>Información General</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Logo y nombre */}
            <div className="flex items-center space-x-4">
              {brand.logo_url && (
                <img 
                  src={brand.logo_url} 
                  alt={brand.name}
                  className="w-16 h-16 rounded-lg object-cover border"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
              <div>
                <h2 className="text-2xl font-bold">{brand.name}</h2>
                <p className="text-muted-foreground">{brand.normalized_name}</p>
              </div>
            </div>

            <Separator />

            {/* Detalles */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">ID: {brand.id}</span>
              </div>
              
              {brand.country_code && (
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{brand.country_code}</span>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {new Date(brand.created_at).toLocaleDateString('es-ES')}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{brand.product_count || 0} productos</span>
              </div>
            </div>

            {/* Website */}
            {brand.website && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Sitio web</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(brand.website, '_blank')}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Visitar
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Estado y Verificación */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Estado y Verificación</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Estado activo */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Estado</span>
              <Badge variant={brand.is_active ? "default" : "secondary"}>
                {brand.is_active ? (
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

            {/* Verificación */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Verificación</span>
              <Badge className={verificationStatusColors[brand.verification_status]}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {verificationStatusLabels[brand.verification_status]}
              </Badge>
            </div>

            <Separator />

            {/* Calidad */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Calidad</span>
                <span className="text-sm font-semibold">{qualityPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300" 
                  style={{ width: `${qualityPercentage}%` }}
                />
              </div>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <Star className="h-3 w-3" />
                <span>Puntuación de calidad del contenido</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Aliases y Categorías */}
      {(brand.aliases?.length > 0 || brand.category_tags?.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Información Adicional</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Aliases */}
            {brand.aliases && brand.aliases.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Aliases</h4>
                <div className="flex flex-wrap gap-2">
                  {brand.aliases.map((alias, index) => (
                    <Badge key={index} variant="outline">
                      {alias}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Categorías */}
            {brand.category_tags && brand.category_tags.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Categorías</h4>
                <div className="flex flex-wrap gap-2">
                  {brand.category_tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Descripción */}
      {brand.description && (
        <Card>
          <CardHeader>
            <CardTitle>Descripción</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              {brand.description}
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
              onClick={() => router.push(`/marketplace-brands/${brandId}/edit`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar Marca
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => {
                // TODO: Implementar verificación/desverificación
                console.log('Toggle verification:', brandId);
              }}
            >
              {brand.verification_status === 'verified' ? (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Desverificar
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  Verificar
                </>
              )}
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => {
                // TODO: Implementar activar/desactivar
                console.log('Toggle status:', brandId);
              }}
            >
              {brand.is_active ? (
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

            {brand.website && (
              <Button 
                variant="outline"
                onClick={() => window.open(brand.website, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Visitar Sitio Web
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 