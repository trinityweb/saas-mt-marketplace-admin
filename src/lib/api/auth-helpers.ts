import { NextRequest, NextResponse } from 'next/server';

/**
 * Helper para manejar la autenticación del marketplace-admin
 * 
 * El marketplace-admin requiere:
 * 1. JWT token del usuario admin logueado (para validar que es un usuario autenticado)
 * 2. API Key del servicio (para identificar que viene del marketplace-admin)
 * 3. X-User-Role (para indicar permisos de operaciones globales)
 * 
 * NO requiere X-Tenant-ID porque opera a nivel global
 */

const MARKETPLACE_ADMIN_API_KEY = process.env.MARKETPLACE_ADMIN_API_KEY || 'marketplace-admin-key-2025';

/**
 * Obtiene los headers de autenticación para llamadas a Kong
 * @param request - NextRequest con el JWT en el header Authorization
 * @returns Headers configurados o error response
 */
export function getAuthHeaders(request: NextRequest): 
  { headers: Record<string, string> } | 
  { error: NextResponse } {
  
  // Obtener el JWT del usuario logueado
  const authToken = request.headers.get('Authorization');
  
  if (!authToken || !authToken.startsWith('Bearer ')) {
    return {
      error: NextResponse.json(
        { error: 'Authentication required. Please login.' },
        { status: 401 }
      )
    };
  }

  // Preparar headers para Kong
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': authToken, // JWT del usuario admin logueado
    'X-API-Key': MARKETPLACE_ADMIN_API_KEY, // API Key del servicio
    'X-User-Role': 'marketplace_admin' // Rol para operaciones globales
    // NO incluir X-Tenant-ID para operaciones globales del admin
  };

  return { headers };
}

/**
 * Crea headers para endpoints que requieren autenticación dual
 * (para backends que necesitan validar tanto JWT como API Key)
 */
export function getDualAuthHeaders(request: NextRequest): 
  { headers: Record<string, string> } | 
  { error: NextResponse } {
  
  const result = getAuthHeaders(request);
  
  if ('error' in result) {
    return result;
  }

  // Para backends que esperan auth dual, incluir ambos mecanismos
  return {
    headers: {
      ...result.headers,
      'X-Auth-Type': 'dual' // Indicador para backends que soportan auth dual
    }
  };
}

/**
 * Verifica si el request tiene autenticación válida
 */
export function isAuthenticated(request: NextRequest): boolean {
  const authToken = request.headers.get('Authorization');
  return !!(authToken && authToken.startsWith('Bearer '));
}

/**
 * Extrae el JWT token del header Authorization
 */
export function extractJWT(request: NextRequest): string | null {
  const authToken = request.headers.get('Authorization');
  if (!authToken || !authToken.startsWith('Bearer ')) {
    return null;
  }
  return authToken.substring(7); // Remover "Bearer "
}