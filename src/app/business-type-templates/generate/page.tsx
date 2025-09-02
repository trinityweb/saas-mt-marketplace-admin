'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Building2,
  MapPin,
  Target,
  Package,
  Check,
  Loader2,
  Info,
  Lightbulb,
  TrendingUp,
  Users,
  ShoppingBag,
  Zap,
  Brain,
  Wand2
} from 'lucide-react';

import { Button } from '@/components/shared-ui';
import { Input } from '@/components/shared-ui';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shared-ui';
import { Badge } from '@/components/shared-ui';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/shared-ui';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useAuth } from '@/hooks/use-auth';
import { useHeader } from '@/components/layout/admin-layout';

// Interfaces para el wizard
interface BusinessContext {
  business_name: string;
  business_type: string;
  business_description: string;
  region: string;
  target_market: string;
  business_size: string;
  special_requirements: string;
}

interface AIParameters {
  optimization_focus: string;
  category_depth: string;
  product_variety: string;
  price_range: string;
  customization_level: string;
}

interface GeneratedTemplate {
  name: string;
  description: string;
  confidence_score: number;
  categories: Array<{
    name: string;
    relevance_score: number;
    suggested_products: number;
  }>;
  recommended_attributes: string[];
  suggested_brands: string[];
  insights: string[];
}

const BUSINESS_TYPES = [
  { value: 'restaurant', label: 'Restaurante', icon: '🍽️' },
  { value: 'retail', label: 'Tienda Minorista', icon: '🛍️' },
  { value: 'fashion', label: 'Moda y Textiles', icon: '👗' },
  { value: 'grocery', label: 'Supermercado', icon: '🛒' },
  { value: 'pharmacy', label: 'Farmacia', icon: '💊' },
  { value: 'tech', label: 'Tecnología', icon: '💻' },
  { value: 'beauty', label: 'Belleza y Cosmética', icon: '💄' },
  { value: 'other', label: 'Otro', icon: '📦' }
];

const OPTIMIZATION_FOCUS = [
  { value: 'conversion', label: 'Maximizar conversión', description: 'Optimizado para ventas rápidas' },
  { value: 'discovery', label: 'Descubrimiento de productos', description: 'Facilitar exploración del catálogo' },
  { value: 'efficiency', label: 'Eficiencia operativa', description: 'Minimizar tiempo de gestión' },
  { value: 'experience', label: 'Experiencia del cliente', description: 'Foco en satisfacción del usuario' }
];

export default function GenerateTemplatePage() {
  const router = useRouter();
  const { token } = useAuth();
  const { setHeaderProps, clearHeaderProps } = useHeader();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [generatedTemplate, setGeneratedTemplate] = useState<GeneratedTemplate | null>(null);
  
  // Estado del formulario
  const [businessContext, setBusinessContext] = useState<BusinessContext>({
    business_name: '',
    business_type: '',
    business_description: '',
    region: 'AR',
    target_market: '',
    business_size: 'small',
    special_requirements: ''
  });
  
  const [aiParameters, setAIParameters] = useState<AIParameters>({
    optimization_focus: 'conversion',
    category_depth: 'balanced',
    product_variety: 'medium',
    price_range: 'medium',
    customization_level: 'medium'
  });

  // Icono memoizado
  const headerIcon = useMemo(() => <Sparkles className="w-5 h-5 text-white" />, []);

  // Establecer header dinámico
  useEffect(() => {
    setHeaderProps({
      title: 'Generar Template con IA',
      subtitle: 'Crea una plantilla personalizada usando inteligencia artificial',
      backUrl: '/business-type-templates',
      backLabel: 'Volver a Plantillas',
      icon: headerIcon
    });

    return () => {
      clearHeaderProps();
    };
  }, [setHeaderProps, clearHeaderProps, headerIcon]);

  // Validación por paso
  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(businessContext.business_name && businessContext.business_type && businessContext.business_description);
      case 2:
        return !!(businessContext.region && businessContext.target_market);
      case 3:
        return true; // Los parámetros AI tienen valores por defecto
      default:
        return false;
    }
  };

  // Función para generar template (simulada)
  const generateTemplate = async () => {
    setGenerating(true);
    
    // Simular llamada a API
    setTimeout(() => {
      const mockTemplate: GeneratedTemplate = {
        name: `Template ${businessContext.business_name} - Optimizado IA`,
        description: `Plantilla generada por IA para ${businessContext.business_name}, optimizada para ${OPTIMIZATION_FOCUS.find(o => o.value === aiParameters.optimization_focus)?.label}`,
        confidence_score: 92.5,
        categories: [
          { name: 'Productos Estrella', relevance_score: 95, suggested_products: 15 },
          { name: 'Ofertas Especiales', relevance_score: 88, suggested_products: 10 },
          { name: 'Novedades', relevance_score: 82, suggested_products: 8 },
          { name: 'Productos de Temporada', relevance_score: 76, suggested_products: 12 }
        ],
        recommended_attributes: [
          'Descripción detallada',
          'Ingredientes/Materiales',
          'Tiempo de entrega',
          'Garantía',
          'Instrucciones de uso'
        ],
        suggested_brands: [
          'Marca propia',
          'Proveedores locales certificados',
          'Marcas premium seleccionadas'
        ],
        insights: [
          `Para ${businessContext.business_type} en ${businessContext.region}, recomendamos enfocarse en productos locales`,
          'Los clientes valoran la transparencia en precios y disponibilidad',
          'Incluir fotos de alta calidad aumenta la conversión en 40%',
          'Las categorías sugeridas están basadas en 500+ negocios similares exitosos'
        ]
      };
      
      setGeneratedTemplate(mockTemplate);
      setGenerating(false);
      setCurrentStep(4);
    }, 3000);
  };

  // Función para aplicar el template generado
  const applyGeneratedTemplate = () => {
    // Aquí se llamaría a la API para crear el template
    // Por ahora, redirigir a la página de edición
    router.push('/business-type-templates/new-generated-id/edit');
  };

  // Renderizar el contenido según el paso actual
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Información del Negocio
              </CardTitle>
              <CardDescription>
                Cuéntanos sobre tu negocio para personalizar la plantilla
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="business_name">Nombre del Negocio *</Label>
                <Input
                  id="business_name"
                  value={businessContext.business_name}
                  onChange={(e) => setBusinessContext({...businessContext, business_name: e.target.value})}
                  placeholder="ej. La Parrilla de Juan"
                />
              </div>

              <div className="space-y-2">
                <Label>Tipo de Negocio *</Label>
                <RadioGroup
                  value={businessContext.business_type}
                  onValueChange={(value) => setBusinessContext({...businessContext, business_type: value})}
                >
                  <div className="grid grid-cols-2 gap-4">
                    {BUSINESS_TYPES.map((type) => (
                      <div key={type.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={type.value} id={type.value} />
                        <Label htmlFor={type.value} className="flex items-center gap-2 cursor-pointer">
                          <span className="text-xl">{type.icon}</span>
                          {type.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="business_description">Descripción del Negocio *</Label>
                <Textarea
                  id="business_description"
                  value={businessContext.business_description}
                  onChange={(e) => setBusinessContext({...businessContext, business_description: e.target.value})}
                  placeholder="Describe tu negocio, productos principales, estilo, etc..."
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  Mientras más detalles proporciones, mejor será la plantilla generada
                </p>
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Contexto del Mercado
              </CardTitle>
              <CardDescription>
                Información sobre tu mercado objetivo y ubicación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="region">Región *</Label>
                  <Select
                    value={businessContext.region}
                    onValueChange={(value) => setBusinessContext({...businessContext, region: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AR">Argentina</SelectItem>
                      <SelectItem value="MX">México</SelectItem>
                      <SelectItem value="CO">Colombia</SelectItem>
                      <SelectItem value="CL">Chile</SelectItem>
                      <SelectItem value="PE">Perú</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="business_size">Tamaño del Negocio</Label>
                  <Select
                    value={businessContext.business_size}
                    onValueChange={(value) => setBusinessContext({...businessContext, business_size: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Pequeño (1-10 empleados)</SelectItem>
                      <SelectItem value="medium">Mediano (11-50 empleados)</SelectItem>
                      <SelectItem value="large">Grande (50+ empleados)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="target_market">Mercado Objetivo *</Label>
                <Textarea
                  id="target_market"
                  value={businessContext.target_market}
                  onChange={(e) => setBusinessContext({...businessContext, target_market: e.target.value})}
                  placeholder="ej. Familias de clase media, jóvenes profesionales, turistas..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="special_requirements">Requerimientos Especiales (opcional)</Label>
                <Textarea
                  id="special_requirements"
                  value={businessContext.special_requirements}
                  onChange={(e) => setBusinessContext({...businessContext, special_requirements: e.target.value})}
                  placeholder="ej. Necesito categorías para productos veganos, opciones de delivery, etc..."
                  rows={3}
                />
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  La IA analizará negocios similares en tu región para optimizar las recomendaciones
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Parámetros de Generación AI
              </CardTitle>
              <CardDescription>
                Ajusta cómo la IA generará tu plantilla
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Enfoque de Optimización</Label>
                <RadioGroup
                  value={aiParameters.optimization_focus}
                  onValueChange={(value) => setAIParameters({...aiParameters, optimization_focus: value})}
                >
                  {OPTIMIZATION_FOCUS.map((focus) => (
                    <div key={focus.value} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted">
                      <RadioGroupItem value={focus.value} id={focus.value} className="mt-1" />
                      <Label htmlFor={focus.value} className="cursor-pointer flex-1">
                        <div className="font-medium">{focus.label}</div>
                        <div className="text-sm text-muted-foreground">{focus.description}</div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category_depth">Profundidad de Categorías</Label>
                  <Select
                    value={aiParameters.category_depth}
                    onValueChange={(value) => setAIParameters({...aiParameters, category_depth: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="simple">Simple (5-10 categorías)</SelectItem>
                      <SelectItem value="balanced">Balanceado (10-20 categorías)</SelectItem>
                      <SelectItem value="detailed">Detallado (20+ categorías)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product_variety">Variedad de Productos</Label>
                  <Select
                    value={aiParameters.product_variety}
                    onValueChange={(value) => setAIParameters({...aiParameters, product_variety: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baja (50-100 productos)</SelectItem>
                      <SelectItem value="medium">Media (100-500 productos)</SelectItem>
                      <SelectItem value="high">Alta (500+ productos)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Tecnología AI Avanzada</p>
                    <p className="text-sm text-muted-foreground">
                      Nuestro modelo analiza más de 10,000 negocios exitosos para generar 
                      la plantilla perfecta para tu caso específico.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 4:
        if (generating) {
          return (
            <Card>
              <CardContent className="py-16">
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <div className="relative">
                      <Sparkles className="h-16 w-16 text-purple-600 animate-pulse" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin" />
                      </div>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold">Generando tu plantilla...</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    La IA está analizando tu información y creando una plantilla optimizada 
                    específicamente para tu negocio.
                  </p>
                  <Progress value={66} className="max-w-xs mx-auto" />
                </div>
              </CardContent>
            </Card>
          );
        }

        if (generatedTemplate) {
          return (
            <div className="space-y-6">
              <Card className="border-green-200 dark:border-green-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-green-600">
                      <Check className="h-5 w-5" />
                      Plantilla Generada Exitosamente
                    </CardTitle>
                    <Badge variant="outline" className="text-green-600">
                      {generatedTemplate.confidence_score}% confianza
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium">{generatedTemplate.name}</h4>
                      <p className="text-sm text-muted-foreground">{generatedTemplate.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Categorías Recomendadas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {generatedTemplate.categories.map((category, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{category.relevance_score}%</Badge>
                            <span className="text-sm">{category.name}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            ~{category.suggested_products} productos
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Atributos Sugeridos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {generatedTemplate.recommended_attributes.map((attr, index) => (
                        <Badge key={index} variant="secondary">
                          {attr}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Insights de la IA
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {generatedTemplate.insights.map((insight, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <TrendingUp className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm">{insight}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        }

        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress indicator */}
      {currentStep < 4 && (
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center flex-1">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center font-medium
                ${currentStep >= step 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'}
              `}>
                {step}
              </div>
              {step < 3 && (
                <div className={`
                  flex-1 h-1 mx-4
                  ${currentStep > step ? 'bg-primary' : 'bg-muted'}
                `} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Step content */}
      {renderStepContent()}

      {/* Navigation buttons */}
      <div className="flex justify-between">
        {currentStep > 1 && currentStep < 4 && (
          <Button
            variant="outline"
            onClick={() => setCurrentStep(currentStep - 1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>
        )}
        
        {currentStep < 3 && (
          <Button
            className="ml-auto"
            onClick={() => setCurrentStep(currentStep + 1)}
            disabled={!isStepValid(currentStep)}
          >
            Siguiente
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
        
        {currentStep === 3 && (
          <Button
            className="ml-auto"
            onClick={generateTemplate}
            disabled={generating}
          >
            <Wand2 className="h-4 w-4 mr-2" />
            Generar Plantilla
          </Button>
        )}
        
        {currentStep === 4 && generatedTemplate && (
          <div className="flex gap-2 ml-auto">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(3)}
            >
              Ajustar Parámetros
            </Button>
            <Button onClick={applyGeneratedTemplate}>
              <Check className="h-4 w-4 mr-2" />
              Aplicar Plantilla
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}