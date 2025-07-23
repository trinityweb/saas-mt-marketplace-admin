// Tipos genéricos para componentes de productos reutilizables
// Funcionan tanto para productos de tenant como productos globales

export interface BaseProduct {
  id: string;
  name: string;
  description?: string;
  brand?: string;
  category?: string;
  ean?: string;
  price?: number;
  quality_score?: number;
  is_verified?: boolean;
  is_active?: boolean;
  source?: string;
  image_url?: string;
  image_urls?: string[] | null;
  tags?: string[] | null;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

// Datos básicos del producto (para formularios)
export interface ProductFormData {
  name: string;
  description: string;
  brand: string;
  category: string;
  ean?: string;
  price?: number;
  status: 'active' | 'inactive' | 'draft';
  tags: string[];
  weight?: string;
  dimensions?: string;
  quality_score?: number;
  is_verified?: boolean;
  source?: string;
}

// Propiedades para componentes de visualización
export interface ProductViewProps {
  product: BaseProduct;
  mode: 'view' | 'edit';
  onSave?: (data: Partial<BaseProduct>) => Promise<void>;
  onCancel?: () => void;
  showVerificationBadge?: boolean;
  showQualityScore?: boolean;
  showSource?: boolean;
  readonly?: boolean;
}

// Propiedades para componentes de edición
export interface ProductEditProps {
  product?: BaseProduct;
  onSave: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
  brands: Array<{ id: string; name: string }>;
  categories: Array<{ id: string; name: string }>;
  readonly?: boolean;
  mode: 'create' | 'edit';
}

// Propiedades para vista de tarjetas
export interface ProductCardProps {
  product: BaseProduct;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete?: (id: string) => void;
  onVerify?: (id: string) => void;
  showActions?: boolean;
  compact?: boolean;
}

// Estados de carga y error
export interface LoadingState {
  loading: boolean;
  error: string | null;
  success: string | null;
}

// Configuración de contexto (backoffice vs marketplace)
export interface ProductContext {
  type: 'tenant' | 'global';
  endpoints: {
    list: string;
    create: string;
    update: string;
    delete: string;
    brands: string;
    categories: string;
  };
  permissions: {
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canVerify: boolean;
  };
} 