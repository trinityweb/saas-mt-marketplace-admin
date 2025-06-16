export interface IamLoginRequest {
  email: string;
  password?: string;
  google_token?: string;
  provider: 'LOCAL' | 'GOOGLE';
  tenant_id?: string;
}

export interface IamRole {
  id: string;
  name: string;
  description: string;
  saas: string;
  created_at: string;
  updated_at: string;
}

export interface IamRoleCreate {
  name: string;
  description: string;
  saas: string;
}

export interface IamRoleUpdate {
  name?: string;
  description?: string;
  saas?: string;
}

export class RoleAdapter implements IamRole {
  constructor(
    public id: string,
    public name: string,
    public description: string,
    public saas: string,
    public created_at: string,
    public updated_at: string,
  ) {}

  // Getters legacy para compatibilidad con código existente
  get ID(): string { return this.id; }
  get Name(): string { return this.name; }
  get Description(): string { return this.description; }
  get Saas(): string { return this.saas; }
  get CreatedAt(): string { return this.created_at; }
  get UpdatedAt(): string { return this.updated_at; }

  static fromResponse(data: IamRole): RoleAdapter {
    return new RoleAdapter(
      data.id,
      data.name,
      data.description,
      data.saas,
      data.created_at,
      data.updated_at
    );
  }
}

export interface IamUser {
  id: string;
  email: string;
  tenant_id: string;
  role_id: string;
  status: string;
  provider: string;
  created_at: string;
  updated_at: string;
  tenant?: IamTenant;
  role?: {
    id: string;
    name: string;
    description: string;
  };
}

export class UserAdapter implements IamUser {
  constructor(
    public ID: string,
    public Email: string,
    public TenantID: string,
    public RoleID: string,
    public Status: string,
    public Provider: string,
    public CreatedAt: string,
    public UpdatedAt: string,
    public Tenant?: IamTenant,
    public Role?: {
      ID: string;
      Name: string;
      Description: string;
    }
  ) {}

  // Getters de conveniencia
  get id(): string { return this.ID; }
  get email(): string { return this.Email; }
  get tenant_id(): string { return this.TenantID; }
  get role_id(): string { return this.RoleID; }
  get status(): string { return this.Status; }
  get provider(): string { return this.Provider; }
  get created_at(): string { return this.CreatedAt; }
  get updated_at(): string { return this.UpdatedAt; }
  get tenant(): IamTenant | undefined { return this.Tenant; }
  get role(): { id: string; name: string; description: string; } | undefined { return this.Role; }

  // Getters de conveniencia
  get name(): string { return this.email.split('@')[0]; }
  get roleName(): string { return this.role?.name || this.role_id; }

  static fromResponse(data: IamUser): UserAdapter {
    // Manejar tanto la estructura snake_case como camelCase
    const id = data.id || data.ID;
    const email = data.email || data.Email;
    const tenantId = data.tenant_id || data.TenantID;
    const roleId = data.role_id || data.RoleID;
    const status = data.status || data.Status;
    const provider = data.provider || data.Provider;
    const createdAt = data.created_at || data.CreatedAt;
    const updatedAt = data.updated_at || data.UpdatedAt;
    const tenant = data.tenant || data.Tenant;
    const role = data.role || data.Role;

    return new UserAdapter(
      id,
      email,
      tenantId,
      roleId,
      status,
      provider,
      createdAt,
      updatedAt,
      tenant,
      role
    );
  }
}

export interface IamAuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: IamUser;
}

export interface IamTenantCreate {
  name: string;
  email_key: string;
  plan_id: string;
}

export interface IamUserCreate {
  email: string;
  name: string;
  role: string;
  tenant_id: string;
}

export interface IamUserUpdate {
  email?: string;
  role_id?: string;
  status?: string;
  provider?: string;
}

export interface IamApiError {
  error: {
    code: string;
    message: string;
  };
}

export interface IamPlanCreate {
  name: string;
  description: string;
  monthly_price: number;
  yearly_price: number;
  features: any[];
}

export interface IamPlanUpdate {
  name?: string;
  description?: string;
  monthly_price?: number;
  yearly_price?: number;
  features?: any[];
}

export interface IamPlan {
  id: string;
  saas: string;
  name: string;
  description: string;
  features: any[] | null;
  monthly_price: number;
  yearly_price: number;
  created_at: string;
  updated_at: string;
}

export class PlanAdapter implements IamPlan {
  constructor(
    public id: string,
    public saas: string,
    public name: string,
    public description: string,
    public features: any[] | null,
    public monthly_price: number,
    public yearly_price: number,
    public created_at: string,
    public updated_at: string,
  ) {}

  // Getters legacy para compatibilidad con código existente
  get ID(): string { return this.id; }
  get Saas(): string { return this.saas; }
  get Name(): string { return this.name; }
  get Description(): string { return this.description; }
  get Features(): any[] | null { return this.features; }
  get MonthlyPrice(): number { return this.monthly_price; }
  get YearlyPrice(): number { return this.yearly_price; }
  get CreatedAt(): string { return this.created_at; }
  get UpdatedAt(): string { return this.updated_at; }

  static fromResponse(data: IamPlan): PlanAdapter {
    return new PlanAdapter(
      data.id,
      data.saas,
      data.name,
      data.description,
      data.features,
      data.monthly_price,
      data.yearly_price,
      data.created_at,
      data.updated_at
    );
  }
}

export interface IamTenant {
  id: string;
  name: string;
  slug: string;
  description: string;
  type: string;
  status: string;
  plan_id: string;
  max_users: number;
  user_count: number;
  owner_id: string;
  settings: Record<string, any>;
  features: {
    friends_family: boolean;
    premium_analytics: boolean;
  };
  is_active: boolean;
  can_access: boolean;
  is_expired: boolean;
  can_add_user: boolean;
  has_plan: boolean;
  has_custom_domain: boolean;
  created_at: string;
  updated_at: string;
  plan?: IamPlan;
  users?: IamUser[] | null;
}

export class TenantAdapter implements IamTenant {
  constructor(
    public id: string,
    public name: string,
    public slug: string,
    public description: string,
    public type: string,
    public status: string,
    public plan_id: string,
    public max_users: number,
    public user_count: number,
    public owner_id: string,
    public settings: Record<string, any>,
    public features: {
      friends_family: boolean;
      premium_analytics: boolean;
    },
    public is_active: boolean,
    public can_access: boolean,
    public is_expired: boolean,
    public can_add_user: boolean,
    public has_plan: boolean,
    public has_custom_domain: boolean,
    public created_at: string,
    public updated_at: string,
    public plan?: IamPlan,
    public users?: IamUser[] | null
  ) {}

  // Getters legacy para compatibilidad con código existente
  get ID(): string { return this.id; }
  get Name(): string { return this.name; }
  get PlanID(): string { return this.plan_id; }
  get EmailUserKey(): string { return this.owner_id; } // Fallback para compatibilidad
  get CreatedAt(): string { return this.created_at; }
  get UpdatedAt(): string { return this.updated_at; }
  get Plan(): IamPlan | undefined { return this.plan; }
  get Users(): IamUser[] | null | undefined { return this.users; }

  static fromResponse(data: IamTenant): TenantAdapter {
    return new TenantAdapter(
      data.id,
      data.name,
      data.slug,
      data.description,
      data.type,
      data.status,
      data.plan_id,
      data.max_users,
      data.user_count,
      data.owner_id,
      data.settings,
      data.features,
      data.is_active,
      data.can_access,
      data.is_expired,
      data.can_add_user,
      data.has_plan,
      data.has_custom_domain,
      data.created_at,
      data.updated_at,
      data.plan,
      data.users
    );
  }
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  roles: Role[];
  tenants: Tenant[];
}

export interface Role {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  permissions: Permission[];
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  created_at: string;
  updated_at: string;
}

export interface Tenant {
  id: string;
  name: string;
  description: string;
  domain: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role_ids: string[];
  tenant_ids: string[];
}

export interface UpdateUserRequest {
  first_name?: string;
  last_name?: string;
  role_ids?: string[];
  tenant_ids?: string[];
}

export interface CreateTenantRequest {
  name: string;
  description: string;
  domain: string;
}

export interface UpdateTenantRequest {
  name?: string;
  description?: string;
  domain?: string;
}

export interface CreateRoleRequest {
  name: string;
  description: string;
  permission_ids: string[];
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  permission_ids?: string[];
}

// Respuestas con patrón Criteria
export interface TenantsResponse {
  tenants: IamTenant[];
  total_count: number;
  page: number;
  page_size: number;
}

export interface RolesResponse {
  roles: IamRole[];
  total_count: number;
  page: number;
  page_size: number;
}

export interface PlansResponse {
  plans: IamPlan[];
  total_count: number;
  page: number;
  page_size: number;
}

export interface UsersResponse {
  users: IamUser[];
  total_count: number;
  page: number;
  page_size: number;
} 