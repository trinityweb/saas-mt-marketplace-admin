# 🏪 Marketplace Admin Panel

Panel de administración para el marketplace multi-tenant SaaS. Permite gestionar taxonomías globales, configuraciones de quickstart dinámico y analytics del marketplace.

## 🎯 Funcionalidades

### ✅ Implementado
- ✅ **Dashboard Principal**: Overview con métricas clave
- ✅ **UI Base**: Componentes reutilizados del backoffice principal
- ✅ **Estilos TiendaVecina**: Paleta de colores y temas consistentes
- ✅ **Sistema de Scraping**: Módulo completo para monitoreo y gestión de scraping
  - Dashboard con métricas en tiempo real
  - Monitor de jobs activos
  - Gestión de 30+ fuentes argentinas
  - Programación automática con cron
  - Historial completo de ejecuciones
- ✅ **Gestión de Marcas**: CRUD completo de marcas del marketplace
- ✅ **Taxonomía**: Gestión de categorías jerárquicas
- ✅ **Business Types**: Administración de tipos de negocio
- ✅ **Templates**: Sistema de templates para quickstart

### 🚧 En Desarrollo (Roadmap)
- [ ] **Catálogo Global**: Gestión unificada de productos
- [ ] **Analytics Dashboard**: Métricas avanzadas de uso y adopción
- [ ] **Integración AI**: Curación automática de productos scrapeados
- [ ] **Configuración**: Settings globales del marketplace

## 🛠️ Tecnologías

- **Framework**: Next.js 15 con App Router + Turbopack
- **UI**: ShadCN UI + Radix UI primitives
- **Estilos**: Tailwind CSS con variables CSS
- **Iconos**: Lucide React
- **Estado**: React Server Components + Client Components híbrido
- **Puerto**: `3004` (actualizado para evitar conflictos)

## 🚀 Desarrollo

```bash
# Instalar dependencias
npm install

# Desarrollo local
npm run dev

# Build para producción
npm run build
npm run start

# Tests
npm run test
npm run test:watch
```

## 🎨 Estructura UI

```
src/
├── app/
│   ├── page.tsx              # Dashboard principal
│   ├── layout.tsx            # Layout base
│   ├── globals.css           # Estilos globales TiendaVecina
│   ├── scraper/              # Módulo de scraping
│   │   ├── page.tsx          # Dashboard de scraping
│   │   ├── sources/          # Gestión de fuentes
│   │   ├── schedule/         # Programación
│   │   └── history/          # Historial
│   ├── marketplace-brands/   # Gestión de marcas
│   ├── taxonomy/             # Gestión de categorías
│   └── business-types/       # Tipos de negocio
├── components/
│   ├── ui/                   # Componentes ShadCN 
│   ├── scraper/              # Componentes del módulo scraping
│   └── layout/               # Componentes de layout
├── hooks/                    # Custom React hooks
│   └── scraper/              # Hooks del módulo scraping
└── lib/
    ├── utils.ts              # Utilidades compartidas
    └── api/
        └── scraper/          # Cliente API de scraping
```

## 🔗 Integración con Servicios

El admin panel se integra con:

- **PIM Service** (8090): APIs de taxonomía, productos y templates
- **IAM Service** (8080): Autenticación y autorización
- **Scraper Service** (8086): Sistema de scraping Python
- **Kong Gateway** (8001): Enrutamiento de APIs
- **MongoDB**: Base de datos para productos scrapeados
- **PostgreSQL**: Configuración y metadata

## 🌈 Paleta de Colores TiendaVecina

- **Primario**: `#9333EA` (Púrpura)
- **Secundario**: `#06B6D4` (Cyan)
- **Fondo**: `#F5F5F5` (Gris claro)
- **Tarjetas**: `#FAFAFA` (Gris muy claro)

## 📚 Documentación del Sistema de Scraping

- [Documentación Completa](./public/docs/SCRAPING_MODULE_DOCUMENTATION.md)
- [Guía Rápida](./public/docs/SCRAPING_QUICK_REFERENCE.md)

### Características del Módulo de Scraping:

1. **Dashboard de Métricas**
   - Total de productos scrapeados
   - Nuevos productos del día
   - Tasa de éxito global
   - Métricas por fuente

2. **Monitor de Jobs**
   - Seguimiento en tiempo real
   - Inicio/cancelación de jobs
   - Visualización de progreso
   - Manejo de errores

3. **Gestión de Fuentes**
   - 30+ sitios argentinos configurados
   - Toggle de habilitación
   - Ejecución manual
   - Métricas de salud

4. **Programación Automática**
   - Configuración cron por fuente
   - Frecuencias predefinidas
   - Horarios optimizados
   - Vista previa de próxima ejecución

5. **Historial Completo**
   - Registro de todas las ejecuciones
   - Filtros avanzados
   - Exportación a CSV
   - Detalles de errores

## 📋 Próximos Pasos

1. **FASE 1**: ✅ Sistema de Scraping (COMPLETADO)
2. **FASE 2**: Integración con AI para curación automática
3. **FASE 3**: Dashboard de analytics y métricas avanzadas
4. **FASE 4**: WebSocket para actualizaciones en tiempo real

---

**Parte del ecosistema**: [saas-mt](../../README.md) | **Puerto**: 3004 | **Estado**: 🚀 En Producción
