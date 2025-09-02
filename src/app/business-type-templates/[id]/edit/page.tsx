'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  Save, 
  Settings,
  Plus,
  Trash2,
  ArrowLeft,
  Globe,
  Info,
  AlertTriangle,
  Loader2,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Lightbulb,
  Target,
  TrendingUp,
  X
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
import { marketplaceApi, BusinessTypeTemplate, CategoryTemplate, AttributeTemplate, ProductTemplate, MarketplaceBrand, MarketplaceAttribute } from '@/lib/api';
import { GlobalCatalogProduct } from '@/lib/api/pim';
import { MarketplaceCategorySelect } from '@/components/forms/marketplace-category-select';
import { MarketplaceBrandSelect } from '@/components/forms/marketplace-brand-select';
import { MarketplaceAttributeSelect } from '@/components/forms/marketplace-attribute-select';
import { MarketplaceProductSelect } from '@/components/forms/marketplace-product-select';

// Interface para el formulario
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
  brands: MarketplaceBrand[];
}

// Datos mock para business types
const mockBusinessTypes = [
  { id: 'retail-001', name: 'Tienda Minorista', code: 'retail' },
  { id: 'restaurant-001', name: 'Restaurante', code: 'restaurant' },
  { id: 'fashion-001', name: 'Moda y Textiles', code: 'fashion' },
  { id: 'tech-001', name: 'Tecnología', code: 'tech' },
  { id: 'health-001', name: 'Salud y Farmacia', code: 'health' },
];

export default function EditBusinessTypeTemplatePage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params.id as string;
  const { token } = useAuth();
  const { setHeaderProps, clearHeaderProps } = useHeader();
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('basic');
  const [error, setError] = useState<string | null>(null);
  const [showAISidebar, setShowAISidebar] = useState(false);
  const [aiSuggestions, setAISuggestions] = useState<{
    categories?: string[];
    attributes?: string[];
    products?: string[];
    brands?: string[];
    insights?: string[];
    regional?: { region: string; recommendation: string }[];
  }>({});
  
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
    id: '', name: '', slug: '', description: '', parent_id: '', level: 0
  });
  const [newAttribute, setNewAttribute] = useState<AttributeTemplate>({
    id: '', code: '', name: '', type: 'text', is_required: false
  });
  const [newProduct, setNewProduct] = useState<ProductTemplate>({
    name: '', description: '', category_id: '', category_name: '', sku: '', price: 0
  });
  const [newBrand, setNewBrand] = useState<MarketplaceBrand | null>(null);

  // Icono memoizado para evitar recrear JSX
  const headerIcon = useMemo(() => <Settings className="w-5 h-5 text-white" />, []);

  // Cargar datos del template
  useEffect(() => {
    const loadTemplate = async () => {
      if (!templateId) return;
      
      setInitialLoading(true);
      setError(null);
      
      try {
        const response = await marketplaceApi.getBusinessTypeTemplate(templateId, token || undefined);
        
        if (response.error) {
          throw new Error(response.error);
        }
        
        if (response.data?.template) {
          const template = response.data.template;
          console.log('🔍 Template loaded:', {
            name: template.name,
            categories_count: template.categories?.length || 0,
            categories: template.categories,
            attributes_count: template.attributes?.length || 0,
            products_count: template.products?.length || 0
          });
          
          // Las categorías ahora vienen con el formato correcto del backend
          console.log('✅ Categories from backend:', template.categories?.length || 0, template.categories);
          
          // Handle brands compatibility - convert strings to MarketplaceBrand objects if needed
          const processedBrands = template.brands || [];
          const brandsArray: MarketplaceBrand[] = processedBrands.map((brand: any) => {
            if (typeof brand === 'string') {
              // Legacy string format - create a minimal MarketplaceBrand object
              return {
                id: `legacy-${brand}`,
                name: brand,
                slug: brand.toLowerCase().replace(/\s+/g, '-'),
                normalized_name: brand,
                verification_status: 'unverified' as const,
                quality_score: 0.5,
                product_count: 0,
                category_tags: [],
                aliases: [],
                is_active: true,
                country_code: 'Unknown',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              };
            }
            // Already a MarketplaceBrand object
            return brand;
          });

          setFormData({
            name: template.name,
            description: template.description,
            business_type_id: template.business_type_id,
            version: template.version,
            region: template.region,
            is_active: template.is_active,
            is_default: template.is_default,
            categories: template.categories || [],
            attributes: template.attributes || [],
            products: template.products || [],
            brands: brandsArray
          });
        }
        
      } catch (err: any) {
        console.error('Error loading template:', err);
        setError(err.message || 'Error al cargar la plantilla');
      } finally {
        setInitialLoading(false);
      }
    };

    loadTemplate();
  }, [templateId, token]);

  // Establecer header dinámico
  useEffect(() => {
    const businessType = mockBusinessTypes.find(bt => bt.id === formData.business_type_id);
    const subtitle = businessType 
      ? `Plantilla de ${businessType.name} - Configuración quickstart para onboarding`
      : 'Modificar configuración quickstart para onboarding de tenants';
    
    setHeaderProps({
      title: formData.name || 'Cargando plantilla...',
      subtitle: subtitle,
      backUrl: '/business-type-templates',
      backLabel: 'Volver a Plantillas',
      icon: headerIcon
    });

    return () => {
      clearHeaderProps();
    };
  }, [setHeaderProps, clearHeaderProps, headerIcon, formData.name, formData.business_type_id]);

  // Cargar sugerencias AI cuando cambie el tipo de negocio
  useEffect(() => {
    if (formData.business_type_id && showAISidebar) {
      loadAISuggestions();
    }
  }, [formData.business_type_id, showAISidebar]);

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
    if (newCategory.id && newCategory.name) {
      console.log('➕ Adding new category:', newCategory);
      setFormData(prev => {
        const newCategories = [...prev.categories, { ...newCategory }];
        console.log('📝 Updated categories list:', newCategories);
        return {
          ...prev,
          categories: newCategories
        };
      });
      setNewCategory({ id: '', name: '', slug: '', description: '', parent_id: '', level: 0 });
    }
  };

  const removeCategory = (index: number) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.filter((_, i) => i !== index)
    }));
  };

  // Funciones para manejar atributos
  const addAttribute = (attribute: MarketplaceAttribute) => {
    console.log('➕ Adding new attribute:', attribute);
    const attributeTemplate: AttributeTemplate = {
      id: attribute.id,
      code: attribute.code,
      name: attribute.name,
      type: attribute.type,
      is_required: attribute.is_required,
      default_value: attribute.default_value,
      options: attribute.options
    };
    
    setFormData(prev => {
      const newAttributes = [...prev.attributes, attributeTemplate];
      console.log('📝 Updated attributes list:', newAttributes);
      return {
        ...prev,
        attributes: newAttributes
      };
    });
    setNewAttribute({ id: '', code: '', name: '', type: 'text', is_required: false });
  };

  const removeAttribute = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index)
    }));
  };

  // Funciones para manejar productos
  const addProduct = (product: GlobalCatalogProduct) => {
    console.log('➕ Adding new product:', product);
    const productTemplate: ProductTemplate = {
      id: product.id,
      name: product.name,
      description: product.description,
      category_id: '', // PIM products have category as string
      category_name: product.category || '',
      brand_id: '', // Could be mapped from product.brand
      brand_name: product.brand,
      sku: product.ean, // Using EAN as SKU
      price: product.price || 0, // Use product price or default
      attributes: product.metadata
    };
    
    setFormData(prev => {
      const newProducts = [...prev.products, productTemplate];
      console.log('📝 Updated products list:', newProducts);
      return {
        ...prev,
        products: newProducts
      };
    });
    setNewProduct({ name: '', description: '', category_id: '', category_name: '', sku: '', price: 0 });
  };

  const removeProduct = (index: number) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index)
    }));
  };

  // Función para manejar marcas
  const addBrand = (brand: MarketplaceBrand) => {
    console.log('➕ Adding new brand:', brand);
    // Verificar que la marca no esté ya en la lista
    if (!formData.brands.find(b => b.id === brand.id)) {
      setFormData(prev => {
        const newBrands = [...prev.brands, brand];
        console.log('📝 Updated brands list:', newBrands);
        return {
          ...prev,
          brands: newBrands
        };
      });
    }
    setNewBrand(null);
  };

  const removeBrand = (index: number) => {
    setFormData(prev => ({
      ...prev,
      brands: prev.brands.filter((_, i) => i !== index)
    }));
  };

  // Función para cargar sugerencias AI (simuladas por ahora)
  const loadAISuggestions = () => {
    // Simulación de sugerencias basadas en el tipo de negocio
    const businessType = mockBusinessTypes.find(bt => bt.id === formData.business_type_id);
    
    if (!businessType) return;
    
    // Simulación de sugerencias contextuales
    const suggestions: typeof aiSuggestions = {};
    
    if (businessType.code === 'restaurant') {
      suggestions.categories = ['Bebidas alcohólicas', 'Postres artesanales', 'Menú del día'];
      suggestions.attributes = ['Tiempo de preparación', 'Alérgenos', 'Nivel de picante'];
      suggestions.products = ['Combo ejecutivo', 'Happy hour especial', 'Menú degustación'];
      suggestions.brands = ['Proveedor local certificado', 'Marca propia del restaurante'];
      suggestions.insights = [
        'Los restaurantes en tu región suelen tener 30% más ventas con combos',
        'Considera agregar opciones veganas (crecimiento 45% YoY)',
        'Los menús con fotos aumentan pedidos en 23%'
      ];
      suggestions.regional = [
        { region: 'AR', recommendation: 'Incluir opciones de vinos locales' },
        { region: 'MX', recommendation: 'Agregar salsas picantes personalizables' }
      ];
    } else if (businessType.code === 'fashion') {
      suggestions.categories = ['Accesorios de temporada', 'Línea sustentable', 'Ofertas flash'];
      suggestions.attributes = ['Guía de talles', 'Material', 'Cuidados de la prenda'];
      suggestions.products = ['Pack inicio temporada', 'Cápsulas básicas', 'Edición limitada'];
      suggestions.brands = ['Marcas eco-friendly', 'Diseñadores locales', 'Marcas premium'];
      suggestions.insights = [
        'Las tiendas de moda con talles inclusivos venden 40% más',
        'El filtro por color es usado por 67% de compradores',
        'Las devoluciones gratis aumentan conversión en 35%'
      ];
    }
    
    setAISuggestions(suggestions);
  };

  // Función para guardar cambios
  const handleSave = async () => {
    if (!isValidForm()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const updateData = {
        name: formData.name,
        description: formData.description,
        business_type_id: formData.business_type_id,
        version: formData.version,
        region: formData.region,
        is_active: formData.is_active,
        is_default: formData.is_default,
        categories: formData.categories.map(cat => ({
          ...cat,
          // Asegurar que el nombre sea consistente (podría ser slug o nombre normal)
          name: cat.name
        })),
        attributes: formData.attributes,
        products: formData.products,
        // Convert MarketplaceBrand[] to string[] for backend compatibility
        brands: formData.brands.map(brand => brand.name),
        metadata: {}
      };

      const response = await marketplaceApi.updateBusinessTypeTemplate(templateId, updateData, token || undefined);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Redirigir a la lista de plantillas
      router.push('/business-type-templates');
    } catch (err: any) {
      console.error('Error updating template:', err);
      setError(err.message || 'Error al actualizar la plantilla');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando plantilla...</p>
        </div>
      </div>
    );
  }

  if (error && initialLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Error al cargar plantilla</h3>
          <p className="text-muted-foreground">{error}</p>
          <Button 
            variant="outline" 
            onClick={() => router.push('/business-type-templates')}
            className="mt-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Plantillas
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className={`space-y-6 ${showAISidebar ? 'mr-96' : ''} transition-all duration-300`}>
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={() => setShowAISidebar(!showAISidebar)}
          className="gap-2"
        >
          <Sparkles className="h-4 w-4" />
          {showAISidebar ? 'Ocultar' : 'Mostrar'} Sugerencias AI
        </Button>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => router.push('/business-type-templates')}
            disabled={loading}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!isValidForm() || loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Guardar Cambios
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Info Card - Plantilla que se está editando */}
      {formData.name && formData.business_type_id && (
        <Card className="bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800">
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                  <Settings className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-medium text-purple-900 dark:text-purple-100">
                    {formData.name}
                  </h3>
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    {mockBusinessTypes.find(bt => bt.id === formData.business_type_id)?.name || 'Tipo de negocio'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={formData.is_active ? "default" : "secondary"}>
                  {formData.is_active ? "Activa" : "Inactiva"}
                </Badge>
                {formData.is_default && (
                  <Badge variant="outline" className="text-purple-600 border-purple-300">
                    Por defecto
                  </Badge>
                )}
                <Badge variant="outline" className="text-purple-600 border-purple-300">
                  v{formData.version}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">Información Básica</TabsTrigger>
          <TabsTrigger value="categories">Categorías ({formData.categories.length})</TabsTrigger>
          <TabsTrigger value="attributes">Atributos ({formData.attributes.length})</TabsTrigger>
          <TabsTrigger value="products">Productos ({formData.products.length})</TabsTrigger>
          <TabsTrigger value="brands">Marcas ({formData.brands.length})</TabsTrigger>
        </TabsList>

        {/* Tab: Información Básica */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Información General
              </CardTitle>
              <CardDescription>
                Configuración básica de la plantilla de tipo de negocio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre de la Plantilla *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="ej. Plantilla Restaurante Argentina"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business_type">Tipo de Negocio *</Label>
                  <Select
                    value={formData.business_type_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, business_type_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo de negocio" />
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="version">Versión *</Label>
                  <Input
                    id="version"
                    value={formData.version}
                    onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                    placeholder="1.0.0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region">Región *</Label>
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
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <div className="flex items-center space-x-2 pt-2">
                    <Switch
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                    />
                    <Label className="text-sm">
                      {formData.is_active ? 'Activa' : 'Inactiva'}
                    </Label>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.is_default}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_default: checked }))}
                />
                <Label className="text-sm">
                  Marcar como plantilla por defecto
                </Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Categorías */}
        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Categorías de Productos</CardTitle>
              <CardDescription>
                Define las categorías que incluirá esta plantilla
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Formulario para agregar categoría */}
              <div className="flex gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <MarketplaceCategorySelect
                    value={newCategory.name}
                    onValueChange={(value, category) => {
                      if (category) {
                        setNewCategory({
                          id: category.id,
                          name: category.name,
                          slug: category.slug,
                          description: category.description || '',
                          parent_id: category.parent_id || '',
                          level: category.level
                        });
                      }
                    }}
                    label="Seleccionar Categoría"
                    placeholder="Seleccionar categoría del marketplace..."
                    showActiveOnly={true}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={addCategory} disabled={!newCategory.name}>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar
                  </Button>
                </div>
              </div>

              {/* Lista de categorías */}
              <div className="space-y-2">
                {formData.categories.map((category, index) => (
                  <div key={`category-${category.id || index}`} className="flex items-center justify-between p-3 bg-background border rounded-lg">
                    <div>
                      <div className="font-medium">
                        {category.level > 0 && '↳ '}{category.name}
                      </div>
                      {category.slug && (
                        <div className="text-xs text-muted-foreground">
                          {category.slug}
                        </div>
                      )}
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
                    No hay categorías definidas
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
              <CardTitle>Atributos de Productos</CardTitle>
              <CardDescription>
                Define los atributos personalizados para los productos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Formulario para agregar atributo */}
              <div className="flex gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <MarketplaceAttributeSelect
                    value={newAttribute.name}
                    onValueChange={(value, attribute) => {
                      if (attribute) {
                        addAttribute(attribute);
                      }
                    }}
                    label="Seleccionar Atributo"
                    placeholder="Seleccionar atributo del marketplace..."
                    showActiveOnly={true}
                  />
                </div>
                <div className="flex items-end">
                  <Button disabled={!newAttribute.name}>
                    <Plus className="h-4 w-4 mr-2" />
                    Seleccionar del Marketplace
                  </Button>
                </div>
              </div>

              {/* Lista de atributos */}
              <div className="space-y-2">
                {formData.attributes.map((attribute, index) => (
                  <div key={`attribute-${index}-${attribute.name}`} className="flex items-center justify-between p-3 bg-background border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div>
                        <div className="font-medium">{attribute.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Tipo: {attribute.type}
                          {attribute.is_required && ' • Requerido'}
                          {attribute.code && ` • Código: ${attribute.code}`}
                        </div>
                        {attribute.default_value && (
                          <div className="text-xs text-blue-600">
                            Valor por defecto: {attribute.default_value}
                          </div>
                        )}
                        {attribute.options && attribute.options.length > 0 && (
                          <div className="text-xs text-purple-600">
                            Opciones: {attribute.options.join(', ')}
                          </div>
                        )}
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
                    No hay atributos definidos
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
              <CardTitle>Productos de Ejemplo</CardTitle>
              <CardDescription>
                Define productos de ejemplo que se incluirán en la plantilla
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Formulario para agregar producto */}
              <div className="flex gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <MarketplaceProductSelect
                    value={newProduct.name}
                    onValueChange={(value, product) => {
                      if (product) {
                        addProduct(product);
                      }
                    }}
                    label="Seleccionar Producto"
                    placeholder="Seleccionar producto del catálogo global..."
                    showVerifiedOnly={false}
                    minQualityScore={1}
                  />
                </div>
                <div className="flex items-end">
                  <Button disabled={!newProduct.name}>
                    <Plus className="h-4 w-4 mr-2" />
                    Seleccionar del Catálogo
                  </Button>
                </div>
              </div>

              {/* Lista de productos */}
              <div className="space-y-2">
                {formData.products.map((product, index) => (
                  <div key={`product-${index}-${product.name}`} className="flex items-center justify-between p-3 bg-background border rounded-lg">
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {product.brand_name && `Marca: ${product.brand_name} • `}
                        Categoría: {product.category_name}
                        {product.sku && ` • SKU: ${product.sku}`}
                      </div>
                      {product.description && (
                        <div className="text-xs text-blue-600 mt-1">
                          {product.description}
                        </div>
                      )}
                      {product.price > 0 && (
                        <div className="text-xs text-green-600 mt-1">
                          Precio: ${product.price}
                        </div>
                      )}
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
                    No hay productos definidos
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
              <CardTitle>Marcas</CardTitle>
              <CardDescription>
                Define las marcas que se incluirán en esta plantilla
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Formulario para agregar marca */}
              <div className="flex gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <MarketplaceBrandSelect
                    value={newBrand?.name || ''}
                    onValueChange={(value, brand) => {
                      if (brand) {
                        addBrand(brand);
                      }
                    }}
                    label="Seleccionar Marca"
                    placeholder="Seleccionar marca del marketplace..."
                    showActiveOnly={true}
                    showVerifiedOnly={false}
                  />
                </div>
                <div className="flex items-end">
                  <Button disabled={!newBrand}>
                    <Plus className="h-4 w-4 mr-2" />
                    Seleccionar del Marketplace
                  </Button>
                </div>
              </div>

              {/* Lista de marcas */}
              <div className="space-y-2">
                {formData.brands.map((brand, index) => (
                  <div key={`brand-${index}-${brand.id || brand.name}`} className="flex items-center justify-between p-3 bg-background border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="font-medium">{brand.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Estado: {brand.verification_status === 'verified' ? 'Verificada' : 'No verificada'}
                          {brand.country_code && ` • País: ${brand.country_code}`}
                          {brand.product_count > 0 && ` • ${brand.product_count} productos`}
                        </div>
                        {brand.description && (
                          <div className="text-xs text-blue-600 mt-1">
                            {brand.description}
                          </div>
                        )}
                        {brand.website && (
                          <div className="text-xs text-purple-600 mt-1">
                            Web: {brand.website}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeBrand(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {formData.brands.length === 0 && (
                  <div className="w-full text-center py-8 text-muted-foreground">
                    No hay marcas definidas
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>

      {/* Panel lateral de Sugerencias AI */}
      {showAISidebar && (
        <div className="fixed right-0 top-0 h-full w-96 bg-background border-l shadow-lg overflow-y-auto z-50">
          <div className="sticky top-0 bg-background border-b p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold">Asistente AI</h3>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowAISidebar(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="p-4 space-y-6">
            {/* Botón de Optimizar */}
            <Button 
              className="w-full gap-2"
              variant="default"
              onClick={loadAISuggestions}
            >
              <Sparkles className="h-4 w-4" />
              Optimizar con IA
            </Button>

            {/* Insights generales */}
            {aiSuggestions.insights && aiSuggestions.insights.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Insights del Negocio
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {aiSuggestions.insights.map((insight, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <TrendingUp className="h-3 w-3 text-green-600 mt-1 flex-shrink-0" />
                      <p className="text-sm text-muted-foreground">{insight}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Sugerencias por región */}
            {aiSuggestions.regional && aiSuggestions.regional.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Recomendaciones Regionales
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {aiSuggestions.regional.map((item, index) => (
                    <div key={index} className="space-y-1">
                      <Badge variant="outline" className="text-xs">
                        {item.region}
                      </Badge>
                      <p className="text-sm text-muted-foreground">{item.recommendation}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Sugerencias por sección basadas en el tab activo */}
            {activeTab === 'categories' && aiSuggestions.categories && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Categorías Sugeridas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {aiSuggestions.categories.map((category, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                      <span className="text-sm">{category}</span>
                      <Button size="sm" variant="ghost">
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {activeTab === 'attributes' && aiSuggestions.attributes && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Atributos Recomendados
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {aiSuggestions.attributes.map((attribute, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                      <span className="text-sm">{attribute}</span>
                      <Button size="sm" variant="ghost">
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {activeTab === 'products' && aiSuggestions.products && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Productos Populares
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {aiSuggestions.products.map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                      <span className="text-sm">{product}</span>
                      <Button size="sm" variant="ghost">
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {activeTab === 'brands' && aiSuggestions.brands && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Marcas Recomendadas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {aiSuggestions.brands.map((brand, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                      <span className="text-sm">{brand}</span>
                      <Button size="sm" variant="ghost">
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Preview de distribución */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Distribución del Template</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Categorías</span>
                    <span className="font-medium">{formData.categories.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Atributos</span>
                    <span className="font-medium">{formData.attributes.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Productos</span>
                    <span className="font-medium">{formData.products.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Marcas</span>
                    <span className="font-medium">{formData.brands.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}