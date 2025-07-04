'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  ArrowLeft,
  Save,
  Settings,
  Plus,
  Trash2
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

import { useAuth } from '@/hooks/use-auth';
import { useHeader } from '@/components/layout/admin-layout';
import { useMarketplaceAttributes } from '@/hooks/use-marketplace-attributes';
import { 
  type UpdateMarketplaceAttributeRequest,
  type MarketplaceAttribute,
  marketplaceApi 
} from '@/lib/api';

// Schema de validación
const editAttributeSchema = z.object({
  code: z.string()
    .min(2, 'El código debe tener al menos 2 caracteres')
    .max(50, 'El código no puede tener más de 50 caracteres')
    .regex(/^[a-z_]+$/, 'El código solo puede contener letras minúsculas y guiones bajos'),
  name: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede tener más de 100 caracteres'),
  description: z.string().optional(),
  type: z.enum(['text', 'number', 'select', 'multi_select', 'boolean', 'date']),
  is_required: z.boolean().default(false),
  is_filterable: z.boolean().default(false),
  is_searchable: z.boolean().default(false),
  default_value: z.string().optional(),
  unit: z.string().optional(),
  group_name: z.string().optional(),
  sort_order: z.coerce.number().min(0).default(0),
  is_active: z.boolean().default(true),
  // Reglas de validación para campos numéricos
  min_length: z.coerce.number().optional(),
  max_length: z.coerce.number().optional(),
  min_value: z.coerce.number().optional(),
  max_value: z.coerce.number().optional(),
  pattern: z.string().optional(),
  // Opciones para select
  options: z.array(z.string()).default([])
});

type EditAttributeForm = z.infer<typeof editAttributeSchema>;

const attributeTypes = [
  { value: 'text', label: 'Texto', description: 'Campo de texto libre' },
  { value: 'number', label: 'Número', description: 'Valores numéricos' },
  { value: 'select', label: 'Selección', description: 'Selección única de una lista' },
  { value: 'multi_select', label: 'Selección Múltiple', description: 'Múltiples opciones de una lista' },
  { value: 'boolean', label: 'Sí/No', description: 'Valor verdadero o falso' },
  { value: 'date', label: 'Fecha', description: 'Fechas y horarios' }
];

const commonGroups = [
  'Básico',
  'Físico', 
  'Apariencia',
  'Técnico',
  'Legal',
  'Comercial',
  'Sostenibilidad',
  'Calidad'
];

export default function EditMarketplaceAttributePage() {
  const router = useRouter();
  const params = useParams();
  const { token } = useAuth();
  const { setHeaderProps, clearHeaderProps } = useHeader();
  const { updateAttribute } = useMarketplaceAttributes({ adminToken: token });

  const [attribute, setAttribute] = useState<MarketplaceAttribute | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newOption, setNewOption] = useState('');

  const attributeId = params.id as string;

  // Icono memoizado
  const headerIcon = useMemo(() => <Settings className="w-5 h-5 text-white" />, []);

  // Configurar formulario
  const form = useForm<EditAttributeForm>({
    resolver: zodResolver(editAttributeSchema),
    defaultValues: {
      code: '',
      name: '',
      description: '',
      type: 'text',
      is_required: false,
      is_filterable: false,
      is_searchable: false,
      default_value: '',
      unit: '',
      group_name: '',
      sort_order: 0,
      is_active: true,
      options: []
    }
  });

  const selectedType = form.watch('type');
  const currentOptions = form.watch('options');

  // Cargar datos del atributo
  const loadAttribute = async () => {
    try {
      setLoading(true);
      const response = await marketplaceApi.getMarketplaceAttribute(attributeId, token);
      
      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data) {
        const attr = response.data;
        setAttribute(attr);

        // Poblar el formulario con los datos existentes
        form.reset({
          code: attr.code,
          name: attr.name,
          description: attr.description || '',
          type: attr.type,
          is_required: attr.is_required,
          is_filterable: attr.is_filterable,
          is_searchable: attr.is_searchable,
          default_value: attr.default_value || '',
          unit: attr.unit || '',
          group_name: attr.group_name || '',
          sort_order: attr.sort_order,
          is_active: attr.is_active,
          // Reglas de validación
          min_length: attr.validation_rules?.min_length,
          max_length: attr.validation_rules?.max_length,
          min_value: attr.validation_rules?.min_value,
          max_value: attr.validation_rules?.max_value,
          pattern: attr.validation_rules?.pattern || '',
          // Opciones
          options: attr.options || []
        });
      }
    } catch (error) {
      console.error('Error loading attribute:', error);
      alert(error instanceof Error ? error.message : 'Error al cargar el atributo');
    } finally {
      setLoading(false);
    }
  };

  // Configurar header
  useEffect(() => {
    if (attribute) {
      setHeaderProps({
        title: `Editar: ${attribute.name}`,
        subtitle: `Modificar atributo ${attribute.code}`,
        icon: headerIcon
      });
    }

    return () => {
      clearHeaderProps();
    };
  }, [setHeaderProps, clearHeaderProps, headerIcon, attribute]);

  // Cargar datos iniciales
  useEffect(() => {
    if (attributeId) {
      loadAttribute();
    }
  }, [attributeId]);

  // Handlers
  const handleBack = () => {
    router.push('/marketplace-attributes');
  };

  const handleAddOption = () => {
    if (newOption.trim()) {
      const currentOptions = form.getValues('options');
      form.setValue('options', [...currentOptions, newOption.trim()]);
      setNewOption('');
    }
  };

  const handleRemoveOption = (index: number) => {
    const currentOptions = form.getValues('options');
    form.setValue('options', currentOptions.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: EditAttributeForm) => {
    try {
      setIsSubmitting(true);

      // Preparar datos para envío
      const updateData: UpdateMarketplaceAttributeRequest = {
        code: data.code,
        name: data.name,
        description: data.description || undefined,
        type: data.type,
        is_required: data.is_required,
        is_filterable: data.is_filterable,
        is_searchable: data.is_searchable,
        default_value: data.default_value || undefined,
        unit: data.unit || undefined,
        group_name: data.group_name || undefined,
        sort_order: data.sort_order,
        is_active: data.is_active
      };

      // Agregar opciones para select
      if (data.type === 'select' || data.type === 'multi_select') {
        updateData.options = data.options;
      }

      // Agregar reglas de validación
      const validationRules: any = {};
      if (data.min_length !== undefined) validationRules.min_length = data.min_length;
      if (data.max_length !== undefined) validationRules.max_length = data.max_length;
      if (data.min_value !== undefined) validationRules.min_value = data.min_value;
      if (data.max_value !== undefined) validationRules.max_value = data.max_value;
      if (data.pattern) validationRules.pattern = data.pattern;

      if (Object.keys(validationRules).length > 0) {
        updateData.validation_rules = validationRules;
      }

      await updateAttribute(attributeId, updateData);
      
      // Redirigir al detalle
      router.push(`/marketplace-attributes/${attributeId}`);
    } catch (error) {
      console.error('Error al actualizar atributo:', error);
      alert(error instanceof Error ? error.message : 'Error al actualizar el atributo');
    } finally {
      setIsSubmitting(false);
    }
  };

  const showValidationRules = selectedType === 'text' || selectedType === 'number';
  const showOptions = selectedType === 'select' || selectedType === 'multi_select';
  const showUnit = selectedType === 'number';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Cargando atributo...</p>
        </div>
      </div>
    );
  }

  if (!attribute) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">Atributo no encontrado</p>
          <Button onClick={handleBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a la lista
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Info Card - Atributo que se está editando */}
      {attribute && (
        <Card className="bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center">
                  <Settings className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="font-medium text-orange-900 dark:text-orange-100">
                    {attribute.name}
                  </h3>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    Código: {attribute.code} • Tipo: {attribute.type}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={attribute.is_active ? "default" : "secondary"}>
                  {attribute.is_active ? "Activo" : "Inactivo"}
                </Badge>
                {attribute.is_required && (
                  <Badge variant="destructive">
                    Requerido
                  </Badge>
                )}
                {attribute.is_filterable && (
                  <Badge variant="outline" className="text-orange-600 border-orange-300">
                    Filtrable
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Información básica */}
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
              <CardDescription>
                Modifica la información fundamental del atributo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="ej: brand, color, size"
                          {...field}
                          onChange={(e) => {
                            // Convertir a minúsculas y reemplazar espacios
                            const value = e.target.value.toLowerCase().replace(/\s+/g, '_');
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Identificador único del atributo (solo letras minúsculas y guiones bajos)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre *</FormLabel>
                      <FormControl>
                        <Input placeholder="ej: Marca, Color, Tamaño" {...field} />
                      </FormControl>
                      <FormDescription>
                        Nombre descriptivo que se mostrará en la interfaz
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descripción detallada del atributo..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Descripción opcional para explicar el propósito del atributo
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {attributeTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div>
                                <div className="font-medium">{type.label}</div>
                                <div className="text-xs text-muted-foreground">{type.description}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="group_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grupo</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un grupo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Sin grupo</SelectItem>
                          {commonGroups.map((group) => (
                            <SelectItem key={group} value={group}>
                              {group}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Agrupa atributos relacionados para mejor organización
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sort_order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Orden</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0"
                          placeholder="0"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Orden de aparición (números menores aparecen primero)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Propiedades */}
          <Card>
            <CardHeader>
              <CardTitle>Propiedades</CardTitle>
              <CardDescription>
                Configura cómo se comportará este atributo en el sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="is_required"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Requerido</FormLabel>
                          <FormDescription>
                            Este atributo será obligatorio para todos los productos
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="is_filterable"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Filtrable</FormLabel>
                          <FormDescription>
                            Los usuarios podrán filtrar productos por este atributo
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="is_searchable"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Buscable</FormLabel>
                          <FormDescription>
                            Este atributo se incluirá en las búsquedas de texto
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="default_value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor por defecto</FormLabel>
                        <FormControl>
                          <Input placeholder="Valor predeterminado..." {...field} />
                        </FormControl>
                        <FormDescription>
                          Valor que se asignará automáticamente si no se especifica
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {showUnit && (
                    <FormField
                      control={form.control}
                      name="unit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unidad</FormLabel>
                          <FormControl>
                            <Input placeholder="ej: kg, cm, litros" {...field} />
                          </FormControl>
                          <FormDescription>
                            Unidad de medida para valores numéricos
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="is_active"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Activo</FormLabel>
                          <FormDescription>
                            El atributo estará disponible para su uso
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Opciones para select */}
          {showOptions && (
            <Card>
              <CardHeader>
                <CardTitle>Opciones</CardTitle>
                <CardDescription>
                  Define las opciones disponibles para la selección
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Nueva opción..."
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddOption();
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddOption}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {currentOptions.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Opciones actuales:</p>
                    <div className="space-y-1">
                      {currentOptions.map((option, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <span>{option}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveOption(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Reglas de validación */}
          {showValidationRules && (
            <Card>
              <CardHeader>
                <CardTitle>Reglas de Validación</CardTitle>
                <CardDescription>
                  Define las reglas de validación para este atributo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedType === 'text' && (
                    <>
                      <FormField
                        control={form.control}
                        name="min_length"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Longitud mínima</FormLabel>
                            <FormControl>
                              <Input type="number" min="0" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="max_length"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Longitud máxima</FormLabel>
                            <FormControl>
                              <Input type="number" min="0" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="pattern"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Patrón (RegEx)</FormLabel>
                            <FormControl>
                              <Input placeholder="^[A-Za-z0-9]+$" {...field} />
                            </FormControl>
                            <FormDescription>
                              Expresión regular para validar el formato del texto
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  {selectedType === 'number' && (
                    <>
                      <FormField
                        control={form.control}
                        name="min_value"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Valor mínimo</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="max_value"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Valor máximo</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Botones */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleBack}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 