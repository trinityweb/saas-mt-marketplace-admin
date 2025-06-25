// ====================================
// TIPOS PARA SERVICIO PIM
// ====================================

// Tipos de respuesta de API
export interface ApiResponse<T> {
  data: T;
  message: string;
  status: 'success' | 'error';
  pagination?: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ====================================
// BUSINESS TYPES
// ====================================

export interface BusinessType {
  id: string;
  code: string;
  name: string;
  description: string;
  icon?: string;
  color?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface BusinessTypeCreateRequest {
  code: string;
  name: string;
  description: string;
  icon?: string;
  color?: string;
  is_active?: boolean;
  sort_order?: number;
}

export interface BusinessTypeUpdateRequest extends Partial<BusinessTypeCreateRequest> {
  id: string;
}

// ====================================
// BUSINESS TYPE TEMPLATES
// ====================================

export interface BusinessTypeTemplate {
  id: string;
  name: string;
  description: string;
  business_type_id: string;
  business_type?: BusinessType;
  version: string;
  region: string;
  is_active: boolean;
  is_default: boolean;
  template_data: BusinessTypeTemplateData;
  created_at: string;
  updated_at: string;
  // Estadísticas calculadas
  stats?: {
    categories_count: number;
    attributes_count: number;
    products_count: number;
    brands_count: number;
  };
}

export interface BusinessTypeTemplateData {
  categories: CategoryTemplate[];
  attributes: AttributeTemplate[];
  products: ProductTemplate[];
  brands: string[];
}

export interface CategoryTemplate {
  name: string;
  description: string;
  parent_name?: string;
  sort_order: number;
  attributes: string[];
}

export interface AttributeTemplate {
  code: string;
  name: string;
  type: 'text' | 'number' | 'select' | 'multi_select' | 'boolean';
  is_required: boolean;
  default_value?: string;
  options?: string[];
  validation_rules?: Record<string, any>;
}

export interface ProductTemplate {
  name: string;
  description: string;
  category: string;
  brand: string;
  sku: string;
  price: number;
  attributes: Record<string, any>;
}

export interface BusinessTypeTemplateCreateRequest {
  name: string;
  description: string;
  business_type_id: string;
  version: string;
  region: string;
  is_active?: boolean;
  is_default?: boolean;
  template_data: BusinessTypeTemplateData;
}

export interface BusinessTypeTemplateUpdateRequest extends Partial<BusinessTypeTemplateCreateRequest> {
  id: string;
}

// ====================================
// MARKETPLACE CATEGORIES
// ====================================

export interface MarketplaceCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string;
  parent?: MarketplaceCategory;
  level: number;
  path: string;
  is_active: boolean;
  sort_order: number;
  attributes?: MarketplaceAttribute[];
  created_at: string;
  updated_at: string;
  // Para la vista jerárquica
  children?: MarketplaceCategory[];
}

export interface MarketplaceCategoryCreateRequest {
  name: string;
  description?: string;
  parent_id?: string;
  is_active?: boolean;
  sort_order?: number;
}

export interface MarketplaceCategoryUpdateRequest extends Partial<MarketplaceCategoryCreateRequest> {
  id: string;
}

// ====================================
// MARKETPLACE ATTRIBUTES
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

export interface MarketplaceAttributeCreateRequest {
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

export interface MarketplaceAttributeUpdateRequest extends Partial<MarketplaceAttributeCreateRequest> {
  id: string;
}

// ====================================
// GLOBAL CATALOG PRODUCTS
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

export interface GlobalProductCreateRequest {
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

export interface GlobalProductUpdateRequest extends Partial<GlobalProductCreateRequest> {
  id: string;
}

// ====================================
// FILTROS Y CRITERIOS DE BÚSQUEDA
// ====================================

export interface BusinessTypeTemplateFilters {
  name?: string;
  business_type_id?: string;
  region?: string;
  is_active?: boolean;
  is_default?: boolean;
  version?: string;
}

export interface MarketplaceCategoryFilters {
  name?: string;
  slug?: string;
  parent_id?: string;
  level?: number;
  is_active?: boolean;
}

export interface MarketplaceAttributeFilters {
  code?: string;
  name?: string;
  type?: string;
  is_required?: boolean;
  is_filterable?: boolean;
  is_searchable?: boolean;
  is_active?: boolean;
  group_name?: string;
}

export interface GlobalProductFilters {
  ean?: string;
  name?: string;
  brand?: string;
  category_id?: string;
  is_verified?: boolean;
  source?: string;
  quality_score_min?: number;
  quality_score_max?: number;
}

// ====================================
// CRITERIOS DE ORDENACIÓN
// ====================================

export type SortField = 'created_at' | 'updated_at' | 'name' | 'sort_order' | 'quality_score';
export type SortOrder = 'asc' | 'desc';

export interface SortCriteria {
  field: SortField;
  order: SortOrder;
}

// ====================================
// BULK OPERATIONS
// ====================================

export interface BulkOperationRequest<T> {
  operation: 'create' | 'update' | 'delete' | 'activate' | 'deactivate';
  items: T[];
}

export interface BulkOperationResponse {
  successful: number;
  failed: number;
  errors: Array<{
    index: number;
    error: string;
  }>;
}

// ====================================
// ERROR HANDLING
// ====================================

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  field?: string;
}

export interface ValidationError extends ApiError {
  field: string;
  value: any;
  constraint: string;
} 