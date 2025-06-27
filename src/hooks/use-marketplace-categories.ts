'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { marketplaceApi, MarketplaceCategory, CreateMarketplaceCategoryRequest } from '@/lib/api';

interface MarketplaceCategoryFilters {
  search?: string;
  is_active?: boolean;
  parent_id?: string;
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
}

interface PaginationInfo {
  total: number;
  offset: number;
  limit: number;
  has_next: boolean;
  has_prev: boolean;
  total_pages: number;
}

interface UseMarketplaceCategoriesOptions {
  autoLoad?: boolean;
  adminToken?: string;
  initialFilters?: MarketplaceCategoryFilters;
}

interface UseMarketplaceCategoriesReturn {
  categories: MarketplaceCategory[];
  loading: boolean;
  error: string | null;
  pagination: PaginationInfo;
  filters: MarketplaceCategoryFilters;
  setFilters: (newFilters: Partial<MarketplaceCategoryFilters>) => void;
  createCategory: (category: CreateMarketplaceCategoryRequest) => Promise<boolean>;
  updateCategory: (id: string, category: Partial<MarketplaceCategory>) => Promise<boolean>;
  deleteCategory: (id: string) => Promise<boolean>;
  refreshCategories: () => Promise<void>;
  syncChanges: () => Promise<boolean>;
}

export function useMarketplaceCategories(
  options: UseMarketplaceCategoriesOptions = {}
): UseMarketplaceCategoriesReturn {
  const { autoLoad = true, adminToken = '', initialFilters = {} } = options;
  
  const [categories, setCategories] = useState<MarketplaceCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<MarketplaceCategoryFilters>(initialFilters);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    offset: 0,
    limit: 20,
    has_next: false,
    has_prev: false,
    total_pages: 0,
  });

  const setFilters = useCallback((newFilters: Partial<MarketplaceCategoryFilters>) => {
    setFiltersState(prevFilters => ({
      ...prevFilters,
      ...newFilters,
      ...(Object.keys(newFilters).some(key => !['page', 'page_size', 'sort_by', 'sort_dir'].includes(key)) ? { page: 1 } : {}),
    }));
  }, []);

  const refreshCategories = useCallback(async () => {
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
      const response = await marketplaceApi.getAllMarketplaceCategories({
        page: filters.page,
        page_size: filters.page_size,
        sort_by: filters.sort_by,
        sort_dir: filters.sort_dir,
        search: filters.search,
        is_active: filters.is_active,
        parent_id: filters.parent_id,
      }, token);
      
      if (response.error) {
        setError(response.error);
        setCategories([]);
        setPagination({
          total: 0,
          offset: 0,
          limit: filters.page_size || 20,
          has_next: false,
          has_prev: false,
          total_pages: 0,
        });
        return;
      }

      if (response.data) {
        setCategories(response.data.categories || []);
        setPagination(response.data.pagination);
      }
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      setError(err.message || 'Error al cargar categorías');
      setCategories([]);
      setPagination({
        total: 0,
        offset: 0,
        limit: filters.page_size || 20,
        has_next: false,
        has_prev: false,
        total_pages: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [adminToken, filters]);

  const createCategory = useCallback(async (category: CreateMarketplaceCategoryRequest): Promise<boolean> => {
    const token = adminToken || 
      (typeof window !== 'undefined' ? localStorage.getItem('iam_access_token') : null) ||
      'dev-marketplace-admin';
    
    if (!token) {
      console.warn('No admin token available');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await marketplaceApi.createMarketplaceCategory(category, token);
      
      if (response.error) {
        throw new Error(response.error);
      } else {
        await refreshCategories();
        return true;
      }
    } catch (err: any) {
      console.error('Error creating category:', err);
      setError(err.message || 'Error al crear la categoría');
      return false;
    } finally {
      setLoading(false);
    }
  }, [adminToken, refreshCategories]);

  const updateCategory = useCallback(async (id: string, updates: Partial<MarketplaceCategory>): Promise<boolean> => {
    const token = adminToken || 
      (typeof window !== 'undefined' ? localStorage.getItem('iam_access_token') : null) ||
      'dev-marketplace-admin';
    
    if (!token) {
      console.warn('No admin token available');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await marketplaceApi.updateMarketplaceCategory(id, updates, token);
      
      if (response.error) {
        throw new Error(response.error);
      } else {
        await refreshCategories();
        return true;
      }
    } catch (err: any) {
      console.error('Error updating category:', err);
      setError(err.message || 'Error al actualizar la categoría');
      return false;
    } finally {
      setLoading(false);
    }
  }, [adminToken, refreshCategories]);

  const deleteCategory = useCallback(async (id: string): Promise<boolean> => {
    const token = adminToken || 
      (typeof window !== 'undefined' ? localStorage.getItem('iam_access_token') : null) ||
      'dev-marketplace-admin';
    
    if (!token) {
      console.warn('No admin token available');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await marketplaceApi.deleteMarketplaceCategory(id, token);
      if (response.error) {
        throw new Error(response.error);
      }
      await refreshCategories();
      return true;
    } catch (err: any) {
      console.error('Error deleting category:', err);
      setError(err.message || 'Error al eliminar la categoría');
      return false;
    } finally {
      setLoading(false);
    }
  }, [adminToken, refreshCategories]);

  const syncChanges = useCallback(async (): Promise<boolean> => {
    const token = adminToken || 
      (typeof window !== 'undefined' ? localStorage.getItem('iam_access_token') : null) ||
      'dev-marketplace-admin';
    
    if (!token) {
      console.warn('No admin token available');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await marketplaceApi.syncMarketplaceChanges(token);
      
      if (response.error) {
        throw new Error(response.error);
      } else {
        return true;
      }
    } catch (err: any) {
      console.error('Error syncing changes:', err);
      setError('Error al sincronizar cambios');
      return false;
    } finally {
      setLoading(false);
    }
  }, [adminToken]);

  useEffect(() => {
    if (typeof window !== 'undefined' && autoLoad) {
      refreshCategories();
    }
  }, [autoLoad, refreshCategories, filters]);

  return {
    categories,
    loading,
    error,
    pagination,
    filters,
    setFilters,
    createCategory,
    updateCategory,
    deleteCategory,
    refreshCategories,
    syncChanges,
  };
} 