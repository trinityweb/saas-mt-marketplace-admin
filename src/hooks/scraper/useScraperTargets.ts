'use client';

import { useState, useEffect, useCallback } from 'react';
import { scraperAPI, ScraperTarget } from '@/lib/api/scraper/scraper-api';
import { useToast } from '@/hooks/use-toast';

export function useScraperTargets() {
  const [targets, setTargets] = useState<ScraperTarget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchTargets = useCallback(async () => {
    try {
      setLoading(true);
      const data = await scraperAPI.getTargets();
      setTargets(data);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch targets';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTargets();
  }, [fetchTargets]);

  const toggleTarget = useCallback(async (targetName: string, enabled: boolean) => {
    try {
      // Intentar actualizar en el backend
      const result = await scraperAPI.toggleSource(targetName, enabled);
      
      // Si el backend no tiene el endpoint implementado, actualizamos localmente
      if (result?.local_only) {
        setTargets(prev => prev.map(target => 
          target.name === targetName ? { ...target, is_active: enabled, enabled } : target
        ));
        
        toast({
          title: enabled ? 'Fuente habilitada' : 'Fuente deshabilitada',
          description: `${targetName} ha sido ${enabled ? 'habilitada' : 'deshabilitada'} (local)`,
        });
      } else {
        // Si el backend respondió correctamente, refrescar la lista
        await fetchTargets();
        
        toast({
          title: enabled ? 'Fuente habilitada' : 'Fuente deshabilitada',
          description: `${targetName} ha sido ${enabled ? 'habilitada' : 'deshabilitada'}`,
        });
      }
    } catch (err) {
      // En caso de error, actualizar localmente para no bloquear el UI
      setTargets(prev => prev.map(target => 
        target.name === targetName ? { ...target, is_active: enabled, enabled } : target
      ));
      
      console.error('Error toggling target:', err);
      
      toast({
        title: 'Advertencia',
        description: 'Estado actualizado localmente. El backend no está disponible.',
        variant: 'default',
      });
    }
  }, [toast, fetchTargets]);

  const refreshTarget = useCallback(async (targetName: string) => {
    try {
      const response = await scraperAPI.startScraping({
        target_name: targetName,
        force: true,
      });
      
      if (response && response.success) {
        toast({
          title: 'Scraping iniciado',
          description: response.message || `Actualizando datos de ${targetName}`,
        });

        // Actualizar inmediatamente el campo last_run localmente
        setTargets(prev => prev.map(target => 
          (target.name === targetName || target.source_id === targetName) 
            ? { ...target, last_run: new Date().toISOString() } 
            : target
        ));

        // Refrescar los targets después de un tiempo para obtener datos actualizados
        setTimeout(() => {
          fetchTargets();
        }, 2000);
        
        // Hacer otro refresh más tarde para obtener resultados del scraping
        setTimeout(() => {
          fetchTargets();
        }, 10000);
      } else {
        toast({
          title: 'Error',
          description: response?.message || 'No se pudo iniciar el scraping',
          variant: 'destructive',
        });
      }

      return response;
    } catch (err) {
      console.error('Error starting scraping:', err);
      
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      
      toast({
        title: 'Error al iniciar scraping',
        description: errorMessage,
        variant: 'destructive',
      });
      
      return null;
    }
  }, [toast, fetchTargets]);

  return {
    targets,
    loading,
    error,
    refresh: fetchTargets,
    toggleTarget,
    refreshTarget,
  };
}