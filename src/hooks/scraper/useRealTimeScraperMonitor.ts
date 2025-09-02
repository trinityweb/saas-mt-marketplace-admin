import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';

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

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  metadata?: Record<string, any>;
}

interface Metrics {
  totalSources: number;
  activeSources: number;
  totalProductsProcessed: number;
  productsTrend: number;
  avgSuccessRate: number;
  avgResponseTime: number;
}

interface WebSocketMessage {
  type: 'source-update' | 'log' | 'metrics' | 'error';
  sourceId?: string;
  data: any;
}

export function useRealTimeScraperMonitor() {
  const [sources, setSources] = useState<ScraperSource[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({
    totalSources: 0,
    activeSources: 0,
    totalProductsProcessed: 0,
    productsTrend: 0,
    avgSuccessRate: 0,
    avgResponseTime: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  // Inicializar datos mock para desarrollo
  const initializeMockData = useCallback(() => {
    const mockSources: ScraperSource[] = [
      {
        id: '1',
        name: 'Almacén Natural',
        url: 'almacennatural.com',
        status: 'running',
        health: 'healthy',
        lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        stats: {
          totalProducts: 12543,
          newProducts: 234,
          updatedProducts: 567,
          failedProducts: 12,
          successRate: 0.98,
          avgResponseTime: 245,
          errorRate: 0.02,
        },
        performance: {
          cpuUsage: 45.2,
          memoryUsage: 62.8,
          requestsPerSecond: 12.5,
          bytesProcessed: 1024 * 1024 * 256, // 256MB
        },
        currentJob: {
          id: 'job-1',
          progress: 65,
          itemsProcessed: 650,
          totalItems: 1000,
          startTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          estimatedEndTime: new Date(Date.now() + 8 * 60 * 1000).toISOString(),
          currentUrl: 'https://almacennatural.com/productos?page=65',
          errors: 3,
        },
        logs: [
          {
            id: '1',
            timestamp: new Date().toISOString(),
            level: 'info',
            message: 'Iniciando scraping de página 65...',
          },
          {
            id: '2',
            timestamp: new Date(Date.now() - 30000).toISOString(),
            level: 'warn',
            message: 'Reintentando conexión después de timeout',
          },
        ],
      },
      {
        id: '2',
        name: 'Blaisten',
        url: 'blaisten.com.ar',
        status: 'idle',
        health: 'healthy',
        lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        nextRun: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        stats: {
          totalProducts: 8923,
          newProducts: 0,
          updatedProducts: 0,
          failedProducts: 0,
          successRate: 0.95,
          avgResponseTime: 312,
          errorRate: 0.05,
        },
        performance: {
          cpuUsage: 0,
          memoryUsage: 0,
          requestsPerSecond: 0,
          bytesProcessed: 0,
        },
        logs: [],
      },
      {
        id: '3',
        name: 'Carrefour',
        url: 'carrefour.com.ar',
        status: 'failed',
        health: 'unhealthy',
        lastRun: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        stats: {
          totalProducts: 45678,
          newProducts: 0,
          updatedProducts: 0,
          failedProducts: 234,
          successRate: 0.45,
          avgResponseTime: 1234,
          errorRate: 0.55,
        },
        performance: {
          cpuUsage: 0,
          memoryUsage: 0,
          requestsPerSecond: 0,
          bytesProcessed: 0,
        },
        logs: [
          {
            id: '3',
            timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
            level: 'error',
            message: 'Error de conexión: timeout después de 30s',
          },
        ],
      },
      {
        id: '4',
        name: 'Coto Digital',
        url: 'cotodigital3.com.ar',
        status: 'paused',
        health: 'degraded',
        lastRun: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        stats: {
          totalProducts: 23456,
          newProducts: 123,
          updatedProducts: 456,
          failedProducts: 23,
          successRate: 0.89,
          avgResponseTime: 456,
          errorRate: 0.11,
        },
        performance: {
          cpuUsage: 12.3,
          memoryUsage: 34.5,
          requestsPerSecond: 5.6,
          bytesProcessed: 1024 * 1024 * 128, // 128MB
        },
        currentJob: {
          id: 'job-4',
          progress: 34,
          itemsProcessed: 340,
          totalItems: 1000,
          startTime: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          errors: 8,
        },
        logs: [
          {
            id: '4',
            timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
            level: 'info',
            message: 'Scraping pausado por el usuario',
          },
        ],
      },
    ];

    setSources(mockSources);
    setMetrics({
      totalSources: mockSources.length,
      activeSources: mockSources.filter(s => s.status === 'running').length,
      totalProductsProcessed: mockSources.reduce((acc, s) => acc + s.stats.totalProducts, 0),
      productsTrend: 12.5,
      avgSuccessRate: mockSources.reduce((acc, s) => acc + s.stats.successRate, 0) / mockSources.length,
      avgResponseTime: mockSources.reduce((acc, s) => acc + s.stats.avgResponseTime, 0) / mockSources.length,
    });
  }, []);

  // Conectar WebSocket
  const connectWebSocket = useCallback(() => {
    try {
      // En desarrollo, usar mock data
      if (process.env.NODE_ENV === 'development') {
        initializeMockData();
        setConnected(true);
        setLoading(false);
        
        // Simular actualizaciones en tiempo real
        const interval = setInterval(() => {
          setSources(prev => prev.map(source => {
            if (source.status === 'running' && source.currentJob) {
              const newProgress = Math.min(source.currentJob.progress + Math.random() * 5, 100);
              const newItemsProcessed = Math.floor((newProgress / 100) * source.currentJob.totalItems);
              
              // Si llegó al 100%, cambiar estado a completed
              if (newProgress >= 100) {
                return {
                  ...source,
                  status: 'completed' as const,
                  currentJob: undefined,
                  stats: {
                    ...source.stats,
                    totalProducts: source.stats.totalProducts + source.currentJob.totalItems,
                    newProducts: source.stats.newProducts + Math.floor(Math.random() * 100),
                  },
                  logs: [
                    ...source.logs,
                    {
                      id: Date.now().toString(),
                      timestamp: new Date().toISOString(),
                      level: 'info' as const,
                      message: 'Scraping completado exitosamente',
                    },
                  ].slice(-50), // Mantener solo los últimos 50 logs
                };
              }
              
              return {
                ...source,
                currentJob: {
                  ...source.currentJob,
                  progress: newProgress,
                  itemsProcessed: newItemsProcessed,
                },
                performance: {
                  ...source.performance,
                  cpuUsage: 40 + Math.random() * 20,
                  memoryUsage: 50 + Math.random() * 30,
                  requestsPerSecond: 10 + Math.random() * 10,
                  bytesProcessed: source.performance.bytesProcessed + Math.random() * 1024 * 1024,
                },
                logs: [
                  ...source.logs,
                  Math.random() > 0.7 ? {
                    id: Date.now().toString(),
                    timestamp: new Date().toISOString(),
                    level: Math.random() > 0.8 ? 'warn' as const : 'info' as const,
                    message: `Procesando productos ${newItemsProcessed}/${source.currentJob.totalItems}...`,
                  } : null,
                ].filter(Boolean).slice(-50) as LogEntry[],
              };
            }
            return source;
          }));
        }, 2000);
        
        return () => clearInterval(interval);
      }
      
      // En producción, conectar WebSocket real
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8100/ws/scraper';
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        console.log('WebSocket conectado');
        setConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
      };
      
      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          handleWebSocketMessage(message);
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };
      
      wsRef.current.onerror = (event) => {
        console.error('WebSocket error:', event);
        setError('Error de conexión con el servidor');
      };
      
      wsRef.current.onclose = () => {
        console.log('WebSocket desconectado');
        setConnected(false);
        
        // Intentar reconectar con backoff exponencial
        const attempts = reconnectAttemptsRef.current;
        if (attempts < 5) {
          const delay = Math.min(1000 * Math.pow(2, attempts), 30000);
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connectWebSocket();
          }, delay);
        }
      };
      
    } catch (err) {
      console.error('Error connecting WebSocket:', err);
      setError('Error al conectar con el servidor');
      setLoading(false);
    }
  }, [initializeMockData]);

  // Manejar mensajes WebSocket
  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    switch (message.type) {
      case 'source-update':
        if (message.sourceId) {
          setSources(prev => prev.map(source => 
            source.id === message.sourceId ? { ...source, ...message.data } : source
          ));
        }
        break;
        
      case 'log':
        if (message.sourceId) {
          setSources(prev => prev.map(source => 
            source.id === message.sourceId 
              ? { 
                  ...source, 
                  logs: [...source.logs, message.data].slice(-50) // Mantener últimos 50 logs
                } 
              : source
          ));
        }
        break;
        
      case 'metrics':
        setMetrics(message.data);
        break;
        
      case 'error':
        toast.error(message.data.message || 'Error en el servidor');
        break;
    }
  }, []);

  // Acciones del scraper
  const startScraper = useCallback(async (sourceId: string) => {
    try {
      if (process.env.NODE_ENV === 'development') {
        setSources(prev => prev.map(source => 
          source.id === sourceId 
            ? { 
                ...source, 
                status: 'running' as const,
                currentJob: {
                  id: `job-${Date.now()}`,
                  progress: 0,
                  itemsProcessed: 0,
                  totalItems: Math.floor(Math.random() * 2000) + 500,
                  startTime: new Date().toISOString(),
                  errors: 0,
                },
              } 
            : source
        ));
        toast.success('Scraper iniciado');
        return;
      }
      
      // En producción, enviar comando por WebSocket
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          action: 'start',
          sourceId,
        }));
      }
    } catch (err) {
      toast.error('Error al iniciar el scraper');
      console.error('Error starting scraper:', err);
    }
  }, []);

  const stopScraper = useCallback(async (sourceId: string) => {
    try {
      if (process.env.NODE_ENV === 'development') {
        setSources(prev => prev.map(source => 
          source.id === sourceId 
            ? { ...source, status: 'idle' as const, currentJob: undefined } 
            : source
        ));
        toast.success('Scraper detenido');
        return;
      }
      
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          action: 'stop',
          sourceId,
        }));
      }
    } catch (err) {
      toast.error('Error al detener el scraper');
      console.error('Error stopping scraper:', err);
    }
  }, []);

  const pauseScraper = useCallback(async (sourceId: string) => {
    try {
      if (process.env.NODE_ENV === 'development') {
        setSources(prev => prev.map(source => 
          source.id === sourceId 
            ? { ...source, status: 'paused' as const } 
            : source
        ));
        toast.success('Scraper pausado');
        return;
      }
      
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          action: 'pause',
          sourceId,
        }));
      }
    } catch (err) {
      toast.error('Error al pausar el scraper');
      console.error('Error pausing scraper:', err);
    }
  }, []);

  const resumeScraper = useCallback(async (sourceId: string) => {
    try {
      if (process.env.NODE_ENV === 'development') {
        setSources(prev => prev.map(source => 
          source.id === sourceId 
            ? { ...source, status: 'running' as const } 
            : source
        ));
        toast.success('Scraper reanudado');
        return;
      }
      
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          action: 'resume',
          sourceId,
        }));
      }
    } catch (err) {
      toast.error('Error al reanudar el scraper');
      console.error('Error resuming scraper:', err);
    }
  }, []);

  const clearLogs = useCallback((sourceId: string) => {
    setSources(prev => prev.map(source => 
      source.id === sourceId 
        ? { ...source, logs: [] } 
        : source
    ));
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      if (process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 500));
        initializeMockData();
      } else {
        // En producción, solicitar estado actual
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            action: 'refresh',
          }));
        }
      }
    } catch (err) {
      console.error('Error refreshing:', err);
    } finally {
      setLoading(false);
    }
  }, [initializeMockData]);

  // Efectos
  useEffect(() => {
    connectWebSocket();
    
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connectWebSocket]);

  return {
    sources,
    metrics,
    loading,
    error,
    connected,
    startScraper,
    stopScraper,
    pauseScraper,
    resumeScraper,
    clearLogs,
    refresh,
  };
}