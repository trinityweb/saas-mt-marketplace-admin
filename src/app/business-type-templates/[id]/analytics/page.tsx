'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  BarChart,
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  Globe,
  Activity,
  ArrowLeft,
  Download,
  Filter,
  Calendar,
  Percent,
  Edit3,
  Eye,
  DollarSign,
  Target,
  Sparkles
} from 'lucide-react';

import { Button } from '@/components/shared-ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shared-ui';
import { Badge } from '@/components/shared-ui';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/shared-ui';

import { useAuth } from '@/hooks/use-auth';
import { useHeader } from '@/components/layout/admin-layout';

// Interfaces para los datos de analytics
interface TemplateMetrics {
  usage_count: number;
  success_rate: number;
  modification_rate: number;
  revenue_impact: number;
  avg_setup_time: number;
  tenant_retention: number;
}

interface UsageOverTime {
  date: string;
  count: number;
  success_rate: number;
}

interface RegionalPerformance {
  region: string;
  usage_count: number;
  success_rate: number;
  popular_categories: string[];
}

interface ProductPopularity {
  product_name: string;
  category: string;
  selection_rate: number;
  modification_rate: number;
  revenue_contribution: number;
}

interface CategoryDistribution {
  category: string;
  product_count: number;
  selection_rate: number;
}

interface TemplateAnalytics {
  template_id: string;
  template_name: string;
  business_type: string;
  metrics: TemplateMetrics;
  usage_over_time: UsageOverTime[];
  regional_performance: RegionalPerformance[];
  product_popularity: ProductPopularity[];
  category_distribution: CategoryDistribution[];
  top_modifications: string[];
  ai_insights: string[];
}

// Datos simulados para el demo
const generateMockAnalytics = (templateId: string): TemplateAnalytics => {
  // Generar datos de uso en el tiempo (últimos 30 días)
  const usageOverTime: UsageOverTime[] = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    usageOverTime.push({
      date: date.toISOString().split('T')[0],
      count: Math.floor(Math.random() * 20) + 5,
      success_rate: 75 + Math.random() * 20
    });
  }

  return {
    template_id: templateId,
    template_name: 'Plantilla Restaurante Premium',
    business_type: 'Restaurante',
    metrics: {
      usage_count: 234,
      success_rate: 87.5,
      modification_rate: 23.4,
      revenue_impact: 125000,
      avg_setup_time: 8.5,
      tenant_retention: 92.3
    },
    usage_over_time: usageOverTime,
    regional_performance: [
      {
        region: 'AR',
        usage_count: 156,
        success_rate: 89.2,
        popular_categories: ['Platos principales', 'Bebidas', 'Postres']
      },
      {
        region: 'MX',
        usage_count: 78,
        success_rate: 84.5,
        popular_categories: ['Tacos y antojitos', 'Bebidas', 'Combos']
      }
    ],
    product_popularity: [
      {
        product_name: 'Combo del día',
        category: 'Combos',
        selection_rate: 92.3,
        modification_rate: 12.5,
        revenue_contribution: 35000
      },
      {
        product_name: 'Pizza Margherita',
        category: 'Platos principales',
        selection_rate: 87.6,
        modification_rate: 8.2,
        revenue_contribution: 28000
      },
      {
        product_name: 'Cerveza artesanal',
        category: 'Bebidas',
        selection_rate: 76.4,
        modification_rate: 5.1,
        revenue_contribution: 22000
      }
    ],
    category_distribution: [
      { category: 'Platos principales', product_count: 45, selection_rate: 95.2 },
      { category: 'Bebidas', product_count: 32, selection_rate: 88.7 },
      { category: 'Postres', product_count: 18, selection_rate: 72.3 },
      { category: 'Entradas', product_count: 15, selection_rate: 68.9 }
    ],
    top_modifications: [
      'Agregar campo de "tiempo de preparación" a productos',
      'Incluir categoría de "Opciones veganas"',
      'Cambiar precios base de productos',
      'Agregar atributo de "nivel de picante"'
    ],
    ai_insights: [
      'Esta plantilla tiene 23% mejor performance que el promedio del rubro',
      'Los tenants que no modifican precios tienen 15% más retención',
      'Agregar fotos a productos aumenta ventas en 34%',
      'La categoría "Combos" genera 40% del revenue total'
    ]
  };
};

export default function TemplateAnalyticsPage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params.id as string;
  const { token } = useAuth();
  const { setHeaderProps, clearHeaderProps } = useHeader();
  
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<TemplateAnalytics | null>(null);
  const [timeRange, setTimeRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');

  // Icono memoizado
  const headerIcon = useMemo(() => <BarChart className="w-5 h-5 text-white" />, []);

  // Cargar datos de analytics
  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true);
      
      // Simular carga de datos
      setTimeout(() => {
        const mockData = generateMockAnalytics(templateId);
        setAnalytics(mockData);
        setLoading(false);
      }, 1000);
    };

    loadAnalytics();
  }, [templateId]);

  // Establecer header dinámico
  useEffect(() => {
    setHeaderProps({
      title: analytics?.template_name || 'Analytics de Template',
      subtitle: `Métricas de performance y uso - ${analytics?.business_type || 'Cargando...'}`,
      backUrl: '/business-type-templates',
      backLabel: 'Volver a Plantillas',
      icon: headerIcon
    });

    return () => {
      clearHeaderProps();
    };
  }, [setHeaderProps, clearHeaderProps, headerIcon, analytics]);

  // Función para obtener el color según el valor
  const getMetricColor = (value: number, type: 'percentage' | 'time' = 'percentage') => {
    if (type === 'percentage') {
      if (value >= 80) return 'text-green-600';
      if (value >= 60) return 'text-yellow-600';
      return 'text-red-600';
    }
    // Para tiempo (menor es mejor)
    if (value <= 10) return 'text-green-600';
    if (value <= 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Activity className="w-8 h-8 animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-muted-foreground">No se encontraron datos de analytics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controles superiores */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 días</SelectItem>
              <SelectItem value="30d">Últimos 30 días</SelectItem>
              <SelectItem value="90d">Últimos 90 días</SelectItem>
              <SelectItem value="1y">Último año</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar Reporte
          </Button>
          <Button variant="outline" onClick={() => router.push(`/business-type-templates/${templateId}/edit`)}>
            <Edit3 className="h-4 w-4 mr-2" />
            Editar Template
          </Button>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Usos Totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.metrics.usage_count}</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +23% vs mes anterior
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tasa de Éxito
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getMetricColor(analytics.metrics.success_rate)}`}>
              {analytics.metrics.success_rate.toFixed(1)}%
            </div>
            <Progress value={analytics.metrics.success_rate} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Modificación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.metrics.modification_rate.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              de templates editados
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Impacto Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(analytics.metrics.revenue_impact / 1000).toFixed(0)}k
            </div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <DollarSign className="h-3 w-3 mr-1" />
              Revenue generado
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tiempo Setup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getMetricColor(analytics.metrics.avg_setup_time, 'time')}`}>
              {analytics.metrics.avg_setup_time.toFixed(1)}min
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              promedio
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Retención
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getMetricColor(analytics.metrics.tenant_retention)}`}>
              {analytics.metrics.tenant_retention.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              a 90 días
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de contenido */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vista General</TabsTrigger>
          <TabsTrigger value="performance">Performance Regional</TabsTrigger>
          <TabsTrigger value="products">Productos Populares</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        {/* Tab: Vista General */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Uso en el Tiempo</CardTitle>
              <CardDescription>
                Evolución del uso del template en los últimos {timeRange === '7d' ? '7 días' : timeRange === '30d' ? '30 días' : timeRange === '90d' ? '90 días' : 'año'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Aquí iría un gráfico real, por ahora una representación simple */}
              <div className="h-64 flex items-end gap-1">
                {analytics.usage_over_time.slice(-30).map((day, index) => (
                  <div
                    key={index}
                    className="flex-1 bg-primary/20 hover:bg-primary/30 transition-colors relative group"
                    style={{ height: `${(day.count / 25) * 100}%` }}
                  >
                    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-popover text-popover-foreground px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {day.count} usos
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>Hace 30 días</span>
                <span>Hoy</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Distribución de Categorías</CardTitle>
              <CardDescription>
                Categorías más seleccionadas del template
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {analytics.category_distribution.map((category, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{category.category}</span>
                    <span className="text-muted-foreground">
                      {category.product_count} productos • {category.selection_rate.toFixed(1)}% selección
                    </span>
                  </div>
                  <Progress value={category.selection_rate} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Modificaciones Más Comunes</CardTitle>
              <CardDescription>
                Cambios que los tenants realizan con mayor frecuencia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.top_modifications.map((modification, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-0.5">
                      {index + 1}
                    </Badge>
                    <p className="text-sm">{modification}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Performance Regional */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {analytics.regional_performance.map((region, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      {region.region}
                    </CardTitle>
                    <Badge variant="outline">
                      {region.usage_count} usos
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Tasa de éxito</p>
                      <p className={`text-2xl font-bold ${getMetricColor(region.success_rate)}`}>
                        {region.success_rate.toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">vs Promedio</p>
                      <p className="text-2xl font-bold text-green-600">
                        +{(region.success_rate - analytics.metrics.success_rate).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Categorías populares</p>
                    <div className="flex flex-wrap gap-2">
                      {region.popular_categories.map((cat, idx) => (
                        <Badge key={idx} variant="secondary">
                          {cat}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab: Productos Populares */}
        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Productos por Selección</CardTitle>
              <CardDescription>
                Productos más elegidos al aplicar el template
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.product_popularity.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium">{product.product_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {product.category} • Modificado {product.modification_rate.toFixed(1)}% de veces
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="text-sm font-medium">
                        {product.selection_rate.toFixed(1)}% selección
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ${(product.revenue_contribution / 1000).toFixed(1)}k revenue
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: AI Insights */}
        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                Insights Generados por IA
              </CardTitle>
              <CardDescription>
                Recomendaciones basadas en el análisis de datos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.ai_insights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                    <Target className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{insight}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-medium text-sm mb-2">Recomendaciones de Optimización</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">•</span>
                    Considera agregar más productos en la categoría "Combos" ya que genera el mayor revenue
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">•</span>
                    Los templates con imágenes tienen 34% mejor conversión
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">•</span>
                    Agregar tutoriales reduce el tiempo de setup en 40%
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}