# PROJECT ROADMAP 2025 - SaaS Multi-tenant POS/Marketplace

## 📋 Estado del Proyecto
- **Última actualización**: 2025-07-02
- **Versión**: 1.3
- **Estado general**: PASO 0 - Quickstart (75% completado)

### Estado Baseline de Servicios Existentes
```yaml
Infraestructura Base: ✅ 100% Completada
  - Docker Compose configurado
  - Kong API Gateway funcionando
  - Stack de Monitoreo (Prometheus + Grafana + Loki)
  - PostgreSQL multi-tenant

Backend Services:
  IAM Service: ✅ 90% Completado
    - Login Local + OAuth Google
    - CRUD Tenants/Users/Roles/Plans completo
    - JWT + Refresh Tokens
    - Multi-tenancy funcionando
  
  PIM Service: ✅ 85% Completado  
    - CRUD Categorías con árbol jerárquico
    - Sistema de templates por business type
    - Patrón Criteria implementado
    - 35 tipos de negocio definidos
    - Polirubro template completo
  
  Stock Service: ⚠️ 30% Útil
    - Locations/Warehouses implementados
    - Sin gestión real de inventario
    - Sin integración con productos
  
  Chat Service: 🔄 En migración
    - Migración a patrón Criteria en progreso

Frontend:
  Backoffice: ✅ 95% Completado
    - Administración básica funcionando
    - 30+ componentes React implementados
    - Sistema de navegación unificado
  
  Marketplace Admin: ✅ Estructura base
  Marketplace Frontend: ✅ Estructura base

Métricas Actuales:
  - 15,000+ líneas de código
  - 35+ endpoints API funcionando
  - 10/10 tests de integración pasando
  - Performance <200ms promedio
```

## 🎯 Estrategia: Core Features → POS → Marketplace

### Justificación
1. Cada funcionalidad core sirve tanto para POS como Marketplace
2. POS básico validable en 9 semanas
3. Marketplace emerge naturalmente de múltiples POS conectados
4. Sin saltos conceptuales grandes

---

## 📊 RESUMEN EJECUTIVO DE PASOS

| Paso | Descripción | Duración | Estado | Progreso |
|------|------------|----------|---------|-----------|
| **PASO 0** | Quickstart Completo | 3 semanas | 🔄 EN PROGRESO | 75% |
| **PASO 1** | Stock Service Real | 2 semanas | ⏳ PENDIENTE | 0% |
| **PASO 2** | Sistema de Órdenes | 2 semanas | ⏳ PENDIENTE | 0% |
| **PASO 3** | POS Web MVP | 2 semanas | ⏳ PENDIENTE | 0% |
| **PASO 4** | Features Marketplace | 2 semanas | ⏳ PENDIENTE | 0% |

**Timeline total**: 11 semanas para Marketplace MVP

---

## 🚀 PASO 0: QUICKSTART COMPLETO

### Objetivo
Permitir que nuevos tenants configuren su catálogo completo en <10 minutos mediante un wizard inteligente basado en templates por tipo de negocio.

### Estado Inicial
```yaml
✅ Completado:
  - 35 tipos de negocio argentinos en BD (verificado)
  - Business type templates con categorías vinculadas
  - Endpoints PIM para templates básicos
  - CRUD marketplace categories/brands/products
  - MongoDB con productos globales
  - Servicios compilando sin errores

❌ Faltante (del análisis actual):
  - CRUD para administrar templates
  - Wizard UI para selección interactiva  
  - Mapeo tipo_negocio → categorías/marcas/productos
  - Proceso de importación selectiva al tenant

⚠️ Pendientes Inmediatos identificados:
  - CRUD Productos y Variantes (PIM)
  - Storage de imágenes (PIM)
  - Gestión real de inventario (Stock)
  - Sistema de órdenes básico
  - Integración de pagos
```

### Tareas Detalladas

#### 0.1 Análisis y Documentación [✅ COMPLETADO - 2025-01-08]
- [x] Revisar estructura actual de BD para templates (35 tipos argentinos reales)
- [x] Documentar endpoints existentes de quickstart (3 módulos identificados)
- [x] Identificar y eliminar código/documentación obsoleta (YamlDataLoader + docs)
- [x] Actualizar diagrama de flujo del wizard (arquitectura fragmentada documentada)
- [x] Crear especificación técnica del proceso (QUICKSTART_ANALYSIS_REPORT.md)

**✅ RESULTADOS:**
- Base de datos sólida con 35 tipos de negocio argentinos (verificado)
- Módulo product/quickstart funcional (60% del sistema)
- Arquitectura fragmentada identificada y documentada
- Plan de consolidación definido para PASO 0.2
- Servicios backend compilando y ejecutándose correctamente
- Error de compilación PIM service corregido

**Archivos a revisar/actualizar:**
- `/services/saas-mt-marketplace-admin/public/docs/QUICKSTART_MIGRATION_SPEC.md`
- `/services/saas-mt-pim-service/documentation/quickstart-module.md`
- `/services/saas-mt-pim-service/seeds/004_business_type_quickstart_templates.sql`

#### 0.2 Consolidación de Arquitectura [✅ COMPLETADO - 2025-06-30]
- [x] Servicios compilando sin errores (PIM service corregido)
- [x] BD verificada - 35 tipos de negocio reales
- [x] Refactor módulo principal quickstart para usar BD
- [x] Crear nuevo WizardHandler con endpoints simplificados
- [x] Implementar casos de uso para wizard (start, status, update)
- [x] Crear estructura completa de tests con Object Mother pattern
- [x] Tests de integración con script curl funcionando (10/10 tests pasando)
- [x] Wizard API funcional con datos de ejemplo

**✅ RESULTADOS:**
- API Wizard completamente funcional con 5 endpoints:
  - GET /wizard/status - Estado del wizard
  - POST /wizard/start - Iniciar wizard
  - PUT /wizard/step - Actualizar step
  - GET /wizard/template/:id - Datos completos del template
  - GET /wizard/template/:id/:section - Sección específica con paginación
- Tests de integración pasando (10/10) con script automatizado
- Servicio PIM ejecutándose correctamente en puerto 8090
- Estructura de tests unitarios con Object Mother implementada
- SimpleWizardHandler con datos de ejemplo funcional

#### 0.2.1 CRUD Business Type Templates [✅ COMPLETADO - 2025-07-02]
- [x] Implementar listado de templates con filtros y paginación
- [x] Crear página de creación de nuevos templates
- [x] Implementar página de edición de templates
- [x] Integrar con API backend para CRUD completo
- [x] Alinear estructuras de datos frontend/backend
- [x] Migrar datos existentes al nuevo formato
- [x] Limpiar UI (eliminar headers duplicados)

**✅ RESULTADOS:**
- CRUD completo funcionando en `/business-type-templates`
- Estructuras de datos alineadas entre Go y TypeScript
- Script de migración SQL para actualizar datos existentes
- UI mejorada sin redundancias
- Categorías con información completa (id, name, slug, description, parent_id, level)
- Edición de templates sin pérdida de datos

**Archivos implementados:**
```
marketplace-admin/business-type-templates/
├── page.tsx               # ✅ Lista de templates con filtros
├── create/page.tsx       # ✅ Crear nuevo template
└── [id]/edit/page.tsx    # ✅ Editar template existente
```

#### 0.3 Quickstart Wizard UI [✅ COMPLETADO - 2025-07-06]
- [x] Diseñar flujo UX del wizard (3 pasos optimizados)
- [x] Implementar componentes del wizard en Next.js (Atomic Design)
- [x] Crear lógica de estado y navegación con hooks
- [x] Integrar con APIs del wizard (/wizard/start, /wizard/step, etc.)
- [x] Implementar guardado de progreso automático
- [x] Agregar endpoint POST /wizard/complete

**✅ RESULTADOS:**
- Wizard completo funcionando en `/quickstart`
- Componentes reutilizables: Stepper, Wizard (Atomic Design)
- 3 pasos optimizados:
  1. Selección tipo de negocio
  2. Categorías y Atributos (agrupados)
  3. Marcas y Productos (agrupados)
- Guardado automático de progreso en cada paso
- UI responsive y moderna con Tailwind CSS
- Búsqueda y filtros en cada paso
- Opción "Seleccionar todo" para agilizar

**Archivos implementados:**
```
backoffice/
├── src/app/(dashboard)/quickstart/page.tsx
├── src/components/shared-ui/molecules/
│   ├── stepper.tsx
│   └── wizard.tsx
├── src/components/quickstart/steps/
│   ├── business-type-selection.tsx
│   ├── categories-attributes-selection.tsx
│   └── brands-products-selection.tsx
├── src/services/quickstart-wizard.service.ts
└── src/types/quickstart.ts
```

**APIs integradas:**
- GET /api/v1/business-types - Lista tipos de negocio ✅
- POST /api/v1/wizard/start - Iniciar wizard ✅
- GET /api/v1/wizard/status - Estado actual ✅
- PUT /api/v1/wizard/step - Actualizar step ✅
- GET /api/v1/wizard/template/:id/:section - Datos específicos ✅
- POST /api/v1/wizard/complete - Completar wizard ✅

#### 0.4 Proceso de Importación [⏳ PENDIENTE]
- [ ] Completar implementación real del POST /wizard/complete (actualmente mock)
- [ ] Lógica de creación masiva de entidades (categorías, marcas, productos)
- [ ] Conectar con servicios reales (categorías, products, brands)
- [ ] Manejo de errores y rollback en transacciones
- [ ] Testing end-to-end del proceso completo

### Criterios de Éxito
- [ ] Nuevo tenant puede completar wizard en <10 minutos
- [ ] 80% de productos sugeridos son relevantes
- [ ] Sin errores en importación masiva
- [ ] Documentación actualizada y coherente

### Entregables
1. CRUD funcional de templates
2. Wizard UI completo y testeado
3. Proceso de importación robusto
4. Documentación técnica actualizada
5. BD sin tablas/datos obsoletos

---

## 🚀 PASO 1: STOCK SERVICE REAL

### Objetivo
Completar el Stock Service con funcionalidad real de inventario, integrando con PIM para manejo de cantidades y movimientos.

### Estado Inicial
```yaml
✅ Completado:
  - Estructura de locations/warehouses
  - Arquitectura hexagonal
  - OpenAPI documentado

❌ Faltante:
  - Entidades de inventario real
  - Integración con productos (PIM)
  - Gestión de cantidades
  - Movimientos de stock
  - Estados de stock
```

### Tareas Detalladas

#### 1.1 Análisis y Documentación [⏳ PENDIENTE]
- [ ] Auditar código actual del Stock Service
- [ ] Revisar y actualizar OpenAPI spec
- [ ] Eliminar código no utilizado
- [ ] Documentar integración necesaria con PIM
- [ ] Actualizar diagrama de arquitectura

#### 1.2 Modelo de Datos de Inventario [⏳ PENDIENTE]
- [ ] Diseñar entidad StockItem
- [ ] Crear migraciones de BD
- [ ] Definir estados de stock
- [ ] Implementar relaciones con productos
- [ ] Índices para performance

#### 1.3 API de Gestión de Stock [⏳ PENDIENTE]
- [ ] CRUD de stock items
- [ ] Endpoint de consulta de disponibilidad
- [ ] API de movimientos de stock
- [ ] Gestión de reservas
- [ ] Batch operations

#### 1.4 Integración con PIM [⏳ PENDIENTE]
- [ ] Cliente HTTP para PIM service
- [ ] Sincronización de productos
- [ ] Validación de SKUs
- [ ] Cache de datos de productos
- [ ] Tests de integración

### Criterios de Éxito
- [ ] API completa de inventario funcionando
- [ ] Integración bidireccional con PIM
- [ ] Performance <100ms para consultas
- [ ] 95% cobertura de tests

---

## 🚀 PASO 2: SISTEMA DE ÓRDENES

### Objetivo
Implementar sistema completo de órdenes/pedidos que permita procesar ventas desde el POS.

### Estado Inicial
```yaml
❌ No existe:
  - Sin microservicio de órdenes
  - Sin modelo de datos definido
  - Sin integración con otros servicios
```

### Tareas Detalladas

#### 2.1 Análisis y Diseño [⏳ PENDIENTE]
- [ ] Decidir: nuevo servicio vs módulo en existente
- [ ] Diseñar modelo de datos
- [ ] Definir estados y flujo de órdenes
- [ ] Documentar integraciones necesarias
- [ ] Crear ADR (Architecture Decision Record)

#### 2.2 Implementación Base [⏳ PENDIENTE]
- [ ] Setup inicial del servicio/módulo
- [ ] Entidades y value objects
- [ ] Casos de uso core
- [ ] API REST básica
- [ ] Tests unitarios

#### 2.3 Integraciones [⏳ PENDIENTE]
- [ ] Integración con Stock (reservas)
- [ ] Integración con PIM (productos)
- [ ] Integración con IAM (clientes)
- [ ] Webhooks para eventos
- [ ] Tests de integración

### Criterios de Éxito
- [ ] Proceso completo de orden funcionando
- [ ] Estados transaccionales correctos
- [ ] Integraciones sin pérdida de datos
- [ ] API documentada con OpenAPI

---

## 🚀 PASO 3: POS WEB MVP

### Objetivo
Frontend mínimo viable de punto de venta para realizar ventas usando el catálogo y procesando órdenes.

### Estado Inicial
```yaml
✅ Completado:
  - Infraestructura Next.js
  - Sistema de autenticación
  - Componentes UI base

❌ Faltante:
  - Interfaz de ventas
  - Búsqueda de productos
  - Carrito/orden actual
  - Proceso de checkout
  - Impresión de tickets
```

### Tareas Detalladas

#### 3.1 UI de Ventas [⏳ PENDIENTE]
- [ ] Layout de POS
- [ ] Búsqueda rápida de productos
- [ ] Grid/lista de productos
- [ ] Carrito de venta actual
- [ ] Teclado numérico

#### 3.2 Proceso de Checkout [⏳ PENDIENTE]
- [ ] Cálculo de totales
- [ ] Métodos de pago
- [ ] Aplicar descuentos
- [ ] Confirmar venta
- [ ] Generar ticket

#### 3.3 Integraciones [⏳ PENDIENTE]
- [ ] Integración con órdenes API
- [ ] Actualización de stock
- [ ] Manejo de errores
- [ ] Estado offline básico
- [ ] Sincronización

### Criterios de Éxito
- [ ] Venta completa en <2 minutos
- [ ] Interfaz intuitiva sin training
- [ ] Funciona en tablet/desktop
- [ ] Impresión de tickets

---

## 🚀 PASO 4: FEATURES MARKETPLACE

### Objetivo
Expandir el POS individual a marketplace conectando múltiples sellers y agregando descubrimiento geolocalizado.

### Estado Inicial
```yaml
✅ Completado:
  - Multi-tenancy funcionando
  - Catálogo por tenant

❌ Faltante:
  - Portal de compradores
  - Búsqueda multi-tenant
  - Geolocalización
  - Carrito multi-seller
```

### Tareas Detalladas

#### 4.1 Portal de Compradores [⏳ PENDIENTE]
- [ ] Landing page marketplace
- [ ] Búsqueda de productos cercanos
- [ ] Filtros por categoría/marca
- [ ] Vista de tiendas
- [ ] Perfil de comprador

#### 4.2 Multi-tenant Features [⏳ PENDIENTE]
- [ ] Búsqueda cross-tenant
- [ ] Agregación de inventarios
- [ ] Carrito multi-seller
- [ ] Checkout unificado
- [ ] Distribución de órdenes

#### 4.3 Geolocalización [⏳ PENDIENTE]
- [ ] Integración con mapas
- [ ] Búsqueda por proximidad
- [ ] Zonas de cobertura
- [ ] Cálculo de envíos
- [ ] Tiempos estimados

### Criterios de Éxito
- [ ] Encontrar productos en <30 segundos
- [ ] Comprar de múltiples tiendas
- [ ] Entrega en <2 horas
- [ ] UX mobile-first

---

## 📊 MÉTRICAS Y SEGUIMIENTO

### Métricas de Progreso
- **Velocidad**: Tareas completadas por semana
- **Calidad**: Bugs encontrados post-release  
- **Deuda técnica**: Código/docs obsoletos eliminados
- **Cobertura**: % de tests automatizados

### Métricas de Éxito
- **Técnicas**: Cobertura tests >90%, Performance <500ms p95, Uptime >99.5%
- **Producto**: Onboarding completion >85%, Time to first product <15min, NPS >50
- **Negocio**: Beta retention >80%, Support tickets <2 por seller, ROI 70% reducción tiempo

### Proceso de Actualización
1. Al iniciar cada tarea: Análisis y actualización de docs
2. Durante desarrollo: Commits atómicos con referencias
3. Al completar: Actualizar este roadmap + entrada en PROJECT_JOURNAL.md
4. Semanalmente: Review de progreso y ajustes

### Template Actualización Semanal
```markdown
## Update [FECHA]

### ✅ Completado esta semana
- [PASO] [TAREA]: Descripción breve

### 🟡 En progreso
- [PASO] [TAREA]: Status y % completado

### 🔄 Próxima semana  
- [PASO] [TAREA]: Prioridad y owner

### 🚨 Blockers/Issues
- **Blocker**: Descripción y plan de resolución

### 📊 Métricas clave
- **Progreso general**: X/11 semanas
- **Paso actual**: X/Y tareas
- **Performance**: [metric] 
```

### Control de Cambios
```
v1.0 - 2025-01-08 - Plan inicial creado
v1.1 - 2025-06-15 - Completado análisis inicial y documentación
v1.2 - 2025-06-30 - Completada consolidación de arquitectura
v1.3 - 2025-07-02 - Completado CRUD de Business Type Templates
```

## Update 2025-07-02

### ✅ Completado esta semana
- [PASO 0.2.1] CRUD Business Type Templates: Implementación completa con listado, creación y edición
- [PASO 0.2.1] Alineación de estructuras de datos: Sincronización entre Go backend y TypeScript frontend
- [PASO 0.2.1] Migración de datos: Script SQL para actualizar datos existentes al nuevo formato
- [PASO 0.2.1] Mejoras de UI: Eliminación de headers duplicados y simplificación de columnas

### 🟡 En progreso
- [PASO 0.3] Quickstart Wizard UI: 0% - Próximo paso principal

### 🔄 Próxima semana  
- [PASO 0.3] Diseñar flujo UX del wizard en backoffice
- [PASO 0.3] Implementar componentes del wizard
- Continuar mejoras de UI en marketplace admin si es necesario

### 🚨 Blockers/Issues
- **Resuelto**: Formato de datos inconsistente entre BD y aplicación - Solucionado con migración

### 📊 Métricas clave
- **Progreso general**: PASO 0 al 75%
- **Paso actual**: 0.2.1 completado, iniciando 0.3
- **Performance**: APIs respondiendo en <200ms

---

## 🔗 REFERENCIAS

### Documentación Relacionada
- [ARQUITECTURA_MICROSERVICIOS.md](./ARQUITECTURA_MICROSERVICIOS.md)
- [QUICKSTART_MIGRATION_SPEC.md](./QUICKSTART_MIGRATION_SPEC.md)
- [PROJECT_TRACKING.md](./PROJECT_TRACKING.md) (deprecar después de migrar tareas)
- [PRD.md](./PRD.md) - Product Requirements Document

### Decisiones Técnicas
- [ADR-001: POS antes que Marketplace](./adr/001-pos-first.md) (por crear)
- [ADR-002: Stock como servicio independiente](./adr/002-stock-service.md) (por crear)