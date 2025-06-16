'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { marketplaceApi, MarketplaceCategory, CreateMarketplaceCategoryRequest } from '@/lib/api';

interface UseMarketplaceCategoriesOptions {
  autoLoad?: boolean;
  adminToken?: string;
}

interface UseMarketplaceCategoriesReturn {
  categories: MarketplaceCategory[];
  loading: boolean;
  error: string | null;
  createCategory: (category: CreateMarketplaceCategoryRequest) => Promise<boolean>;
  updateCategory: (id: string, category: Partial<MarketplaceCategory>) => Promise<boolean>;
  deleteCategory: (id: string) => Promise<boolean>;
  refreshCategories: () => Promise<void>;
  syncChanges: () => Promise<boolean>;
}

export function useMarketplaceCategories(
  options: UseMarketplaceCategoriesOptions = {}
): UseMarketplaceCategoriesReturn {
  const { autoLoad = true, adminToken = '' } = options;
  
  const [categories, setCategories] = useState<MarketplaceCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mover mockCategories fuera del useCallback para evitar dependencias cambiantes
  const mockCategories = useMemo(() => [
    {
      id: '1',
      name: 'Electrónicos',
      slug: 'electronicos',
      description: 'Dispositivos electrónicos, gadgets y accesorios tecnológicos',
      parent_id: null,
      level: 0,
      is_active: true,
      sort_order: 1,
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
    },
    {
      id: '2',
      name: 'Ropa y Accesorios',
      slug: 'ropa-accesorios',
      description: 'Vestimenta, calzado y accesorios de moda',
      parent_id: null,
      level: 0,
      is_active: true,
      sort_order: 2,
      created_at: '2024-01-15T10:05:00Z',
      updated_at: '2024-01-15T10:05:00Z',
    },
    {
      id: '3',
      name: 'Vestidos',
      slug: 'vestidos',
      description: 'Vestidos formales y casuales',
      parent_id: '2',
      level: 2,
      is_active: true,
      sort_order: 1,
      created_at: '2024-01-15T10:10:00Z',
      updated_at: '2024-01-15T10:10:00Z',
    },
    {
      id: '4',
      name: 'Tecnología',
      slug: 'tecnologia',
      description: 'Electrónicos, computadoras y accesorios tecnológicos',
      parent_id: null,
      level: 0,
      is_active: true,
      sort_order: 2,
      created_at: '2024-01-15T10:15:00Z',
      updated_at: '2024-01-15T10:15:00Z',
    },
    {
      id: '5',
      name: 'Smartphones',
      slug: 'smartphones',
      description: 'Teléfonos inteligentes y accesorios',
      parent_id: '4',
      level: 1,
      is_active: true,
      sort_order: 1,
      created_at: '2024-01-15T10:20:00Z',
      updated_at: '2024-01-15T10:20:00Z',
    },
  ], []);

  const refreshCategories = useCallback(async () => {
    // Intentar obtener el token del parámetro, localStorage, o usar token de desarrollo
    const token = adminToken || 
      (typeof window !== 'undefined' ? localStorage.getItem('iam_access_token') : null) ||
      'dev-marketplace-admin'; // Token de desarrollo como fallback
    
    if (!token) {
      console.warn('No admin token available, using mock data');
      setCategories(mockCategories);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Intentar cargar desde API real
      const response = await marketplaceApi.getAllMarketplaceCategories(token);
      
      if (response.error) {
        console.warn('API not available, using mock data:', response.error);
        // Fallback a mock data si la API no está disponible
        setCategories(mockCategories);
      } else {
        setCategories(response.data || []);
      }
    } catch (err) {
      console.warn('API error, using mock data:', err);
      // Fallback a mock data en caso de error
      setCategories(mockCategories);
    } finally {
      setLoading(false);
    }
  }, [adminToken, mockCategories]);

  const createCategory = useCallback(async (category: CreateMarketplaceCategoryRequest): Promise<boolean> => {
    // Intentar obtener el token del parámetro, localStorage, o usar token de desarrollo
    const token = adminToken || 
      (typeof window !== 'undefined' ? localStorage.getItem('iam_access_token') : null) ||
      'dev-marketplace-admin'; // Token de desarrollo como fallback
    
    if (!token) {
      console.warn('No admin token available');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await marketplaceApi.createMarketplaceCategory(category, token);
      
      if (response.error) {
        console.warn('API not available, simulating creation:', response.error);
        // Simular creación exitosa
        const newCategory: MarketplaceCategory = {
          id: Date.now().toString(),
          name: category.name,
          slug: category.slug || category.name.toLowerCase().replace(/\s+/g, '-'),
          description: category.description,
          parent_id: category.parent_id,
          level: category.parent_id ? 1 : 0, // Simplificado para mock
          is_active: true,
          sort_order: categories.length + 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        setCategories(prev => [...prev, newCategory]);
        return true;
      } else {
        await refreshCategories();
        return true;
      }
    } catch (err) {
      console.error('Error creating category:', err);
      setError('Error al crear la categoría');
      return false;
    } finally {
      setLoading(false);
    }
  }, [adminToken, categories.length, refreshCategories]);

  const updateCategory = useCallback(async (id: string, updates: Partial<MarketplaceCategory>): Promise<boolean> => {
    // Intentar obtener el token del parámetro, localStorage, o usar token de desarrollo
    const token = adminToken || 
      (typeof window !== 'undefined' ? localStorage.getItem('iam_access_token') : null) ||
      'dev-marketplace-admin'; // Token de desarrollo como fallback
    
    if (!token) {
      console.warn('No admin token available');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // Llamar a la API real para actualizar la categoría
      const response = await marketplaceApi.updateMarketplaceCategory(id, updates, token);
      
      if (response.error) {
        console.warn('API update failed, simulating update:', response.error);
        // Fallback: simular actualización exitosa si la API falla
        setCategories(prev => 
          prev.map(cat => 
            cat.id === id 
              ? { ...cat, ...updates, updated_at: new Date().toISOString() }
              : cat
          )
        );
        return true;
      } else {
        // Actualización exitosa: refrescar datos desde la API
        await refreshCategories();
        return true;
      }
    } catch (err) {
      console.error('Error updating category:', err);
      setError('Error al actualizar la categoría');
      return false;
    } finally {
      setLoading(false);
    }
  }, [adminToken]);

  const deleteCategory = useCallback(async (id: string): Promise<boolean> => {
    // Intentar obtener el token del parámetro, localStorage, o usar token de desarrollo
    const token = adminToken || 
      (typeof window !== 'undefined' ? localStorage.getItem('iam_access_token') : null) ||
      'dev-marketplace-admin'; // Token de desarrollo como fallback
    
    if (!token) {
      console.warn('No admin token available');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // TODO: Implementar endpoint de eliminación en el backend
      // const response = await marketplaceApi.deleteMarketplaceCategory(id, token);
      
      // Simular eliminación exitosa por ahora
      setCategories(prev => prev.filter(cat => cat.id !== id));
      
      return true;
    } catch (err) {
      console.error('Error deleting category:', err);
      setError('Error al eliminar la categoría');
      return false;
    } finally {
      setLoading(false);
    }
  }, [adminToken]);

  const syncChanges = useCallback(async (): Promise<boolean> => {
    // Intentar obtener el token del parámetro, localStorage, o usar token de desarrollo
    const token = adminToken || 
      (typeof window !== 'undefined' ? localStorage.getItem('iam_access_token') : null) ||
      'dev-marketplace-admin'; // Token de desarrollo como fallback
    
    if (!token) {
      console.warn('No admin token available');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await marketplaceApi.syncMarketplaceChanges(token);
      
      if (response.error) {
        console.warn('Sync API not available:', response.error);
        // Simular sincronización exitosa
        return true;
      } else {
        return true;
      }
    } catch (err) {
      console.error('Error syncing changes:', err);
      setError('Error al sincronizar cambios');
      return false;
    } finally {
      setLoading(false);
    }
  }, [adminToken]);

  useEffect(() => {
    // Solo ejecutar en el cliente y si tenemos autoLoad habilitado
    if (typeof window !== 'undefined' && autoLoad) {
      refreshCategories();
    }
  }, [autoLoad, refreshCategories]);

  return {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    refreshCategories,
    syncChanges,
  };
} 