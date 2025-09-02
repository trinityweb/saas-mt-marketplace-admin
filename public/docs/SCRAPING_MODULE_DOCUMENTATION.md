# 📊 Documentación del Sistema de Scraping - Marketplace Admin

## 📋 Índice
1. [Visión General](#visión-general)
2. [Arquitectura](#arquitectura)
3. [Componentes](#componentes)
4. [API Integration](#api-integration)
5. [Guía de Uso](#guía-de-uso)
6. [Desarrollo](#desarrollo)
7. [Configuración](#configuración)
8. [Troubleshooting](#troubleshooting)

## 🎯 Visión General

El Sistema de Scraping es un módulo integrado en el Marketplace Admin que permite monitorear y gestionar la recolección automática de productos del mercado argentino. Este sistema se conecta con el servicio de scraping Python existente para proporcionar una interfaz visual completa.

### Características Principales

- **Dashboard de Métricas**: Vista en tiempo real del estado del sistema
- **Monitor de Jobs**: Seguimiento de trabajos de scraping activos
- **Gestión de Fuentes**: Control de 30+ sitios web argentinos
- **Programación Automática**: Configuración de horarios con cron
- **Historial Completo**: Registro de todas las ejecuciones

### Flujo de Datos

```
Marketplace Admin (Frontend) 
    ↓
Scraper Service (Python - Puerto 8086)
    ↓
MongoDB (Almacenamiento de productos)
```

## 🏗️ Arquitectura

### Estructura del Módulo

```
services/saas-mt-marketplace-admin/
├── src/
│   ├── app/scraper/                    # Páginas del módulo
│   │   ├── page.tsx                    # Dashboard principal
│   │   ├── sources/page.tsx            # Gestión de fuentes
│   │   ├── schedule/page.tsx           # Programación
│   │   └── history/page.tsx            # Historial
│   │
│   ├── components/scraper/             # Componentes React
│   │   ├── ScraperDashboard.tsx       # Dashboard con métricas
│   │   ├── JobMonitor.tsx              # Monitor de jobs activos
│   │   ├── SourceManager.tsx           # Gestión de fuentes
│   │   ├── ScheduleConfig.tsx          # Configuración cron
│   │   └── ScrapingHistory.tsx         # Tabla de historial
│   │
│   ├── hooks/scraper/                  # Custom hooks
│   │   ├── useScraperDashboard.ts      # Estado del dashboard
│   │   └── useScraperTargets.ts        # Gestión de fuentes
│   │
│   └── lib/api/scraper/                # Cliente API
│       └── scraper-api.ts              # Comunicación con backend
```

### Integración con el Sistema

El módulo se integra en el Marketplace Admin existente:

- **Navegación**: Nueva sección "Sistema de Scraping" en el sidebar
- **Routing**: Rutas bajo `/scraper/*`
- **Styling**: Usa el sistema de diseño compartido (Tailwind + shadcn/ui)
- **Estado**: Manejo local con React hooks y polling para actualizaciones

## 📦 Componentes

### ScraperDashboard

Dashboard principal que muestra métricas agregadas del sistema.

**Props:**
```typescript
interface ScraperDashboardProps {
  metrics: ScraperDashboardMetrics;
  activeJobs: ScraperJob[];
  onRefresh: () => void;
  loading?: boolean;
}
```

**Métricas mostradas:**
- Productos totales y nuevos hoy
- Fuentes activas y jobs en progreso
- Tasa de éxito global
- Duplicados detectados
- Rendimiento por fuente (top 5)

### JobMonitor

Componente para monitorear y controlar jobs de scraping en tiempo real.

**Funcionalidades:**
- Iniciar nuevos jobs de scraping
- Ver progreso en tiempo real
- Cancelar jobs activos
- Mostrar errores y estadísticas

**Props:**
```typescript
interface JobMonitorProps {
  targets: ScraperTarget[];
  onJobComplete?: (job: ScraperJob) => void;
}
```

### SourceManager

Gestión completa de fuentes de scraping con vista tipo grid.

**Características:**
- Toggle para habilitar/deshabilitar fuentes
- Métricas de salud por fuente (tasa de éxito)
- Ejecución manual de scraping
- Filtrado por nombre
- Badges de frecuencia y prioridad

### ScheduleConfig

Configuración de programación automática para cada fuente.

**Opciones de configuración:**
- Frecuencia: Diario, cada 2-3 días, semanal
- Hora y minutos específicos
- Toggle de habilitación
- Vista previa de próxima ejecución

### ScrapingHistory

Tabla completa con historial de todas las ejecuciones.

**Funcionalidades:**
- Filtros por estado, fecha y fuente
- Paginación
- Exportación a CSV
- Detalles de errores
- Estadísticas por ejecución

## 🔌 API Integration

### Cliente API (scraper-api.ts)

El cliente API maneja toda la comunicación con el servicio de scraping Python.

#### Endpoints principales:

```typescript
// Dashboard metrics
GET /monitoring/health/summary

// Active jobs
GET /jobs
GET /jobs/{job_id}
DELETE /jobs/{job_id}

// Start scraping
POST /scrape
{
  target: string;
  urls?: string[];
  force?: boolean;
  metadata?: Record<string, any>;
}

// Targets
GET /targets

// Schedules
GET /monitoring/schedules
PUT /monitoring/schedules/{target_name}

// History
GET /monitoring/history?page=1&page_size=20
```

### Tipos de Datos

```typescript
interface ScraperDashboardMetrics {
  total_products: number;
  new_today: number;
  duplicates_detected: number;
  success_rate: number;
  last_run: string;
  active_sources: number;
  jobs_in_progress: number;
  by_source: Record<string, {
    products: number;
    last_run: string;
    success_rate: number;
  }>;
}

interface ScraperJob {
  job_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  target_name: string;
  products_found: number;
  duplicates_detected: number;
  errors: string[];
  started_at: string;
  completed_at?: string;
}

interface ScraperTarget {
  name: string;
  display_name: string;
  enabled: boolean;
  url: string;
  last_run?: string;
  products_count: number;
  success_rate: number;
  frequency: 'daily' | 'every_2_days' | 'every_3_days' | 'weekly';
  priority: 'high' | 'medium' | 'low';
}
```

## 📖 Guía de Uso

### Acceso al Módulo

1. Navegar al Marketplace Admin
2. En el sidebar, hacer clic en "Sistema de Scraping"
3. Se mostrará el dashboard principal

### Dashboard Principal

El dashboard muestra un resumen del estado actual:
- **Métricas generales**: Total de productos, nuevos hoy, etc.
- **Jobs activos**: Trabajos en progreso con barra de progreso
- **Rendimiento por fuente**: Top 5 fuentes con mejor rendimiento

### Gestión de Fuentes

1. Ir a la pestaña "Fuentes"
2. Ver todas las fuentes disponibles en formato grid
3. Acciones disponibles:
   - **Toggle switch**: Habilitar/deshabilitar fuente
   - **Ejecutar ahora**: Iniciar scraping manual
   - **Configurar**: Ajustar programación (ícono calendario)

### Programación de Scraping

1. Ir a la pestaña "Programación"
2. Para cada fuente configurar:
   - **Frecuencia**: Diario, cada 2-3 días, semanal
   - **Hora**: Seleccionar hora del día
   - **Minutos**: 00, 15, 30 o 45
3. Guardar configuración

### Consultar Historial

1. Ir a la pestaña "Historial"
2. Usar filtros para buscar:
   - Por fuente específica
   - Por estado (completado, fallido, cancelado)
   - Por rango de fechas
3. Exportar resultados a CSV si es necesario

## 🛠️ Desarrollo

### Instalación de Dependencias

```bash
cd services/saas-mt-marketplace-admin
npm install
```

### Variables de Entorno

Configurar en `.env.local`:

```env
NEXT_PUBLIC_SCRAPER_SERVICE_URL=http://localhost:8086
```

### Ejecutar en Desarrollo

```bash
npm run dev
```

El módulo estará disponible en: http://localhost:3004/scraper

### Agregar Nuevas Fuentes

Para agregar una nueva fuente de scraping:

1. Configurar en el servicio Python (scraper-service)
2. La fuente aparecerá automáticamente en el frontend
3. Configurar programación según necesidad

### Personalización

#### Cambiar intervalo de actualización

En `useScraperDashboard.ts`:

```typescript
const [refreshInterval, setRefreshInterval] = useState<number>(5000); // 5 segundos
```

#### Modificar cantidad de fuentes mostradas

En `ScraperDashboard.tsx`:

```typescript
{Object.entries(metrics.by_source).slice(0, 5).map(...)} // Cambiar 5 por el número deseado
```

## ⚙️ Configuración

### Configuración del Servicio Backend

El servicio de scraping Python debe estar ejecutándose en el puerto 8086.

```bash
cd services/saas-mt-scraper-service
python -m uvicorn src.api.server:app --port 8086
```

### MongoDB

Asegurarse de que MongoDB esté corriendo para almacenar los productos scrapeados.

### Horarios de Scraping

Los horarios están configurados en hora local de Argentina (UTC-3):
- **Alta prioridad**: 9:00, 12:00, 15:00
- **Media prioridad**: 10:00, 14:00, 18:00
- **Baja prioridad**: 11:00, 16:00, 20:00

## 🔧 Troubleshooting

### El dashboard no muestra datos

1. Verificar que el servicio de scraping esté corriendo:
   ```bash
   curl http://localhost:8086/health
   ```

2. Verificar la configuración de CORS en el servicio Python

3. Revisar la consola del navegador para errores

### Jobs quedan colgados

1. Verificar logs del servicio de scraping:
   ```bash
   tail -f services/saas-mt-scraper-service/logs/scraper_*.log
   ```

2. Cancelar job manualmente desde el JobMonitor

3. Reiniciar el servicio si es necesario

### No se actualizan las métricas

1. Verificar que el polling esté activo (cada 5 segundos)
2. Refrescar manualmente con el botón "Actualizar"
3. Verificar conexión con el backend

### Error al programar scraping

1. Verificar formato de cron expression
2. Asegurar que la fuente esté habilitada
3. Revisar permisos del usuario

## 🚀 Mejoras Futuras

### WebSocket Integration
- Reemplazar polling por WebSocket para actualizaciones en tiempo real
- Notificaciones push cuando terminen los jobs

### Análisis Avanzado
- Gráficos de tendencias históricas
- Predicción de tiempos de scraping
- Alertas automáticas por anomalías

### Gestión de Datos
- Vista previa de productos scrapeados
- Aprobación manual antes de importar
- Deduplicación inteligente

### Integración con AI
- Curación automática de productos
- Detección de cambios de precios
- Categorización inteligente

---

## 📞 Soporte

Para problemas o preguntas sobre el módulo de scraping:

1. Revisar esta documentación
2. Consultar logs del servicio
3. Contactar al equipo de desarrollo

**Última actualización**: 31 de Enero de 2025  
**Versión**: 1.0.0