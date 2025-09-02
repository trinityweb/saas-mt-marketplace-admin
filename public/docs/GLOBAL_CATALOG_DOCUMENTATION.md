# 📦 Global Catalog - Documentación

## 📋 Índice
1. [Visión General](#visión-general)
2. [Arquitectura](#arquitectura)
3. [Funcionalidades](#funcionalidades)
4. [API Integration](#api-integration)
5. [Componentes](#componentes)
6. [Guía de Uso](#guía-de-uso)
7. [Configuración](#configuración)

## 🎯 Visión General

El Global Catalog es el catálogo centralizado de productos del marketplace. Sirve como fuente única de verdad para productos que pueden ser importados por los tenants, facilitando el onboarding rápido y manteniendo consistencia de datos.

### Características Principales

- **Catálogo Centralizado**: Base de datos MongoDB con millones de productos
- **Búsqueda por EAN**: Identificación única de productos
- **Verificación Manual**: Sistema de quality score
- **Importación Masiva**: CSV/JSON con validación
- **Integración con Scraping**: Productos del scraper se pueden promover al catálogo

### Flujo de Datos

```
Scraper Service → Productos Scrapeados
                          ↓
                  Curación con AI
                          ↓
                   Global Catalog
                          ↓
                  Tenant Products
```

## 🏗️ Arquitectura

### Estructura del Módulo

```
src/app/global-catalog/
├── page.tsx                    # Listado principal con filtros
├── create/
│   └── page.tsx               # Crear producto manual
├── [id]/
│   ├── page.tsx              # Vista detalle del producto
│   └── edit/
│       └── page.tsx          # Editar producto
└── import/
    └── page.tsx              # Importación masiva

src/hooks/
└── useGlobalCatalog.ts       # Hook principal

src/lib/api/
└── global-catalog.ts         # Cliente API
```

### Base de Datos

- **MongoDB**: Almacenamiento principal para escalabilidad
- **Colección**: `global_products`
- **Índices**: EAN (único), nombre (texto), marca, categoría

## 🚀 Funcionalidades

### 1. Listado de Productos

- **Filtros disponibles**:
  - Búsqueda por nombre
  - Filtro por marca
  - Filtro por categoría
  - Estado de verificación
  - Rango de quality score
  - Fuente (scraping, manual, import)

- **Ordenamiento**:
  - Nombre (A-Z, Z-A)
  - Fecha de creación
  - Quality score
  - Verificación

### 2. Búsqueda por EAN

```typescript
// Búsqueda rápida por código de barras
const product = await globalCatalogApi.searchByEAN('7790520013446');
```

### 3. Verificación de Productos

Estados de verificación:
- `verified` ✅ - Verificado manualmente
- `unverified` ⚠️ - Pendiente de verificación
- `disputed` ❌ - Información disputada
- `pending` 🕐 - En proceso de verificación

### 4. Quality Score

Métrica de 0 a 1 que indica la calidad de la información:
- **1.0**: Información completa y verificada
- **0.8-0.9**: Información completa, pendiente verificación
- **0.5-0.7**: Información parcial
- **< 0.5**: Información mínima

### 5. Importación Masiva

Soporta dos formatos:

**CSV**:
```csv
ean,name,brand,category,price,description
7790520013446,"Coca Cola 2.25L","Coca-Cola","Bebidas",500,"Gaseosa sabor cola"
```

**JSON**:
```json
[
  {
    "ean": "7790520013446",
    "name": "Coca Cola 2.25L",
    "brand": "Coca-Cola",
    "category": "Bebidas",
    "price": 500,
    "description": "Gaseosa sabor cola"
  }
]
```

## 🔌 API Integration

### Endpoints Principales

```typescript
// Listar productos con filtros
GET /api/v1/global-catalog
  ?page=1
  &page_size=20
  &name=coca
  &brand=Coca-Cola
  &category_id=uuid
  &is_verified=true
  &quality_score_min=0.8

// Buscar por EAN
GET /api/v1/public/global-catalog/search?ean=7790520013446

// Crear producto
POST /api/v1/global-catalog
{
  "ean": "7790520013446",
  "name": "Coca Cola 2.25L",
  "brand": "Coca-Cola",
  "category_id": "uuid",
  "attributes": {},
  "images": ["url1", "url2"]
}

// Actualizar producto
PUT /api/v1/global-catalog/{id}

// Verificar producto
PATCH /api/v1/global-catalog/{id}/verify

// Importación masiva
POST /api/v1/global-catalog/bulk-import
```

### Tipos de Datos

```typescript
interface GlobalProduct {
  id: string;
  ean: string;
  name: string;
  description?: string;
  brand: string;
  category_id?: string;
  category?: MarketplaceCategory;
  attributes: Record<string, any>;
  images: string[];
  quality_score: number;
  is_verified: boolean;
  source: 'scraping' | 'manual' | 'import' | 'api';
  created_at: string;
  updated_at: string;
}

interface GlobalProductsResponse {
  products: GlobalProduct[];
  total: number;
  page: number;
  page_size: number;
}
```

## 📦 Componentes

### GlobalCatalogTable

Tabla principal con todas las funcionalidades:

```tsx
<GlobalCatalogTable
  products={products}
  loading={loading}
  pagination={pagination}
  onPageChange={handlePageChange}
  onSort={handleSort}
  onVerify={handleVerify}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

### ProductDetailView

Vista detallada del producto:

```tsx
<ProductDetailView
  product={product}
  onEdit={handleEdit}
  onVerify={handleVerify}
  showActions={true}
/>
```

### ImportWizard

Wizard de importación con validación:

```tsx
<ImportWizard
  onComplete={handleImportComplete}
  validationRules={rules}
  allowedFormats={['csv', 'json']}
/>
```

## 📖 Guía de Uso

### Buscar un Producto

1. **Por nombre**: Usar la barra de búsqueda principal
2. **Por EAN**: Usar el campo específico de EAN
3. **Por filtros**: Combinar marca, categoría, verificación

### Crear Producto Manual

1. Click en "Nuevo Producto"
2. Completar formulario:
   - EAN (único y obligatorio)
   - Nombre del producto
   - Marca (seleccionar existente o crear nueva)
   - Categoría (del árbol de taxonomía)
   - Atributos opcionales
3. Guardar

### Importación Masiva

1. Ir a "Importar Productos"
2. Descargar plantilla (CSV o JSON)
3. Completar con datos
4. Subir archivo
5. Revisar validación:
   - ✅ Verde: Campo válido
   - ⚠️ Amarillo: Advertencia
   - ❌ Rojo: Error
6. Corregir errores si hay
7. Confirmar importación

### Verificar Productos

1. Localizar producto no verificado
2. Revisar información
3. Click en "Verificar"
4. Confirmar verificación

### Integración con Tenants

Los productos del catálogo global pueden ser importados por tenants:

1. Tenant busca en catálogo global
2. Selecciona productos
3. Importa a su catálogo
4. Personaliza precios y stock

## ⚙️ Configuración

### Variables de Entorno

```env
# MongoDB para catálogo global
MONGO_HOST=mongodb
MONGO_PORT=27017
MONGO_DATABASE=pim_marketplace
MONGO_USER=admin
MONGO_PASSWORD=admin123

# Límites
MAX_IMPORT_SIZE=10000
MAX_FILE_SIZE_MB=50
```

### Índices MongoDB

```javascript
// Índices para performance
db.global_products.createIndex({ "ean": 1 }, { unique: true })
db.global_products.createIndex({ "name": "text" })
db.global_products.createIndex({ "brand": 1 })
db.global_products.createIndex({ "category_id": 1 })
db.global_products.createIndex({ "quality_score": -1 })
db.global_products.createIndex({ "created_at": -1 })
```

### Permisos

- **marketplace_admin**: Acceso completo (CRUD + verificación)
- **tenant_admin**: Solo lectura y búsqueda
- **public**: Búsqueda por EAN únicamente

## 🔧 Hooks y Utilidades

### useGlobalCatalog

Hook principal para gestión del catálogo:

```typescript
const {
  products,
  loading,
  error,
  pagination,
  filters,
  setFilters,
  searchByEAN,
  createProduct,
  updateProduct,
  deleteProduct,
  verifyProduct,
  importBulk
} = useGlobalCatalog();
```

### Utilidades

```typescript
// Calcular quality score
function calculateQualityScore(product: Partial<GlobalProduct>): number {
  let score = 0;
  if (product.name) score += 0.2;
  if (product.description) score += 0.2;
  if (product.brand) score += 0.1;
  if (product.category_id) score += 0.1;
  if (product.images?.length > 0) score += 0.2;
  if (product.attributes && Object.keys(product.attributes).length > 3) score += 0.2;
  return Math.min(score, 1);
}

// Validar EAN
function validateEAN(ean: string): boolean {
  if (!/^\d{13}$/.test(ean)) return false;
  // Implementar checksum EAN-13
  return true;
}
```

## 🚨 Troubleshooting

### Producto no se encuentra por EAN

1. Verificar formato EAN (13 dígitos)
2. Verificar que no tenga espacios
3. Buscar variantes (con/sin ceros iniciales)

### Importación falla

1. Verificar formato del archivo
2. Verificar encoding (UTF-8)
3. Revisar límite de tamaño
4. Verificar EANs duplicados

### Performance lento

1. Verificar índices MongoDB
2. Usar paginación (max 100 items)
3. Limitar campos en proyección
4. Usar cache para búsquedas frecuentes

## 🚀 Mejoras Futuras

1. **Integración con proveedores**:
   - APIs de distribuidores
   - Actualización automática de precios
   - Sincronización de stock

2. **Machine Learning**:
   - Categorización automática
   - Detección de duplicados
   - Sugerencias de productos relacionados

3. **Analítica**:
   - Productos más buscados
   - Tendencias de categorías
   - Reportes de adopción

---

**Última actualización**: 31 de Enero de 2025  
**Versión**: 1.0.0