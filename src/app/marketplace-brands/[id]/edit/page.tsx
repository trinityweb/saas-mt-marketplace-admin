'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { 
  Award,
  Save,
  X,
  AlertTriangle,
  Loader2,
  Eye,
  EyeOff,
  Plus,
  Trash2
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
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

interface BrandFormData {
  name: string;
  normalized_name: string;
  description: string;
  website: string;
  logo_url: string;
  country_code: string;
  verification_status: 'verified' | 'unverified' | 'pending' | 'disputed';
  is_active: boolean;
  aliases: string[];
  category_tags: string[];
  quality_score: number;
}

export default function BrandEditPage() {
  const router = useRouter();
  const params = useParams();
  const { token } = useAuth();
  const { setHeaderProps, clearHeaderProps } = useHeader();
  
  // Debug: Log inicial
  console.log('🚀 BrandEditPage cargada, ID:', params.id);
  
  const [originalBrand, setOriginalBrand] = useState<MarketplaceBrand | null>(null);
  const [formData, setFormData] = useState<BrandFormData>({
    name: '',
    normalized_name: '',
    description: '',
    website: '',
    logo_url: '',
    country_code: '',
    verification_status: 'unverified',
    is_active: true,
    aliases: [],
    category_tags: [],
    quality_score: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Estados para campos dinámicos
  const [newAlias, setNewAlias] = useState('');
  const [newCategoryTag, setNewCategoryTag] = useState('');

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
      
      const data: MarketplaceBrand = await response.json();
      setOriginalBrand(data);
      
      // Normalizar quality score
      const normalizedScore = data.quality_score > 1 ? data.quality_score / 10 : data.quality_score;
      
      setFormData({
        name: data.name || '',
        normalized_name: data.normalized_name || '',
        description: data.description || '',
        website: data.website || '',
        logo_url: data.logo_url || '',
        country_code: data.country_code || '',
        verification_status: data.verification_status || 'unverified',
        is_active: data.is_active ?? true,
        aliases: data.aliases || [],
        category_tags: data.category_tags || [],
        quality_score: normalizedScore
      });
      
    } catch (err) {
      console.error('Error fetching brand:', err);
      setError('Error al cargar la marca: ' + (err instanceof Error ? err.message : 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  // Función para guardar cambios
  const handleSave = useCallback(async () => {
    try {
      setSaving(true);
      setError(null);
      
      // Preparar datos para enviar
      const updateData = {
        ...formData,
        // Asegurar que quality_score esté en el rango correcto
        quality_score: formData.quality_score > 1 ? formData.quality_score : formData.quality_score
      };
      
      // Debug: mostrar datos que se van a enviar
      console.log('🔄 Datos del formulario:', formData);
      console.log('📤 Datos a enviar:', updateData);
      console.log('🎯 URL:', `/api/pim/marketplace-brands/${brandId}`);
      
      const response = await fetch(`/api/pim/marketplace-brands/${brandId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      const responseData = await response.json();
      console.log('📥 Respuesta de la API:', responseData);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      // Mostrar éxito y redirigir
      console.log('✅ Marca actualizada correctamente');
      router.push(`/marketplace-brands/${brandId}`);
      
    } catch (err) {
      console.error('❌ Error saving brand:', err);
      setError('Error al guardar la marca: ' + (err instanceof Error ? err.message : 'Error desconocido'));
    } finally {
      setSaving(false);
    }
  }, [formData, brandId, router]);

  // Cargar marca al montar
  useEffect(() => {
    if (brandId) {
      fetchBrand();
    }
  }, [brandId]);

  // Configurar header
  useEffect(() => {
    if (originalBrand) {
      setHeaderProps({
        title: `Editar: ${originalBrand.name}`,
        subtitle: 'Modificar información de la marca del marketplace',
        backUrl: `/marketplace-brands/${brandId}`,
        backLabel: 'Volver a Detalles',
        icon: headerIcon,
        actions: (
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => router.push(`/marketplace-brands/${brandId}`)}
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
  }, [setHeaderProps, clearHeaderProps, headerIcon, originalBrand, brandId, router, hasChanges, saving, handleSave]);

  // Detectar cambios en el formulario
  useEffect(() => {
    if (originalBrand) {
      const originalNormalizedScore = originalBrand.quality_score > 1 ? originalBrand.quality_score / 10 : originalBrand.quality_score;
      
      const hasFormChanges = 
        formData.name !== (originalBrand.name || '') ||
        formData.normalized_name !== (originalBrand.normalized_name || '') ||
        formData.description !== (originalBrand.description || '') ||
        formData.website !== (originalBrand.website || '') ||
        formData.logo_url !== (originalBrand.logo_url || '') ||
        formData.country_code !== (originalBrand.country_code || '') ||
        formData.verification_status !== (originalBrand.verification_status || 'unverified') ||
        formData.is_active !== (originalBrand.is_active ?? true) ||
        formData.quality_score !== originalNormalizedScore ||
        JSON.stringify(formData.aliases) !== JSON.stringify(originalBrand.aliases || []) ||
        JSON.stringify(formData.category_tags) !== JSON.stringify(originalBrand.category_tags || []);
      
      // Debug: mostrar comparación de cambios
      console.log('🔍 Detectando cambios en marca:');
      console.log('📋 Datos originales:', {
        name: originalBrand.name || '',
        normalized_name: originalBrand.normalized_name || '',
        description: originalBrand.description || '',
        website: originalBrand.website || '',
        logo_url: originalBrand.logo_url || '',
        country_code: originalBrand.country_code || '',
        verification_status: originalBrand.verification_status || 'unverified',
        is_active: originalBrand.is_active ?? true,
        quality_score: originalNormalizedScore,
        aliases: originalBrand.aliases || [],
        category_tags: originalBrand.category_tags || []
      });
      console.log('✏️ Datos actuales del formulario:', formData);
      console.log('🔄 ¿Hay cambios?', hasFormChanges);
      
      setHasChanges(hasFormChanges);
    }
  }, [formData, originalBrand]);

  // Funciones para manejar arrays dinámicos
  const addAlias = () => {
    if (newAlias.trim() && !formData.aliases.includes(newAlias.trim())) {
      setFormData(prev => ({
        ...prev,
        aliases: [...prev.aliases, newAlias.trim()]
      }));
      setNewAlias('');
    }
  };

  const removeAlias = (index: number) => {
    setFormData(prev => ({
      ...prev,
      aliases: prev.aliases.filter((_, i) => i !== index)
    }));
  };

  const addCategoryTag = () => {
    if (newCategoryTag.trim() && !formData.category_tags.includes(newCategoryTag.trim())) {
      setFormData(prev => ({
        ...prev,
        category_tags: [...prev.category_tags, newCategoryTag.trim()]
      }));
      setNewCategoryTag('');
    }
  };

  const removeCategoryTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      category_tags: prev.category_tags.filter((_, i) => i !== index)
    }));
  };

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

  if (error && !originalBrand) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-medium text-destructive mb-2">Error al cargar</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
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

  return (
    <div className="container mx-auto py-8 space-y-6">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Información Básica */}
        <Card>
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
            <CardDescription>
              Datos principales de la marca
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nombre de la marca"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="normalized_name">Nombre Normalizado</Label>
              <Input
                id="normalized_name"
                value={formData.normalized_name}
                onChange={(e) => setFormData(prev => ({ ...prev, normalized_name: e.target.value }))}
                placeholder="Nombre normalizado para búsquedas"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descripción de la marca"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Sitio Web</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                placeholder="https://ejemplo.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo_url">URL del Logo</Label>
              <Input
                id="logo_url"
                type="url"
                value={formData.logo_url}
                onChange={(e) => setFormData(prev => ({ ...prev, logo_url: e.target.value }))}
                placeholder="https://ejemplo.com/logo.png"
              />
              {formData.logo_url && (
                <div className="mt-2">
                  <img 
                    src={formData.logo_url} 
                    alt="Preview del logo"
                    className="w-16 h-16 rounded-lg object-cover border"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Estado y Configuración */}
        <Card>
          <CardHeader>
            <CardTitle>Estado y Configuración</CardTitle>
            <CardDescription>
              Configuración del estado y verificación
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="country_code">Código de País</Label>
              <Input
                id="country_code"
                value={formData.country_code}
                onChange={(e) => setFormData(prev => ({ ...prev, country_code: e.target.value.toUpperCase() }))}
                placeholder="AR"
                maxLength={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="verification_status">Estado de Verificación</Label>
              <Select
                value={formData.verification_status}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, verification_status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unverified">No verificada</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="verified">Verificada</SelectItem>
                  <SelectItem value="disputed">Disputada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quality_score">Puntuación de Calidad (0-1)</Label>
              <Input
                id="quality_score"
                type="number"
                min="0"
                max="1"
                step="0.01"
                value={formData.quality_score}
                onChange={(e) => setFormData(prev => ({ ...prev, quality_score: parseFloat(e.target.value) || 0 }))}
              />
              <div className="text-xs text-muted-foreground">
                Equivale a {Math.round(formData.quality_score * 100)}%
              </div>
            </div>

            <Separator />

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="is_active">Marca activa</Label>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Aliases */}
      <Card>
        <CardHeader>
          <CardTitle>Aliases</CardTitle>
          <CardDescription>
            Nombres alternativos o variaciones de la marca
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              value={newAlias}
              onChange={(e) => setNewAlias(e.target.value)}
              placeholder="Agregar nuevo alias"
              onKeyPress={(e) => e.key === 'Enter' && addAlias()}
            />
            <Button onClick={addAlias} disabled={!newAlias.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {formData.aliases.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.aliases.map((alias, index) => (
                <Badge key={index} variant="outline" className="flex items-center space-x-1">
                  <span>{alias}</span>
                  <button onClick={() => removeAlias(index)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Categorías */}
      <Card>
        <CardHeader>
          <CardTitle>Etiquetas de Categoría</CardTitle>
          <CardDescription>
            Categorías asociadas con esta marca
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              value={newCategoryTag}
              onChange={(e) => setNewCategoryTag(e.target.value)}
              placeholder="Agregar nueva categoría"
              onKeyPress={(e) => e.key === 'Enter' && addCategoryTag()}
            />
            <Button onClick={addCategoryTag} disabled={!newCategoryTag.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {formData.category_tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.category_tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                  <span>{tag}</span>
                  <button onClick={() => removeCategoryTag(index)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Acciones */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => router.push(`/marketplace-brands/${brandId}`)}
        >
          Cancelar
        </Button>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            onClick={() => router.push(`/marketplace-brands/${brandId}`)}
          >
            <Eye className="h-4 w-4 mr-2" />
            Ver Detalles
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
    </div>
  );
} 