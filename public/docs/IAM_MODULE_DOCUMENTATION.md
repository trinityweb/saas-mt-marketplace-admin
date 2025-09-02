# 🔐 IAM Module - Documentación

## 📋 Índice
1. [Visión General](#visión-general)
2. [Arquitectura](#arquitectura)
3. [Funcionalidades](#funcionalidades)
4. [API Integration](#api-integration)
5. [Componentes](#componentes)
6. [Guía de Uso](#guía-de-uso)
7. [Seguridad](#seguridad)
8. [Troubleshooting](#troubleshooting)

## 🎯 Visión General

El módulo IAM (Identity and Access Management) es el sistema central de gestión de identidades, accesos y multi-tenancy del marketplace. Maneja usuarios, tenants, roles, permisos y planes de suscripción.

### Características Principales

- **Multi-Tenancy**: Aislamiento completo por tenant
- **RBAC**: Control de acceso basado en roles
- **Planes de Suscripción**: Límites y características por plan
- **JWT Auth**: Autenticación stateless segura
- **Gestión de Permisos**: Granular por recurso y acción

### Componentes del Sistema

```
IAM Module
├── Tenants (Organizaciones)
├── Users (Usuarios del sistema)
├── Roles (Conjuntos de permisos)
├── Plans (Planes de suscripción)
└── Permissions (Permisos granulares)
```

## 🏗️ Arquitectura

### Estructura del Módulo

```
src/app/iam/
├── page.tsx                    # Dashboard IAM
├── tenants/
│   ├── page.tsx               # Listado de tenants
│   ├── create/
│   │   └── page.tsx          # Crear tenant
│   └── [id]/
│       ├── page.tsx          # Detalle tenant
│       └── edit/
│           └── page.tsx      # Editar tenant
├── roles/
│   ├── page.tsx              # Gestión de roles
│   └── [id]/
│       └── edit/
│           └── page.tsx      # Editar rol
└── plans/
    ├── page.tsx              # Planes de suscripción
    └── [id]/
        └── edit/
            └── page.tsx      # Editar plan

src/components/iam/
├── TenantsList.tsx           # Tabla de tenants
├── TenantForm.tsx            # Formulario tenant
├── RolesList.tsx             # Lista de roles
├── RolePermissions.tsx       # Editor de permisos
├── PlansList.tsx             # Tabla de planes
└── PlanFeatures.tsx          # Características del plan

src/hooks/
├── useTenants.ts             # Hook para tenants
├── useRoles.ts               # Hook para roles
└── usePlans.ts               # Hook para planes

src/lib/api/
└── iam-client.ts             # Cliente API IAM
```

### Base de Datos

**PostgreSQL - Tablas principales**:
- `tenants`: Organizaciones del sistema
- `users`: Usuarios (nota: gestión actualmente no funcional)
- `roles`: Roles del sistema
- `plans`: Planes de suscripción
- `permissions`: Permisos granulares
- `role_permissions`: Relación rol-permiso
- `plan_features`: Características por plan

## 🚀 Funcionalidades

### 1. Gestión de Tenants

**Información del Tenant**:
```typescript
interface Tenant {
  id: string;
  name: string;
  domain: string;
  plan_id: string;
  plan?: Plan;
  status: 'active' | 'suspended' | 'trial' | 'cancelled';
  metadata: {
    business_type?: string;
    country: string;
    timezone: string;
    currency: string;
  };
  limits: {
    max_users: number;
    max_products: number;
    max_orders_per_month: number;
  };
  created_at: string;
  trial_ends_at?: string;
}
```

**Operaciones disponibles**:
- Crear nuevo tenant
- Editar información
- Cambiar plan
- Suspender/Activar
- Ver límites y uso

### 2. Gestión de Roles

**Roles predefinidos**:
- `super_admin`: Acceso total al sistema
- `marketplace_admin`: Administrador del marketplace
- `tenant_admin`: Administrador del tenant
- `store_manager`: Gerente de tienda
- `cashier`: Cajero/Vendedor

**Estructura de Rol**:
```typescript
interface Role {
  id: string;
  name: string;
  display_name: string;
  description: string;
  is_system: boolean;  // No editable si es true
  permissions: Permission[];
  created_at: string;
}
```

### 3. Gestión de Planes

**Planes disponibles**:
- **Starter**: Plan básico (10 usuarios, 1000 productos)
- **Professional**: Plan medio (50 usuarios, 10000 productos)
- **Enterprise**: Plan completo (usuarios ilimitados)

**Características por Plan**:
```typescript
interface Plan {
  id: string;
  name: string;
  display_name: string;
  price: number;
  billing_period: 'monthly' | 'yearly';
  features: {
    max_users: number;
    max_products: number;
    max_orders_per_month: number;
    has_api_access: boolean;
    has_analytics: boolean;
    has_multi_store: boolean;
    has_custom_domain: boolean;
  };
  is_active: boolean;
}
```

### 4. Sistema de Permisos

**Estructura de Permisos**:
```typescript
interface Permission {
  id: string;
  resource: string;     // ej: "products", "orders"
  action: string;       // ej: "create", "read", "update", "delete"
  display_name: string;
  description: string;
}
```

**Recursos disponibles**:
- products, categories, brands, attributes
- orders, customers, invoices
- users, roles, settings
- reports, analytics, exports

## 🔌 API Integration

### Endpoints Principales

```typescript
// === TENANTS ===
// Listar tenants
GET /api/v1/tenants
  ?page=1
  &page_size=20
  &status=active
  &plan_id=uuid

// Obtener tenant
GET /api/v1/tenants/{id}

// Crear tenant
POST /api/v1/tenants
{
  "name": "Mi Tienda",
  "domain": "mitienda",
  "plan_id": "uuid",
  "metadata": {
    "business_type": "retail",
    "country": "AR",
    "timezone": "America/Argentina/Buenos_Aires",
    "currency": "ARS"
  }
}

// Actualizar tenant
PUT /api/v1/tenants/{id}

// Cambiar plan
PATCH /api/v1/tenants/{id}/plan
{
  "plan_id": "new-plan-uuid"
}

// === ROLES ===
// Listar roles
GET /api/v1/roles

// Obtener rol con permisos
GET /api/v1/roles/{id}?include_permissions=true

// Crear rol custom
POST /api/v1/roles
{
  "name": "custom_role",
  "display_name": "Rol Personalizado",
  "description": "Descripción del rol",
  "permissions": ["uuid1", "uuid2"]
}

// Actualizar permisos del rol
PUT /api/v1/roles/{id}/permissions
{
  "permissions": ["uuid1", "uuid2", "uuid3"]
}

// === PLANS ===
// Listar planes
GET /api/v1/plans?is_active=true

// Obtener plan
GET /api/v1/plans/{id}

// Crear plan
POST /api/v1/plans
{
  "name": "custom_plan",
  "display_name": "Plan Personalizado",
  "price": 99.99,
  "billing_period": "monthly",
  "features": {
    "max_users": 100,
    "max_products": 50000,
    "has_api_access": true
  }
}

// === AUTH ===
// Login
POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "password"
}

// Refresh token
POST /api/v1/auth/refresh
{
  "refresh_token": "..."
}

// Logout
POST /api/v1/auth/logout
```

## 📦 Componentes

### TenantsList

Tabla principal de tenants con acciones:

```tsx
<TenantsList
  tenants={tenants}
  loading={loading}
  onEdit={handleEdit}
  onChangePlan={handleChangePlan}
  onToggleStatus={handleToggleStatus}
  showUsage={true}
/>
```

### RolePermissions

Editor de permisos por rol:

```tsx
<RolePermissions
  role={role}
  allPermissions={permissions}
  onChange={handlePermissionsChange}
  readOnly={role.is_system}
/>
```

### PlanFeatures

Comparativa de características:

```tsx
<PlanFeatures
  plans={plans}
  currentPlanId={tenant.plan_id}
  onSelectPlan={handlePlanSelect}
  showPricing={true}
/>
```

## 📖 Guía de Uso

### Crear Nuevo Tenant

1. Navegar a IAM → Tenants
2. Click en "Nuevo Tenant"
3. Completar formulario:
   - **Nombre**: Nombre de la empresa
   - **Dominio**: Subdomain único (ej: "mitienda")
   - **Plan**: Seleccionar plan inicial
   - **Metadata**:
     - Tipo de negocio
     - País (AR por defecto)
     - Zona horaria
     - Moneda
4. Guardar

### Gestionar Roles

1. Ir a IAM → Roles
2. Ver roles del sistema (no editables)
3. Para crear rol custom:
   - Click en "Nuevo Rol"
   - Definir nombre y descripción
   - Seleccionar permisos
   - Guardar

### Cambiar Plan de Tenant

1. En listado de tenants, click en "Cambiar Plan"
2. Seleccionar nuevo plan
3. Revisar cambios en límites
4. Confirmar cambio

### Asignar Rol a Usuario

**Nota**: La gestión de usuarios no está funcional actualmente.
Los roles se asignan durante la creación del usuario en el backend.

## 🔒 Seguridad

### Autenticación JWT

**Token Structure**:
```typescript
interface JWTPayload {
  sub: string;          // user_id
  email: string;
  tenant_id: string;
  role: string;
  permissions: string[];
  exp: number;
  iat: number;
}
```

**Headers requeridos**:
```
Authorization: Bearer <jwt_token>
X-Tenant-ID: <tenant_uuid>
```

### Validación de Permisos

```typescript
// Ejemplo de validación en frontend
function canUserPerform(action: string, resource: string): boolean {
  const userPermissions = getUserPermissions();
  return userPermissions.some(p => 
    p.resource === resource && p.action === action
  );
}

// Uso
if (canUserPerform('create', 'products')) {
  // Mostrar botón crear producto
}
```

### Multi-Tenancy

- Todos los datos están aislados por `tenant_id`
- El tenant_id se extrae del JWT
- Las queries incluyen automáticamente el filtro
- No es posible acceder a datos de otro tenant

## 🚨 Troubleshooting

### Login falla

1. Verificar credenciales correctas
2. Verificar que el tenant esté activo
3. Revisar expiración del trial
4. Verificar servicio IAM activo

### No se ven los tenants

1. Verificar rol del usuario (debe ser marketplace_admin)
2. Verificar token JWT válido
3. Limpiar caché del navegador
4. Verificar permisos en backend

### Error al cambiar plan

1. Verificar que el plan destino esté activo
2. Validar límites del nuevo plan
3. Verificar permisos del usuario
4. Revisar logs del servicio

### Permisos no se aplican

1. Refrescar token después de cambios
2. Verificar asignación rol-permisos
3. Limpiar caché de permisos
4. Re-login si es necesario

## 🚀 Mejoras Futuras

1. **Gestión de Usuarios**:
   - CRUD completo de usuarios
   - Invitaciones por email
   - 2FA authentication
   - Password policies

2. **Auditoría**:
   - Log de todas las acciones
   - Reportes de acceso
   - Alertas de seguridad
   - Compliance reports

3. **SSO Integration**:
   - OAuth2 providers
   - SAML support
   - Active Directory
   - Social login

4. **API Keys**:
   - Generación de API keys
   - Rate limiting por key
   - Scopes específicos
   - Revocación automática

---

**Última actualización**: 1 de Agosto de 2025  
**Versión**: 1.0.0