'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Edit } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

import { BusinessType, UpdateBusinessTypeRequest } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { useBusinessTypes } from '@/hooks/use-business-types';
import { useHeader } from '@/components/layout/admin-layout';

export default function EditBusinessTypePage() {
  const router = useRouter();
  const params = useParams();
  const { token } = useAuth();
  const businessTypeId = params.id as string;
  
  const { businessTypes, updateBusinessType, loading } = useBusinessTypes({ 
    adminToken: token || 'dev-marketplace-admin' 
  });
  
  const { setHeaderProps, clearHeaderProps } = useHeader();

  const [formData, setFormData] = useState<UpdateBusinessTypeRequest>({
    name: '',
    description: '',
    icon: '',
    color: '#3B82F6',
    is_active: true,
  });
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Buscar el business type actual
  const currentBusinessType = useMemo(() => {
    return businessTypes.find(bt => bt.id === businessTypeId);
  }, [businessTypes, businessTypeId]);

  // Icono memoizado para evitar recrear JSX
  const headerIcon = useMemo(() => <Edit className="w-5 h-5 text-white" />, []);

  // Establecer header dinámico
  useEffect(() => {
    setHeaderProps({
      title: 'Editar Tipo de Negocio',
      subtitle: currentBusinessType ? `Editando: ${currentBusinessType.name}` : 'Modificar información del tipo de negocio',
      backUrl: '/business-types',
      backLabel: 'Volver a Tipos de Negocio',
      icon: headerIcon
    });

    return () => {
      clearHeaderProps();
    };
  }, [setHeaderProps, clearHeaderProps, headerIcon, currentBusinessType]);

  // Cargar datos del business type cuando esté disponible
  useEffect(() => {
    if (currentBusinessType) {
      setFormData({
        name: currentBusinessType.name,
        description: currentBusinessType.description || '',
        icon: currentBusinessType.icon || '',
        color: currentBusinessType.color || '',
        is_active: currentBusinessType.is_active
      });
    }
  }, [currentBusinessType]);

  const handleInputChange = (field: keyof UpdateBusinessTypeRequest, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name?.trim()) {
      setError('El nombre es requerido');
      return;
    }

    if (!formData.description?.trim()) {
      setError('La descripción es requerida');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const success = await updateBusinessType(businessTypeId, formData);
      
      if (success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/business-types');
        }, 1500);
      } else {
        setError('Error al actualizar el tipo de negocio');
      }
    } catch (err) {
      setError('Error inesperado al actualizar el tipo de negocio');
    } finally {
      setSaving(false);
    }
  };

  // Mostrar loading si aún no se han cargado los business types
  if (loading || !businessTypes.length) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Cargando tipo de negocio...</span>
        </div>
      </div>
    );
  }

  // Mostrar error si no se encuentra el business type
  if (!currentBusinessType) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertDescription>
            No se encontró el tipo de negocio con ID: {businessTypeId}
          </AlertDescription>
        </Alert>
        
        <Button 
          variant="outline" 
          onClick={() => router.push('/business-types')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Tipos de Negocio
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <AlertDescription>
            ✅ Tipo de negocio actualizado exitosamente. Redirigiendo...
          </AlertDescription>
        </Alert>
      )}

      {/* Info Card - Tipo de negocio que se está editando */}
      {currentBusinessType && (
        <Card className="bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800">
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-medium"
                  style={{ backgroundColor: currentBusinessType.color || '#6366f1' }}
                >
                  {currentBusinessType.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-medium text-indigo-900 dark:text-indigo-100">
                    {currentBusinessType.name}
                  </h3>
                  <p className="text-sm text-indigo-700 dark:text-indigo-300">
                    Modificando configuración del tipo de negocio
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={currentBusinessType.is_active ? "default" : "secondary"}>
                  {currentBusinessType.is_active ? "Activo" : "Inactivo"}
                </Badge>
                {currentBusinessType.icon && (
                  <Badge variant="outline" className="text-indigo-600 border-indigo-300">
                    {currentBusinessType.icon}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Información del Tipo de Negocio</CardTitle>
          <CardDescription>
            Modifica la información básica del tipo de negocio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ej: Comercio Minorista"
                  disabled={saving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="icon">Icono</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => handleInputChange('icon', e.target.value)}
                  placeholder="Ej: store, utensils, shirt"
                  disabled={saving}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe el tipo de negocio y sus características..."
                rows={3}
                disabled={saving}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="color"
                    type="color"
                    value={formData.color}
                    onChange={(e) => handleInputChange('color', e.target.value)}
                    className="w-16 h-10 p-1 border rounded"
                    disabled={saving}
                  />
                  <Input
                    value={formData.color}
                    onChange={(e) => handleInputChange('color', e.target.value)}
                    placeholder="#3B82F6"
                    className="flex-1"
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="is_active">Estado</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                    disabled={saving}
                  />
                  <Label htmlFor="is_active" className="text-sm">
                    {formData.is_active ? 'Activo' : 'Inactivo'}
                  </Label>
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.push('/business-types')}
                disabled={saving}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Cancelar
              </Button>

              <Button 
                type="submit" 
                disabled={saving}
                className="flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Vista previa del tipo de negocio */}
      <Card>
        <CardHeader>
          <CardTitle>Vista Previa</CardTitle>
          <CardDescription>
            Así se verá el tipo de negocio con los cambios aplicados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-4 border rounded-lg">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-lg font-medium"
              style={{ backgroundColor: formData.color || '#6366f1' }}
            >
              {formData.name ? formData.name.charAt(0).toUpperCase() : 'T'}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{formData.name || 'Nombre del tipo de negocio'}</h3>
              <p className="text-sm text-muted-foreground">
                {formData.description || 'Descripción del tipo de negocio'}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  formData.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {formData.is_active ? 'Activo' : 'Inactivo'}
                </span>
                {formData.icon && (
                  <span className="text-xs text-muted-foreground">
                    Icono: {formData.icon}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 