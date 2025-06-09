# 🏪 Marketplace Admin Panel

Panel de administración para el marketplace multi-tenant SaaS. Permite gestionar taxonomías globales, configuraciones de quickstart dinámico y analytics del marketplace.

## 🎯 Funcionalidades

### ✅ Implementado
- ✅ **Dashboard Principal**: Overview con métricas clave
- ✅ **UI Base**: Componentes reutilizados del backoffice principal
- ✅ **Estilos TiendaVecina**: Paleta de colores y temas consistentes

### 🚧 En Desarrollo (Roadmap)
- [ ] **Taxonomía Global**: Gestión de categorías y atributos marketplace
- [ ] **Quickstart Dinámico**: Admin panel para tipos de negocio y templates
- [ ] **Analytics Dashboard**: Métricas de uso, búsquedas y adopción
- [ ] **Configuración**: Settings globales del marketplace

## 🛠️ Tecnologías

- **Framework**: Next.js 15 con App Router
- **UI**: ShadCN UI + Radix UI primitives
- **Estilos**: Tailwind CSS con variables CSS
- **Iconos**: Lucide React
- **Estado**: React Server Components + Client Components híbrido
- **Puerto**: `3002` (para evitar conflictos con backoffice en 3001)

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
│   └── globals.css           # Estilos globales TiendaVecina
├── components/
│   └── ui/                   # Componentes ShadCN copiados del backoffice
└── lib/
    └── utils.ts              # Utilidades compartidas
```

## 🔗 Integración con Servicios

El admin panel se conectará con:

- **PIM Service**: APIs de taxonomía y productos
- **IAM Service**: Autenticación y autorización
- **Kong Gateway**: Enrutamiento de APIs
- **ElasticSearch**: Consultas de búsqueda y analytics

## 🌈 Paleta de Colores TiendaVecina

- **Primario**: `#9333EA` (Púrpura)
- **Secundario**: `#06B6D4` (Cyan)
- **Fondo**: `#F5F5F5` (Gris claro)
- **Tarjetas**: `#FAFAFA` (Gris muy claro)

## 📋 Próximos Pasos

1. **FASE 1**: Implementar gestión de taxonomía global
2. **FASE 2**: Crear admin panel para quickstart dinámico
3. **FASE 3**: Dashboard de analytics y métricas
4. **FASE 4**: Configuración avanzada del marketplace

---

**Parte del ecosistema**: [saas-mt](../../README.md) | **Puerto**: 3002 | **Estado**: �� Base Implementada
