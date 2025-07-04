import { useState, useEffect, useCallback } from 'react';
import { 
  marketplaceApi, 
  type MarketplaceAttribute, 
  type MarketplaceAttributeValue,
  type MarketplaceAttributeWithValues,
  type MarketplaceAttributeFilters,
  type CreateMarketplaceAttributeRequest,
  type CreateMarketplaceAttributeValueRequest,
  type UpdateMarketplaceAttributeRequest,
  type UpdateMarketplaceAttributeValueRequest
} from '@/lib/api';

interface UseMarketplaceAttributesOptions {
  adminToken?: string;
  initialFilters?: MarketplaceAttributeFilters;
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

interface UseMarketplaceAttributesReturn {
  attributes: MarketplaceAttribute[];
  loading: boolean;
  error: string | null;
  pagination: PaginationInfo;
  stats: {
    total: number;
    active: number;
    inactive: number;
    by_type: Record<string, number>;
    by_group: Record<string, number>;
  };
  filters: MarketplaceAttributeFilters;
  setFilters: (filters: Partial<MarketplaceAttributeFilters>) => void;
  loadAttributes: (filters?: MarketplaceAttributeFilters) => Promise<void>;
  loadPage: (pageNumber: number, pageSize?: number) => Promise<void>;
  loadStatistics: () => Promise<void>;
  createAttribute: (attributeData: CreateMarketplaceAttributeRequest) => Promise<MarketplaceAttribute>;
  updateAttribute: (attributeId: string, updates: UpdateMarketplaceAttributeRequest) => Promise<MarketplaceAttribute>;
  deleteAttribute: (attributeId: string) => Promise<void>;
  getAttributeWithValues: (attributeId: string) => Promise<MarketplaceAttributeWithValues>;
  // Métodos para attribute values
  createAttributeValue: (valueData: CreateMarketplaceAttributeValueRequest) => Promise<MarketplaceAttributeValue>;
  updateAttributeValue: (attributeId: string, valueId: string, updates: UpdateMarketplaceAttributeValueRequest) => Promise<MarketplaceAttributeValue>;
  deleteAttributeValue: (attributeId: string, valueId: string) => Promise<void>;
}

export const useMarketplaceAttributes = (options: UseMarketplaceAttributesOptions = {}): UseMarketplaceAttributesReturn => {
  const { adminToken, initialFilters = {} } = options;
  const [filters, setFiltersState] = useState<MarketplaceAttributeFilters>(initialFilters);
  const [attributes, setAttributes] = useState<MarketplaceAttribute[]>([]);
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
    active: 0,
    inactive: 0,
    by_type: {} as Record<string, number>,
    by_group: {} as Record<string, number>
  });

  const setFilters = useCallback((newFilters: Partial<MarketplaceAttributeFilters>) => {
    setFiltersState(prev => ({
      ...prev,
      ...newFilters,
      // Reset page to 1 if any filter other than page/page_size changes
      ...(Object.keys(newFilters).some(key => !['page', 'page_size'].includes(key)) ? { page: 1 } : {}),
    }));
  }, []);

  const loadAttributes = useCallback(async (filterOverrides: MarketplaceAttributeFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const currentFilters = { ...filters, ...filterOverrides };
      
      const response = await marketplaceApi.getAllMarketplaceAttributes({
        page_size: 20,
        page: 1,
        ...currentFilters
      }, adminToken);
      
      if (response.error) {
        setError(response.error);
        return;
      }

      if (response.data) {
        setAttributes(response.data.attributes || []);
        
        // Actualizar información de paginación
        const total = response.data.total || 0;
        const pageSize = currentFilters.page_size || 20;
        const currentPage = currentFilters.page || 1;
        
        setPagination({
          offset: (currentPage - 1) * pageSize,
          limit: pageSize,
          total: total,
          total_pages: Math.ceil(total / pageSize),
          has_next: currentPage * pageSize < total,
          has_prev: currentPage > 1,
          page: currentPage
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading attributes');
    } finally {
      setLoading(false);
    }
  }, [filters, adminToken]);

  const loadStatistics = useCallback(async () => {
    try {
      // Cargar todos los atributos para calcular estadísticas
      const response = await marketplaceApi.getAllMarketplaceAttributes({
        page_size: 1000,
        page: 1
      }, adminToken);
      
      if (response.data && response.data.attributes) {
        const attributes = response.data.attributes;
        
        // Calcular estadísticas
        const byType: Record<string, number> = {};
        const byGroup: Record<string, number> = {};
        
        attributes.forEach(attr => {
          // Por tipo
          byType[attr.type] = (byType[attr.type] || 0) + 1;
          
          // Por grupo
          const group = attr.group_name || 'Sin grupo';
          byGroup[group] = (byGroup[group] || 0) + 1;
        });
        
        const active = attributes.filter(a => a.is_active !== false).length;
        
        setStats({
          total: attributes.length,
          active: active,
          inactive: attributes.length - active,
          by_type: byType,
          by_group: byGroup
        });
      }
    } catch (err) {
      console.error('Error loading statistics:', err);
    }
  }, [adminToken]);

  const loadPage = useCallback(async (pageNumber: number, pageSize: number = 20) => {
    await loadAttributes({ page: pageNumber, page_size: pageSize });
  }, [loadAttributes]);

  const createAttribute = useCallback(async (attributeData: CreateMarketplaceAttributeRequest) => {
    try {
      const response = await marketplaceApi.createMarketplaceAttribute(attributeData, adminToken);
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Refrescar datos
      await Promise.all([loadAttributes(), loadStatistics()]);
      return response.data!;
    } catch (err) {
      throw err;
    }
  }, [adminToken, loadAttributes, loadStatistics]);

  const updateAttribute = useCallback(async (attributeId: string, updates: UpdateMarketplaceAttributeRequest) => {
    try {
      const response = await marketplaceApi.updateMarketplaceAttribute(attributeId, updates, adminToken);
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Refrescar datos
      await Promise.all([loadAttributes(), loadStatistics()]);
      return response.data!;
    } catch (err) {
      throw err;
    }
  }, [adminToken, loadAttributes, loadStatistics]);

  const deleteAttribute = useCallback(async (attributeId: string) => {
    try {
      const response = await marketplaceApi.deleteMarketplaceAttribute(attributeId, adminToken);
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Refrescar datos
      await Promise.all([loadAttributes(), loadStatistics()]);
    } catch (err) {
      throw err;
    }
  }, [adminToken, loadAttributes, loadStatistics]);

  const getAttributeWithValues = useCallback(async (attributeId: string) => {
    try {
      const response = await marketplaceApi.getMarketplaceAttributeWithValues(attributeId, adminToken);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!;
    } catch (err) {
      throw err;
    }
  }, [adminToken]);

  // Métodos para attribute values
  const createAttributeValue = useCallback(async (valueData: CreateMarketplaceAttributeValueRequest) => {
    try {
      const response = await marketplaceApi.createMarketplaceAttributeValue(valueData, adminToken);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!;
    } catch (err) {
      throw err;
    }
  }, [adminToken]);

  const updateAttributeValue = useCallback(async (attributeId: string, valueId: string, updates: UpdateMarketplaceAttributeValueRequest) => {
    try {
      const response = await marketplaceApi.updateMarketplaceAttributeValue(attributeId, valueId, updates, adminToken);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!;
    } catch (err) {
      throw err;
    }
  }, [adminToken]);

  const deleteAttributeValue = useCallback(async (attributeId: string, valueId: string) => {
    try {
      const response = await marketplaceApi.deleteMarketplaceAttributeValue(attributeId, valueId, adminToken);
      if (response.error) {
        throw new Error(response.error);
      }
    } catch (err) {
      throw err;
    }
  }, [adminToken]);

  // Efectos
  useEffect(() => {
    loadAttributes();
  }, [loadAttributes]);

  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

  return {
    attributes,
    loading,
    error,
    pagination,
    stats,
    filters,
    setFilters,
    loadAttributes,
    loadPage,
    loadStatistics,
    createAttribute,
    updateAttribute,
    deleteAttribute,
    getAttributeWithValues,
    createAttributeValue,
    updateAttributeValue,
    deleteAttributeValue,
  };
}; 