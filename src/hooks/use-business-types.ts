'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { marketplaceApi, BusinessType, CreateBusinessTypeRequest, UpdateBusinessTypeRequest } from '@/lib/api';

interface UseBusinessTypesOptions {
  autoLoad?: boolean;
  adminToken?: string;
  onlyActive?: boolean;
}

interface UseBusinessTypesReturn {
  businessTypes: BusinessType[];
  loading: boolean;
  error: string | null;
  createBusinessType: (businessType: CreateBusinessTypeRequest) => Promise<boolean>;
  updateBusinessType: (id: string, updates: UpdateBusinessTypeRequest) => Promise<boolean>;
  deleteBusinessType: (id: string) => Promise<boolean>;
  refreshBusinessTypes: () => Promise<void>;
}

export function useBusinessTypes(
  options: UseBusinessTypesOptions = {}
): UseBusinessTypesReturn {
  const { autoLoad = true, adminToken = '', onlyActive = false } = options;
  
  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock data como fallback
  const mockBusinessTypes = useMemo(() => [
    {
      id: '1',
      code: 'retail',
      name: 'Comercio Minorista',
      description: 'Tiendas de venta al por menor, supermercados, minimarkets',
      icon: 'store',
      color: '#3B82F6',
      is_active: true,
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
    },
    {
      id: '2',
      code: 'food-beverage',
      name: 'Alimentos y Bebidas',
      description: 'Restaurantes, cafeterías, distribuidores de alimentos',
      icon: 'utensils',
      color: '#10B981',
      is_active: true,
      created_at: '2024-01-15T10:05:00Z',
      updated_at: '2024-01-15T10:05:00Z',
    },
    {
      id: '3',
      code: 'fashion',
      name: 'Moda y Vestimenta',
      description: 'Tiendas de ropa, accesorios y calzado',
      icon: 'shirt',
      color: '#F59E0B',
      is_active: true,
      created_at: '2024-01-15T10:10:00Z',
      updated_at: '2024-01-15T10:10:00Z',
    },
    {
      id: '4',
      code: 'electronics',
      name: 'Electrónicos',
      description: 'Dispositivos electrónicos, computadoras y gadgets',
      icon: 'smartphone',
      color: '#8B5CF6',
      is_active: true,
      created_at: '2024-01-15T10:15:00Z',
      updated_at: '2024-01-15T10:15:00Z',
    },
    {
      id: '5',
      code: 'automotive',
      name: 'Automotriz',
      description: 'Repuestos, accesorios y servicios automotrices',
      icon: 'car',
      color: '#EF4444',
      is_active: false,
      created_at: '2024-01-15T10:20:00Z',
      updated_at: '2024-01-15T10:20:00Z',
    },
  ], []);

  const refreshBusinessTypes = useCallback(async () => {
    // Intentar obtener el token del parámetro, localStorage, o usar token de desarrollo
    const token = adminToken || 
      (typeof window !== 'undefined' ? localStorage.getItem('iam_access_token') : null) ||
      'dev-marketplace-admin'; // Token de desarrollo como fallback
    
    console.log('Using token for API call:', token);
    console.log('API base URL:', process.env.NEXT_PUBLIC_API_URL);

    setLoading(true);
    setError(null);

    try {
      // Intentar cargar desde API real
      const response = await marketplaceApi.getAllBusinessTypes({ only_active: onlyActive }, token);
      
      if (response.error) {
        console.warn('API error, using mock data:', response.error);
        // Fallback a mock data si la API no está disponible
        setBusinessTypes(mockBusinessTypes);
      } else {
        console.log('API success, business types loaded:', response.data?.business_types?.length || 0);
        setBusinessTypes(response.data?.business_types || []);
      }
    } catch (err) {
      console.warn('API error, using mock data:', err);
      // Fallback a mock data en caso de error
      setBusinessTypes(mockBusinessTypes);
    } finally {
      setLoading(false);
    }
  }, [adminToken, onlyActive, mockBusinessTypes]);

  const createBusinessType = useCallback(async (businessType: CreateBusinessTypeRequest): Promise<boolean> => {
    // Intentar obtener el token del parámetro, localStorage, o usar token de desarrollo
    const token = adminToken || 
      (typeof window !== 'undefined' ? localStorage.getItem('iam_access_token') : null) ||
      'dev-marketplace-admin'; // Token de desarrollo como fallback

    setLoading(true);
    setError(null);

    try {
      const response = await marketplaceApi.createBusinessType(businessType, token);
      
      if (response.error) {
        console.warn('API not available, simulating creation:', response.error);
        // Simular creación exitosa
        const newBusinessType: BusinessType = {
          id: Date.now().toString(),
          code: businessType.code,
          name: businessType.name,
          description: businessType.description,
          icon: businessType.icon || 'store',
          color: businessType.color || '#3B82F6',
          metadata: businessType.metadata || {},
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        setBusinessTypes(prev => [...prev, newBusinessType]);
        return true;
      } else {
        await refreshBusinessTypes();
        return true;
      }
    } catch (err) {
      console.error('Error creating business type:', err);
      setError('Error al crear el tipo de negocio');
      return false;
    } finally {
      setLoading(false);
    }
  }, [adminToken, refreshBusinessTypes]);

  const updateBusinessType = useCallback(async (id: string, updates: UpdateBusinessTypeRequest): Promise<boolean> => {
    // Intentar obtener el token del parámetro, localStorage, o usar token de desarrollo
    const token = adminToken || 
      (typeof window !== 'undefined' ? localStorage.getItem('iam_access_token') : null) ||
      'dev-marketplace-admin'; // Token de desarrollo como fallback

    setLoading(true);
    setError(null);

    try {
      const response = await marketplaceApi.updateBusinessType(id, updates, token);
      
      if (response.error) {
        console.warn('API not available, simulating update:', response.error);
        // Simular actualización exitosa
        setBusinessTypes(prev => 
          prev.map(bt => 
            bt.id === id 
              ? { ...bt, ...updates, updated_at: new Date().toISOString() }
              : bt
          )
        );
        return true;
      } else {
        await refreshBusinessTypes();
        return true;
      }
    } catch (err) {
      console.error('Error updating business type:', err);
      setError('Error al actualizar el tipo de negocio');
      return false;
    } finally {
      setLoading(false);
    }
  }, [adminToken, refreshBusinessTypes]);

  const deleteBusinessType = useCallback(async (id: string): Promise<boolean> => {
    // Intentar obtener el token del parámetro, localStorage, o usar token de desarrollo
    const token = adminToken || 
      (typeof window !== 'undefined' ? localStorage.getItem('iam_access_token') : null) ||
      'dev-marketplace-admin'; // Token de desarrollo como fallback

    setLoading(true);
    setError(null);

    try {
      const response = await marketplaceApi.deleteBusinessType(id, token);
      
      if (response.error) {
        console.warn('API not available, simulating deletion:', response.error);
        // Simular eliminación exitosa
        setBusinessTypes(prev => prev.filter(bt => bt.id !== id));
        return true;
      } else {
        await refreshBusinessTypes();
        return true;
      }
    } catch (err) {
      console.error('Error deleting business type:', err);
      setError('Error al eliminar el tipo de negocio');
      return false;
    } finally {
      setLoading(false);
    }
  }, [adminToken, refreshBusinessTypes]);

  // Auto-load en mount y cuando cambie el token
  useEffect(() => {
    if (autoLoad) {
      refreshBusinessTypes();
    }
  }, [autoLoad, refreshBusinessTypes, adminToken]);

  return {
    businessTypes,
    loading,
    error,
    createBusinessType,
    updateBusinessType,
    deleteBusinessType,
    refreshBusinessTypes,
  };
} 