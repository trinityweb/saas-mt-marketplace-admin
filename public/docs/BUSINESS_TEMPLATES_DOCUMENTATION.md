# 📋 Business Type Templates - Documentación

## 📋 Índice
1. [Visión General](#visión-general)
2. [Arquitectura](#arquitectura)
3. [Funcionalidades](#funcionalidades)
4. [API Integration](#api-integration)
5. [Componentes](#componentes)
6. [Guía de Uso](#guía-de-uso)
7. [Generación con AI](#generación-con-ai)
8. [Analytics](#analytics)
9. [Troubleshooting](#troubleshooting)

## 🎯 Visión General

Business Type Templates es el módulo que gestiona plantillas predefinidas de productos para cada tipo de negocio. Facilita el onboarding rápido de nuevos tenants proporcionando catálogos pre-curados y optimizados por tipo de comercio.

### Características Principales

- **Templates Predefinidos**: Catálogos listos para usar
- **Generación con AI**: Creación inteligente basada en contexto
- **Analytics Integrado**: Métricas de uso y efectividad
- **Versionado**: Control de cambios en templates
- **Personalización**: Ajuste fino por región y tamaño

### Flujo de Valor

```
Tipo de Negocio → Template Seleccionado → Catálogo Inicial
                          ↓
                    Personalización
                          ↓
                    Tenant Operativo
```

## 🏗️ Arquitectura

### Estructura del Módulo

```
src/app/business-type-templates/
├── page.tsx                    # Listado de templates
├── create/
│   └── page.tsx               # Crear template manual
├── generate/
│   └── page.tsx               # Wizard generación AI
├── [id]/
│   ├── page.tsx              # Vista detalle
│   ├── edit/
│   │   └── page.tsx          # Editor de template
│   └── analytics/
│       └── page.tsx          # Analytics del template

src/components/templates/
├── TemplatesList.tsx          # Tabla principal
├── TemplateEditor.tsx         # Editor completo
├── TemplateWizard.tsx         # Wizard AI 3 pasos
├── TemplateSuggestions.tsx    # Panel sugerencias AI
└── TemplateAnalytics.tsx      # Dashboard analytics

src/hooks/
└── useTemplates.ts            # Hook principal

src/lib/api/
└── templates-api.ts           # Cliente API extendido
```

### Base de Datos

- **PostgreSQL**: Tablas principales
  - `business_type_templates`: Templates base
  - `template_products`: Productos del template
  - `template_analytics`: Métricas de uso
  - `template_versions`: Historial de versiones

## 🚀 Funcionalidades

### 1. Gestión de Templates

**Listado Principal**:
- Vista tabla con columnas extendidas
- Filtros por tipo de negocio
- Búsqueda por nombre/descripción
- Indicadores de performance
- Estado AI (generado/manual)

**Acciones Disponibles**:
- Ver detalle completo
- Editar productos
- Clonar template
- Ver analytics
- Exportar/Importar

### 2. Editor de Templates

**Características del Editor**:
- Lista de productos con drag & drop
- Categorías organizadas
- Precios sugeridos
- Stock inicial recomendado
- Preview en tiempo real

**Campos por Producto**:
```typescript
interface TemplateProduct {
  id: string;
  product_name: string;
  category: string;
  suggested_price: number;
  initial_stock: number;
  priority: 'high' | 'medium' | 'low';
  is_essential: boolean;
  alternatives: string[];
}
```

### 3. Generación con AI

**Wizard de 3 Pasos**:

**Paso 1 - Contexto del Negocio**:
- Tipo de negocio
- Tamaño (pequeño/mediano/grande)
- Ubicación (barrio/zona)
- Presupuesto inicial

**Paso 2 - Mercado Objetivo**:
- Demografía principal
- Nivel socioeconómico
- Competencia cercana
- Especialización deseada

**Paso 3 - Parámetros de Generación**:
- Cantidad de productos (50-500)
- Incluir marcas premium
- Foco en productos locales
- Optimización de márgenes

### 4. Analytics Dashboard

**Métricas Principales**:
- Adopción del template (%)
- Productos más/menos usados
- Revenue promedio por tenant
- Tiempo hasta primera venta
- Tasa de personalización

**Visualizaciones**:
- Gráfico de adopción temporal
- Heatmap de productos
- Comparativa con otros templates
- Tendencias de uso

## 🔌 API Integration

### Endpoints Principales

```typescript
// Listar templates
GET /api/v1/business-type-templates
  ?business_type_id=uuid
  &page=1
  &page_size=20
  &include_analytics=true

// Obtener template con productos
GET /api/v1/business-type-templates/{id}
  ?include_products=true
  &include_analytics=true

// Crear template manual
POST /api/v1/business-type-templates
{
  "name": "Kiosco Urbano Premium",
  "business_type_id": "uuid",
  "description": "Template para kioscos en zonas céntricas",
  "metadata": {
    "size": "small",
    "location": "urban",
    "focus": "premium"
  }
}

// Generar con AI
POST /api/v1/business-type-templates/generate
{
  "business_type_id": "uuid",
  "context": {
    "size": "medium",
    "location": "suburban",
    "budget": "moderate",
    "target_demographic": "families",
    "competition": "low",
    "specialization": "healthy_products"
  },
  "parameters": {
    "product_count": 150,
    "include_premium": false,
    "local_focus": true,
    "optimize_margins": true
  }
}

// Actualizar template
PUT /api/v1/business-type-templates/{id}

// Obtener analytics
GET /api/v1/business-type-templates/{id}/analytics
  ?period=30d
  &metrics=adoption,revenue,customization

// Clonar template
POST /api/v1/business-type-templates/{id}/clone

// Obtener sugerencias AI
POST /api/v1/business-type-templates/{id}/suggestions
{
  "type": "products",
  "context": "current_market_trends"
}
```

### Tipos de Datos

```typescript
interface BusinessTypeTemplate {
  id: string;
  name: string;
  business_type_id: string;
  business_type?: BusinessType;
  description?: string;
  product_count: number;
  is_active: boolean;
  generated_by_ai: boolean;
  ai_context?: AIGenerationContext;
  performance_score?: number;
  adoption_count: number;
  last_used_at?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface TemplateAnalytics {
  template_id: string;
  period: string;
  metrics: {
    adoption_rate: number;
    average_revenue: number;
    customization_rate: number;
    time_to_first_sale: number;
    product_performance: ProductMetric[];
  };
  trends: {
    adoption: DataPoint[];
    revenue: DataPoint[];
  };
}

interface AIGenerationContext {
  business_context: {
    size: 'small' | 'medium' | 'large';
    location: string;
    budget: 'low' | 'moderate' | 'high';
  };
  market_context: {
    target_demographic: string;
    competition_level: string;
    specialization: string;
  };
  parameters: {
    product_count: number;
    include_premium: boolean;
    local_focus: boolean;
    optimize_margins: boolean;
  };
}
```

## 📦 Componentes

### TemplatesList

Tabla principal con vista enriquecida:

```tsx
<TemplatesList
  templates={templates}
  loading={loading}
  onEdit={handleEdit}
  onClone={handleClone}
  onAnalytics={handleAnalytics}
  onGenerate={handleGenerate}
  showPerformance={true}
/>
```

### TemplateWizard

Wizard de generación con AI:

```tsx
<TemplateWizard
  businessType={selectedBusinessType}
  onComplete={handleWizardComplete}
  onCancel={handleCancel}
  defaultContext={savedContext}
/>
```

### TemplateEditor

Editor completo de productos:

```tsx
<TemplateEditor
  template={template}
  products={products}
  onSave={handleSave}
  onProductAdd={handleProductAdd}
  onProductRemove={handleProductRemove}
  onProductUpdate={handleProductUpdate}
  showSuggestions={true}
/>
```

### TemplateSuggestions

Panel lateral con sugerencias AI:

```tsx
<TemplateSuggestions
  template={template}
  context="market_trends"
  onApplySuggestion={handleApplySuggestion}
  autoRefresh={true}
/>
```

## 📖 Guía de Uso

### Crear Template Manual

1. Ir a "Templates de Negocio"
2. Click en "Nuevo Template"
3. Completar información básica:
   - Nombre descriptivo
   - Tipo de negocio asociado
   - Descripción detallada
   - Metadata (tamaño, ubicación, etc.)
4. Guardar y continuar al editor

### Generar Template con AI

1. Click en "Generar con AI"
2. **Paso 1**: Definir contexto del negocio
   - Seleccionar tipo de negocio
   - Indicar tamaño esperado
   - Ubicación/zona
   - Presupuesto inicial
3. **Paso 2**: Definir mercado objetivo
   - Demografía principal
   - Nivel socioeconómico
   - Competencia en la zona
   - Especialización deseada
4. **Paso 3**: Configurar parámetros
   - Cantidad de productos
   - Incluir marcas premium
   - Foco en productos locales
   - Optimización de márgenes
5. Generar y revisar resultado

### Editar Template

1. Seleccionar template de la lista
2. Click en "Editar"
3. En el editor:
   - Agregar/quitar productos
   - Ajustar precios sugeridos
   - Cambiar categorías
   - Definir productos esenciales
   - Establecer prioridades
4. Guardar cambios (crea nueva versión)

### Analizar Performance

1. Click en "Analytics" del template
2. Revisar métricas:
   - Tasa de adopción
   - Revenue promedio
   - Productos más exitosos
   - Tiempo hasta primera venta
3. Identificar oportunidades de mejora
4. Aplicar optimizaciones sugeridas

## 🤖 Generación con AI

### Proceso de Generación

1. **Análisis de Contexto**:
   - AI evalúa el tipo de negocio
   - Considera ubicación y demografía
   - Analiza competencia y mercado

2. **Selección de Productos**:
   - Curación desde catálogo global
   - Priorización por relevancia
   - Balance de categorías
   - Optimización de márgenes

3. **Personalización**:
   - Ajuste de precios por zona
   - Inclusión de productos locales
   - Adaptación a presupuesto

### Prompts Dinámicos

El sistema usa prompts contextuales:

```typescript
const prompt = `
Genera un catálogo de productos para ${businessType} 
ubicado en ${location} con las siguientes características:
- Tamaño: ${size}
- Presupuesto: ${budget}
- Cliente objetivo: ${targetDemo}
- Competencia: ${competition}

Requisitos:
- ${productCount} productos balanceados
- Productos esenciales marcados
- Precios competitivos para la zona
- ${localFocus ? 'Incluir productos locales' : ''}
- ${premiumBrands ? 'Incluir marcas premium' : 'Evitar marcas premium'}
`;
```

## 📊 Analytics

### Métricas Clave

**Adoption Rate**:
```
(Tenants usando template / Tenants totales del tipo) × 100
```

**Customization Rate**:
```
(Productos modificados / Productos totales) × 100
```

**Performance Score**:
```
(Revenue promedio × Adoption rate × (1 - Churn rate)) / 1000
```

### Dashboards Disponibles

1. **Overview Dashboard**:
   - KPIs principales
   - Tendencias temporales
   - Comparativa entre templates

2. **Product Performance**:
   - Heatmap de productos
   - Top 10 más/menos usados
   - Correlación precio-adopción

3. **Tenant Success**:
   - Time to first sale
   - Revenue growth curve
   - Retention metrics

## 🚨 Troubleshooting

### Template no genera correctamente

1. Verificar conexión con AI Gateway
2. Revisar contexto completo enviado
3. Validar que existan productos en catálogo
4. Verificar límites de API

### Analytics no actualiza

1. Verificar job de agregación
2. Limpiar caché de métricas
3. Revisar logs de cálculo
4. Validar datos fuente

### Editor no guarda cambios

1. Verificar permisos de usuario
2. Validar formato de productos
3. Revisar límites de template
4. Verificar conectividad

### Sugerencias AI no aparecen

1. Verificar servicio AI activo
2. Validar contexto del template
3. Revisar configuración de prompts
4. Verificar rate limits

## 🚀 Mejoras Futuras

1. **Machine Learning**:
   - Predicción de éxito de productos
   - Optimización automática de precios
   - Recomendaciones personalizadas

2. **Integración Regional**:
   - Templates por provincia/ciudad
   - Adaptación a regulaciones locales
   - Proveedores regionales

3. **Colaboración**:
   - Templates compartidos entre tenants
   - Marketplace de templates
   - Ratings y reviews

4. **Automatización**:
   - Actualización automática de productos
   - Ajuste dinámico de precios
   - Alertas de oportunidades

---

**Última actualización**: 1 de Agosto de 2025  
**Versión**: 1.0.0