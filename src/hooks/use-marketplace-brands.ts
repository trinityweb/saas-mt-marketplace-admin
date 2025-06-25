import { useState, useEffect, useCallback } from 'react';
import { marketplaceApi, type MarketplaceBrand, type MarketplaceBrandFilters } from '@/lib/api';

interface UseMarketplaceBrandsOptions {
  adminToken?: string;
}

interface PaginationInfo {
  offset: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export const useMarketplaceBrands = (options: UseMarketplaceBrandsOptions = {}) => {
  const [brands, setBrands] = useState<MarketplaceBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    offset: 0,
    limit: 20,
    total: 0,
    total_pages: 0,
    has_next: false,
    has_prev: false
  });
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    unverified: 0,
    active: 0,
    inactive: 0
  });

  const loadBrands = useCallback(async (filters: MarketplaceBrandFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await marketplaceApi.getAllMarketplaceBrands({
        page_size: 20,
        page: 1,
        ...filters
      }, options.adminToken);
      
      if (response.error) {
        setError(response.error);
        return;
      }

      if (response.data) {
        setBrands(response.data.brands || []);
        
        // Actualizar información de paginación desde la respuesta de la API
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading brands');
    } finally {
      setLoading(false);
    }
  }, [options.adminToken]);

  const loadStatistics = useCallback(async () => {
    try {
      // Cargar todas las marcas para calcular estadísticas
      const response = await marketplaceApi.getAllMarketplaceBrands({
        page_size: 1000,
        page: 1
      }, options.adminToken);
      
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
  }, [options.adminToken]);

  const loadPage = useCallback(async (pageNumber: number, pageSize: number = 20) => {
    // pageNumber es 1-based, enviamos directamente al backend
    await loadBrands({ page: pageNumber, page_size: pageSize });
  }, [loadBrands]);

  const verifyBrand = useCallback(async (brandId: string) => {
    try {
      const response = await marketplaceApi.verifyMarketplaceBrand(brandId, options.adminToken);
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Refrescar datos
      await Promise.all([loadBrands(), loadStatistics()]);
      return response.data;
    } catch (err) {
      throw err;
    }
  }, [options.adminToken, loadBrands, loadStatistics]);

  const unverifyBrand = useCallback(async (brandId: string) => {
    try {
      const response = await marketplaceApi.unverifyMarketplaceBrand(brandId, options.adminToken);
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Refrescar datos
      await Promise.all([loadBrands(), loadStatistics()]);
      return response.data;
    } catch (err) {
      throw err;
    }
  }, [options.adminToken, loadBrands, loadStatistics]);

  const updateBrand = useCallback(async (brandId: string, updates: Partial<MarketplaceBrand>) => {
    try {
      const response = await marketplaceApi.updateMarketplaceBrand(brandId, updates, options.adminToken);
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Refrescar datos
      await Promise.all([loadBrands(), loadStatistics()]);
      return response.data;
    } catch (err) {
      throw err;
    }
  }, [options.adminToken, loadBrands, loadStatistics]);

  const deleteBrand = useCallback(async (brandId: string) => {
    try {
      const response = await marketplaceApi.deleteMarketplaceBrand(brandId, options.adminToken);
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Refrescar datos
      await Promise.all([loadBrands(), loadStatistics()]);
      return response.data;
    } catch (err) {
      throw err;
    }
  }, [options.adminToken, loadBrands, loadStatistics]);

  const createBrand = useCallback(async (brandData: Partial<MarketplaceBrand>) => {
    try {
      const response = await marketplaceApi.createMarketplaceBrand(brandData, options.adminToken);
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Refrescar datos
      await Promise.all([loadBrands(), loadStatistics()]);
      return response.data;
    } catch (err) {
      throw err;
    }
  }, [options.adminToken, loadBrands, loadStatistics]);

  // Cargar datos iniciales
  useEffect(() => {
    loadBrands();
    loadStatistics();
  }, [loadBrands, loadStatistics]);

  return {
    brands,
    loading,
    error,
    pagination,
    stats,
    loadBrands,
    loadPage,
    loadStatistics,
    verifyBrand,
    unverifyBrand,
    updateBrand,
    deleteBrand,
    createBrand,
    refetch: () => Promise.all([loadBrands(), loadStatistics()])
  };
}; 