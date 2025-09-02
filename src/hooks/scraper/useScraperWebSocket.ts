'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface ScraperEvent {
  type: 'job_started' | 'job_progress' | 'job_completed' | 'job_failed' | 'product_found' | 'error';
  job_id?: string;
  source_id?: string;
  source_name?: string;
  progress?: number;
  products_found?: number;
  message?: string;
  data?: any;
  timestamp?: string;
}

interface UseScraperWebSocketOptions {
  autoConnect?: boolean;
  reconnectDelay?: number;
  maxReconnectAttempts?: number;
  onMessage?: (event: ScraperEvent) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

export function useScraperWebSocket(options: UseScraperWebSocketOptions = {}) {
  const {
    autoConnect = true,
    reconnectDelay = 5000,
    maxReconnectAttempts = 5,
    onMessage,
    onConnect,
    onDisconnect,
    onError,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<ScraperEvent | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      // Por ahora deshabilitamos WebSocket ya que el backend no lo soporta
      // Usar polling como fallback directo
      console.log('[WebSocket] WebSocket not available, using polling');
      useFallbackPolling();
      return;
      
      // Código WebSocket comentado para cuando esté disponible
      /*
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8086/ws';
      console.log('[WebSocket] Connecting to:', wsUrl);
      const ws = new WebSocket(wsUrl);
      */
      
      ws.onopen = () => {
        console.log('[WebSocket] Connected');
        setIsConnected(true);
        setReconnectAttempts(0);
        onConnect?.();
        
        // Enviar mensaje de suscripción si es necesario
        ws.send(JSON.stringify({
          type: 'subscribe',
          channels: ['scraping_events']
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as ScraperEvent;
          console.log('[WebSocket] Message received:', data);
          
          setLastEvent(data);
          onMessage?.(data);
          
          // Mostrar notificaciones para eventos importantes
          if (data.type === 'job_completed') {
            toast({
              title: 'Scraping completado',
              description: `${data.source_name}: ${data.products_found} productos encontrados`,
            });
          } else if (data.type === 'job_failed') {
            toast({
              title: 'Scraping fallido',
              description: data.message || 'Error durante el proceso de scraping',
              variant: 'destructive',
            });
          }
        } catch (error) {
          console.error('[WebSocket] Error parsing message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('[WebSocket] Error:', error);
        onError?.(new Error('WebSocket error'));
      };

      ws.onclose = (event) => {
        console.log('[WebSocket] Disconnected:', event.code, event.reason);
        setIsConnected(false);
        wsRef.current = null;
        onDisconnect?.();
        
        // Intentar reconectar si no fue cerrado intencionalmente
        if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
          setReconnectAttempts(prev => prev + 1);
          console.log(`[WebSocket] Reconnecting in ${reconnectDelay}ms... (attempt ${reconnectAttempts + 1}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectDelay);
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('[WebSocket] Failed to connect:', error);
      setIsConnected(false);
      onError?.(error as Error);
      
      // Fallback a polling si WebSocket no está disponible
      useFallbackPolling();
    }
  }, [reconnectAttempts, maxReconnectAttempts, reconnectDelay, onConnect, onDisconnect, onError, onMessage, toast]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Client disconnect');
      wsRef.current = null;
    }
    
    setIsConnected(false);
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    }
    console.warn('[WebSocket] Cannot send message, not connected');
    return false;
  }, []);

  // Fallback: Polling si WebSocket no está disponible
  const useFallbackPolling = useCallback(() => {
    console.log('[Polling] Using polling for real-time updates');
    
    const pollInterval = setInterval(async () => {
      try {
        // Usar el historial como fuente de datos
        const response = await fetch('http://localhost:8001/scraper/api/v1/scraping/history');
        if (response.ok) {
          const history = await response.json();
          
          // Buscar jobs en progreso o pendientes
          history.forEach((job: any) => {
            if (job.status === 'pending' || job.status === 'running') {
              const event: ScraperEvent = {
                type: 'job_progress',
                job_id: job.job_id,
                source_id: job.source,
                progress: job.status === 'running' ? 50 : 10,
                products_found: job.products_scraped || 0,
                timestamp: new Date().toISOString(),
              };
              onMessage?.(event);
            }
          });
        }
      } catch (error) {
        console.error('[Polling] Error:', error);
      }
    }, 5000); // Poll cada 5 segundos
    
    return () => clearInterval(pollInterval);
  }, [onMessage]);

  // Auto-conectar si está habilitado
  useEffect(() => {
    if (autoConnect) {
      connect();
    }
    
    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    isConnected,
    lastEvent,
    connect,
    disconnect,
    sendMessage,
    reconnectAttempts,
  };
}