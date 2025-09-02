import { useState, useEffect, useCallback, useRef } from 'react';

interface UseMarketplaceOverviewOptions {
  sections: string[];
  includeStats?: boolean;
  timeRangeDays?: number;
  limit?: number;
  autoLoad?: boolean;
}

interface UseMarketplaceOverviewReturn {
  data: Record<string, any>;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useMarketplaceOverview = (options: UseMarketplaceOverviewOptions): UseMarketplaceOverviewReturn => {
  const { 
    sections, 
    includeStats = false, 
    timeRangeDays = 7, 
    limit = 10,
    autoLoad = true 
  } = options;
  
  const [data, setData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);

  const fetchOverview = useCallback(async () => {
    if (sections.length === 0) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        sections: sections.join(','),
        include_stats: includeStats.toString(),
        time_range_days: timeRangeDays.toString(),
        limit: limit.toString(),
        parallel: 'true'
      });

      const response = await fetch(`/api/pim/marketplace/overview?${params}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch overview: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        setData(result.data);
      } else {
        setError(result.message || 'Failed to load overview data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching marketplace overview:', err);
    } finally {
      setLoading(false);
    }
  }, [sections.join(','), includeStats, timeRangeDays, limit]); // Use join to create stable dependency

  useEffect(() => {
    // Only fetch once on mount if autoLoad is true
    if (autoLoad && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchOverview();
    }
  }, [autoLoad]); // Remove fetchOverview from dependencies to avoid loops

  return {
    data,
    loading,
    error,
    refetch: fetchOverview,
  };
};

// Helper hook for specific sections
export const useDashboardOverview = () => {
  return useMarketplaceOverview({
    sections: ['dashboard'],
    includeStats: true,
  });
};

export const useTaxonomyOverview = () => {
  return useMarketplaceOverview({
    sections: ['taxonomy'],
    includeStats: true,
  });
};

export const useBrandsOverview = () => {
  return useMarketplaceOverview({
    sections: ['brands'],
    includeStats: true,
  });
};

export const useGlobalCatalogOverview = () => {
  return useMarketplaceOverview({
    sections: ['global-catalog'],
    includeStats: true,
  });
};

export const useAttributesOverview = () => {
  return useMarketplaceOverview({
    sections: ['attributes'],
    includeStats: true,
  });
};

export const useCurationOverview = () => {
  return useMarketplaceOverview({
    sections: ['curation'],
    includeStats: true,
  });
};