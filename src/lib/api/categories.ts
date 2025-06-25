// Types - Usando la estructura de categorías marketplace del PIM
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  is_active: boolean;
  parent_id?: string | null;
  level: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CategoriesResponse {
  categories: Category[];
  pagination: {
    total: number;
    offset: number;
    limit: number;
    has_next: boolean;
    has_prev: boolean;
    total_pages: number;
  };
  summary?: {
    total_categories: number;
    active_count: number;
    inactive_count: number;
    root_categories: number;
  };
}

export interface CategoriesFilters {
  search?: string;
  is_active?: boolean;
  parent_id?: string;
  offset?: number;
  limit?: number;
}

// API Client
export const categoriesApi = {
  // Obtener categorías con filtros
  async getCategories(filters: CategoriesFilters = {}): Promise<CategoriesResponse> {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.is_active !== undefined) params.append('is_active', filters.is_active.toString());
    if (filters.parent_id) params.append('parent_id', filters.parent_id);
    if (filters.offset !== undefined) params.append('offset', filters.offset.toString());
    if (filters.limit !== undefined) params.append('limit', filters.limit.toString());

    const url = `/api/pim/marketplace-categories${params.toString() ? `?${params.toString()}` : ''}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error al obtener categorías: ${response.status}`);
    }
    
    return response.json();
  },

  // Obtener categoría por ID
  async getCategoryById(id: string): Promise<Category> {
    const response = await fetch(`/api/pim/marketplace-categories/${id}`);
    if (!response.ok) {
      throw new Error(`Error al obtener categoría: ${response.status}`);
    }
    return response.json();
  },

  // Crear nueva categoría
  async createCategory(category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category> {
    const response = await fetch('/api/pim/marketplace-categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(category),
    });
    
    if (!response.ok) {
      throw new Error(`Error al crear categoría: ${response.status}`);
    }
    
    return response.json();
  },

  // Actualizar categoría
  async updateCategory(id: string, category: Partial<Category>): Promise<Category> {
    const response = await fetch(`/api/pim/marketplace-categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(category),
    });
    
    if (!response.ok) {
      throw new Error(`Error al actualizar categoría: ${response.status}`);
    }
    
    return response.json();
  },

  // Eliminar categoría
  async deleteCategory(id: string): Promise<void> {
    const response = await fetch(`/api/pim/marketplace-categories/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Error al eliminar categoría: ${response.status}`);
    }
  },

  // Obtener filtros únicos
  async getUniqueFilters(): Promise<{
    statuses: { label: string; value: boolean }[];
  }> {
    const statuses = [
      { label: 'Activas', value: true },
      { label: 'Inactivas', value: false }
    ];
    
    return { statuses };
  }
}; 