'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { businessTypesApi, BusinessType, BusinessTypesFilters } from '@/lib/api/business-types';

interface UseBusinessTypesOptions {
  autoLoad?: boolean;
  adminToken?: string;
  initialFilters?: BusinessTypesFilters;
}

interface UseBusinessTypesReturn {
  businessTypes: BusinessType[];
  loading: boolean;
  error: string | null;
  pagination: {
    total_count: number;
    page: number;
    page_size: number;
    total_pages: number;
  };
  filters: BusinessTypesFilters;
  setFilters: (newFilters: Partial<BusinessTypesFilters>) => void;
  createBusinessType: (businessType: Omit<BusinessType, 'id' | 'created_at' | 'updated_at' | 'is_active'>) => Promise<boolean>;
  updateBusinessType: (id: string, updates: Partial<BusinessType>) => Promise<boolean>;
  deleteBusinessType: (id: string) => Promise<boolean>;
  refreshBusinessTypes: () => Promise<void>;
}

export function useBusinessTypes(
  options: UseBusinessTypesOptions = {}
): UseBusinessTypesReturn {
  const { autoLoad = true, adminToken = '', initialFilters = {} } = options;
  
  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total_count: 0,
    page: 1,
    page_size: 10,
    total_pages: 0,
  });
  const [filters, setFiltersState] = useState<BusinessTypesFilters>(initialFilters);

  const setFilters = useCallback((newFilters: Partial<BusinessTypesFilters>) => {
    setFiltersState(prevFilters => ({
      ...prevFilters,
      ...newFilters,
      // Reset page to 1 if any filter other than page/page_size changes
      ...(Object.keys(newFilters).some(key => !['page', 'page_size'].includes(key)) ? { page: 1 } : {}),
    }));
  }, []);

  const refreshBusinessTypes = useCallback(async () => {
    const token = adminToken || 
      (typeof window !== 'undefined' ? localStorage.getItem('iam_access_token') : null) ||
      'dev-marketplace-admin';
    
    if (!token) {
      console.warn('No admin token available');
      setError('No authentication token available.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await businessTypesApi.getBusinessTypes(filters);
      setBusinessTypes(response.items);
      setPagination({
        total_count: response.total_count,
        page: response.page,
        page_size: response.page_size,
        total_pages: response.total_pages,
      });
    } catch (err: any) {
      console.error('Error fetching business types:', err);
      setError(err.message || 'Error al cargar tipos de negocio');
      setBusinessTypes([]);
      setPagination({
        total_count: 0,
        page: filters.page || 1,
        page_size: filters.page_size || 10,
        total_pages: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [adminToken, filters]);

  const createBusinessType = useCallback(async (businessType: Omit<BusinessType, 'id' | 'created_at' | 'updated_at' | 'is_active'>): Promise<boolean> => {
    const token = adminToken || 
      (typeof window !== 'undefined' ? localStorage.getItem('iam_access_token') : null) ||
      'dev-marketplace-admin';
    
    if (!token) {
      console.warn('No admin token available');
      setError('No authentication token available.');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      await businessTypesApi.createBusinessType(businessType);
      await refreshBusinessTypes();
      return true;
    } catch (err: any) {
      console.error('Error creating business type:', err);
      setError(err.message || 'Error al crear tipo de negocio');
      return false;
    } finally {
      setLoading(false);
    }
  }, [adminToken, refreshBusinessTypes]);

  const updateBusinessType = useCallback(async (id: string, updates: Partial<BusinessType>): Promise<boolean> => {
    const token = adminToken || 
      (typeof window !== 'undefined' ? localStorage.getItem('iam_access_token') : null) ||
      'dev-marketplace-admin';
    
    if (!token) {
      console.warn('No admin token available');
      setError('No authentication token available.');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      await businessTypesApi.updateBusinessType(id, updates);
      await refreshBusinessTypes();
      return true;
    } catch (err: any) {
      console.error('Error updating business type:', err);
      setError(err.message || 'Error al actualizar tipo de negocio');
      return false;
    } finally {
      setLoading(false);
    }
  }, [adminToken, refreshBusinessTypes]);

  const deleteBusinessType = useCallback(async (id: string): Promise<boolean> => {
    const token = adminToken || 
      (typeof window !== 'undefined' ? localStorage.getItem('iam_access_token') : null) ||
      'dev-marketplace-admin';
    
    if (!token) {
      console.warn('No admin token available');
      setError('No authentication token available.');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      await businessTypesApi.deleteBusinessType(id);
      await refreshBusinessTypes();
      return true;
    } catch (err: any) {
      console.error('Error deleting business type:', err);
      setError(err.message || 'Error al eliminar tipo de negocio');
      return false;
    } finally {
      setLoading(false);
    }
  }, [adminToken, refreshBusinessTypes]);

  // Efecto para cargar datos iniciales y cuando cambien los filtros
  useEffect(() => {
    if (typeof window !== 'undefined' && autoLoad) {
      refreshBusinessTypes();
    }
  }, [autoLoad, filters, refreshBusinessTypes]);

  return {
    businessTypes,
    loading,
    error,
    pagination,
    filters,
    setFilters,
    createBusinessType,
    updateBusinessType,
    deleteBusinessType,
    refreshBusinessTypes,
  };
}