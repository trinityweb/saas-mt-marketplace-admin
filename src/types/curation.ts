// Types for Product Curation System

export interface ScrapedProduct {
  id: string;
  external_id: string;
  source: string;
  source_url?: string;
  name: string;
  description?: string;
  price: number;
  original_price?: number;
  currency: string;
  brand?: string;
  category?: string;
  images: string[];
  attributes?: Record<string, any>;
  scraped_at: string;
  status: 'pending' | 'processing' | 'curated' | 'rejected' | 'published';
  confidence_score?: number;
  validation_errors?: string[];
  curated_data?: CuratedProduct;
  created_at: string;
  updated_at: string;
}

export interface CuratedProduct {
  name: string;
  description: string;
  brand_id?: string;
  brand_name?: string;
  brand_validated?: boolean;
  category_id?: string;
  category_name?: string;
  attributes?: Record<string, any>;
  confidence_scores?: {
    overall: number;
    name: number;
    brand: number;
    category: number;
    description: number;
    attributes: number;
  };
  ai_suggestions?: {
    brand?: string[];
    category?: string[];
    attributes?: Record<string, any>;
  };
  curated_by?: string;
  curated_at?: string;
}

export interface CurationStats {
  total_products: number;
  pending: number;
  processing: number;
  curated: number;
  rejected: number;
  published: number;
  avg_confidence: number;
  today_curated: number;
  week_curated: number;
  month_curated: number;
}

export interface CurationFilter {
  status?: string;
  source?: string;
  brand?: string;
  category?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface BulkCurationAction {
  type: 'approve' | 'reject' | 'send_to_ai' | 'change_brand' | 'change_category' | 'delete';
  product_ids: string[];
  data?: {
    brand_id?: string;
    category_id?: string;
    reason?: string;
  };
}

export interface CurationJob {
  id: string;
  type: 'ai_curation' | 'manual_curation' | 'bulk_update';
  status: 'pending' | 'running' | 'completed' | 'failed';
  product_count: number;
  processed_count: number;
  success_count: number;
  error_count: number;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
  created_by: string;
  created_at: string;
}