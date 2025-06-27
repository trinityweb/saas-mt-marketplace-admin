// Types - Usando la estructura de tipos de negocio del PIM
export interface BusinessType {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface BusinessTypesResponse {
  items: BusinessType[];
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface BusinessTypesFilters {
  search?: string;
  is_active?: boolean;
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
}

// API Client
export const businessTypesApi = {
  async getBusinessTypes(filters: BusinessTypesFilters = {}): Promise<BusinessTypesResponse> {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.is_active !== undefined) params.append('is_active', filters.is_active.toString());
    if (filters.page !== undefined) params.append('page', filters.page.toString());
    if (filters.page_size !== undefined) params.append('page_size', filters.page_size.toString());
    if (filters.sort_by) params.append('sort_by', filters.sort_by);
    if (filters.sort_dir) params.append('sort_dir', filters.sort_dir);

    const url = `/api/pim/business-types${params.toString() ? `?${params.toString()}` : ''}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error al obtener tipos de negocio: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Formato específico del backend PIM: { business_types: [...], total: number }
      if (data.business_types && Array.isArray(data.business_types)) {
        const page = filters.page || 1;
        const page_size = filters.page_size || 20;
        const total_count = data.total || data.business_types.length;
        const total_pages = Math.ceil(total_count / page_size);
        
        // PAGINACIÓN CLIENT-SIDE (temporal hasta que se arregle el backend)
        const startIndex = (page - 1) * page_size;
        const endIndex = startIndex + page_size;
        const paginatedItems = data.business_types.slice(startIndex, endIndex);
        
        return {
          items: paginatedItems,
          total_count,
          page,
          page_size,
          total_pages,
        };
      }
      
      // Si la API devuelve un array directamente, adaptarlo al formato esperado
      if (Array.isArray(data)) {
        const page = filters.page || 1;
        const page_size = filters.page_size || 20;
        const total_count = data.length;
        const total_pages = Math.ceil(total_count / page_size);
        
        return {
          items: data,
          total_count,
          page,
          page_size,
          total_pages,
        };
      }
      
      // Si la API ya devuelve un objeto paginado
      if (data.items || data.data) {
        return {
          items: data.items || data.data,
          total_count: data.total_count || data.total || 0,
          page: data.page || filters.page || 1,
          page_size: data.page_size || filters.page_size || 20,
          total_pages: data.total_pages || Math.ceil((data.total_count || data.total || 0) / (data.page_size || filters.page_size || 20)),
        };
      }
      
      // Fallback si el formato es inesperado
      console.warn('Formato de respuesta inesperado:', data);
      return {
        items: [],
        total_count: 0,
        page: filters.page || 1,
        page_size: filters.page_size || 20,
        total_pages: 0,
      };
    } catch (error) {
      console.error('Error fetching business types:', error);
      throw error;
    }
  },

  async getBusinessTypesById(id: string): Promise<BusinessType> {
    const response = await fetch(`/api/pim/business-types/${id}`);
    if (!response.ok) {
      throw new Error(`Error al obtener tipo de negocio: ${response.status}`);
    }
    return response.json();
  },

  async createBusinessType(businessType: Omit<BusinessType, 'id' | 'created_at' | 'updated_at' | 'is_active'>): Promise<BusinessType> {
    const response = await fetch('/api/pim/business-types', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(businessType),
    });
    
    if (!response.ok) {
      throw new Error(`Error al crear tipo de negocio: ${response.status}`);
    }
    
    return response.json();
  },

  async updateBusinessType(id: string, updates: Partial<BusinessType>): Promise<BusinessType> {
    const response = await fetch(`/api/pim/business-types/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      throw new Error(`Error al actualizar tipo de negocio: ${response.status}`);
    }
    
    return response.json();
  },

  async deleteBusinessType(id: string): Promise<void> {
    const response = await fetch(`/api/pim/business-types/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Error al eliminar tipo de negocio: ${response.status}`);
    }
  },
};
