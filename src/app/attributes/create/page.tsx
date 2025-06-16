'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Save, 
  Plus,
  X,
  AlertCircle,
  Loader2,
  Settings
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/hooks/use-auth';
import { marketplaceApi, CreateTenantCustomAttributeRequest } from '@/lib/api';

interface FormData {
  marketplace_attribute_id: string;
  attribute_values: string[];
  is_active: boolean;
}

interface FormErrors {
  marketplace_attribute_id?: string;
  attribute_values?: string;
  general?: string;
}

// Atributos de marketplace disponibles (esto vendría de una API)
const MARKETPLACE_ATTRIBUTES = [
  { id: 'color', name: 'Color', description: 'Colores de productos' },
  { id: 'size', name: 'Talla', description: 'Tallas o tamaños' },
  { id: 'material', name: 'Material', description: 'Materiales de fabricación' },
  { id: 'brand', name: 'Marca', description: 'Marca del producto' },
  { id: 'style', name: 'Estilo', description: 'Estilo o diseño' },
  { id: 'condition', name: 'Condición', description: 'Estado del producto' },
];

export default function CreateAttributePage() {
  const router = useRouter();
  const { token } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    marketplace_attribute_id: '',
    attribute_values: [],
    is_active: true,
  });
  const [newValue, setNewValue] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddValue = () => {
    const trimmedValue = newValue.trim();
    
    if (!trimmedValue) {
      return;
    }

    if (formData.attribute_values.includes(trimmedValue)) {
      setErrors(prev => ({ ...prev, attribute_values: 'Este valor ya existe' }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      attribute_values: [...prev.attribute_values, trimmedValue]
    }));
    setNewValue('');
    setErrors(prev => ({ ...prev, attribute_values: undefined }));
  };

  const handleRemoveValue = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attribute_values: prev.attribute_values.filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.marketplace_attribute_id) {
      newErrors.marketplace_attribute_id = 'Debes seleccionar un atributo de marketplace';
    }

    if (formData.attribute_values.length === 0) {
      newErrors.attribute_values = 'Debes agregar al menos un valor personalizado';
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
      const requestData: CreateTenantCustomAttributeRequest = {
        marketplace_attribute_id: formData.marketplace_attribute_id,
        attribute_values: formData.attribute_values,
        is_active: formData.is_active,
      };
      
      const response = await marketplaceApi.createTenantCustomAttribute(
        requestData,
        token || 'dev-token'
      );
      
      if (response.error) {
        setErrors({ general: response.error });
      } else {
        router.push('/attributes?created=true');
      }
    } catch (error) {
      setErrors({ 
        general: error instanceof Error ? error.message : 'Error al crear el atributo personalizado' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedAttribute = MARKETPLACE_ATTRIBUTES.find(
    attr => attr.id === formData.marketplace_attribute_id
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/attributes">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver a Atributos
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold">Crear Atributo Personalizado</h1>
                  <p className="text-sm text-muted-foreground">
                    Agrega valores personalizados para un atributo del marketplace
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

          {/* Attribute Selection */}
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-4">Selección de Atributo</h2>
              </div>

              <div className="space-y-2">
                <Label htmlFor="marketplace_attribute_id">
                  Atributo de Marketplace <span className="text-red-500">*</span>
                </Label>
                <Select 
                  value={formData.marketplace_attribute_id} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, marketplace_attribute_id: value }))}
                >
                  <SelectTrigger className={errors.marketplace_attribute_id ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Selecciona un atributo base" />
                  </SelectTrigger>
                  <SelectContent>
                    {MARKETPLACE_ATTRIBUTES.map((attr) => (
                      <SelectItem key={attr.id} value={attr.id}>
                        <div>
                          <div className="font-medium">{attr.name}</div>
                          <div className="text-xs text-muted-foreground">{attr.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.marketplace_attribute_id && (
                  <p className="text-sm text-red-500">{errors.marketplace_attribute_id}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Selecciona el atributo del marketplace al que quieres agregar valores personalizados
                </p>
              </div>

              {selectedAttribute && (
                <div className="bg-muted rounded-lg p-4">
                  <h4 className="text-sm font-medium mb-2">Atributo seleccionado:</h4>
                  <div className="flex items-center gap-2">
                    <Badge>{selectedAttribute.name}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {selectedAttribute.description}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Custom Values */}
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-4">Valores Personalizados</h2>
              </div>

              <div className="space-y-2">
                <Label>
                  Agregar Valores <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddValue())}
                    placeholder="Ej: Rojo Fuego, Talle Local, etc..."
                    className={errors.attribute_values ? 'border-red-500' : ''}
                  />
                  <Button type="button" onClick={handleAddValue}>
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar
                  </Button>
                </div>
                {errors.attribute_values && (
                  <p className="text-sm text-red-500">{errors.attribute_values}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Agrega los valores personalizados que tus clientes reconocen
                </p>
              </div>

              {/* Values List */}
              {formData.attribute_values.length > 0 && (
                <div className="space-y-2">
                  <Label>Valores agregados ({formData.attribute_values.length})</Label>
                  <div className="flex flex-wrap gap-2">
                    {formData.attribute_values.map((value, index) => (
                      <Badge key={index} variant="secondary" className="gap-1 px-3 py-1">
                        {value}
                        <button
                          type="button"
                          onClick={() => handleRemoveValue(index)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
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
                  <Label htmlFor="is_active">Atributo Activo</Label>
                  <p className="text-sm text-muted-foreground">
                    Los atributos activos son visibles en el marketplace
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
            <Link href="/attributes">
              <Button variant="outline" disabled={isSubmitting}>
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={isSubmitting || formData.attribute_values.length === 0}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Crear Atributo
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
} 