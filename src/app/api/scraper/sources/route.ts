import { NextRequest, NextResponse } from 'next/server';
import { getAuthHeaders } from '@/lib/api/auth-helpers';

// SIEMPRE usar Kong Gateway como punto de entrada
const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:8001';

export async function GET(request: NextRequest) {
  try {
    // Obtener headers de autenticación
    const authResult = getAuthHeaders(request);
    if ('error' in authResult) {
      return authResult.error;
    }

    const url = `${API_GATEWAY_URL}/scraper/api/v1/scraping/sources`;
    console.log('[Sources Proxy] GET via Kong:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: authResult.headers
    });

    // Si falla, retornar array vacío en lugar de error
    if (!response.ok) {
      console.warn('[Sources Proxy] MongoDB sources not available, using targets only');
      return NextResponse.json({
        sources: [],
        total: 0,
        note: 'MongoDB sources not available, using hardcoded targets'
      });
    }

    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.warn('[Sources Proxy] Error getting sources, returning empty:', error);
    // Retornar vacío para que funcione con targets
    return NextResponse.json({
      sources: [],
      total: 0,
      note: 'Sources service not available'
    });
  }
}