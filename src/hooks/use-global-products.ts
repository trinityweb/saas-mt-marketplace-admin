import { useState, useEffect, useCallback } from 'react';
import { pimApi, type GlobalCatalogProduct, type GlobalCatalogFilters, type GlobalCatalogResponse } from '@/lib/api/pim';

interface UseGlobalProductsOptions {
  adminToken?: string;
  initialFilters?: GlobalCatalogFilters;
}

interface PaginationInfo {
  offset: number;
  limit: number;
  total: number;
}

interface UseGlobalProductsReturn {
  products: GlobalCatalogProduct[];
  loading: boolean;
  error: string | null;
  pagination: PaginationInfo;
  stats: {
    total: number;
    verified: number;
    unverified: number;
    by_brand: Record<string, number>;
    by_category: Record<string, number>;
    by_source: Record<string, number>;
    average_quality_score: number;
  };
  filters: GlobalCatalogFilters;
  setFilters: (filters: Partial<GlobalCatalogFilters>) => void;
  loadProducts: (filters?: GlobalCatalogFilters) => Promise<void>;
  loadPage: (pageNumber: number, pageSize?: number) => Promise<void>;
  verifyProduct: (productId: string) => Promise<any>;
}

export const useGlobalProducts = (options: UseGlobalProductsOptions = {}): UseGlobalProductsReturn => {
  const { adminToken, initialFilters = {} } = options;
  const [filters, setFiltersState] = useState<GlobalCatalogFilters>(initialFilters);
  const [products, setProducts] = useState<GlobalCatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    offset: 0,
    limit: 20,
    total: 0
  });

  // Estadísticas calculadas
  const stats = {
    total: products.length,
    verified: products.filter(product => product.is_verified).length,
    unverified: products.filter(product => !product.is_verified).length,
    by_brand: products.reduce((acc, product) => {
      acc[product.brand] = (acc[product.brand] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    by_category: products.reduce((acc, product) => {
      const category = product.category?.name || 'Sin categoría';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    by_source: products.reduce((acc, product) => {
      acc[product.source] = (acc[product.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    average_quality_score: products.length > 0 
      ? products.reduce((sum, product) => sum + product.quality_score, 0) / products.length 
      : 0
  };

  // Función para cargar productos
  const loadProducts = useCallback(async (newFilters?: GlobalCatalogFilters) => {
    setLoading(true);
    setError(null);

    try {
      const filtersToUse = newFilters || filters;
      
      const response = await pimApi.getGlobalCatalogProducts({
        search: filtersToUse.search,
        brand: filtersToUse.brand,
        category: filtersToUse.category,
        is_verified: filtersToUse.is_verified,
        is_argentine_product: filtersToUse.is_argentine_product,
        min_quality: filtersToUse.min_quality,
        source: filtersToUse.source,
        offset: filtersToUse.offset || 0,
        limit: filtersToUse.limit || 20
      });

      if (response) {
        setProducts(response.products || []);
        setPagination({
          offset: response.pagination.offset,
          limit: response.pagination.limit,
          total: response.pagination.total
        });
        
        console.log('✅ Loaded global products:', response.products?.length || 0);
      }
    } catch (err: any) {
      console.error('Error loading global products:', err);
      setError(err.message || 'Error al cargar productos globales');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Función para cargar una página específica
  const loadPage = useCallback(async (pageNumber: number, pageSize?: number) => {
    const newFilters = {
      ...filters,
      offset: (pageNumber - 1) * (pageSize || filters.limit || 20),
      ...(pageSize && { limit: pageSize })
    };
    
    setFilters(newFilters);
    await loadProducts(newFilters);
  }, [filters, loadProducts]);

  // Función para actualizar filtros
  const setFilters = useCallback((newFilters: Partial<GlobalCatalogFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFiltersState(updatedFilters);
    loadProducts(updatedFilters);
  }, [filters, loadProducts]);

  // Función para crear producto - Not implemented in PIM API yet
  const createProduct = useCallback(async (productData: Partial<GlobalCatalogProduct>) => {
    throw new Error('Create product not implemented in PIM API');
  }, []);

  // Función para actualizar producto - Not implemented in PIM API yet
  const updateProduct = useCallback(async (productId: string, updates: Partial<GlobalCatalogProduct>) => {
    throw new Error('Update product not implemented in PIM API');
  }, []);

  // Función para eliminar producto
  const deleteProduct = useCallback(async (productId: string) => {
    setLoading(true);
    setError(null);

    try {
      await pimApi.deleteGlobalCatalogProduct(productId);
      
      // Remover de la lista local
      setProducts(prev => prev.filter(product => product.id !== productId));
      
      return { success: true };
    } catch (err: any) {
      console.error('Error deleting global product:', err);
      setError(err.message || 'Error al eliminar producto');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para verificar producto
  const verifyProduct = useCallback(async (productId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await pimApi.verifyGlobalCatalogProduct(productId);
      
      // Actualizar la lista local
      setProducts(prev => 
        prev.map(product => 
          product.id === productId 
            ? { ...product, is_verified: true } 
            : product
        )
      );
      
      return { success: true, data: response };
    } catch (err: any) {
      console.error('Error verifying global product:', err);
      setError(err.message || 'Error al verificar producto');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar productos iniciales
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return {
    products,
    loading,
    error,
    pagination,
    stats,
    filters,
    setFilters,
    loadProducts,
    loadPage,
    createProduct,
    updateProduct,
    deleteProduct,
    verifyProduct
  };
};

// Hook simplificado para selects
export const useGlobalProductsForSelect = (
  showVerifiedOnly: boolean = false,
  adminToken?: string
) => {
  const { products, loading, error, loadProducts } = useGlobalProducts({
    adminToken,
    initialFilters: {
      ...(showVerifiedOnly && { is_verified: true }),
      limit: 200 // Cargar más productos para tener opciones
    }
  });

  const filteredProducts = products.filter(product => {
    if (showVerifiedOnly && !product.is_verified) return false;
    return product.name && product.name.trim().length > 0;
  });

  return {
    products: filteredProducts,
    loading,
    error,
    refetch: () => loadProducts({
      ...(showVerifiedOnly && { is_verified: true }),
      limit: 200
    })
  };
};