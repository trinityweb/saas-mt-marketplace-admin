import { useState, useCallback } from 'react';

export interface SearchFilters {
  search?: string;
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
  [key: string]: any;
}

export interface SearchState {
  filters: SearchFilters;
  tempFilters: SearchFilters; // Filtros temporales antes de buscar
  loading: boolean;
}

interface UseSearchWithFiltersProps {
  initialFilters?: SearchFilters;
  onSearch: (filters: SearchFilters) => Promise<void>;
  defaultPageSize?: number;
}

export function useSearchWithFilters({
  initialFilters = {},
  onSearch,
  defaultPageSize = 20
}: UseSearchWithFiltersProps) {
  const [state, setState] = useState<SearchState>({
    filters: { page: 1, page_size: defaultPageSize, ...initialFilters },
    tempFilters: { page: 1, page_size: defaultPageSize, ...initialFilters },
    loading: false
  });

  // Actualizar filtros temporales (sin ejecutar búsqueda)
  const updateTempFilters = useCallback((updates: Partial<SearchFilters>) => {
    setState(prev => ({
      ...prev,
      tempFilters: { ...prev.tempFilters, ...updates }
    }));
  }, []);

  // Ejecutar búsqueda con filtros actuales
  const executeSearch = useCallback(async (resetPage = true) => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const searchFilters = {
        ...state.tempFilters,
        ...(resetPage && { page: 1 }) // Reset a página 1 en nueva búsqueda
      };

      await onSearch(searchFilters);
      
      setState(prev => ({
        ...prev,
        filters: searchFilters,
        tempFilters: searchFilters,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({ ...prev, loading: false }));
      throw error;
    }
  }, [state.tempFilters, onSearch]);

  // Cambiar página (ejecuta búsqueda inmediatamente)
  const handlePageChange = useCallback(async (page: number) => {
    const newFilters = { ...state.filters, page };
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      await onSearch(newFilters);
      setState(prev => ({
        ...prev,
        filters: newFilters,
        tempFilters: newFilters,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({ ...prev, loading: false }));
      throw error;
    }
  }, [state.filters, onSearch]);

  // Cambiar tamaño de página
  const handlePageSizeChange = useCallback(async (pageSize: number) => {
    const newFilters = { ...state.filters, page: 1, page_size: pageSize };
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      await onSearch(newFilters);
      setState(prev => ({
        ...prev,
        filters: newFilters,
        tempFilters: newFilters,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({ ...prev, loading: false }));
      throw error;
    }
  }, [state.filters, onSearch]);

  // Cambiar ordenamiento
  const handleSortChange = useCallback(async (sortBy: string, sortDir: 'asc' | 'desc') => {
    const newFilters = { ...state.filters, sort_by: sortBy, sort_dir: sortDir };
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      await onSearch(newFilters);
      setState(prev => ({
        ...prev,
        filters: newFilters,
        tempFilters: newFilters,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({ ...prev, loading: false }));
      throw error;
    }
  }, [state.filters, onSearch]);

  return {
    // Estado
    filters: state.filters,
    tempFilters: state.tempFilters,
    loading: state.loading,
    
    // Acciones
    updateTempFilters,
    executeSearch,
    handlePageChange,
    handlePageSizeChange,
    handleSortChange,
    
    // Helpers
    hasChanges: JSON.stringify(state.filters) !== JSON.stringify(state.tempFilters)
  };
}
