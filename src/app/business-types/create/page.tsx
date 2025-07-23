'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Save, 
  Users, 
  AlertCircle,
  Loader2,
  Palette,
  Hash
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { useBusinessTypes } from '@/hooks/use-business-types';

interface FormData {
  code: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  is_active: boolean;
}

interface FormErrors {
  code?: string;
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
  general?: string;
}

const predefinedColors = [
  { name: 'Azul', value: '#3B82F6' },
  { name: 'Verde', value: '#10B981' },
  { name: 'Amarillo', value: '#F59E0B' },
  { name: 'Púrpura', value: '#8B5CF6' },
  { name: 'Rojo', value: '#EF4444' },
  { name: 'Rosa', value: '#EC4899' },
  { name: 'Índigo', value: '#6366F1' },
  { name: 'Teal', value: '#14B8A6' },
];

const predefinedIcons = [
  'store', 'utensils', 'shirt', 'smartphone', 'car', 'home', 'heart', 'book',
  'music', 'camera', 'gamepad', 'dumbbell', 'briefcase', 'graduation-cap',
  'palette', 'wrench', 'scissors', 'stethoscope', 'plane', 'gift'
];

export default function CreateBusinessTypePage() {
  const router = useRouter();
  const { token } = useAuth();
  const { createBusinessType } = useBusinessTypes({ adminToken: token || undefined, autoLoad: false });
  const [formData, setFormData] = useState<FormData>({
    code: '',
    name: '',
    description: '',
    icon: 'store',
    color: '#3B82F6',
    is_active: true,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [codeGenerated, setCodeGenerated] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generar código automáticamente desde el nombre
  const generateCode = (name: string): string => {
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
      code: codeGenerated ? generateCode(value) : prev.code
    }));
    
    // Limpiar error de nombre si existe
    if (errors.name) {
      setErrors(prev => ({ ...prev, name: undefined }));
    }
  };

  const handleCodeChange = (value: string) => {
    setCodeGenerated(false);
    setFormData(prev => ({ ...prev, code: value }));
    
    // Limpiar error de código si existe
    if (errors.code) {
      setErrors(prev => ({ ...prev, code: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validar código
    if (!formData.code.trim()) {
      newErrors.code = 'El código es obligatorio';
    } else if (!/^[a-z0-9-]+$/.test(formData.code)) {
      newErrors.code = 'El código solo puede contener letras minúsculas, números y guiones';
    } else if (formData.code.length < 2) {
      newErrors.code = 'El código debe tener al menos 2 caracteres';
    } else if (formData.code.length > 50) {
      newErrors.code = 'El código no puede exceder 50 caracteres';
    }

    // Validar nombre
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    } else if (formData.name.length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    } else if (formData.name.length > 100) {
      newErrors.name = 'El nombre no puede exceder 100 caracteres';
    }

    // Validar descripción
    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es obligatoria';
    } else if (formData.description.length < 10) {
      newErrors.description = 'La descripción debe tener al menos 10 caracteres';
    } else if (formData.description.length > 500) {
      newErrors.description = 'La descripción no puede exceder 500 caracteres';
    }

    // Validar color
    if (!formData.color || !/^#[0-9A-Fa-f]{6}$/.test(formData.color)) {
      newErrors.color = 'Selecciona un color válido';
    }

    // Validar icono
    if (!formData.icon.trim()) {
      newErrors.icon = 'Selecciona un icono';
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
      const businessTypeData = {
        code: formData.code.trim(),
        name: formData.name.trim(),
        description: formData.description.trim(),
        icon: formData.icon,
        color: formData.color,
        metadata: {},
        sort_order: 999, // Por defecto al final
      };
      
      const success = await createBusinessType(businessTypeData);
      
      if (success) {
        // Redirigir a la lista con mensaje de éxito
        router.push('/business-types?created=true');
      } else {
        setErrors({ general: 'Error al crear el tipo de negocio' });
      }
      
    } catch (error) {
      setErrors({ 
        general: error instanceof Error ? error.message : 'Error al crear el tipo de negocio' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/business-types">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver a Tipos de Negocio
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold">Nuevo Tipo de Negocio</h1>
                  <p className="text-sm text-muted-foreground">
                    Crear un nuevo tipo de negocio para configuración quickstart
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Error General */}
          {errors.general && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{errors.general}</AlertDescription>
            </Alert>
          )}

          {/* Preview Card */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-lg font-medium"
                style={{ backgroundColor: formData.color }}
              >
                {formData.name.charAt(0) || '?'}
              </div>
              <div>
                <h3 className="font-semibold">{formData.name || 'Nombre del tipo de negocio'}</h3>
                <p className="text-sm text-muted-foreground">
                  {formData.description || 'Descripción del tipo de negocio'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                <Hash className="w-3 h-3 mr-1" />
                {formData.code || 'codigo'}
              </Badge>
              <Badge variant="outline">
                {formData.icon}
              </Badge>
              <Badge variant={formData.is_active ? "default" : "secondary"}>
                {formData.is_active ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
          </Card>

          {/* Form */}
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nombre y Código */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Nombre <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="ej: Comercio Minorista"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="code">
                    Código <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => handleCodeChange(e.target.value)}
                    placeholder="ej: retail"
                    className={errors.code ? 'border-red-500' : ''}
                  />
                  {errors.code && (
                    <p className="text-sm text-red-500">{errors.code}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Solo letras minúsculas, números y guiones
                  </p>
                </div>
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <Label htmlFor="description">
                  Descripción <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe el tipo de negocio y sus características principales..."
                  rows={3}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {formData.description.length}/500 caracteres
                </p>
              </div>

              {/* Icono y Color */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="icon">
                    Icono <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.icon} onValueChange={(value) => setFormData(prev => ({ ...prev, icon: value }))}>
                    <SelectTrigger className={errors.icon ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Selecciona un icono" />
                    </SelectTrigger>
                    <SelectContent>
                      {predefinedIcons.map((icon) => (
                        <SelectItem key={icon} value={icon}>
                          {icon}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.icon && (
                    <p className="text-sm text-red-500">{errors.icon}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>
                    Color <span className="text-red-500">*</span>
                  </Label>
                  <div className="grid grid-cols-4 gap-2">
                    {predefinedColors.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                        className={`w-full h-10 rounded-lg border-2 transition-all ${
                          formData.color === color.value 
                            ? 'border-primary ring-2 ring-primary/20' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-muted-foreground" />
                    <Input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                      className="w-16 h-8 p-1 border rounded"
                    />
                    <span className="text-sm text-muted-foreground">{formData.color}</span>
                  </div>
                  {errors.color && (
                    <p className="text-sm text-red-500">{errors.color}</p>
                  )}
                </div>
              </div>

              {/* Estado */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label htmlFor="is_active">Estado del tipo de negocio</Label>
                  <p className="text-sm text-muted-foreground">
                    Los tipos de negocio activos aparecerán en la configuración quickstart
                  </p>
                </div>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
              </div>

              {/* Botones */}
              <div className="flex items-center gap-3 pt-6">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Crear Tipo de Negocio
                    </>
                  )}
                </Button>
                <Link href="/business-types">
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </Link>
              </div>
            </form>
          </Card>
        </div>
      </main>
    </div>
  );
} 