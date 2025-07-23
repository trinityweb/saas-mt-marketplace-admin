# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Hablame siempre en español.

## 🚀 Comandos de Desarrollo

### Desarrollo
```bash
npm run dev              # Inicia en puerto 3004 con Turbopack (hot reload rápido)
npm run dev:webpack      # Inicia en puerto 3004 con Webpack tradicional
```

### Build y Producción
```bash
npm run build           # Build de producción
npm run build:analyze   # Build con análisis del bundle
npm start              # Servidor de producción en puerto 3004
```

### Testing
```bash
npm test               # Ejecutar tests
npm test:watch         # Tests en modo watch
npm test:coverage      # Tests con reporte de cobertura
npm test:ci           # Tests para CI/CD
```

### Linting y Limpieza
```bash
npm run lint          # Ejecutar ESLint
npm run clean         # Limpiar cache y builds (.next, node_modules/.cache)
```

## 🏗️ Arquitectura y Estructura

### Next.js 15 App Router
```
src/
├── app/                          # App Router de Next.js
│   ├── api/pim/                 # API Routes proxy a servicios backend
│   ├── (páginas)               # Páginas de la aplicación
│   └── layout.tsx              # Layout raíz con providers
├── components/                  
│   ├── shared-ui/              # Sistema Atomic Design (atoms/molecules/organisms)
│   ├── forms/                  # Form components específicos del dominio
│   └── layout/                 # Layout components (admin-layout, conditional-layout)
├── hooks/                      # Custom React hooks
├── lib/                        # Utilidades y configuraciones
│   ├── api.ts                  # Cliente API singleton (marketplaceApi)
│   ├── types/                  # TypeScript interfaces
│   └── config.ts              # Configuración de la aplicación
└── config/                     # Configuraciones estáticas (sidebar, etc)
```

### Patrón API Proxy
Frontend llama a rutas locales que proxean a Kong Gateway:
```typescript
// Frontend: GET /api/pim/marketplace-brands
// Proxy a: http://localhost:8001/pim/api/v1/marketplace/brands
```

Headers manejados automáticamente por el proxy:
- `Authorization: Bearer <token>`
- `X-Tenant-ID: <uuid>` 
- `X-User-Role: marketplace_admin`

## 🔌 Integración con Servicios Backend

### Kong Gateway (Puerto 8001)
Todos los servicios backend se acceden a través de Kong:
- IAM Service: `/iam/api/v1/*`
- PIM Service: `/pim/api/v1/*`
- Stock Service: `/stock/api/v1/*`

### Endpoints Principales Implementados
```
# IAM
/api/pim/tenants
/api/pim/roles
/api/pim/plans

# PIM Marketplace
/api/pim/marketplace-categories
/api/pim/marketplace-brands
/api/pim/marketplace-attributes
/api/pim/global-catalog
/api/pim/business-types
/api/pim/business-type-templates
```

## 🎨 Sistema de Componentes

### Atomic Design Pattern
- **Atoms**: Botones, inputs, badges básicos
- **Molecules**: Searchable selects, cards, form fields
- **Organisms**: Tablas, sidebars, formularios completos
- **Templates**: Layouts de página

### Convenciones de Componentes
- Archivos: `kebab-case.tsx`
- Componentes: `PascalCase`
- Props interfaces: `<ComponentName>Props`
- Usar `cn()` para merge de clases Tailwind

### Themes
Sistema de 3 temas con CSS variables:
- Light (default)
- Dark
- Dim

Variables en `globals.css`, aplicadas con `next-themes`.

## 📊 Estado Actual del Proyecto

### PASO 0 - Quickstart: 75% Completado
**Objetivo**: Onboarding de nuevos tenants en <10 minutos

**Completado**:
- ✅ CRUD Business Types
- ✅ CRUD Business Type Templates  
- ✅ CRUD Marketplace Categories (taxonomía)
- ✅ CRUD Marketplace Brands
- ✅ CRUD Marketplace Attributes
- ✅ Global Catalog básico
- ✅ Sistema de componentes shared-ui

**En Desarrollo**:
- 🔄 Wizard UI para quickstart
- 🔄 Integración con selección de templates
- 🔄 Proceso de importación al tenant

**Pendiente**:
- ❌ Validación completa del flujo end-to-end
- ❌ Métricas de uso del quickstart

## 🛠️ Patrones de Desarrollo

### API Client Pattern
Usar siempre el singleton `marketplaceApi`:
```typescript
import { marketplaceApi } from '@/lib/api';

// Ejemplo de uso
const response = await marketplaceApi.getAllMarketplaceBrands({
  page: 1,
  page_size: 20
});
```

### Custom Hooks Pattern
Hooks para encapsular lógica de negocio:
```typescript
// Ejemplo: useMarketplaceBrands
export function useMarketplaceBrands(filters) {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  // ... lógica de carga y filtrado
  return { brands, loading, error };
}
```

### Server/Client Components
- Por defecto usar Server Components
- Client Components solo cuando necesario (interactividad, hooks)
- Marcar con `'use client'` al inicio del archivo

### Manejo de Errores
```typescript
const response = await marketplaceApi.someMethod();
if (response.error) {
  toast.error(response.error);
  return;
}
// Procesar response.data
```

## 🔧 Configuraciones Importantes

### Puerto de Desarrollo
**3004** - Evita conflictos con otros frontends del monorepo

### Optimizaciones Next.js
- Turbopack habilitado para desarrollo rápido
- Standalone output para Docker
- Transpilación de `lucide-react` y paquetes internos

### Docker Multi-stage
- `deps`: Instalación de dependencias
- `builder`: Build de la aplicación
- `development`: Imagen con hot reload
- `production`: Imagen distroless optimizada

## 📝 Flujo de Trabajo Típico

1. **Nueva Feature**: Crear página en `app/`, componentes en `components/shared-ui/`
2. **API Integration**: Agregar métodos en `lib/api.ts`, crear hook si es necesario
3. **Forms**: Usar React Hook Form + Zod para validación
4. **Tables**: Usar Tanstack Table con el componente `Table` base
5. **Testing**: Tests en `__tests__/` usando Jest + Testing Library

## 🚨 Consideraciones Importantes

- **Multi-tenant**: Todos los datos están aislados por `tenant_id`
- **Roles**: Verificar siempre permisos con `X-User-Role`
- **Performance**: Usar paginación (page/page_size) en listados
- **UX**: Mantener consistencia con el sistema de diseño TiendaVecina
- **Errores**: Mostrar mensajes claros al usuario con toast notifications