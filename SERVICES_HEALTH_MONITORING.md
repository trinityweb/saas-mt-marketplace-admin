# Monitoreo de Estado de Servicios - Marketplace Admin

## 📋 Descripción

El Marketplace Admin ahora incluye un sistema completo de monitoreo del estado de todos los servicios del ecosistema SaaS multi-tenant. Esta funcionalidad proporciona visibilidad en tiempo real del estado de salud de cada componente del sistema.

## 🎯 Características

### ✅ Monitoreo en Tiempo Real
- **Actualización automática**: Cada 30 segundos
- **Verificación manual**: Botón de refresh disponible
- **Indicadores visuales**: Estados con colores (verde, amarillo, rojo)

### 📊 Servicios Monitoreados

#### 🚀 Servicios Backend (Go)
- **IAM Service** (Puerto 8080) - Autenticación y autorización
- **Chat Service** (Puerto 8000) - Mensajería y comunicación  
- **PIM Service** (Puerto 8090) - Gestión de información de productos
- **Stock Service** (Puerto 8100) - Gestión de inventario

#### 🌐 Infraestructura
- **API Gateway** (Kong) - Enrutamiento y proxy
- **PostgreSQL** - Base de datos principal
- **MongoDB** - Base de datos NoSQL

#### 📈 Monitoreo y Observabilidad
- **Prometheus** - Sistema de métricas
- **Grafana** - Dashboard de visualización

## 🎨 Componentes UI

### 1. Sidebar de Estado de Servicios
- **Ubicación**: Panel lateral izquierdo (desktop)
- **Información mostrada**:
  - Estado general del sistema
  - Lista detallada de cada servicio
  - Tiempo de respuesta
  - Última verificación
  - Mensajes de error (si aplica)

### 2. Indicador de Estado en Header
- **Ubicación**: Barra superior
- **Información mostrada**:
  - Estado general (Operativo/Degradado/Crítico)
  - Botón de actualización manual

### 3. Vista Móvil
- **Comportamiento**: La sidebar se muestra como card completa en dispositivos móviles
- **Responsive**: Adaptación automática según el tamaño de pantalla

## 🔧 Implementación Técnica

### Arquitectura
```
Frontend (React) → API Route (/api/health) → Health Checks → Services
```

### Endpoints de Health Check

#### Servicios Go
Todos los servicios Go implementan el endpoint estándar:
```
GET /health
```

#### Servicios de Infraestructura
- **Kong**: `GET /status` (Admin API)
- **Prometheus**: `GET /-/healthy`
- **Grafana**: `GET /api/health`
- **Bases de datos**: Verificación de conectividad

### Estados de Servicio

| Estado | Color | Descripción |
|--------|-------|-------------|
| `healthy` | 🟢 Verde | Servicio funcionando correctamente |
| `unhealthy` | 🔴 Rojo | Servicio con problemas o caído |
| `unknown` | ⚪ Gris | Estado no determinado |

### Estados Generales del Sistema

| Estado | Descripción |
|--------|-------------|
| `healthy` | Todos los servicios operativos |
| `degraded` | Algunos servicios con problemas |
| `down` | Servicios críticos caídos |

## 🛠️ Configuración

### Variables de Entorno
El sistema detecta automáticamente el entorno:
- **Development**: URLs localhost
- **Production**: URLs de contenedores Docker

### Configuración de Servicios
Los servicios se configuran en:
```typescript
// src/app/api/health/route.ts
const SERVICES_CONFIG: ServiceConfig[]
```

## 🧪 Testing

### Script de Prueba
Ejecutar el script de prueba para verificar todos los endpoints:
```bash
./test-services.sh
```

### Prueba Manual
1. Acceder a `http://localhost:3004`
2. Verificar la sidebar izquierda
3. Comprobar el indicador en el header
4. Probar el botón de refresh

## 📱 Responsive Design

### Desktop (≥1024px)
- Sidebar fija en el lado izquierdo
- Indicador compacto en header

### Tablet/Mobile (<1024px)
- Sidebar oculta
- Card completa de estado en la parte inferior
- Indicador expandido en header

## 🔄 Flujo de Datos

1. **Hook personalizado** (`useServicesHealth`) gestiona el estado
2. **API Route** (`/api/health`) realiza las verificaciones
3. **Componentes UI** muestran la información en tiempo real
4. **Actualización automática** cada 30 segundos

## 🚀 Uso

### Para Desarrolladores
1. Los servicios deben implementar endpoint `/health`
2. Respuesta esperada: HTTP 200 para servicio saludable
3. Timeout configurado: 5 segundos

### Para Administradores
1. Monitorear el estado general en el header
2. Revisar detalles específicos en la sidebar
3. Usar el botón refresh para verificación manual
4. Identificar servicios problemáticos por color rojo

## 🔮 Futuras Mejoras

- [ ] Notificaciones push para servicios caídos
- [ ] Historial de estado de servicios
- [ ] Métricas de uptime
- [ ] Integración con alertas de Prometheus
- [ ] Dashboard de métricas embebido
- [ ] Configuración de intervalos de verificación
- [ ] Filtros por tipo de servicio
- [ ] Exportación de reportes de estado

## 🐛 Troubleshooting

### Servicios Aparecen como "Unhealthy"
1. Verificar que el servicio esté ejecutándose
2. Comprobar que el endpoint `/health` esté implementado
3. Revisar logs del servicio
4. Verificar conectividad de red

### Sidebar No Se Muestra
1. Verificar que la pantalla sea ≥1024px
2. Comprobar que no haya errores de JavaScript
3. Verificar que el hook `useServicesHealth` esté funcionando

### Actualizaciones Lentas
1. Verificar conectividad de red
2. Comprobar que los servicios respondan rápidamente
3. Revisar logs del navegador para errores

## 📞 Soporte

Para problemas o mejoras, contactar al equipo de desarrollo o crear un issue en el repositorio del proyecto. 