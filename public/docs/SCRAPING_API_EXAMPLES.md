# 📡 Sistema de Scraping - Ejemplos de API

## Configuración Base

```typescript
// Configurar URL del servicio
const SCRAPER_API_URL = process.env.NEXT_PUBLIC_SCRAPER_SERVICE_URL || 'http://localhost:8086';
```

## Dashboard Metrics

### Obtener métricas del dashboard

```bash
curl -X GET http://localhost:8086/monitoring/health/summary
```

**Respuesta:**
```json
{
  "total_products": 15234,
  "new_today": 567,
  "duplicates_detected": 89,
  "success_rate": 0.95,
  "last_run": "2025-01-31T10:00:00Z",
  "active_sources": 12,
  "jobs_in_progress": 2,
  "by_source": {
    "jumbo": {
      "products": 3456,
      "last_run": "2025-01-31T09:30:00Z",
      "success_rate": 0.98
    },
    "carrefour": {
      "products": 2890,
      "last_run": "2025-01-31T09:00:00Z",
      "success_rate": 0.92
    }
  }
}
```

## Jobs Management

### Listar jobs activos

```bash
curl -X GET http://localhost:8086/jobs
```

**Respuesta:**
```json
[
  {
    "job_id": "123e4567-e89b-12d3-a456-426614174000",
    "status": "running",
    "progress": 45,
    "target_name": "jumbo",
    "products_found": 150,
    "duplicates_detected": 23,
    "errors": [],
    "started_at": "2025-01-31T10:00:00Z"
  }
]
```

### Iniciar nuevo job de scraping

```bash
curl -X POST http://localhost:8086/scrape \
  -H "Content-Type: application/json" \
  -d '{
    "target": "jumbo",
    "category": "almacen",
    "max_products": 500
  }'
```

**Respuesta:**
```json
{
  "job_id": "456e7890-e89b-12d3-a456-426614174111",
  "status": "pending",
  "estimated_duration": 120,
  "message": "Scraping started for jumbo"
}
```

### Obtener estado de un job específico

```bash
curl -X GET http://localhost:8086/jobs/456e7890-e89b-12d3-a456-426614174111
```

**Respuesta:**
```json
{
  "job_id": "456e7890-e89b-12d3-a456-426614174111",
  "status": "completed",
  "progress": 100,
  "target_name": "jumbo",
  "products_found": 485,
  "duplicates_detected": 67,
  "errors": [],
  "started_at": "2025-01-31T10:00:00Z",
  "completed_at": "2025-01-31T10:02:30Z"
}
```

### Cancelar un job

```bash
curl -X DELETE http://localhost:8086/jobs/456e7890-e89b-12d3-a456-426614174111
```

## Targets (Fuentes)

### Listar todas las fuentes disponibles

```bash
curl -X GET http://localhost:8086/targets
```

**Respuesta:**
```json
[
  {
    "name": "jumbo",
    "display_name": "Jumbo",
    "enabled": true,
    "url": "https://www.jumbo.com.ar",
    "last_run": "2025-01-31T09:30:00Z",
    "products_count": 3456,
    "success_rate": 0.98,
    "frequency": "daily",
    "priority": "high"
  },
  {
    "name": "carrefour",
    "display_name": "Carrefour",
    "enabled": true,
    "url": "https://www.carrefour.com.ar",
    "last_run": "2025-01-31T09:00:00Z",
    "products_count": 2890,
    "success_rate": 0.92,
    "frequency": "every_2_days",
    "priority": "medium"
  }
]
```

## Programación (Scheduling)

### Obtener programación actual

```bash
curl -X GET http://localhost:8086/monitoring/schedules
```

**Respuesta:**
```json
[
  {
    "target_name": "jumbo",
    "cron_expression": "0 9 * * *",
    "enabled": true,
    "next_run": "2025-02-01T09:00:00Z",
    "last_run": "2025-01-31T09:00:00Z"
  }
]
```

### Actualizar programación

```bash
curl -X PUT http://localhost:8086/monitoring/schedules/jumbo \
  -H "Content-Type: application/json" \
  -d '{
    "cron_expression": "0 10 * * *",
    "enabled": true
  }'
```

## Historial

### Obtener historial con filtros

```bash
curl -X GET "http://localhost:8086/monitoring/history?page=1&page_size=20&target_name=jumbo&status=completed"
```

**Respuesta:**
```json
{
  "items": [
    {
      "id": "hist-001",
      "job_id": "123e4567-e89b-12d3-a456-426614174000",
      "target_name": "jumbo",
      "status": "completed",
      "products_found": 485,
      "duplicates_detected": 67,
      "duration_seconds": 150,
      "started_at": "2025-01-31T10:00:00Z",
      "completed_at": "2025-01-31T10:02:30Z"
    }
  ],
  "total_count": 150,
  "page": 1,
  "page_size": 20,
  "total_pages": 8
}
```

## Ejemplos con TypeScript/React

### Hook personalizado para dashboard

```typescript
import { useState, useEffect } from 'react';
import { scraperAPI } from '@/lib/api/scraper/scraper-api';

export function useScraperMetrics() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await scraperAPI.getDashboardMetrics();
        setMetrics(data);
      } catch (error) {
        console.error('Error fetching metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000); // Actualizar cada 5s

    return () => clearInterval(interval);
  }, []);

  return { metrics, loading };
}
```

### Componente para iniciar scraping

```tsx
import React, { useState } from 'react';
import { scraperAPI } from '@/lib/api/scraper/scraper-api';
import { Button } from '@/components/ui/button';

export function StartScrapingButton({ targetName }: { targetName: string }) {
  const [loading, setLoading] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);

  const handleStart = async () => {
    setLoading(true);
    try {
      const response = await scraperAPI.startScraping({
        target_name: targetName,
        force: false,
      });
      setJobId(response.job_id);
      console.log('Job started:', response);
    } catch (error) {
      console.error('Error starting job:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button onClick={handleStart} disabled={loading}>
        {loading ? 'Iniciando...' : 'Iniciar Scraping'}
      </Button>
      {jobId && <p>Job ID: {jobId}</p>}
    </div>
  );
}
```

### Monitor de progreso con WebSocket

```typescript
// Conectar WebSocket para actualizaciones en tiempo real
const ws = scraperAPI.connectWebSocket((data) => {
  console.log('WebSocket update:', data);
  
  if (data.type === 'job_progress') {
    updateJobProgress(data.job_id, data.progress);
  } else if (data.type === 'job_complete') {
    handleJobComplete(data.job_id, data.result);
  }
});

// Cleanup
ws.close();
```

## Filtros y Paginación

### Ejemplo de búsqueda en historial

```typescript
const searchHistory = async (filters: {
  targetName?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
}) => {
  const response = await scraperAPI.getHistory({
    target_name: filters.targetName,
    status: filters.status,
    from_date: filters.fromDate,
    to_date: filters.toDate,
    page: filters.page || 1,
    page_size: 20,
  });

  return response;
};

// Uso
const history = await searchHistory({
  targetName: 'jumbo',
  status: 'completed',
  fromDate: '2025-01-01',
  toDate: '2025-01-31',
  page: 1,
});
```

## Manejo de Errores

### Patrón recomendado

```typescript
try {
  const response = await scraperAPI.startScraping({
    target_name: 'jumbo',
  });
  
  // Éxito
  toast({
    title: 'Scraping iniciado',
    description: `Job ${response.job_id} en progreso`,
  });
  
} catch (error) {
  // Error
  const message = error instanceof Error 
    ? error.message 
    : 'Error desconocido';
    
  toast({
    title: 'Error',
    description: message,
    variant: 'destructive',
  });
}
```

## Testing

### Mock del servicio para tests

```typescript
// __mocks__/scraperAPI.ts
export const scraperAPI = {
  getDashboardMetrics: jest.fn().mockResolvedValue({
    total_products: 1000,
    new_today: 50,
    success_rate: 0.95,
    // ... resto de métricas
  }),
  
  getActiveJobs: jest.fn().mockResolvedValue([
    {
      job_id: 'test-job-1',
      status: 'running',
      progress: 50,
      // ... resto de campos
    }
  ]),
  
  startScraping: jest.fn().mockResolvedValue({
    job_id: 'new-test-job',
    status: 'pending',
    message: 'Job started',
  }),
};
```

## Configuración de CORS

Si el frontend está en un dominio diferente, asegurar que el servicio Python permita CORS:

```python
# En el servicio de scraping Python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3004"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

**Nota**: Todos los endpoints mostrados asumen que el servicio de scraping está corriendo en `http://localhost:8086`