'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Save, 
  Settings,
  Plus,
  Trash2,
  ArrowLeft,
  Globe,
  Info,
  AlertTriangle
} from 'lucide-react';

import { Button } from '@/components/shared-ui';
import { Input } from '@/components/shared-ui';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/shared-ui';
import { Switch } from '@/components/ui/switch';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/shared-ui';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';

import { useAuth } from '@/hooks/use-auth';
import { useHeader } from '@/components/layout/admin-layout';

// Tipos para la plantilla
interface CategoryTemplate {
  name: string;
  description: string;
  parent_name?: string;
  sort_order: number;
  attributes: string[];
}

interface AttributeTemplate {
  code: string;
  name: string;
  type: 'text' | 'number' | 'select' | 'multi_select' | 'boolean';
  is_required: boolean;
  default_value?: string;
  options?: string[];
}

interface ProductTemplate {
  name: string;
  description: string;
  category: string;
  brand: string;
  sku: string;
  price: number;
  attributes: Record<string, any>;
}

interface BusinessTypeTemplateForm {
  name: string;
  description: string;
  business_type_id: string;
  version: string;
  region: string;
  is_active: boolean;
  is_default: boolean;
  categories: CategoryTemplate[];
  attributes: AttributeTemplate[];
  products: ProductTemplate[];
  brands: string[];
}

// Datos mock para business types
const mockBusinessTypes = [
  { id: 'retail-001', name: 'Tienda Minorista', code: 'retail' },
  { id: 'restaurant-001', name: 'Restaurante', code: 'restaurant' },
  { id: 'fashion-001', name: 'Moda y Textiles', code: 'fashion' },
  { id: 'tech-001', name: 'Tecnología', code: 'tech' },
  { id: 'health-001', name: 'Salud y Farmacia', code: 'health' },
];

export default function CreateBusinessTypeTemplatePage() {
  const router = useRouter();
  const { token } = useAuth();
  const { setHeaderProps, clearHeaderProps } = useHeader();
  
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  
  // Estado del formulario
  const [formData, setFormData] = useState<BusinessTypeTemplateForm>({
    name: '',
    description: '',
    business_type_id: '',
    version: '1.0.0',
    region: 'AR',
    is_active: true,
    is_default: false,
    categories: [],
    attributes: [],
    products: [],
    brands: []
  });

  // Estados para los formularios de agregar items
  const [newCategory, setNewCategory] = useState<CategoryTemplate>({
    name: '', description: '', sort_order: 0, attributes: []
  });
  const [newAttribute, setNewAttribute] = useState<AttributeTemplate>({
    code: '', name: '', type: 'text', is_required: false
  });
  const [newProduct, setNewProduct] = useState<ProductTemplate>({
    name: '', description: '', category: '', brand: '', sku: '', price: 0, attributes: {}
  });
  const [newBrand, setNewBrand] = useState('');

  // Icono memoizado para evitar recrear JSX
  const headerIcon = useMemo(() => <Settings className="w-5 h-5 text-white" />, []);

  // Establecer header dinámico
  useEffect(() => {
    setHeaderProps({
      title: 'Crear Plantilla de Tipo de Negocio',
      subtitle: 'Configuración quickstart para onboarding de tenants',
      backUrl: '/business-type-templates',
      backLabel: 'Volver a Plantillas',
      icon: headerIcon
    });

    return () => {
      clearHeaderProps();
    };
  }, [setHeaderProps, clearHeaderProps, headerIcon]);

  // Validación del formulario
  const isValidForm = () => {
    return formData.name && 
           formData.description && 
           formData.business_type_id &&
           formData.version &&
           formData.region;
  };

  // Funciones para manejar categorías
  const addCategory = () => {
    if (newCategory.name && newCategory.description) {
      setFormData(prev => ({
        ...prev,
        categories: [...prev.categories, { ...newCategory }]
      }));
      setNewCategory({ name: '', description: '', sort_order: 0, attributes: [] });
    }
  };

  const removeCategory = (index: number) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.filter((_, i) => i !== index)
    }));
  };

  // Funciones para manejar atributos
  const addAttribute = () => {
    if (newAttribute.code && newAttribute.name) {
      setFormData(prev => ({
        ...prev,
        attributes: [...prev.attributes, { ...newAttribute }]
      }));
      setNewAttribute({ code: '', name: '', type: 'text', is_required: false });
    }
  };

  const removeAttribute = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index)
    }));
  };

  // Funciones para manejar productos
  const addProduct = () => {
    if (newProduct.name && newProduct.description) {
      setFormData(prev => ({
        ...prev,
        products: [...prev.products, { ...newProduct }]
      }));
      setNewProduct({ name: '', description: '', category: '', brand: '', sku: '', price: 0, attributes: {} });
    }
  };

  const removeProduct = (index: number) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index)
    }));
  };

  // Funciones para manejar marcas
  const addBrand = () => {
    if (newBrand && !formData.brands.includes(newBrand)) {
      setFormData(prev => ({
        ...prev,
        brands: [...prev.brands, newBrand]
      }));
      setNewBrand('');
    }
  };

  const removeBrand = (index: number) => {
    setFormData(prev => ({
      ...prev,
      brands: prev.brands.filter((_, i) => i !== index)
    }));
  };

  // Enviar formulario
  const handleSubmit = async () => {
    if (!isValidForm()) return;

    setLoading(true);
    try {
      // Simular API call
      console.log('Creating template:', formData);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Redirigir a la lista
      router.push('/business-type-templates');
    } catch (error) {
      console.error('Error creating template:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Crear Plantilla</h1>
          <p className="text-muted-foreground">
            Configura una nueva plantilla quickstart para onboarding de tenants
          </p>
        </div>
      </div>

      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertTitle>Información Importante</AlertTitle>
        <AlertDescription>
          Esta plantilla será utilizada durante el proceso de onboarding para configurar 
          automáticamente el catálogo inicial del tenant según su tipo de negocio.
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">Información Básica</TabsTrigger>
          <TabsTrigger value="categories">Categorías</TabsTrigger>
          <TabsTrigger value="attributes">Atributos</TabsTrigger>
          <TabsTrigger value="products">Productos</TabsTrigger>
          <TabsTrigger value="brands">Marcas</TabsTrigger>
        </TabsList>

        {/* Tab: Información Básica */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
              <CardDescription>
                Configura los datos principales de la plantilla
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre de la Plantilla *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ej: Tienda Retail Básica - Argentina"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business_type">Tipo de Negocio *</Label>
                  <Select
                    value={formData.business_type_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, business_type_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un tipo de negocio" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockBusinessTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe qué incluye esta plantilla..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="version">Versión</Label>
                  <Input
                    id="version"
                    value={formData.version}
                    onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                    placeholder="1.0.0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region">Región</Label>
                  <Select
                    value={formData.region}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, region: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AR">Argentina</SelectItem>
                      <SelectItem value="MX">México</SelectItem>
                      <SelectItem value="GLOBAL">Global</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                    />
                    <Label htmlFor="is_active">Activa</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_default"
                      checked={formData.is_default}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_default: checked }))}
                    />
                    <Label htmlFor="is_default">Por Defecto</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Categorías */}
        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Categorías ({formData.categories.length})</CardTitle>
              <CardDescription>
                Define las categorías que se crearán automáticamente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Formulario para agregar categoría */}
              <div className="p-4 border rounded-lg space-y-4">
                <h4 className="font-medium">Agregar Nueva Categoría</h4>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Nombre de la categoría"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                  />
                  <Input
                    placeholder="Descripción"
                    value={newCategory.description}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <Button onClick={addCategory} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Categoría
                </Button>
              </div>

              {/* Lista de categorías */}
              <div className="space-y-2">
                {formData.categories.map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{category.name}</div>
                      <div className="text-sm text-muted-foreground">{category.description}</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCategory(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {formData.categories.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay categorías configuradas
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Atributos */}
        <TabsContent value="attributes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Atributos ({formData.attributes.length})</CardTitle>
              <CardDescription>
                Define los atributos que se crearán automáticamente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Formulario para agregar atributo */}
              <div className="p-4 border rounded-lg space-y-4">
                <h4 className="font-medium">Agregar Nuevo Atributo</h4>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Código del atributo"
                    value={newAttribute.code}
                    onChange={(e) => setNewAttribute(prev => ({ ...prev, code: e.target.value }))}
                  />
                  <Input
                    placeholder="Nombre del atributo"
                    value={newAttribute.name}
                    onChange={(e) => setNewAttribute(prev => ({ ...prev, name: e.target.value }))}
                  />
                  <Select
                    value={newAttribute.type}
                    onValueChange={(value: any) => setNewAttribute(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Texto</SelectItem>
                      <SelectItem value="number">Número</SelectItem>
                      <SelectItem value="select">Selección</SelectItem>
                      <SelectItem value="multi_select">Selección Múltiple</SelectItem>
                      <SelectItem value="boolean">Sí/No</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={newAttribute.is_required}
                      onCheckedChange={(checked) => setNewAttribute(prev => ({ ...prev, is_required: checked }))}
                    />
                    <Label>Requerido</Label>
                  </div>
                </div>
                <Button onClick={addAttribute} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Atributo
                </Button>
              </div>

              {/* Lista de atributos */}
              <div className="space-y-2">
                {formData.attributes.map((attribute, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{attribute.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {attribute.code} • {attribute.type}
                        {attribute.is_required && <Badge variant="secondary" className="ml-2">Requerido</Badge>}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttribute(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {formData.attributes.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay atributos configurados
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Productos */}
        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Productos de Ejemplo ({formData.products.length})</CardTitle>
              <CardDescription>
                Define productos de ejemplo que se crearán automáticamente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Lista de productos */}
              <div className="space-y-2">
                {formData.products.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {product.brand} • {product.category} • ${product.price}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeProduct(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {formData.products.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay productos configurados
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Marcas */}
        <TabsContent value="brands" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Marcas Sugeridas ({formData.brands.length})</CardTitle>
              <CardDescription>
                Define marcas que se sugerirán durante la configuración
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Formulario para agregar marca */}
              <div className="flex space-x-2">
                <Input
                  placeholder="Nombre de la marca"
                  value={newBrand}
                  onChange={(e) => setNewBrand(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addBrand()}
                />
                <Button onClick={addBrand}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Lista de marcas */}
              <div className="flex flex-wrap gap-2">
                {formData.brands.map((brand, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-2">
                    {brand}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0"
                      onClick={() => removeBrand(index)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
                {formData.brands.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground w-full">
                    No hay marcas configuradas
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Botones de acción */}
      <div className="flex justify-between items-center pt-6 border-t">
        <Button variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => console.log('Preview:', formData)}
          >
            Vista Previa
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValidForm() || loading}
            className="min-w-[120px]"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Creando...
              </div>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Crear Plantilla
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
} 