# 🚀 Sistema de Scraping - Guía Rápida

## Navegación

```
/scraper                 → Dashboard principal
/scraper/sources         → Gestión de fuentes
/scraper/schedule        → Programación cron
/scraper/history         → Historial de ejecuciones
```

## Componentes Principales

### 📊 Dashboard
```tsx
import { ScraperDashboard } from '@/components/scraper/ScraperDashboard';

// Muestra:
// - Productos totales
// - Nuevos hoy
// - Tasa de éxito
// - Jobs activos
// - Top 5 fuentes
```

### 🎯 Monitor de Jobs
```tsx
import { JobMonitor } from '@/components/scraper/JobMonitor';

// Funciones:
// - Iniciar scraping
// - Ver progreso
// - Cancelar jobs
// - Notificaciones de completado
```

### 🌐 Fuentes
```tsx
import { SourceManager } from '@/components/scraper/SourceManager';

// Grid con:
// - 30+ sitios argentinos
// - Toggle on/off
// - Métricas de salud
// - Ejecución manual
```

### ⏰ Programación
```tsx
import { ScheduleConfig } from '@/components/scraper/ScheduleConfig';

// Configurar:
// - Frecuencia (diario, 2-3 días, semanal)
// - Hora específica
// - Vista previa próxima ejecución
```

### 📋 Historial
```tsx
import { ScrapingHistory } from '@/components/scraper/ScrapingHistory';

// Tabla con:
// - Filtros avanzados
// - Paginación
// - Exportar CSV
// - Detalles de errores
```

## Hooks Personalizados

### useScraperDashboard
```typescript
const {
  metrics,          // Métricas del dashboard
  activeJobs,       // Jobs en progreso
  loading,          // Estado de carga
  error,            // Errores
  refresh,          // Función para refrescar
  startScraping,    // Iniciar nuevo job
  cancelJob         // Cancelar job activo
} = useScraperDashboard();
```

### useScraperTargets
```typescript
const {
  targets,          // Lista de fuentes
  loading,          // Estado de carga
  error,            // Errores
  refresh,          // Refrescar lista
  toggleTarget,     // Habilitar/deshabilitar
  refreshTarget     // Ejecutar scraping manual
} = useScraperTargets();
```

## API Endpoints

### Scraper Service (Python - Puerto 8086)

```typescript
// Dashboard
GET  /monitoring/health/summary

// Jobs
GET  /jobs                      // Listar activos
GET  /jobs/{job_id}            // Detalle de job
POST /scrape                   // Iniciar scraping
DELETE /jobs/{job_id}          // Cancelar job

// Fuentes
GET  /targets                  // Listar fuentes

// Programación  
GET  /monitoring/schedules
PUT  /monitoring/schedules/{target}

// Historial
GET  /monitoring/history?page=1&page_size=20
```

## Tipos TypeScript

```typescript
interface ScraperDashboardMetrics {
  total_products: number;
  new_today: number;
  duplicates_detected: number;
  success_rate: number;
  last_run: string;
  active_sources: number;
  jobs_in_progress: number;
  by_source: Record<string, SourceMetrics>;
}

interface ScraperJob {
  job_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  target_name: string;
  products_found: number;
  started_at: string;
  completed_at?: string;
}

interface ScraperTarget {
  name: string;
  display_name: string;
  enabled: boolean;
  url: string;
  products_count: number;
  success_rate: number;
  frequency: 'daily' | 'every_2_days' | 'every_3_days' | 'weekly';
  priority: 'high' | 'medium' | 'low';
}
```

## Estados de Jobs

```
pending    → Job en cola
running    → Scraping activo (mostrar progreso)
completed  → Finalizado exitosamente
failed     → Error durante ejecución
cancelled  → Cancelado por usuario
```

## Frecuencias de Scraping

```
daily         → Todos los días
every_2_days  → Cada 2 días  
every_3_days  → Cada 3 días
weekly        → Una vez por semana
```

## Troubleshooting Rápido

### No se conecta al backend
```bash
# Verificar servicio
curl http://localhost:8086/health

# Verificar CORS
# En scraper-service, asegurar que permite localhost:3004
```

### Jobs no avanzan
```bash
# Ver logs
tail -f services/saas-mt-scraper-service/logs/scraper_*.log

# Verificar MongoDB
mongosh
> use pim_marketplace
> db.scraper_products.countDocuments()
```

### Métricas no se actualizan
```javascript
// Cambiar intervalo de polling (default 5s)
const [refreshInterval, setRefreshInterval] = useState(3000); // 3 segundos
```

## Comandos Útiles

```bash
# Desarrollo
cd services/saas-mt-marketplace-admin
npm run dev

# Backend scraper
cd services/saas-mt-scraper-service
python -m uvicorn src.api.server:app --port 8086 --reload

# Ver productos scrapeados
mongosh
> use pim_marketplace
> db.scraper_products.find().limit(5).pretty()

# Logs
tail -f logs/scraper_*.log
tail -f logs/scheduler_daemon.log
```

## Personalización Rápida

### Cambiar colores de estado
```tsx
// En JobMonitor.tsx
const getStatusColor = (status: string) => {
  switch (status) {
    case 'running': return 'default';      // Azul
    case 'completed': return 'success';    // Verde
    case 'failed': return 'destructive';   // Rojo
    case 'pending': return 'secondary';    // Gris
  }
};
```

### Agregar nueva métrica al dashboard
```tsx
// En ScraperDashboard.tsx
<Card>
  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    <CardTitle className="text-sm font-medium">
      Nueva Métrica
    </CardTitle>
    <IconComponent className="h-4 w-4 text-muted-foreground" />
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">{metrics.nueva_metrica}</div>
    <p className="text-xs text-muted-foreground">
      Descripción
    </p>
  </CardContent>
</Card>
```

### Modificar límite de fuentes mostradas
```tsx
// En ScraperDashboard.tsx
{Object.entries(metrics.by_source)
  .slice(0, 10)  // Cambiar de 5 a 10
  .map(([source, data]) => (...))}
```

---

**Tips Pro:**
- El servicio Python ya tiene dashboards web en puertos 8888 y 8889 para debugging
- MongoDB tiene índices optimizados para búsquedas por URL y target_name
- Los jobs se pueden cancelar pero el cleanup puede tardar unos segundos
- La programación cron usa hora Argentina (UTC-3)