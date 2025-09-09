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

    const url = `${API_GATEWAY_URL}/scraper/api/v1/targets`;
    console.log('[Targets Proxy] GET via Kong:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: authResult.headers
    });

    if (!response.ok) {
      console.error('[Targets Proxy] Error:', response.status, await response.text());
      return NextResponse.json(
        { error: 'Error al obtener targets de scraping' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('[Targets Proxy] Error getting targets:', error);
    return NextResponse.json(
      { error: 'Error al conectar con el servicio de scraping' },
      { status: 500 }
    );
  }
}
