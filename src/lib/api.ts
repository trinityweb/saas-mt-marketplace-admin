// API Client for Marketplace Admin
// Manages communication with PIM service marketplace endpoints

// Types
export interface MarketplaceCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string | null;
  level: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateMarketplaceCategoryRequest {
  name: string;
  description?: string;
  parent_id?: string | null;
  slug?: string;
}

export interface TenantTaxonomy {
  tenant_id: string;
  format: string;
  total_categories: number;
  total_mappings: number;
  categories: TenantCategoryNode[];
  metadata: TaxonomyMetadata;
  generated_at: string;
}

export interface TenantCategoryNode {
  category_id: string;
  name: string;
  level: number;
  parent_id?: string | null;
  mapping_id?: string;
  marketplace_category_id?: string;
  custom_name?: string;
  children?: TenantCategoryNode[];
  is_active: boolean;
  has_mapping: boolean;
  created_at: string;
  updated_at: string;
}

export interface TaxonomyMetadata {
  max_depth: number;
  root_categories_count: number;
  mapped_categories_count: number;
  unmapped_categories_count: number;
  custom_attributes_count: number;
  last_sync_at?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface TenantCustomAttribute {
  id: string;
  marketplace_attribute_id: string;
  tenant_id: string;
  attribute_values: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateTenantCustomAttributeRequest {
  marketplace_attribute_id: string;
  attribute_values?: string[];
  is_active?: boolean;
}

export interface UpdateTenantCustomAttributeRequest {
  attribute_values?: string[];
  is_active?: boolean;
}

export interface TenantCustomAttributesResponse {
  data: TenantCustomAttribute[];
  total: number;
  page: number;
  page_size: number;
}

export interface BusinessType {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  metadata?: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateBusinessTypeRequest {
  code: string;
  name: string;
  description: string;
  icon?: string;
  color?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateBusinessTypeRequest {
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
  metadata?: Record<string, unknown>;
  is_active?: boolean;
}

export interface BusinessTypesResponse {
  business_types: BusinessType[];
  total: number;
}

interface PimCategory {
  id: string;
  name: string;
  description?: string;
  parent_id?: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

// API Client Class
class MarketplaceApiClient {
  private defaultHeaders: HeadersInit;

  constructor() {
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  private getBaseUrl(service?: string): string {
    // Usar directamente el API Gateway como en el backoffice
    const apiGatewayUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
    
    // Para business types, usar el servicio PIM directamente
    if (service === 'pim') {
      return `${apiGatewayUrl}/pim`;
    }
    
    return `${apiGatewayUrl}/marketplace`;
  }

  private getStoredTokens() {
    if (typeof window !== 'undefined') {
      return {
        accessToken: localStorage.getItem('iam_access_token'),
        tenantId: localStorage.getItem('current_tenant_id')
      };
    }
    return { accessToken: null, tenantId: null };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    service?: string
  ): Promise<ApiResponse<T>> {
    try {
      const { accessToken, tenantId } = this.getStoredTokens();
      
      // Crear headers con autenticación y tenant ID
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // En modo desarrollo, usar token y rol hardcodeados si no hay token real
      const isDev = process.env.NODE_ENV === 'development';
      const token = accessToken || (isDev ? 'dev-marketplace-admin' : null);
      const role = (options.headers as Record<string, string>)?.['X-User-Role'] || (isDev ? 'marketplace_admin' : null);
      
      // Añadir token de autorización
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Añadir rol
      if (role) {
        headers['X-User-Role'] = role;
      }

      // Añadir tenant ID - usar el mismo hardcodeado que el backoffice para testing
      headers['X-Tenant-ID'] = tenantId || '9a4c3eb9-2471-4688-bfc8-973e5b3e4ce8';

      // Combinar con headers adicionales
      if (options.headers) {
        Object.assign(headers, options.headers);
      }

      const url = `${this.getBaseUrl(service)}${endpoint}`;
      
      const response = await fetch(url, {
        ...options,
        headers: headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`MarketplaceAPI: Error ${response.status} for ${url}:`, errorData);
        return {
          error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error(`MarketplaceAPI: Error en solicitud ${endpoint}:`, error);
      return {
        error: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }

  // Marketplace Categories (Admin endpoints)
  async createMarketplaceCategory(
    category: CreateMarketplaceCategoryRequest,
    adminToken: string
  ): Promise<ApiResponse<MarketplaceCategory>> {
    const response = await this.request<MarketplaceCategory>('/categories', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'X-User-Role': 'marketplace_admin',
      },
      body: JSON.stringify(category),
    });

    if (response.error) {
      return { error: response.error };
    }

    return { data: response.data };
  }

  async validateCategoryHierarchy(
    categoryId: string,
    newParentId?: string,
    _adminToken?: string
  ): Promise<ApiResponse<{ is_valid: boolean; issues?: unknown[] }>> {
    return this.request('/categories/validate-hierarchy', {
      method: 'POST',
      body: JSON.stringify({
        category_id: categoryId,
        new_parent_id: newParentId,
        max_depth: 3,
        validate_children: true,
      }),
    });
  }

  async syncMarketplaceChanges(_adminToken: string): Promise<ApiResponse<{
    sync_id: string;
    status: string;
    affected_tenants: number;
  }>> {
    return this.request('/sync-changes', {
      method: 'POST',
    });
  }

  // Tenant Taxonomy (accessible by tenants)
  async getTenantTaxonomy(
    tenantId: string,
    options: {
      includeCustomAttributes?: boolean;
      includeMarketplaceData?: boolean;
      includeInactive?: boolean;
      format?: 'tree' | 'flat';
    } = {},
    tenantToken?: string
  ): Promise<ApiResponse<TenantTaxonomy>> {
    const searchParams = new URLSearchParams();
    if (options.includeCustomAttributes) searchParams.set('include_custom_attributes', 'true');
    if (options.includeMarketplaceData) searchParams.set('include_marketplace_data', 'true');
    if (options.includeInactive) searchParams.set('include_inactive', 'true');
    if (options.format) searchParams.set('format', options.format);

    const endpoint = `/taxonomy${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

    return this.request<TenantTaxonomy>(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tenantToken}`,
        'X-Tenant-ID': tenantId,
        'X-User-Role': 'tenant_admin',
      },
    });
  }

  async updateMarketplaceCategory(
    id: string,
    updates: Partial<MarketplaceCategory>,
    adminToken: string
  ): Promise<ApiResponse<MarketplaceCategory>> {
    const response = await this.request<MarketplaceCategory>(`/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'X-User-Role': 'marketplace_admin',
      },
      body: JSON.stringify(updates),
    });

    if (response.error) {
      return { error: response.error };
    }

    return { data: response.data };
  }

  // Utility methods for category management
  async getAllMarketplaceCategories(adminToken: string): Promise<ApiResponse<MarketplaceCategory[]>> {
    // Usar el endpoint correcto para categorías del marketplace
    const response = await this.request<MarketplaceCategory[]>('/categories', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'X-User-Role': 'marketplace_admin',
      },
    });

    if (response.error) {
      return { error: response.error };
    }

    return { data: response.data || [] };
  }

  // Build category tree from flat list
  buildCategoryTree(categories: TenantCategoryNode[]): TenantCategoryNode[] {
    const categoryMap = new Map<string, TenantCategoryNode>();
    const rootCategories: TenantCategoryNode[] = [];

    // First pass: create map of all categories
    categories.forEach(category => {
      categoryMap.set(category.category_id, { ...category, children: [] });
    });

    // Second pass: build tree structure
    categories.forEach(category => {
      const categoryNode = categoryMap.get(category.category_id)!;
      
      if (category.parent_id) {
        const parent = categoryMap.get(category.parent_id);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(categoryNode);
        }
      } else {
        rootCategories.push(categoryNode);
      }
    });

    return rootCategories;
  }

  // Get category path (breadcrumb)
  getCategoryPath(categoryId: string, categories: TenantCategoryNode[]): string[] {
    const categoryMap = new Map<string, TenantCategoryNode>();
    categories.forEach(cat => categoryMap.set(cat.category_id, cat));

    const path: string[] = [];
    let currentCategory = categoryMap.get(categoryId);

    while (currentCategory) {
      path.unshift(currentCategory.name);
      currentCategory = currentCategory.parent_id 
        ? categoryMap.get(currentCategory.parent_id)
        : undefined;
    }

    return path;
  }

  // Tenant Custom Attributes
  async createTenantCustomAttribute(
    attribute: CreateTenantCustomAttributeRequest,
    tenantToken?: string
  ): Promise<ApiResponse<TenantCustomAttribute>> {
    return this.request<TenantCustomAttribute>('/tenant/custom-attributes', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tenantToken}`,
        'X-User-Role': 'marketplace_admin',
      },
      body: JSON.stringify(attribute),
    });
  }

  async getTenantCustomAttributes(
    options: {
      page?: number;
      page_size?: number;
      marketplace_attribute_id?: string;
      is_active?: boolean;
    } = {},
    tenantToken?: string
  ): Promise<ApiResponse<TenantCustomAttributesResponse>> {
    const searchParams = new URLSearchParams();
    if (options.page) searchParams.set('page', options.page.toString());
    if (options.page_size) searchParams.set('page_size', options.page_size.toString());
    if (options.marketplace_attribute_id) searchParams.set('marketplace_attribute_id', options.marketplace_attribute_id);
    if (options.is_active !== undefined) searchParams.set('is_active', options.is_active.toString());

    const endpoint = `/tenant/custom-attributes${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

    return this.request<TenantCustomAttributesResponse>(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tenantToken}`,
        'X-User-Role': 'marketplace_admin',
      },
    });
  }

  async updateTenantCustomAttribute(
    attributeId: string,
    updates: UpdateTenantCustomAttributeRequest,
    tenantToken?: string
  ): Promise<ApiResponse<TenantCustomAttribute>> {
    return this.request<TenantCustomAttribute>(`/tenant/custom-attributes/${attributeId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${tenantToken}`,
        'X-User-Role': 'marketplace_admin',
      },
      body: JSON.stringify(updates),
    });
  }

  async deleteTenantCustomAttribute(
    attributeId: string,
    tenantToken?: string
  ): Promise<ApiResponse<void>> {
    return this.request<void>(`/tenant/custom-attributes/${attributeId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${tenantToken}`,
        'X-User-Role': 'marketplace_admin',
      },
    });
  }

  // Business Types Management
  async getAllBusinessTypes(
    options: {
      only_active?: boolean;
    } = {},
    _adminToken?: string
  ): Promise<ApiResponse<BusinessTypesResponse>> {
    const searchParams = new URLSearchParams();
    if (options.only_active) searchParams.set('only_active', 'true');

    // Usar la ruta correcta del servicio PIM a través del API Gateway
    const endpoint = `/api/v1/business-types${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

    return this.request<BusinessTypesResponse>(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${_adminToken || 'dev-marketplace-admin'}`,
        'X-User-Role': 'marketplace_admin',
        'X-Tenant-ID': '9a4c3eb9-2471-4688-bfc8-973e5b3e4ce8',
      },
    }, 'pim');
  }

  async createBusinessType(
    businessType: CreateBusinessTypeRequest,
    _adminToken?: string
  ): Promise<ApiResponse<BusinessType>> {
    return this.request<BusinessType>('/api/v1/business-types', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${_adminToken || 'dev-marketplace-admin'}`,
        'X-User-Role': 'marketplace_admin',
        'X-Tenant-ID': '9a4c3eb9-2471-4688-bfc8-973e5b3e4ce8',
      },
      body: JSON.stringify(businessType),
    }, 'pim');
  }

  async getBusinessType(
    businessTypeId: string,
    _adminToken?: string
  ): Promise<ApiResponse<BusinessType>> {
    return this.request<BusinessType>(`/api/v1/business-types/${businessTypeId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${_adminToken || 'dev-marketplace-admin'}`,
        'X-User-Role': 'marketplace_admin',
        'X-Tenant-ID': '9a4c3eb9-2471-4688-bfc8-973e5b3e4ce8',
      },
    }, 'pim');
  }

  async updateBusinessType(
    businessTypeId: string,
    updates: UpdateBusinessTypeRequest,
    _adminToken?: string
  ): Promise<ApiResponse<BusinessType>> {
    return this.request<BusinessType>(`/api/v1/business-types/${businessTypeId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${_adminToken || 'dev-marketplace-admin'}`,
        'X-User-Role': 'marketplace_admin',
        'X-Tenant-ID': '9a4c3eb9-2471-4688-bfc8-973e5b3e4ce8',
      },
      body: JSON.stringify(updates),
    }, 'pim');
  }

  async deleteBusinessType(
    businessTypeId: string,
    _adminToken?: string
  ): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/v1/business-types/${businessTypeId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${_adminToken || 'dev-marketplace-admin'}`,
        'X-User-Role': 'marketplace_admin',
        'X-Tenant-ID': '9a4c3eb9-2471-4688-bfc8-973e5b3e4ce8',
      },
    }, 'pim');
  }
}

// Export singleton instance
export const marketplaceApi = new MarketplaceApiClient(); 