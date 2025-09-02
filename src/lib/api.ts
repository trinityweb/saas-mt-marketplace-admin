// API Client for Marketplace Admin
// Manages communication with PIM service marketplace endpoints

// Types
export interface BusinessTypeTemplate {
  id: string;
  business_type_id: string;
  name: string;
  description: string;
  version: string;
  region: string;
  is_active: boolean;
  is_default: boolean;
  categories: CategoryTemplate[];
  attributes: AttributeTemplate[];
  products: ProductTemplate[];
  brands: MarketplaceBrand[] | string[]; // Support both for backwards compatibility
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CategoryTemplate {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string;
  level: number;
}

export interface AttributeTemplate {
  id: string;
  code: string;
  name: string;
  type: string;
  is_required: boolean;
  default_value?: string;
  options?: string[];
}

export interface ProductTemplate {
  id?: string;
  name: string;
  description?: string;
  category_id: string;
  category_name?: string;
  brand_id?: string;
  brand_name?: string;
  sku: string;
  price: number;
  attributes?: Record<string, any>;
}

export interface CriteriaResponse<T> {
  items: T[];
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface CreateBusinessTypeTemplateRequest {
  business_type_id: string;
  name: string;
  description: string;
  version?: string;
  region: string;
  categories: CategoryTemplate[];
  attributes: AttributeTemplate[];
  products: ProductTemplate[];
  brands?: MarketplaceBrand[] | string[]; // Support both for backwards compatibility
  metadata?: Record<string, any>;
}

export interface UpdateBusinessTypeTemplateRequest extends Partial<CreateBusinessTypeTemplateRequest> {
  id: string;
}
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

// AI Integration Types
export interface AITemplateParams {
  business_context: {
    business_name: string;
    business_type: string;
    business_description: string;
    region: string;
    target_market: string;
    business_size: string;
    special_requirements?: string;
  };
  ai_parameters: {
    optimization_focus: string;
    category_depth: string;
    product_variety: string;
    price_range: string;
    customization_level: string;
  };
}

export interface AIGenerationMetadata {
  confidence_score: number;
  generation_time: number;
  model_version: string;
  insights: string[];
}

export interface TemplateAnalytics {
  template_id: string;
  template_name: string;
  business_type: string;
  metrics: {
    usage_count: number;
    success_rate: number;
    modification_rate: number;
    revenue_impact: number;
    avg_setup_time: number;
    tenant_retention: number;
  };
  usage_over_time: Array<{
    date: string;
    count: number;
    success_rate: number;
  }>;
  regional_performance: Array<{
    region: string;
    usage_count: number;
    success_rate: number;
    popular_categories: string[];
  }>;
  product_popularity: Array<{
    product_name: string;
    category: string;
    selection_rate: number;
    modification_rate: number;
    revenue_contribution: number;
  }>;
  category_distribution: Array<{
    category: string;
    product_count: number;
    selection_rate: number;
  }>;
  top_modifications: string[];
  ai_insights: string[];
}

export interface AISuggestions {
  categories?: string[];
  attributes?: string[];
  products?: string[];
  brands?: string[];
  insights?: string[];
  regional?: Array<{ region: string; recommendation: string }>;
}

export interface AIOptimizationChanges {
  type: 'add' | 'remove' | 'modify';
  section: 'categories' | 'attributes' | 'products' | 'brands';
  item: string;
  reason: string;
  impact_score: number;
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
  items: MarketplaceAttribute[];
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// ====================================
// MARKETPLACE ATTRIBUTE VALUES INTERFACES
// ====================================

export interface MarketplaceAttributeValue {
  id: string;
  attribute_id: string;
  value: string;
  display_name?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateMarketplaceAttributeValueRequest {
  attribute_id: string;
  value: string;
  display_name?: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface UpdateMarketplaceAttributeValueRequest {
  value?: string;
  display_name?: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface MarketplaceAttributeValuesResponse {
  attribute_values: MarketplaceAttributeValue[];
  total: number;
  page: number;
  page_size: number;
}

export interface MarketplaceAttributeFilters {
  search?: string;
  type?: string;
  is_active?: boolean;
  is_filterable?: boolean;
  is_required?: boolean;
  group_name?: string;
  page_size?: number;
  page?: number;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
}

export interface MarketplaceAttributeWithValues extends MarketplaceAttribute {
  attribute_values?: MarketplaceAttributeValue[];
  values_count?: number;
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
  limit?: number; // Para compatibilidad con llamadas que usan limit
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
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
  async getAllMarketplaceCategories(
    filters: {
      page?: number;
      page_size?: number;
      sort_by?: string;
      sort_dir?: 'asc' | 'desc';
      search?: string;
      is_active?: boolean;
      parent_id?: string;
    } = {},
    adminToken: string
  ): Promise<ApiResponse<{
    categories: MarketplaceCategory[];
    pagination: {
      total: number;
      offset: number;
      limit: number;
      has_next: boolean;
      has_prev: boolean;
      total_pages: number;
    };
  }>> {
    const searchParams = new URLSearchParams();
    
    // Enviar page/page_size al proxy - el proxy hará la conversión a offset/limit
    if (filters.page) searchParams.set('page', filters.page.toString());
    if (filters.page_size) searchParams.set('page_size', filters.page_size.toString());
    
    if (filters.sort_by) searchParams.set('sort_by', filters.sort_by);
    if (filters.sort_dir) searchParams.set('sort_dir', filters.sort_dir);
    if (filters.search) searchParams.set('search', filters.search);
    if (filters.is_active !== undefined) searchParams.set('is_active', filters.is_active.toString());
    if (filters.parent_id) searchParams.set('parent_id', filters.parent_id);

    const endpoint = `/marketplace-categories${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

    const response = await this.request<{
      categories: MarketplaceCategory[];
      pagination: {
        total: number;
        offset: number;
        limit: number;
        has_next: boolean;
        has_prev: boolean;
        total_pages: number;
      };
    }>(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'X-User-Role': 'marketplace_admin',
      },
    }, 'pim');

    if (response.error) {
      return { error: response.error };
    }

    return { data: response.data };
  }

  // Nueva función para obtener TODAS las categorías haciendo múltiples llamadas
  async getAllMarketplaceCategoriesComplete(
    filters: {
      sort_by?: string;
      sort_dir?: 'asc' | 'desc';
      search?: string;
      is_active?: boolean;
      parent_id?: string;
    } = {},
    adminToken: string
  ): Promise<ApiResponse<{
    categories: MarketplaceCategory[];
    total: number;
  }>> {
    try {
      console.log('🔍 getAllMarketplaceCategoriesComplete: Fetching all categories with filters:', filters);
      
      // Primera llamada para obtener el total
      const firstCall = await this.getAllMarketplaceCategories({
        page: 1,
        page_size: 20,
        ...filters
      }, adminToken);

      if (firstCall.error) {
        return { error: firstCall.error };
      }

      if (!firstCall.data) {
        return { data: { categories: [], total: 0 } };
      }

      const totalCategories = firstCall.data.pagination.total;
      let allCategories = firstCall.data.categories || [];

      console.log('📊 Total categories to fetch:', totalCategories);

      if (totalCategories <= 20) {
        // Si hay 20 o menos, ya las tenemos todas
        return { 
          data: { 
            categories: allCategories, 
            total: totalCategories 
          } 
        };
      }

      // Si hay más de 20, hacer llamadas adicionales
      const pageSize = 20;
      const totalPages = Math.ceil(totalCategories / pageSize);
      
      console.log('📄 Total pages needed:', totalPages);

      // Hacer llamadas paralelas para las páginas restantes
      const additionalRequests = [];
      
      for (let page = 2; page <= totalPages; page++) {
        additionalRequests.push(
          this.getAllMarketplaceCategories({
            page,
            page_size: pageSize,
            ...filters
          }, adminToken)
        );
      }

      console.log('🚀 Making', additionalRequests.length, 'additional requests');

      const additionalResponses = await Promise.all(additionalRequests);

      // Combinar todas las respuestas válidas y contar errores
      let errorCount = 0;
      for (let i = 0; i < additionalResponses.length; i++) {
        const response = additionalResponses[i];
        const pageNum = i + 2; // página 2, 3, 4, etc.
        
        if (response.error) {
          errorCount++;
          console.warn(`⚠️ Failed request for page ${pageNum}:`, response.error);
        } else if (response.data?.categories) {
          console.log(`✅ Page ${pageNum}: Got ${response.data.categories.length} categories`);
          allCategories = allCategories.concat(response.data.categories);
        } else {
          console.warn(`⚠️ Page ${pageNum}: No categories in response`);
        }
      }

      console.log('✅ getAllMarketplaceCategoriesComplete: Total categories fetched:', allCategories.length);
      if (errorCount > 0) {
        console.warn('⚠️ Some requests failed:', errorCount, 'out of', additionalRequests.length);
      }

      // Deduplicar por ID para evitar duplicados
      const uniqueCategories = allCategories.filter((category, index, self) => 
        index === self.findIndex(c => c.id === category.id)
      );

      console.log('🔄 After deduplication:', uniqueCategories.length, 'unique categories');

      // Si fallaron muchas llamadas, advertir al usuario
      if (errorCount > additionalRequests.length / 2) {
        console.warn('🚨 Most additional requests failed. Showing partial results.');
      }

      return { 
        data: { 
          categories: uniqueCategories, 
          total: uniqueCategories.length // Usar el número real de categorías obtenidas
        } 
      };

    } catch (error) {
      console.error('❌ Error in getAllMarketplaceCategoriesComplete:', error);
      return { error: 'Error al obtener todas las categorías' };
    }
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
      sort_by?: string;
      sort_dir?: 'asc' | 'desc';
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
    if (options.sort_by) searchParams.set('sort_by', options.sort_by);
    if (options.sort_dir) searchParams.set('sort_dir', options.sort_dir);

    const endpoint = `/marketplace-attributes${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

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
    return this.request<MarketplaceAttribute>('/marketplace-attributes', {
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
    return this.request<MarketplaceAttribute>(`/marketplace-attributes/${attributeId}`, {
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
    return this.request<MarketplaceAttribute>(`/marketplace-attributes/${attributeId}`, {
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
    return this.request<void>(`/marketplace-attributes/${attributeId}`, {
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

    const endpoint = `/global-catalog${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

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
    return this.request<GlobalProduct>('/global-catalog', {
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
    return this.request<GlobalProduct>(`/global-catalog/${productId}`, {
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
    return this.request<GlobalProduct>(`/global-catalog/${productId}`, {
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
    return this.request<void>(`/global-catalog/${productId}`, {
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
    return this.request<GlobalProduct>(`/global-catalog/${productId}/verify`, {
      method: 'PATCH',
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
    return this.request<BulkImportResponse>('/global-catalog/bulk-import', {
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
    if (filters.sort_by) searchParams.set('sort_by', filters.sort_by);
    if (filters.sort_dir) searchParams.set('sort_dir', filters.sort_dir);

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

  async getAllMarketplaceBrandsComplete(
    filters: {
      search?: string;
      verification_status?: string;
      is_active?: boolean;
      country_code?: string;
      sort_by?: string;
      sort_dir?: 'asc' | 'desc';
    } = {},
    adminToken?: string
  ): Promise<ApiResponse<{
    brands: MarketplaceBrand[];
    total: number;
  }>> {
    try {
      const allBrands: MarketplaceBrand[] = [];
      let page = 1;
      const pageSize = 100; // Tamaño máximo permitido
      let hasMore = true;
      let totalCount = 0;
      let errorCount = 0;
      const maxErrors = 3;

      console.log('🔄 Iniciando carga completa de marcas...');

      while (hasMore && errorCount < maxErrors) {
        try {
          console.log(`📄 Cargando página ${page} (tamaño: ${pageSize})`);
          
          const response = await this.getAllMarketplaceBrands({
            ...filters,
            page,
            page_size: pageSize,
          }, adminToken);

          if (response.error) {
            errorCount++;
            console.warn(`⚠️ Error en página ${page}: ${response.error} (intento ${errorCount}/${maxErrors})`);
            
            if (errorCount >= maxErrors) {
              console.error(`❌ Demasiados errores, deteniendo en página ${page}`);
              return { error: `Error al cargar marcas después de ${maxErrors} intentos: ${response.error}` };
            }
            
            // Esperar antes de reintentar
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }

          if (!response.data?.brands) {
            console.warn(`⚠️ Página ${page} sin datos, deteniendo`);
            break;
          }

          const brands = response.data.brands;
          const pagination = response.data.pagination;
          
          // Actualizar total en la primera página exitosa
          if (totalCount === 0 && pagination?.total) {
            totalCount = pagination.total;
            console.log(`📊 Total de marcas: ${totalCount}`);
          }

          // Agregar marcas únicas (por si hay duplicados)
          const existingIds = new Set(allBrands.map(b => b.id));
          const newBrands = brands.filter(brand => !existingIds.has(brand.id));
          
          if (newBrands.length > 0) {
            allBrands.push(...newBrands);
            console.log(`✅ Página ${page}: ${newBrands.length} marcas nuevas (total: ${allBrands.length})`);
          } else {
            console.log(`⚠️ Página ${page}: ${brands.length} marcas duplicadas ignoradas`);
          }

          // Verificar si hay más páginas
          hasMore = pagination?.has_next || (brands.length === pageSize && allBrands.length < (totalCount || Infinity));
          
          if (!hasMore) {
            console.log(`✅ Carga completa: ${allBrands.length} marcas únicas cargadas`);
          }

          page++;
          errorCount = 0; // Reset error count en página exitosa

        } catch (error) {
          errorCount++;
          console.error(`❌ Error inesperado en página ${page}:`, error);
          
          if (errorCount >= maxErrors) {
            return { error: `Error inesperado después de ${maxErrors} intentos: ${error instanceof Error ? error.message : 'Error desconocido'}` };
          }
          
          // Esperar antes de reintentar
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Aplicar ordenamiento si se especificó
      if (filters.sort_by && allBrands.length > 0) {
        const sortField = filters.sort_by as keyof MarketplaceBrand;
        const sortDir = filters.sort_dir || 'asc';
        
        allBrands.sort((a, b) => {
          const aVal = a[sortField];
          const bVal = b[sortField];
          
          if (aVal === null || aVal === undefined) return 1;
          if (bVal === null || bVal === undefined) return -1;
          
          let result = 0;
          if (typeof aVal === 'string' && typeof bVal === 'string') {
            result = aVal.localeCompare(bVal);
          } else if (typeof aVal === 'number' && typeof bVal === 'number') {
            result = aVal - bVal;
          } else {
            result = String(aVal).localeCompare(String(bVal));
          }
          
          return sortDir === 'desc' ? -result : result;
        });
      }

      console.log(`🎉 Carga de marcas completada: ${allBrands.length} marcas`);

      return {
        data: {
          brands: allBrands,
          total: allBrands.length
        }
      };

    } catch (error) {
      console.error('❌ Error fatal cargando marcas:', error);
      return { 
        error: `Error fatal cargando marcas: ${error instanceof Error ? error.message : 'Error desconocido'}` 
      };
    }
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
      total: allBrands.data?.pagination?.total || 0,
      verified: verifiedBrands.data?.pagination?.total || 0,
      unverified: (allBrands.data?.pagination?.total || 0) - (verifiedBrands.data?.pagination?.total || 0),
      active: activeBrands.data?.pagination?.total || 0,
      inactive: (allBrands.data?.pagination?.total || 0) - (activeBrands.data?.pagination?.total || 0),
    };

    return { data: stats };
  }

  // ====================================
  // MARKETPLACE ATTRIBUTE VALUES MANAGEMENT
  // ====================================

  async getAllMarketplaceAttributeValues(
    attributeId: string,
    options: {
      page?: number;
      page_size?: number;
      search?: string;
      is_active?: boolean;
    } = {},
    _adminToken?: string
  ): Promise<ApiResponse<MarketplaceAttributeValuesResponse>> {
    const searchParams = new URLSearchParams();
    
    if (options.page) searchParams.set('page', options.page.toString());
    if (options.page_size) searchParams.set('page_size', options.page_size.toString());
    if (options.search) searchParams.set('search', options.search);
    if (options.is_active !== undefined) searchParams.set('is_active', options.is_active.toString());

    const endpoint = `/marketplace/attributes/${attributeId}/values${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    
    return this.request<MarketplaceAttributeValuesResponse>(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${_adminToken || 'dev-marketplace-admin'}`,
        'X-User-Role': 'marketplace_admin',
      },
    }, 'pim');
  }

  async createMarketplaceAttributeValue(
    value: CreateMarketplaceAttributeValueRequest,
    _adminToken?: string
  ): Promise<ApiResponse<MarketplaceAttributeValue>> {
    return this.request<MarketplaceAttributeValue>(`/marketplace/attributes/${value.attribute_id}/values`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${_adminToken || 'dev-marketplace-admin'}`,
        'X-User-Role': 'marketplace_admin',
      },
      body: JSON.stringify(value),
    }, 'pim');
  }

  async getMarketplaceAttributeValue(
    attributeId: string,
    valueId: string,
    _adminToken?: string
  ): Promise<ApiResponse<MarketplaceAttributeValue>> {
    return this.request<MarketplaceAttributeValue>(`/marketplace/attributes/${attributeId}/values/${valueId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${_adminToken || 'dev-marketplace-admin'}`,
        'X-User-Role': 'marketplace_admin',
      },
    }, 'pim');
  }

  async updateMarketplaceAttributeValue(
    attributeId: string,
    valueId: string,
    updates: UpdateMarketplaceAttributeValueRequest,
    _adminToken?: string
  ): Promise<ApiResponse<MarketplaceAttributeValue>> {
    return this.request<MarketplaceAttributeValue>(`/marketplace/attributes/${attributeId}/values/${valueId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${_adminToken || 'dev-marketplace-admin'}`,
        'X-User-Role': 'marketplace_admin',
      },
      body: JSON.stringify(updates),
    }, 'pim');
  }

  async deleteMarketplaceAttributeValue(
    attributeId: string,
    valueId: string,
    _adminToken?: string
  ): Promise<ApiResponse<void>> {
    return this.request<void>(`/marketplace/attributes/${attributeId}/values/${valueId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${_adminToken || 'dev-marketplace-admin'}`,
        'X-User-Role': 'marketplace_admin',
      },
    }, 'pim');
  }

  async getMarketplaceAttributeWithValues(
    attributeId: string,
    _adminToken?: string
  ): Promise<ApiResponse<MarketplaceAttributeWithValues>> {
    // Obtener el atributo y sus valores en paralelo
    const [attributeResponse, valuesResponse] = await Promise.all([
      this.getMarketplaceAttribute(attributeId, _adminToken),
      this.getAllMarketplaceAttributeValues(attributeId, { page_size: 1000 }, _adminToken)
    ]);

    if (attributeResponse.error) {
      return { error: attributeResponse.error };
    }

    if (valuesResponse.error) {
      return { error: valuesResponse.error };
    }

    const attributeWithValues: MarketplaceAttributeWithValues = {
      ...attributeResponse.data!,
      attribute_values: valuesResponse.data?.attribute_values || [],
      values_count: valuesResponse.data?.total || 0
    };

    return { data: attributeWithValues };
  }

  // =================================
  // BUSINESS TYPE TEMPLATES METHODS
  // =================================

  async getBusinessTypeTemplates(
    params?: {
      page?: number;
      page_size?: number;
      search?: string;
      business_type_id?: string;
      region?: string;
      is_active?: boolean;
      is_default?: boolean;
      sort_by?: string;
      sort_dir?: 'asc' | 'desc';
    },
    _adminToken?: string
  ): Promise<ApiResponse<CriteriaResponse<BusinessTypeTemplate>>> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.page_size) searchParams.append('page_size', params.page_size.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.business_type_id) searchParams.append('business_type_id', params.business_type_id);
    if (params?.region) searchParams.append('region', params.region);
    if (params?.is_active !== undefined) searchParams.append('is_active', params.is_active.toString());
    if (params?.is_default !== undefined) searchParams.append('is_default', params.is_default.toString());
    if (params?.sort_by) searchParams.append('sort_by', params.sort_by);
    if (params?.sort_dir) searchParams.append('sort_dir', params.sort_dir);

    const url = `/business-type-templates${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    
    return this.request<CriteriaResponse<BusinessTypeTemplate>>(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${_adminToken || 'dev-marketplace-admin'}`,
        'X-User-Role': 'marketplace_admin',
      },
    }, 'pim');
  }

  async getBusinessTypeTemplate(
    templateId: string,
    _adminToken?: string
  ): Promise<ApiResponse<{ template: BusinessTypeTemplate }>> {
    return this.request<{ template: BusinessTypeTemplate }>(`/business-type-templates/${templateId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${_adminToken || 'dev-marketplace-admin'}`,
        'X-User-Role': 'marketplace_admin',
      },
    }, 'pim');
  }

  async createBusinessTypeTemplate(
    template: CreateBusinessTypeTemplateRequest,
    _adminToken?: string
  ): Promise<ApiResponse<{ template: BusinessTypeTemplate }>> {
    return this.request<{ template: BusinessTypeTemplate }>(`/business-type-templates`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${_adminToken || 'dev-marketplace-admin'}`,
        'X-User-Role': 'marketplace_admin',
      },
      body: JSON.stringify(template),
    }, 'pim');
  }

  async updateBusinessTypeTemplate(
    templateId: string,
    template: Partial<CreateBusinessTypeTemplateRequest>,
    _adminToken?: string
  ): Promise<ApiResponse<{ template: BusinessTypeTemplate }>> {
    return this.request<{ template: BusinessTypeTemplate }>(`/business-type-templates/${templateId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${_adminToken || 'dev-marketplace-admin'}`,
        'X-User-Role': 'marketplace_admin',
      },
      body: JSON.stringify(template),
    }, 'pim');
  }

  async deleteBusinessTypeTemplate(
    templateId: string,
    _adminToken?: string
  ): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/business-type-templates/${templateId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${_adminToken || 'dev-marketplace-admin'}`,
        'X-User-Role': 'marketplace_admin',
      },
    }, 'pim');
  }

  // AI Integration Methods
  async generateTemplateWithAI(
    params: AITemplateParams,
    _adminToken?: string
  ): Promise<ApiResponse<{ template: BusinessTypeTemplate; ai_metadata: AIGenerationMetadata }>> {
    return this.request<{ template: BusinessTypeTemplate; ai_metadata: AIGenerationMetadata }>(`/ai/templates/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${_adminToken || 'dev-marketplace-admin'}`,
        'X-User-Role': 'marketplace_admin',
      },
      body: JSON.stringify(params),
    }, 'pim');
  }

  async getTemplateAnalytics(
    templateId: string,
    timeRange?: string,
    _adminToken?: string
  ): Promise<ApiResponse<TemplateAnalytics>> {
    const queryParams = timeRange ? `?time_range=${timeRange}` : '';
    return this.request<TemplateAnalytics>(`/templates/${templateId}/analytics${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${_adminToken || 'dev-marketplace-admin'}`,
        'X-User-Role': 'marketplace_admin',
      },
    }, 'pim');
  }

  async getAISuggestions(
    templateId: string,
    context: { business_type?: string; region?: string; current_data?: any },
    _adminToken?: string
  ): Promise<ApiResponse<AISuggestions>> {
    return this.request<AISuggestions>(`/ai/templates/${templateId}/suggestions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${_adminToken || 'dev-marketplace-admin'}`,
        'X-User-Role': 'marketplace_admin',
      },
      body: JSON.stringify(context),
    }, 'pim');
  }

  async optimizeTemplateWithAI(
    templateId: string,
    optimizationParams: { focus: string; constraints?: any },
    _adminToken?: string
  ): Promise<ApiResponse<{ optimized_template: BusinessTypeTemplate; changes: AIOptimizationChanges[] }>> {
    return this.request<{ optimized_template: BusinessTypeTemplate; changes: AIOptimizationChanges[] }>(`/ai/templates/${templateId}/optimize`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${_adminToken || 'dev-marketplace-admin'}`,
        'X-User-Role': 'marketplace_admin',
      },
      body: JSON.stringify(optimizationParams),
    }, 'pim');
  }

  async validateBrand(
    brandName: string,
    _adminToken?: string
  ): Promise<ApiResponse<{ 
    valid: boolean; 
    brand?: MarketplaceBrand; 
    suggestions?: string[];
    confidence?: number;
  }>> {
    // First, search for the brand in existing brands
    const searchResult = await this.getAllMarketplaceBrands({
      search: brandName,
      page_size: 10
    }, _adminToken);
    
    if (searchResult.error) {
      return { error: searchResult.error };
    }
    
    // Check if we have an exact match
    const exactMatch = searchResult.data?.items.find(
      b => b.name.toLowerCase() === brandName.toLowerCase() ||
           b.normalized_name.toLowerCase() === brandName.toLowerCase()
    );
    
    if (exactMatch) {
      return {
        data: {
          valid: true,
          brand: exactMatch,
          confidence: 100
        }
      };
    }
    
    // Check for similar brands
    const similarBrands = searchResult.data?.items || [];
    
    return {
      data: {
        valid: false,
        suggestions: similarBrands.map(b => b.name),
        confidence: similarBrands.length > 0 ? 50 : 0
      }
    };
  }
}

// Export singleton instance
export const marketplaceApi = new MarketplaceApiClient();