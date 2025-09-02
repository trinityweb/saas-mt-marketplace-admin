import { apiClient } from '@/lib/api';

export interface ScraperDashboardMetrics {
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

export interface ScraperJob {
  job_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  target_name: string;
  products_found: number;
  duplicates_detected: number;
  errors: string[];
  started_at: string;
  completed_at?: string;
  estimated_duration?: number;
}

export interface ScraperTarget {
  id: string;
  name: string;
  display_name: string;
  category: string;
  engine: string;
  is_active: boolean;
  enabled?: boolean; // Para compatibilidad
  url?: string;
  health_score: number;
  last_run?: string | null;
  products_count: number;
  success_rate: number;
  frequency?: 'daily' | 'every_2_days' | 'every_3_days' | 'weekly';
  priority?: 'high' | 'medium' | 'low';
  created_at?: string;
  updated_at?: string;
}

export interface ScrapingSchedule {
  target_name: string;
  cron_expression: string;
  enabled: boolean;
  next_run: string;
  last_run?: string;
}

export interface ScrapingHistory {
  id: string;
  job_id: string;
  target_name: string;
  status: string;
  products_found: number;
  duplicates_detected: number;
  duration_seconds: number;
  started_at: string;
  completed_at: string;
  error_message?: string;
}

export interface StartScrapingRequest {
  target_name: string;
  urls?: string[];
  force?: boolean;
  metadata?: Record<string, any>;
}

export interface StartScrapingResponse {
  success: boolean;
  message: string;
  job_id: string;
  source?: {
    id: string;
    name: string;
    urls_count: number;
    type: string;
  };
  status?: string;
  estimated_duration?: number;
}

class ScraperAPI {
  // Usar el proxy local en lugar de llamar directamente a Kong
  private baseUrl = '';  // Vacío para usar URLs relativas
  private basePath = '/api/scraper';  // Ruta del proxy local

  private getHeaders(): HeadersInit {
    // TODO: Obtener el token JWT del contexto de autenticación
    const token = localStorage.getItem('auth_token') || '';
    const tenantId = localStorage.getItem('tenant_id') || '';
    
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      'X-Tenant-ID': tenantId,
    };
  }

  async getDashboardMetrics(): Promise<ScraperDashboardMetrics> {
    const response = await fetch(`${this.baseUrl}${this.basePath}/api/v1/health/report`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch dashboard metrics');
    }

    const healthReport = await response.json();
    
    // Adaptar el formato del health report al formato esperado por el dashboard
    return {
      total_products: 0, // Este dato no está en el health report
      new_today: 0, // Este dato no está en el health report
      duplicates_detected: 0, // Este dato no está en el health report
      success_rate: healthReport.average_success_rate / 100 || 0,
      last_run: healthReport.timestamp || new Date().toISOString(),
      active_sources: healthReport.targets?.active || 0,
      jobs_in_progress: 0, // Este dato viene de otro endpoint
      by_source: {} // Este dato requiere otro endpoint o transformación
    };
  }

  async getActiveJobs(): Promise<ScraperJob[]> {
    try {
      console.log('[Scraper API] Fetching active jobs...');
      const response = await fetch(`${this.baseUrl}${this.basePath}/api/v1/scraping/jobs`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        console.warn('[Scraper API] Failed to fetch active jobs:', response.status);
        return [];
      }

      const jobs = await response.json();
      console.log('[Scraper API] Active jobs:', jobs.length);
      
      // Adaptar el formato si es necesario
      if (Array.isArray(jobs)) {
        return jobs.map(job => ({
          job_id: job.job_id || job.id || job._id,
          status: job.status || 'pending',
          progress: job.progress || 0,
          target_name: job.target_name || job.source_id || job.source || '',
          products_found: job.products_found || job.products_scraped || 0,
          duplicates_detected: job.duplicates_detected || 0,
          errors: job.errors || [],
          started_at: job.started_at || job.created_at || new Date().toISOString(),
          completed_at: job.completed_at,
          estimated_duration: job.estimated_duration
        }));
      }
      
      return [];
    } catch (error) {
      console.error('[Scraper API] Error fetching jobs:', error);
      return [];
    }
  }

  async getJobStatus(jobId: string): Promise<ScraperJob> {
    const response = await fetch(`${this.baseUrl}${this.basePath}/api/v1/scraping/jobs/${jobId}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch job status');
    }

    return response.json();
  }

  async startScraping(request: StartScrapingRequest): Promise<StartScrapingResponse> {
    try {
      console.log('[Scraper API] Starting scraping for:', request.target_name);
      // El endpoint requiere el source_id en la URL
      const url = `${this.baseUrl}${this.basePath}/api/v1/scraping/sources/${request.target_name}/execute`;
      
      console.log('[Scraper API] POST to:', url);
      
      // El endpoint no requiere body según la documentación
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
      });

      console.log('[Scraper API] Response status:', response.status);

      if (!response.ok) {
        let errorText = '';
        try {
          errorText = await response.text();
        } catch (e) {
          console.warn('[Scraper API] Could not read error response text');
        }
        
        console.error('[Scraper API] Error details:', {
          status: response.status,
          statusText: response.statusText,
          url: url,
          body: errorText
        });
        
        // Intentar parsear el mensaje de error
        if (errorText) {
          try {
            const errorJson = JSON.parse(errorText);
            throw new Error(errorJson.message || errorJson.error || `Error del servidor: ${response.status}`);
          } catch (parseError) {
            // Si no es JSON, usar el texto directamente
            if (errorText.length > 0 && errorText.length < 200) {
              throw new Error(errorText);
            }
          }
        }
        
        // Mensajes de error específicos por código de estado
        switch (response.status) {
          case 404:
            throw new Error('Endpoint de scraping no encontrado. Verificar configuración del backend.');
          case 405:
            throw new Error('Método no permitido. Verificar configuración del endpoint.');
          case 401:
            throw new Error('No autorizado. Verificar token de autenticación.');
          case 403:
            throw new Error('Acceso denegado. Verificar permisos del usuario.');
          case 500:
          case 502:
          case 503:
            throw new Error('Error en el servidor de scraping. Por favor intente más tarde.');
          default:
            throw new Error(`Error al iniciar scraping: ${response.status} ${response.statusText}`);
        }
      }

      const data = await response.json();
      console.log('[Scraper API] Success! Response:', data);
      return data;
      
    } catch (error) {
      console.error('[Scraper API] Failed to start scraping:', error);
      
      // Si es un error de red o CORS
      if (error instanceof TypeError && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
        throw new Error('No se puede conectar con el servidor. Verificar que el backend esté activo.');
      }
      
      throw error;
    }
  }

  async cancelJob(jobId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}${this.basePath}/api/v1/scraping/jobs/${jobId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to cancel job');
    }
  }

  async getTargets(): Promise<ScraperTarget[]> {
    try {
      console.log('[Scraper API] Fetching targets...');
      // Usar el endpoint real del backend
      const url = `${this.baseUrl}${this.basePath}/api/v1/scraping/sources`;
      
      const response = await fetch(url, {
        headers: this.getHeaders(),
      });

      console.log('[Scraper API] Targets response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        console.error('[Scraper API] Failed to fetch targets:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        
        throw new Error(`Error al obtener fuentes de scraping: ${response.status}`);
      }

      const data = await response.json();
      
      // El backend devuelve {sources: [...]}, no un array directo
      const sources = data.sources || [];
      console.log('[Scraper API] Sources fetched:', sources.length, 'sources');
      
      // Mapear estructura del backend a la esperada por el frontend
      return sources.map((source: any) => ({
        id: source._id || source.id || source.source_id || source.name,
        name: source.source_id || source.name,  // Usar source_id si existe, sino name
        display_name: source.display_name || source.name || source.source_id,
        category: source.category || 'otros',
        engine: source.type || source.engine || 'scrapy',
        is_active: source.is_active !== undefined ? source.is_active : (source.status === 'active' || source.enabled),
        enabled: source.enabled !== undefined ? source.enabled : source.status === 'active', // Para compatibilidad
        url: source.base_url || source.url,
        health_score: source.health_score || 85,
        last_run: source.last_run,
        // Usar last_products_found o products_count, preferir el primero si existe
        products_count: source.last_products_found !== undefined ? source.last_products_found : (source.products_count || 0),
        success_rate: source.success_rate || 0,
        // Agregar campo opcional para el total histórico si está disponible
        total_products_scraped: source.total_products_scraped
      }));
    } catch (error) {
      console.error('[Scraper API] Error fetching targets:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('No se puede conectar con el servidor de scraping');
      }
      
      throw error;
    }
  }

  async toggleSource(sourceId: string, isActive: boolean): Promise<any> {
    try {
      // Normalizar el sourceId a minúsculas para coincidir con el backend
      const normalizedSourceId = sourceId.toLowerCase().replace(/\s+/g, '-');
      console.log(`[Scraper API] Toggling source ${normalizedSourceId} (original: ${sourceId}) to ${isActive ? 'active' : 'inactive'}`);
      const url = `${this.baseUrl}${this.basePath}/api/v1/scraping/sources/${normalizedSourceId}`;
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({ is_active: isActive }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        console.error('[Scraper API] Failed to toggle source:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        
        // Si el endpoint no está implementado, retornar sin error para no bloquear el UI
        if (response.status === 404 || response.status === 405) {
          console.warn('[Scraper API] Toggle endpoint not implemented in backend, updating locally only');
          return { success: true, local_only: true };
        }
        
        throw new Error(`Error al actualizar fuente: ${response.status}`);
      }

      const data = await response.json();
      console.log('[Scraper API] Toggle successful:', data);
      return data;
    } catch (error) {
      console.error('[Scraper API] Error toggling source:', error);
      throw error;
    }
  }

  async getSchedules(): Promise<ScrapingSchedule[]> {
    const response = await fetch(`${this.baseUrl}${this.basePath}/api/v1/scraping/schedules`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch schedules');
    }

    return response.json();
  }

  async updateSchedule(targetName: string, schedule: Partial<ScrapingSchedule>): Promise<void> {
    const response = await fetch(`${this.baseUrl}${this.basePath}/api/v1/scraping/schedules/${targetName}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(schedule),
    });

    if (!response.ok) {
      throw new Error('Failed to update schedule');
    }
  }

  async getHistory(params?: {
    page?: number;
    page_size?: number;
    target_name?: string;
    status?: string;
    from_date?: string;
    to_date?: string;
  }): Promise<{
    items: ScrapingHistory[];
    total_count: number;
    page: number;
    page_size: number;
    total_pages: number;
  }> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const response = await fetch(`${this.baseUrl}${this.basePath}/api/v1/scraping/history?${queryParams}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch history');
    }

    return response.json();
  }

  // WebSocket connection for real-time updates
  connectWebSocket(onMessage: (data: any) => void): WebSocket {
    const wsUrl = this.baseUrl.replace('http', 'ws');
    const ws = new WebSocket(`${wsUrl}${this.basePath}/ws`);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return ws;
  }
}

export const scraperAPI = new ScraperAPI();