// Configuration for Marketplace Admin
export const config = {
  // API Configuration
  api: {
    // Conexión a través de Kong API Gateway
    // En el navegador usar localhost:8001, en el servidor usar la URL interna
    baseUrl: (() => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      // Si estamos en el navegador (typeof window !== 'undefined'), usar localhost
      if (typeof window !== 'undefined') {
        return 'http://localhost:8001/pim/api/v1';
      }
      // Si estamos en el servidor, usar la URL interna o localhost como fallback
      return (apiUrl || 'http://localhost:8001') + '/pim/api/v1';
    })(),
    timeout: 30000,
    retries: 3,
  },

  // Authentication
  auth: {
    // Token temporal de desarrollo - en producción usaríamos JWT del IAM
    adminToken: process.env.NEXT_PUBLIC_MARKETPLACE_ADMIN_TOKEN || 'marketplace-admin-token-dev',
    tokenHeader: 'Authorization',
    roleHeader: 'X-User-Role',
    defaultRole: 'marketplace_admin',
  },

  // Application
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'Marketplace Admin',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    debug: process.env.NEXT_PUBLIC_DEBUG === 'true',
  },

  // Theme
  theme: {
    default: process.env.NEXT_PUBLIC_DEFAULT_THEME || 'dark',
  },

  // Features
  features: {
    // Habilitamos la API real para testing
    enableRealApi: process.env.NEXT_PUBLIC_ENABLE_REAL_API !== 'false',
    enableMockFallback: true,
    enableDebugLogs: process.env.NODE_ENV === 'development',
  },

  // Pagination
  pagination: {
    defaultPageSize: 10,
    maxPageSize: 100,
  },

  // Validation
  validation: {
    maxCategoryNameLength: 100,
    maxDescriptionLength: 500,
    maxSlugLength: 100,
    maxCategoryDepth: 3,
  },
} as const;

export type Config = typeof config; 