# RealTimeScraperMonitor Component

## Descripción

El componente `RealTimeScraperMonitor` es un organismo complejo que proporciona un panel de control en tiempo real para monitorear y gestionar múltiples scrapers web. Utiliza WebSocket/SSE para actualizaciones en vivo y sigue los principios de Atomic Design.

## Características

### 1. **Monitoreo en Tiempo Real**
- Conexión WebSocket/SSE para actualizaciones instantáneas
- Auto-reconexión con backoff exponencial
- Indicador de estado de conexión

### 2. **Tabla de Fuentes Mejorada**
- Estado visual con iconos y colores
- Indicadores de salud del servicio
- Barras de progreso para trabajos activos
- Estadísticas de productos procesados
- Métricas de rendimiento (CPU, memoria)

### 3. **Controles de Scraper**
- Iniciar/Detener scrapers individuales
- Pausar/Reanudar trabajos en progreso
- Actualización manual del estado

### 4. **Panel de Logs Expandible**
- Logs en tiempo real con niveles de severidad
- Auto-scroll opcional
- Limpieza de logs
- Formato tipo terminal con colores

### 5. **Métricas de Rendimiento**
- Cards con estadísticas globales
- Gráficos de tendencias
- Métricas detalladas por fuente seleccionada
- Uso de recursos (CPU, memoria, red)

### 6. **Responsive Design**
- Adaptable a diferentes tamaños de pantalla
- Optimizado para desktop y tablet

## Uso

```tsx
import { RealTimeScraperMonitor } from '@/components/shared-ui/organisms';

function ScraperDashboard() {
  return (
    <RealTimeScraperMonitor className="custom-class" />
  );
}
```

## Props

| Prop | Tipo | Descripción | Requerido |
|------|------|-------------|-----------|
| `className` | `string` | Clases CSS adicionales | No |

## Hook Personalizado

El componente utiliza `useRealTimeScraperMonitor` que maneja:

- **Estado de conexión WebSocket**
- **Gestión de fuentes de scraping**
- **Métricas globales**
- **Acciones del scraper** (start, stop, pause, resume)
- **Manejo de logs**
- **Auto-refresh de datos**

## Estructura de Datos

### ScraperSource
```typescript
interface ScraperSource {
  id: string;
  name: string;
  url: string;
  status: 'idle' | 'running' | 'paused' | 'completed' | 'failed' | 'scheduled';
  health: 'healthy' | 'degraded' | 'unhealthy';
  lastRun?: string;
  nextRun?: string;
  stats: {
    totalProducts: number;
    newProducts: number;
    updatedProducts: number;
    failedProducts: number;
    successRate: number;
    avgResponseTime: number;
    errorRate: number;
  };
  performance: {
    cpuUsage: number;
    memoryUsage: number;
    requestsPerSecond: number;
    bytesProcessed: number;
  };
  currentJob?: {
    id: string;
    progress: number;
    itemsProcessed: number;
    totalItems: number;
    startTime: string;
    estimatedEndTime?: string;
    currentUrl?: string;
    errors: number;
  };
  logs: LogEntry[];
}
```

## Desarrollo

### Modo Development
En desarrollo, el componente usa datos mock y simula actualizaciones en tiempo real cada 2 segundos.

### Modo Production
En producción, se conecta a un WebSocket real configurado en `NEXT_PUBLIC_WS_URL`.

## Dependencias

- **React**: Framework base
- **Radix UI**: Componentes primitivos
- **Tailwind CSS**: Estilos
- **Lucide React**: Iconos
- **date-fns**: Formateo de fechas
- **sonner**: Notificaciones toast

## Mejoras Futuras

1. **Gráficos históricos** de métricas
2. **Filtros avanzados** para la tabla
3. **Exportación de datos** a CSV/Excel
4. **Configuración de alertas** personalizadas
5. **Vista de comparación** entre fuentes
6. **Modo oscuro** mejorado
7. **Integración con sistema de notificaciones**

## Consideraciones de Rendimiento

- Los logs se limitan a 50 entradas por fuente
- Las actualizaciones de UI están optimizadas con React.memo
- El auto-scroll se puede desactivar para mejorar rendimiento
- La conexión WebSocket incluye throttling de mensajes