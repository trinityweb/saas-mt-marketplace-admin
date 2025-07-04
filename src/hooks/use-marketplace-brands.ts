import { useState, useEffect, useCallback } from 'react';
import { marketplaceApi, type MarketplaceBrand, type MarketplaceBrandFilters } from '@/lib/api';

interface UseMarketplaceBrandsOptions {
  adminToken?: string;
  initialFilters?: MarketplaceBrandFilters;
}

interface PaginationInfo {
  offset: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
  page: number;
}

interface UseMarketplaceBrandsReturn {
  brands: MarketplaceBrand[];
  loading: boolean;
  error: string | null;
  pagination: PaginationInfo;
  stats: {
    total: number;
    verified: number;
    unverified: number;
    active: number;
    inactive: number;
  };
  filters: MarketplaceBrandFilters;
  setFilters: (filters: Partial<MarketplaceBrandFilters>) => void;
  loadBrands: (filters?: MarketplaceBrandFilters) => Promise<void>;
  loadPage: (pageNumber: number, pageSize?: number) => Promise<void>;
  loadStatistics: () => Promise<void>;
  verifyBrand: (brandId: string) => Promise<any>;
  unverifyBrand: (brandId: string) => Promise<any>;
  updateBrand: (brandId: string, updates: Partial<MarketplaceBrand>) => Promise<any>;
  deleteBrand: (brandId: string) => Promise<any>;
  createBrand: (brandData: Partial<MarketplaceBrand>) => Promise<any>;
}

export const useMarketplaceBrands = (options: UseMarketplaceBrandsOptions = {}): UseMarketplaceBrandsReturn => {
  const { adminToken, initialFilters = {} } = options;
  const [filters, setFiltersState] = useState<MarketplaceBrandFilters>(initialFilters);
  const [brands, setBrands] = useState<MarketplaceBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    offset: 0,
    limit: 20,
    total: 0,
    total_pages: 0,
    has_next: false,
    has_prev: false,
    page: 1
  });
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    unverified: 0,
    active: 0,
    inactive: 0
  });

  const setFilters = useCallback((newFilters: Partial<MarketplaceBrandFilters>) => {
    setFiltersState(prev => ({
      ...prev,
      ...newFilters,
      // Reset page to 1 if any filter other than page/page_size changes
      ...(Object.keys(newFilters).some(key => !['page', 'page_size'].includes(key)) ? { page: 1 } : {}),
    }));
  }, []);

  const loadBrands = useCallback(async (filterOverrides: MarketplaceBrandFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const currentFilters = { ...filters, ...filterOverrides };
      
      const response = await marketplaceApi.getAllMarketplaceBrands({
        page_size: 20,
        page: 1,
        ...currentFilters
      }, adminToken);
      
      if (response.error) {
        setError(response.error);
        return;
      }

      if (response.data) {
        setBrands(response.data.brands || []);
        
        // Actualizar información de paginación desde la respuesta de la API
        if (response.data.pagination) {
          const paginationData = response.data.pagination;
          setPagination({
            ...paginationData,
            page: Math.floor(paginationData.offset / paginationData.limit) + 1
          });
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading brands');
    } finally {
      setLoading(false);
    }
  }, [filters, adminToken]);

  const loadStatistics = useCallback(async () => {
    try {
      // Cargar todas las marcas para calcular estadísticas
      const response = await marketplaceApi.getAllMarketplaceBrands({
        page_size: 1000,
        page: 1
      }, adminToken);
      
      if (response.data && response.data.brands) {
        const brands = response.data.brands;
        const verified = brands.filter(b => b.verification_status === 'verified').length;
        const active = brands.filter(b => b.is_active !== false).length;
        
        setStats({
          total: brands.length,
          verified: verified,
          unverified: brands.length - verified,
          active: active,
          inactive: brands.length - active
        });
      }
    } catch (err) {
      console.error('Error loading statistics:', err);
    }
  }, [adminToken]);

  const loadPage = useCallback(async (pageNumber: number, pageSize: number = 20) => {
    await loadBrands({ page: pageNumber, page_size: pageSize });
  }, [loadBrands]);

  const verifyBrand = useCallback(async (brandId: string) => {
    try {
      const response = await marketplaceApi.verifyMarketplaceBrand(brandId, adminToken);
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Refrescar datos
      await Promise.all([loadBrands(), loadStatistics()]);
      return response.data;
    } catch (err) {
      throw err;
    }
  }, [adminToken, loadBrands, loadStatistics]);

  const unverifyBrand = useCallback(async (brandId: string) => {
    try {
      const response = await marketplaceApi.unverifyMarketplaceBrand(brandId, adminToken);
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Refrescar datos
      await Promise.all([loadBrands(), loadStatistics()]);
      return response.data;
    } catch (err) {
      throw err;
    }
  }, [adminToken, loadBrands, loadStatistics]);

  const updateBrand = useCallback(async (brandId: string, updates: Partial<MarketplaceBrand>) => {
    try {
      const response = await marketplaceApi.updateMarketplaceBrand(brandId, updates, adminToken);
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Refrescar datos
      await Promise.all([loadBrands(), loadStatistics()]);
      return response.data;
    } catch (err) {
      throw err;
    }
  }, [adminToken, loadBrands, loadStatistics]);

  const deleteBrand = useCallback(async (brandId: string) => {
    try {
      const response = await marketplaceApi.deleteMarketplaceBrand(brandId, adminToken);
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Refrescar datos
      await Promise.all([loadBrands(), loadStatistics()]);
      return response.data;
    } catch (err) {
      throw err;
    }
  }, [adminToken, loadBrands, loadStatistics]);

  const createBrand = useCallback(async (brandData: Partial<MarketplaceBrand>) => {
    try {
      const response = await marketplaceApi.createMarketplaceBrand(brandData, adminToken);
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Refrescar datos
      await Promise.all([loadBrands(), loadStatistics()]);
      return response.data;
    } catch (err) {
      throw err;
    }
  }, [adminToken, loadBrands, loadStatistics]);

  // Cargar datos iniciales y cuando cambien los filtros
  useEffect(() => {
    loadBrands();
    loadStatistics();
  }, [filters, loadBrands, loadStatistics]);

  return {
    brands,
    loading,
    error,
    pagination,
    stats,
    filters,
    setFilters,
    loadBrands,
    loadPage,
    loadStatistics,
    verifyBrand,
    unverifyBrand,
    updateBrand,
    deleteBrand,
    createBrand,
  };
}; 