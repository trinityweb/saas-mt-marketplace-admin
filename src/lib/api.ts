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

// ====================================
// MARKETPLACE ATTRIBUTES INTERFACES
// ====================================

export interface MarketplaceAttribute {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: 'text' | 'number' | 'select' | 'multi_select' | 'boolean' | 'date';
  is_required: boolean;
  is_filterable: boolean;
  is_searchable: boolean;
  default_value?: string;
  options?: string[];
  validation_rules?: AttributeValidationRules;
  unit?: string;
  group_name?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AttributeValidationRules {
  min_length?: number;
  max_length?: number;
  min_value?: number;
  max_value?: number;
  pattern?: string;
  custom_rules?: string[];
}

export interface CreateMarketplaceAttributeRequest {
  code: string;
  name: string;
  description?: string;
  type: 'text' | 'number' | 'select' | 'multi_select' | 'boolean' | 'date';
  is_required?: boolean;
  is_filterable?: boolean;
  is_searchable?: boolean;
  default_value?: string;
  options?: string[];
  validation_rules?: AttributeValidationRules;
  unit?: string;
  group_name?: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface UpdateMarketplaceAttributeRequest extends Partial<CreateMarketplaceAttributeRequest> {
  id?: string;
}

export interface MarketplaceAttributesResponse {
  attributes: MarketplaceAttribute[];
  total: number;
  page: number;
  page_size: number;
}

// ====================================
// MARKETPLACE BRANDS INTERFACES
// ====================================

export interface MarketplaceBrand {
  id: string;
  name: string;
  slug: string;
  normalized_name: string;
  description?: string;
  logo_url?: string;
  website?: string;
  country_code: string;
  category_tags: string[];
  verification_status: 'verified' | 'unverified' | 'disputed' | 'pending';
  quality_score: number;
  product_count: number;
  web_data?: Record<string, any>;
  aliases: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface CreateMarketplaceBrandRequest {
  name: string;
  description?: string;
  logo_url?: string;
  website?: string;
  aliases?: string[];
}

export interface UpdateMarketplaceBrandRequest {
  name?: string;
  description?: string;
  logo_url?: string;
  website?: string;
  verification_status?: 'verified' | 'unverified' | 'disputed' | 'pending';
  quality_score?: number;
  aliases?: string[];
  category_tags?: string[];
  is_active?: boolean;
}

export interface MarketplaceBrandsResponse {
  brands: MarketplaceBrand[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    has_next: boolean;
    has_prev: boolean;
    total_pages: number;
  };
}

export interface MarketplaceBrandFilters {
  search?: string;
  verification_status?: string;
  is_active?: boolean;
  country_code?: string;
  page_size?: number;
  page?: number;
}

// ====================================
// GLOBAL CATALOG INTERFACES
// ====================================

export interface GlobalProduct {
  id: string;
  ean: string;
  name: string;
  description?: string;
  brand: string;
  category_id?: string;
  category?: MarketplaceCategory;
  attributes: Record<string, any>;
  images: string[];
  quality_score: number;
  is_verified: boolean;
  source: string;
  created_at: string;
  updated_at: string;
}

export interface CreateGlobalProductRequest {
  ean: string;
  name: string;
  description?: string;
  brand: string;
  category_id?: string;
  attributes?: Record<string, any>;
  images?: string[];
  quality_score?: number;
  is_verified?: boolean;
  source: string;
}

export interface UpdateGlobalProductRequest extends Partial<CreateGlobalProductRequest> {
  id?: string;
}

export interface GlobalProductsResponse {
  products: GlobalProduct[];
  total: number;
  page: number;
  page_size: number;
}

export interface BulkImportResponse {
  successful: number;
  failed: number;
  errors: Array<{
    index: number;
    error: string;
    ean?: string;
  }>;
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
    // Usar los proxies del frontend en lugar de llamadas directas a Kong
    const frontendBaseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3004';
    
    // Para servicios PIM, usar el proxy local
    if (service === 'pim') {
      return `${frontendBaseUrl}/api/pim`;
    }
    
    return `${frontendBaseUrl}/api/marketplace`;
  }



  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    service?: string
  ): Promise<ApiResponse<T>> {
    try {
      // Crear headers básicos - el proxy del frontend se encargará de los headers de autenticación
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Combinar con headers adicionales del llamador si los hay
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

  // ====================================
  // MARKETPLACE ATTRIBUTES MANAGEMENT
  // ====================================

  async getAllMarketplaceAttributes(
    options: {
      page?: number;
      page_size?: number;
      type?: string;
      is_active?: boolean;
      is_filterable?: boolean;
      group_name?: string;
    } = {},
    _adminToken?: string
  ): Promise<ApiResponse<MarketplaceAttributesResponse>> {
    const searchParams = new URLSearchParams();
    if (options.page) searchParams.set('page', options.page.toString());
    if (options.page_size) searchParams.set('page_size', options.page_size.toString());
    if (options.type) searchParams.set('type', options.type);
    if (options.is_active !== undefined) searchParams.set('is_active', options.is_active.toString());
    if (options.is_filterable !== undefined) searchParams.set('is_filterable', options.is_filterable.toString());
    if (options.group_name) searchParams.set('group_name', options.group_name);

    const endpoint = `/marketplace/attributes${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

    return this.request<MarketplaceAttributesResponse>(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${_adminToken || 'dev-marketplace-admin'}`,
        'X-User-Role': 'marketplace_admin',
      },
    }, 'pim');
  }

  async createMarketplaceAttribute(
    attribute: CreateMarketplaceAttributeRequest,
    _adminToken?: string
  ): Promise<ApiResponse<MarketplaceAttribute>> {
    return this.request<MarketplaceAttribute>('/marketplace/attributes', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${_adminToken || 'dev-marketplace-admin'}`,
        'X-User-Role': 'marketplace_admin',
      },
      body: JSON.stringify(attribute),
    }, 'pim');
  }

  async getMarketplaceAttribute(
    attributeId: string,
    _adminToken?: string
  ): Promise<ApiResponse<MarketplaceAttribute>> {
    return this.request<MarketplaceAttribute>(`/marketplace/attributes/${attributeId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${_adminToken || 'dev-marketplace-admin'}`,
        'X-User-Role': 'marketplace_admin',
      },
    }, 'pim');
  }

  async updateMarketplaceAttribute(
    attributeId: string,
    updates: UpdateMarketplaceAttributeRequest,
    _adminToken?: string
  ): Promise<ApiResponse<MarketplaceAttribute>> {
    return this.request<MarketplaceAttribute>(`/marketplace/attributes/${attributeId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${_adminToken || 'dev-marketplace-admin'}`,
        'X-User-Role': 'marketplace_admin',
      },
      body: JSON.stringify(updates),
    }, 'pim');
  }

  async deleteMarketplaceAttribute(
    attributeId: string,
    _adminToken?: string
  ): Promise<ApiResponse<void>> {
    return this.request<void>(`/marketplace/attributes/${attributeId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${_adminToken || 'dev-marketplace-admin'}`,
        'X-User-Role': 'marketplace_admin',
      },
    }, 'pim');
  }

  // ====================================
  // GLOBAL CATALOG MANAGEMENT
  // ====================================

  async getAllGlobalProducts(
    options: {
      page?: number;
      page_size?: number;
      name?: string;
      brand?: string;
      category_id?: string;
      is_verified?: boolean;
      quality_score_min?: number;
      quality_score_max?: number;
      source?: string;
    } = {},
    _adminToken?: string
  ): Promise<ApiResponse<GlobalProductsResponse>> {
    const searchParams = new URLSearchParams();
    if (options.page) searchParams.set('page', options.page.toString());
    if (options.page_size) searchParams.set('page_size', options.page_size.toString());
    if (options.name) searchParams.set('name', options.name);
    if (options.brand) searchParams.set('brand', options.brand);
    if (options.category_id) searchParams.set('category_id', options.category_id);
    if (options.is_verified !== undefined) searchParams.set('is_verified', options.is_verified.toString());
    if (options.quality_score_min) searchParams.set('quality_score_min', options.quality_score_min.toString());
    if (options.quality_score_max) searchParams.set('quality_score_max', options.quality_score_max.toString());
    if (options.source) searchParams.set('source', options.source);

    const endpoint = `/catalog/global-products${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

    return this.request<GlobalProductsResponse>(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${_adminToken || 'dev-marketplace-admin'}`,
        'X-User-Role': 'marketplace_admin',
      },
    }, 'pim');
  }

  async createGlobalProduct(
    product: CreateGlobalProductRequest,
    _adminToken?: string
  ): Promise<ApiResponse<GlobalProduct>> {
    return this.request<GlobalProduct>('/catalog/global-products', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${_adminToken || 'dev-marketplace-admin'}`,
        'X-User-Role': 'marketplace_admin',
      },
      body: JSON.stringify(product),
    }, 'pim');
  }

  async getGlobalProduct(
    productId: string,
    _adminToken?: string
  ): Promise<ApiResponse<GlobalProduct>> {
    return this.request<GlobalProduct>(`/catalog/global-products/${productId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${_adminToken || 'dev-marketplace-admin'}`,
        'X-User-Role': 'marketplace_admin',
      },
    }, 'pim');
  }

  async updateGlobalProduct(
    productId: string,
    updates: UpdateGlobalProductRequest,
    _adminToken?: string
  ): Promise<ApiResponse<GlobalProduct>> {
    return this.request<GlobalProduct>(`/catalog/global-products/${productId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${_adminToken || 'dev-marketplace-admin'}`,
        'X-User-Role': 'marketplace_admin',
      },
      body: JSON.stringify(updates),
    }, 'pim');
  }

  async deleteGlobalProduct(
    productId: string,
    _adminToken?: string
  ): Promise<ApiResponse<void>> {
    return this.request<void>(`/catalog/global-products/${productId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${_adminToken || 'dev-marketplace-admin'}`,
        'X-User-Role': 'marketplace_admin',
      },
    }, 'pim');
  }

  async verifyGlobalProduct(
    productId: string,
    _adminToken?: string
  ): Promise<ApiResponse<GlobalProduct>> {
    return this.request<GlobalProduct>(`/catalog/global-products/${productId}/verify`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${_adminToken || 'dev-marketplace-admin'}`,
        'X-User-Role': 'marketplace_admin',
      },
    }, 'pim');
  }

  async bulkImportGlobalProducts(
    products: CreateGlobalProductRequest[],
    _adminToken?: string
  ): Promise<ApiResponse<BulkImportResponse>> {
    return this.request<BulkImportResponse>('/catalog/global-products/bulk-import', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${_adminToken || 'dev-marketplace-admin'}`,
        'X-User-Role': 'marketplace_admin',
      },
      body: JSON.stringify({ products }),
    }, 'pim');
  }

  // ====================================
  // MARKETPLACE BRANDS MANAGEMENT
  // ====================================

  async getAllMarketplaceBrands(
    filters: MarketplaceBrandFilters = {},
    _adminToken?: string
  ): Promise<ApiResponse<MarketplaceBrandsResponse>> {
    const searchParams = new URLSearchParams();
    
    if (filters.search) searchParams.set('search', filters.search);
    if (filters.verification_status) searchParams.set('verification_status', filters.verification_status);
    if (filters.is_active !== undefined) searchParams.set('is_active', filters.is_active.toString());
    if (filters.country_code) searchParams.set('country_code', filters.country_code);
    if (filters.page_size) searchParams.set('page_size', filters.page_size.toString());
    if (filters.page) searchParams.set('page', filters.page.toString());

    const endpoint = `/marketplace-brands${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    
    return this.request<MarketplaceBrandsResponse>(endpoint, {
      method: 'GET',
    }, 'pim');
  }

  async getMarketplaceBrand(
    brandId: string,
    _adminToken?: string
  ): Promise<ApiResponse<MarketplaceBrand>> {
    return this.request<MarketplaceBrand>(`/marketplace-brands/${brandId}`, {
      method: 'GET',
    }, 'pim');
  }

  async createMarketplaceBrand(
    brand: CreateMarketplaceBrandRequest,
    _adminToken?: string
  ): Promise<ApiResponse<MarketplaceBrand>> {
    return this.request<MarketplaceBrand>('/marketplace-brands', {
      method: 'POST',
      body: JSON.stringify(brand),
    }, 'pim');
  }

  async updateMarketplaceBrand(
    brandId: string,
    updates: UpdateMarketplaceBrandRequest,
    _adminToken?: string
  ): Promise<ApiResponse<MarketplaceBrand>> {
    return this.request<MarketplaceBrand>(`/marketplace-brands/${brandId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }, 'pim');
  }

  async deleteMarketplaceBrand(
    brandId: string,
    _adminToken?: string
  ): Promise<ApiResponse<void>> {
    return this.request<void>(`/marketplace-brands/${brandId}`, {
      method: 'DELETE',
    }, 'pim');
  }

  async verifyMarketplaceBrand(
    brandId: string,
    _adminToken?: string
  ): Promise<ApiResponse<MarketplaceBrand>> {
    return this.updateMarketplaceBrand(brandId, {
      verification_status: 'verified',
      quality_score: 1.0,
    }, _adminToken);
  }

  async unverifyMarketplaceBrand(
    brandId: string,
    _adminToken?: string
  ): Promise<ApiResponse<MarketplaceBrand>> {
    return this.updateMarketplaceBrand(brandId, {
      verification_status: 'unverified',
    }, _adminToken);
  }

  async getMarketplaceBrandsStatistics(
    _adminToken?: string
  ): Promise<ApiResponse<{
    total: number;
    verified: number;
    unverified: number;
    active: number;
    inactive: number;
  }>> {
    // Since the backend doesn't have a statistics endpoint yet,
    // we'll calculate it from the list endpoint
    const [allBrands, verifiedBrands, activeBrands] = await Promise.all([
      this.getAllMarketplaceBrands({ limit: 1000 }, _adminToken),
      this.getAllMarketplaceBrands({ verification_status: 'verified', limit: 1000 }, _adminToken),
      this.getAllMarketplaceBrands({ is_active: true, limit: 1000 }, _adminToken),
    ]);

    if (allBrands.error || verifiedBrands.error || activeBrands.error) {
      return { error: 'Error al obtener estadísticas de marcas' };
    }

    const stats = {
      total: allBrands.data?.total || 0,
      verified: verifiedBrands.data?.total || 0,
      unverified: (allBrands.data?.total || 0) - (verifiedBrands.data?.total || 0),
      active: activeBrands.data?.total || 0,
      inactive: (allBrands.data?.total || 0) - (activeBrands.data?.total || 0),
    };

    return { data: stats };
  }
}

// Export singleton instance
export const marketplaceApi = new MarketplaceApiClient(); 