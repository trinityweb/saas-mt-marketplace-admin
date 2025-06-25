// API client para el PIM Service
const PIM_BASE_URL = '/api/pim'; // Usar rutas proxy locales

export interface GlobalCatalogProduct {
  id: string;
  ean: string;
  name: string;
  description?: string;
  brand: string;
  category: string;
  price: number;
  image_url: string;
  image_urls: string[] | null;
  source: string;
  source_url?: string;
  reliability: number;
  quality_score: number;
  is_verified: boolean;
  is_active: boolean;
  business_type: string | null;
  is_argentine_product: boolean;
  tags: string[] | null;
  metadata?: any;
  created_at: string;
  updated_at: string;
  last_scraped_at?: string | null;
}

export interface GlobalCatalogResponse {
  products: GlobalCatalogProduct[];
  pagination: {
    offset: number;
    limit: number;
    total: number;
    has_next: boolean;
    has_prev: boolean;
    total_pages: number;
  };
  summary: {
    total_products: number;
    argentine_products: number;
    verified_products: number;
    high_quality_products: number;
    average_quality: number;
  };
}

export interface GlobalCatalogFilters {
  search?: string;
  brand?: string;
  category?: string;
  is_verified?: boolean;
  is_argentine_product?: boolean;
  source?: string;
  min_quality?: number;
  offset?: number;
  limit?: number;
}

class PimApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = PIM_BASE_URL;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    console.log(`🔗 API Request: ${options.method || 'GET'} ${url}`);
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      console.error(`❌ API Error: ${response.status}`, errorData);
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ API Response:`, { 
      endpoint, 
      status: response.status,
      dataKeys: Object.keys(data),
      ...(data.pagination && { pagination: data.pagination }),
      ...(data.products && { productsCount: data.products.length })
    });
    return data;
  }

  // Global Catalog endpoints
  async getGlobalCatalogProducts(filters: GlobalCatalogFilters = {}): Promise<GlobalCatalogResponse> {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.brand) params.append('brand', filters.brand);
    if (filters.category) params.append('category', filters.category);
    if (filters.is_verified !== undefined) params.append('is_verified', String(filters.is_verified));
    if (filters.is_argentine_product !== undefined) params.append('is_argentine_product', String(filters.is_argentine_product));
    if (filters.source) params.append('source', filters.source);
    if (filters.min_quality) params.append('min_quality', String(filters.min_quality));
    if (filters.offset) params.append('offset', String(filters.offset));
    if (filters.limit) params.append('limit', String(filters.limit));

    const queryString = params.toString();
    const endpoint = `/global-catalog${queryString ? `?${queryString}` : ''}`;
    
    return this.request<GlobalCatalogResponse>(endpoint);
  }

  async verifyGlobalCatalogProduct(id: string): Promise<GlobalCatalogProduct> {
    return this.request<GlobalCatalogProduct>(`/global-catalog/${id}/verify`, {
      method: 'PATCH',
    });
  }

  async deleteGlobalCatalogProduct(id: string): Promise<void> {
    await this.request<void>(`/global-catalog/${id}`, {
      method: 'DELETE',
    });
  }

  // Obtener marcas únicas del global catalog
  async getGlobalCatalogBrands(): Promise<string[]> {
    try {
      const response = await this.getGlobalCatalogProducts({ limit: 1000 });
      const brands = [...new Set(response.products.map(p => p.brand))];
      return brands.filter(Boolean).sort();
    } catch (error) {
      console.error('Error getting brands:', error);
      return [];
    }
  }

  // Obtener categorías únicas del global catalog
  async getGlobalCatalogCategories(): Promise<string[]> {
    try {
      const response = await this.getGlobalCatalogProducts({ limit: 1000 });
      const categories = [...new Set(response.products.map(p => p.category))];
      return categories.filter(Boolean).sort();
    } catch (error) {
      console.error('Error getting categories:', error);
      return [];
    }
  }

  // Obtener fuentes únicas del global catalog
  async getGlobalCatalogSources(): Promise<string[]> {
    try {
      const response = await this.getGlobalCatalogProducts({ limit: 1000 });
      const sources = [...new Set(response.products.map(p => p.source))];
      return sources.filter(Boolean).sort();
    } catch (error) {
      console.error('Error getting sources:', error);
      return [];
    }
  }
}

// Singleton instance
export const pimApi = new PimApiClient();

// Export types
export type { GlobalCatalogProduct, GlobalCatalogResponse, GlobalCatalogFilters }; 