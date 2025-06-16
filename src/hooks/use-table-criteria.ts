'use client';

import { useState, useCallback, useEffect } from 'react';
import { SearchCriteria } from '@/components/ui/criteria-data-table';

interface UseTableCriteriaProps {
  defaultPageSize?: number;
  defaultSearchTerm?: string;
  defaultFilters?: Record<string, any>;
  onSearch?: (criteria: SearchCriteria) => void;
  debounceMs?: number;
}

export function useTableCriteria({
  defaultPageSize = 20,
  defaultSearchTerm = '',
  defaultFilters = {},
  onSearch,
  debounceMs = 300,
}: UseTableCriteriaProps = {}) {
  const [criteria, setCriteria] = useState<SearchCriteria>({
    page: 1,
    page_size: defaultPageSize,
    search: defaultSearchTerm,
    sort_by: '',
    sort_dir: 'asc',
    ...defaultFilters,
  });

  // Debounce search
  useEffect(() => {
    if (!onSearch) return;

    const timeoutId = setTimeout(() => {
      onSearch(criteria);
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [criteria, onSearch, debounceMs]);

  const updateCriteria = useCallback((updates: Partial<SearchCriteria>) => {
    setCriteria(prev => ({
      ...prev,
      ...updates,
      // Reset to page 1 if search or filters change (except for pagination changes)
      page: updates.page !== undefined ? updates.page : 
            (updates.search !== undefined || Object.keys(updates).some(key => 
              key !== 'page' && key !== 'page_size' && key !== 'sort_by' && key !== 'sort_dir')) ? 1 : prev.page
    }));
  }, []);

  const handleSearchChange = useCallback((search: string) => {
    updateCriteria({ search });
  }, [updateCriteria]);

  const handlePageChange = useCallback((page: number) => {
    updateCriteria({ page });
  }, [updateCriteria]);

  const handlePageSizeChange = useCallback((page_size: number) => {
    updateCriteria({ page_size, page: 1 });
  }, [updateCriteria]);

  const handleSortChange = useCallback((sort_by: string, sort_dir: 'asc' | 'desc') => {
    updateCriteria({ sort_by, sort_dir });
  }, [updateCriteria]);

  const handleFilterChange = useCallback((key: string, value: any) => {
    updateCriteria({ [key]: value });
  }, [updateCriteria]);

  const resetCriteria = useCallback(() => {
    setCriteria({
      page: 1,
      page_size: defaultPageSize,
      search: defaultSearchTerm,
      sort_by: '',
      sort_dir: 'asc',
      ...defaultFilters,
    });
  }, [defaultPageSize, defaultSearchTerm, defaultFilters]);

  return {
    criteria,
    updateCriteria,
    handleSearchChange,
    handlePageChange,
    handlePageSizeChange,
    handleSortChange,
    handleFilterChange,
    resetCriteria,
  };
} 