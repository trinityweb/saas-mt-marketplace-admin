import { API_CONFIG, API_ROUTES } from "@/lib/config/api";
import {
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  IamUser,
  IamRole,
  Permission,
  IamTenant,
  IamPlan,
  ChangePasswordRequest,
  IamUserCreate,
  IamUserUpdate,
  IamTenantCreate,
  UpdateTenantRequest,
  IamRoleCreate,
  IamRoleUpdate,
  IamPlanCreate,
  IamPlanUpdate,
  TenantsResponse,
  RolesResponse,
  PlansResponse,
  UsersResponse,
} from "@/lib/types/iam-api";

// Interfaces para criterios de búsqueda
export interface UserSearchCriteria {
  tenantId?: string;
  status?: string;
  roleId?: string;
  page?: number;
  pageSize?: number;
}

export interface UserListResponse {
  users: IamUser[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

class IamApiClient {
  private baseUrl = API_CONFIG.clientIamBaseUrl;

  // Método para obtener el token almacenado
  private getStoredTokens() {
    if (typeof window !== 'undefined') {
      return {
        accessToken: localStorage.getItem('iam_access_token'),
        refreshToken: localStorage.getItem('iam_refresh_token'),
        tenantId: localStorage.getItem('current_tenant_id')
      };
    }
    return { accessToken: null, refreshToken: null, tenantId: null };
  }

  // Método para almacenar tokens
  private storeTokens(accessToken: string, refreshToken: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('iam_access_token', accessToken);
      localStorage.setItem('iam_refresh_token', refreshToken);
    }
  }

  // Método para construir query parameters
  private buildQueryParams(criteria: Record<string, any>): string {
    const params = new URLSearchParams();
    
    Object.entries(criteria).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        // Convertir nombres de parámetros de camelCase a snake_case
        let paramName = key;
        if (key === 'tenantId') paramName = 'tenant_id';
        if (key === 'roleId') paramName = 'role_id';
        if (key === 'pageSize') paramName = 'page_size';
        
        params.append(paramName, value.toString());
      }
    });
    
    return params.toString();
  }

  // Método para manejar respuestas y errores
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = `Error del servidor: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.text();
        errorMessage += ` - ${errorData}`;
      } catch (e) {
        console.error('No se pudo leer el cuerpo del error:', e);
      }
      throw new Error(errorMessage);
    }
    
    return response.json();
  }

  private async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const { accessToken, tenantId } = this.getStoredTokens();
    
    // Crear objeto de headers base
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Añadir token de autorización si existe
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    // Añadir tenant ID si existe
    if (tenantId) {
      headers['X-Tenant-ID'] = tenantId;
    }

    // Combinar con headers adicionales si existen
    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    try {
      console.log(`IamClient: Enviando solicitud ${options.method || 'GET'} a ${endpoint}`);
      console.log(`IamClient: Headers enviados:`, headers);
      console.log(`IamClient: URL completa:`, `${this.baseUrl}${endpoint}`);
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: headers
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      console.error(`IamClient: Error en solicitud ${endpoint}:`, error);
      throw error;
    }
  }

  // Auth
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await this.fetch<LoginResponse>(API_ROUTES.IAM.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    // Almacenar tokens
    this.storeTokens(response.access_token, response.refresh_token);

    return response;
  }

  async logout(): Promise<void> {
    try {
      // Intentar hacer logout en el servidor
      await this.fetch(API_ROUTES.IAM.AUTH.LOGOUT, {
        method: 'POST',
      });
    } catch (error) {
      // Si el logout falla (ej: token expirado), logueamos pero no lanzamos error
      console.warn('Error al hacer logout en el servidor:', error);
      // No relanzamos el error para permitir que la limpieza local continúe
    }

    // Siempre limpiar tokens almacenados independientemente del resultado del servidor
    if (typeof window !== 'undefined') {
      localStorage.removeItem('iam_access_token');
      localStorage.removeItem('iam_refresh_token');
      localStorage.removeItem('current_tenant_id');
    }
  }

  async refreshToken(data: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    const response = await this.fetch<RefreshTokenResponse>(API_ROUTES.IAM.AUTH.REFRESH_TOKEN, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    // Almacenar nuevos tokens
    this.storeTokens(response.access_token, response.refresh_token);

    return response;
  }

  async verifyToken(): Promise<void> {
    await this.fetch(API_ROUTES.IAM.AUTH.VERIFY_TOKEN, {
      method: 'POST',
    });
  }

  // Users - Métodos mejorados con criterios de búsqueda
  async searchUsers(criteria: UserSearchCriteria): Promise<UserListResponse> {
    // Validar que al menos un criterio de filtro esté presente
    if (!criteria.tenantId && !criteria.status && !criteria.roleId) {
      // Si no hay criterios específicos, usar el tenant actual como fallback
      const { tenantId } = this.getStoredTokens();
      if (tenantId) {
        criteria.tenantId = tenantId;
      } else {
        throw new Error('Se requiere al menos un criterio de búsqueda');
      }
    }

    const queryParams = this.buildQueryParams(criteria);
    const endpoint = `/users/search?${queryParams}`;
    
    console.log('Buscando usuarios con criterios:', criteria);
    console.log('Endpoint construido:', endpoint);
    
    const response = await this.fetch<UserListResponse>(endpoint);
    console.log('Respuesta de búsqueda de usuarios:', response);
    
    return response;
  }

  async getUsers(): Promise<IamUser[]> {
    try {
      console.log('Obteniendo lista de usuarios...');
      const users = await this.fetch<IamUser[]>('/users');
      console.log('Usuarios obtenidos:', users);
      return users;
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      throw error;
    }
  }

  async getUser(id: string): Promise<IamUser> {
    return this.fetch<IamUser>(`/users/${id}`);
  }

  async createUser(data: IamUserCreate): Promise<IamUser> {
    return this.fetch<IamUser>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUser(id: string, data: IamUserUpdate): Promise<IamUser> {
    return this.fetch<IamUser>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: string): Promise<void> {
    await this.fetch(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  async changePassword(id: string, data: ChangePasswordRequest): Promise<void> {
    await this.fetch(`/users/${id}/change-password`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUsersByTenant(tenantId: string, page?: number, pageSize?: number): Promise<IamUser[]> {
    const params = new URLSearchParams();
    if (page !== undefined) params.append('page', page.toString());
    if (pageSize !== undefined) params.append('page_size', pageSize.toString());
    
    const queryString = params.toString();
    const endpoint = `/tenants/${tenantId}/users${queryString ? `?${queryString}` : ''}`;
    
    return this.fetch<IamUser[]>(endpoint);
  }

  async getUsersByStatus(status: string, page?: number, pageSize?: number): Promise<IamUser[]> {
    const params = new URLSearchParams();
    params.append('status', status);
    if (page !== undefined) params.append('page', page.toString());
    if (pageSize !== undefined) params.append('page_size', pageSize.toString());
    
    return this.fetch<IamUser[]>(`/users?${params.toString()}`);
  }

  async getUsersByRole(roleId: string, page?: number, pageSize?: number): Promise<IamUser[]> {
    const params = new URLSearchParams();
    params.append('role_id', roleId);
    if (page !== undefined) params.append('page', page.toString());
    if (pageSize !== undefined) params.append('page_size', pageSize.toString());
    
    return this.fetch<IamUser[]>(`/users?${params.toString()}`);
  }

  // Tenants
  async getTenants(): Promise<IamTenant[]> {
    return this.fetch<IamTenant[]>('/tenants');
  }

  async getTenant(id: string): Promise<IamTenant> {
    return this.fetch<IamTenant>(`/tenants/${id}`);
  }

  async createTenant(data: IamTenantCreate): Promise<IamTenant> {
    return this.fetch<IamTenant>('/tenants', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTenant(id: string, data: UpdateTenantRequest): Promise<IamTenant> {
    return this.fetch<IamTenant>(`/tenants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTenant(id: string): Promise<void> {
    await this.fetch(`/tenants/${id}`, {
      method: 'DELETE',
    });
  }

  async getTenantUsers(id: string): Promise<IamUser[]> {
    return this.fetch<IamUser[]>(`/tenants/${id}/users`);
  }

  // Roles
  async getRoles(): Promise<IamRole[]> {
    return this.fetch<IamRole[]>('/roles');
  }

  async getRole(id: string): Promise<IamRole> {
    return this.fetch<IamRole>(`/roles/${id}`);
  }

  async createRole(data: IamRoleCreate): Promise<IamRole> {
    return this.fetch<IamRole>('/roles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRole(id: string, data: IamRoleUpdate): Promise<IamRole> {
    return this.fetch<IamRole>(`/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteRole(id: string): Promise<void> {
    await this.fetch(`/roles/${id}`, {
      method: 'DELETE',
    });
  }

  async getRolePermissions(id: string): Promise<Permission[]> {
    return this.fetch<Permission[]>(`/roles/${id}/permissions`);
  }

  // Permissions
  async getPermissions(): Promise<Permission[]> {
    return this.fetch<Permission[]>('/permissions');
  }

  async getPermission(id: string): Promise<Permission> {
    return this.fetch<Permission>(`/permissions/${id}`);
  }

  // Plans
  async getPlans(): Promise<IamPlan[]> {
    return this.fetch<IamPlan[]>('/plans');
  }

  async getPlan(id: string): Promise<IamPlan> {
    return this.fetch<IamPlan>(`/plans/${id}`);
  }

  async createPlan(data: IamPlanCreate): Promise<IamPlan> {
    return this.fetch<IamPlan>('/plans', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePlan(id: string, data: IamPlanUpdate): Promise<IamPlan> {
    return this.fetch<IamPlan>(`/plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePlan(id: string): Promise<void> {
    await this.fetch(`/plans/${id}`, {
      method: 'DELETE',
    });
  }

  // Método de debug para búsqueda de usuarios
  async debugSearchUsers(): Promise<{ success: boolean; method: string; result?: UserListResponse; error?: string }[]> {
    const methods = [
      { name: 'Búsqueda general', call: () => this.getUsers() },
      { name: 'Búsqueda por tenant', call: () => this.searchUsers({ tenantId: 'test-tenant' }) },
      { name: 'Búsqueda por status', call: () => this.searchUsers({ status: 'ACTIVE' }) },
    ];

    const results = [];
    for (const method of methods) {
      try {
        const result = await method.call();
        results.push({ success: true, method: method.name, result });
      } catch (error) {
        results.push({ 
          success: false, 
          method: method.name, 
          error: error instanceof Error ? error.message : 'Error desconocido'
        });
      }
    }

    return results;
  }
}

// Crear instancia única
export const iamClient = new IamApiClient(); 