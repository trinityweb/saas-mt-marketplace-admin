export const API_CONFIG = {
  // URL para el cliente (browser) - debe ser la URL externa
  CLIENT_GATEWAY_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001',
  
  // URL para el servidor (API routes) - puede ser URL interna o externa
  SERVER_GATEWAY_URL: process.env.API_GATEWAY_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001',
  
  // URL por defecto (para compatibilidad)
  GATEWAY_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001',
  
  IAM_BASE_PATH: '/iam/api/v1',
  PIM_BASE_PATH: '/pim/api/v1',
  
  get iamBaseUrl() {
    return `${this.GATEWAY_URL}${this.IAM_BASE_PATH}`;
  },
  
  get pimBaseUrl() {
    return `${this.GATEWAY_URL}${this.PIM_BASE_PATH}`;
  },

  // URLs específicas para servidor
  get serverIamBaseUrl() {
    return `${this.SERVER_GATEWAY_URL}${this.IAM_BASE_PATH}`;
  },
  
  get serverPimBaseUrl() {
    return `${this.SERVER_GATEWAY_URL}${this.PIM_BASE_PATH}`;
  },

  // URLs específicas para cliente
  get clientIamBaseUrl() {
    return `${this.CLIENT_GATEWAY_URL}${this.IAM_BASE_PATH}`;
  },
  
  get clientPimBaseUrl() {
    return `${this.CLIENT_GATEWAY_URL}${this.PIM_BASE_PATH}`;
  }
} as const;

// Constantes para las rutas de la API
export const API_ROUTES = {
  IAM: {
    AUTH: {
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
      REFRESH_TOKEN: '/auth/refresh',
      VERIFY_TOKEN: '/auth/verify-token',
    }
  },
  PIM: {
    MARKETPLACE: {
      TAXONOMY: '/marketplace/taxonomy',
      CATEGORIES: '/marketplace/categories',
      SYNC: '/marketplace/sync',
    }
  }
} as const; 