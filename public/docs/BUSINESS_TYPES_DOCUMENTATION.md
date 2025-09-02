# 🏢 Business Types - Documentación

## 📋 Índice
1. [Visión General](#visión-general)
2. [Arquitectura](#arquitectura)
3. [Funcionalidades](#funcionalidades)
4. [API Integration](#api-integration)
5. [Componentes](#componentes)
6. [Guía de Uso](#guía-de-uso)
7. [Configuración](#configuración)
8. [Troubleshooting](#troubleshooting)

## 🎯 Visión General

Business Types es el módulo de gestión de tipos de negocio del marketplace. Define las categorías principales de negocios (kiosco, restaurant, farmacia, etc.) que determinan qué productos y características están disponibles para cada tenant.

### Características Principales

- **Tipos Predefinidos**: 20+ tipos de negocio para Argentina
- **Iconos Personalizados**: Cada tipo tiene su ícono distintivo
- **Colores de Marca**: Esquema de colores por tipo
- **Ordenamiento**: Control de orden de visualización
- **Activación**: Control de disponibilidad por tipo

### Importancia en el Sistema

```
Business Type → Template de Productos → Catálogo del Tenant
                      ↓
                Configuración UI
                      ↓
                 Experiencia UX
```

## 🏗️ Arquitectura

### Estructura del Módulo

```
src/app/business-types/
├── page.tsx                    # Listado principal
├── create/
│   └── page.tsx               # Crear nuevo tipo
└── [id]/
    └── edit/
        └── page.tsx           # Editar tipo existente

src/components/business-types/
├── BusinessTypesList.tsx      # Tabla con acciones
├── BusinessTypeForm.tsx       # Formulario CRUD
└── BusinessTypeCard.tsx       # Vista card

src/hooks/
└── useBusinessTypes.ts        # Hook principal

src/lib/api/
└── business-types.ts          # Cliente API
```

### Base de Datos

- **PostgreSQL**: Tabla `business_types`
- **Campos principales**:
  - `id` (UUID)
  - `name` (único)
  - `display_name`
  - `icon` (nombre del ícono)
  - `color` (hex)
  - `description`
  - `is_active`
  - `sort_order`

## 🚀 Funcionalidades

### 1. Listado de Tipos

- **Vista tabla**: Información completa con acciones
- **Vista cards**: Visualización atractiva con iconos
- **Filtros**:
  - Por estado (activo/inactivo)
  - Por nombre
  - Ordenamiento personalizado

### 2. Crear Tipo de Negocio

Campos del formulario:
- **Nombre interno**: Identificador único (ej: "kiosco")
- **Nombre display**: Visible al usuario (ej: "Kiosco y Minimarket")
- **Descripción**: Detalle del tipo de negocio
- **Ícono**: Selección de librería de iconos
- **Color**: Color picker para branding
- **Orden**: Posición en listados
- **Estado**: Activo/Inactivo

### 3. Iconos Disponibles

```typescript
const iconOptions = [
  { value: 'Store', label: 'Tienda', icon: Store },
  { value: 'ShoppingCart', label: 'Supermercado', icon: ShoppingCart },
  { value: 'Coffee', label: 'Cafetería', icon: Coffee },
  { value: 'Utensils', label: 'Restaurant', icon: Utensils },
  { value: 'Pill', label: 'Farmacia', icon: Pill },
  { value: 'Book', label: 'Librería', icon: Book },
  { value: 'Shirt', label: 'Ropa', icon: Shirt },
  { value: 'Wrench', label: 'Ferretería', icon: Wrench },
  { value: 'Car', label: 'Automotor', icon: Car },
  { value: 'Package', label: 'Almacén', icon: Package }
];
```

### 4. Seeds Predefinidos

Tipos incluidos para Argentina:
- Kiosco y Minimarket
- Supermercado
- Almacén de Barrio
- Restaurant
- Bar y Cervecería
- Cafetería
- Panadería
- Carnicería
- Verdulería
- Farmacia
- Perfumería
- Ferretería
- Librería y Papelería
- Tienda de Ropa
- Zapatería
- Electrónica
- Juguetería
- Deportes
- Mascotas
- Automotor

## 🔌 API Integration

### Endpoints Principales

```typescript
// Listar tipos de negocio
GET /api/v1/business-types
  ?page=1
  &page_size=20
  &is_active=true
  &sort_by=sort_order
  &sort_order=asc

// Obtener tipo específico
GET /api/v1/business-types/{id}

// Crear tipo
POST /api/v1/business-types
{
  "name": "kiosco",
  "display_name": "Kiosco y Minimarket",
  "description": "Pequeño comercio de productos básicos",
  "icon": "Store",
  "color": "#4CAF50",
  "is_active": true,
  "sort_order": 1
}

// Actualizar tipo
PUT /api/v1/business-types/{id}

// Eliminar tipo
DELETE /api/v1/business-types/{id}

// Activar/Desactivar
PATCH /api/v1/business-types/{id}/toggle
```

### Tipos de Datos

```typescript
interface BusinessType {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  icon: string;
  color: string;
  is_active: boolean;
  sort_order: number;
  template_count?: number;
  tenant_count?: number;
  created_at: string;
  updated_at: string;
}

interface BusinessTypesResponse {
  items: BusinessType[];
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
}

interface CreateBusinessTypeRequest {
  name: string;
  display_name: string;
  description?: string;
  icon: string;
  color: string;
  is_active?: boolean;
  sort_order?: number;
}
```

## 📦 Componentes

### BusinessTypesList

Tabla principal con funcionalidades completas:

```tsx
<BusinessTypesList
  businessTypes={businessTypes}
  loading={loading}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onToggle={handleToggle}
  onSort={handleSort}
/>
```

### BusinessTypeForm

Formulario reutilizable para crear/editar:

```tsx
<BusinessTypeForm
  businessType={businessType}
  onSubmit={handleSubmit}
  onCancel={handleCancel}
  loading={submitting}
/>
```

### BusinessTypeCard

Vista card para presentación visual:

```tsx
<BusinessTypeCard
  businessType={businessType}
  onClick={handleClick}
  showStats={true}
/>
```

## 📖 Guía de Uso

### Crear un Nuevo Tipo

1. Navegar a "Tipos de Negocio" en el sidebar
2. Click en "Nuevo Tipo de Negocio"
3. Completar formulario:
   - **Nombre**: Único, sin espacios (ej: "pet_shop")
   - **Nombre Display**: Amigable (ej: "Tienda de Mascotas")
   - **Descripción**: Opcional pero recomendada
   - **Ícono**: Seleccionar de la lista
   - **Color**: Usar color picker
   - **Orden**: Número para posición
4. Guardar

### Editar Tipo Existente

1. En el listado, click en el botón "Editar"
2. Modificar campos necesarios
3. Guardar cambios

### Activar/Desactivar

- **Toggle rápido**: Switch en la tabla
- **Edición**: Cambiar estado en formulario

### Reordenar Tipos

1. Editar cada tipo
2. Cambiar valor de "Orden"
3. Los tipos se mostrarán ordenados por este campo

### Asociar con Templates

Los tipos de negocio se usan al crear templates:

1. Crear/editar template
2. Seleccionar tipo de negocio
3. El template heredará configuración del tipo

## ⚙️ Configuración

### Variables de Entorno

```env
# No requiere configuración específica
# Usa la configuración general del PIM Service
```

### Permisos

- **marketplace_admin**: CRUD completo
- **tenant_admin**: Solo lectura
- **user**: Sin acceso

### Validaciones

- **Nombre único**: No puede repetirse
- **Nombre formato**: Solo letras, números y underscore
- **Color válido**: Formato hexadecimal
- **Orden positivo**: Mayor a 0

## 🔧 Hooks y Utilidades

### useBusinessTypes

Hook principal para gestión:

```typescript
const {
  businessTypes,
  loading,
  error,
  pagination,
  filters,
  setFilters,
  createBusinessType,
  updateBusinessType,
  deleteBusinessType,
  toggleBusinessType,
  refreshBusinessTypes
} = useBusinessTypes();
```

### Utilidades

```typescript
// Obtener ícono React component
function getIconComponent(iconName: string): LucideIcon {
  const icons = {
    Store,
    ShoppingCart,
    Coffee,
    // ... más iconos
  };
  return icons[iconName] || Store;
}

// Validar nombre
function validateBusinessTypeName(name: string): boolean {
  return /^[a-z0-9_]+$/.test(name);
}

// Generar slug desde display name
function generateSlug(displayName: string): string {
  return displayName
    .toLowerCase()
    .replace(/[áàäâ]/g, 'a')
    .replace(/[éèëê]/g, 'e')
    .replace(/[íìïî]/g, 'i')
    .replace(/[óòöô]/g, 'o')
    .replace(/[úùüû]/g, 'u')
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}
```

## 🚨 Troubleshooting

### El tipo no aparece en selects

1. Verificar que esté activo
2. Refrescar caché del navegador
3. Verificar permisos del usuario

### Error al crear tipo

1. Verificar que el nombre sea único
2. Formato de nombre correcto (sin espacios)
3. Color en formato hex válido

### Iconos no se muestran

1. Verificar nombre exacto del ícono
2. Importar ícono en el componente
3. Actualizar mapeo de iconos

### Cambios no se reflejan

1. Limpiar caché del navegador
2. Verificar respuesta de API
3. Revisar console.log para errores

## 🚀 Mejoras Futuras

1. **Iconos Personalizados**:
   - Upload de SVG custom
   - Librería de iconos ampliada
   - Preview en tiempo real

2. **Configuración Avanzada**:
   - Metadatos adicionales
   - Configuración de impuestos por tipo
   - Horarios típicos de operación

3. **Analytics**:
   - Uso por tipo de negocio
   - Tendencias de adopción
   - Performance por tipo

4. **Integración AI**:
   - Sugerencia automática de tipo
   - Detección por productos
   - Optimización de categorización

---

**Última actualización**: 1 de Agosto de 2025  
**Versión**: 1.0.0