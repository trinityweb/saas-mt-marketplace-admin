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

    // Obtener query params para filtros opcionales
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const sourceId = searchParams.get('source_id');
    const limit = searchParams.get('limit') || '50';

    // Construir query params para el backend
    const backendParams = new URLSearchParams();
    if (status) backendParams.set('status', status);
    if (sourceId) backendParams.set('source_id', sourceId);
    backendParams.set('limit', limit);

    const url = `${API_GATEWAY_URL}/scraper/api/v1/scraping/jobs?${backendParams}`;
    console.log('[Jobs Proxy] GET via Kong:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: authResult.headers
    });

    if (!response.ok) {
      console.error('[Jobs Proxy] Error:', response.status, await response.text());
      // Retornar array vacío en lugar de error para que la UI funcione
      return NextResponse.json([]);
    }

    const data = await response.json();
    
    // Asegurar que siempre retornamos un array
    if (Array.isArray(data)) {
      return NextResponse.json(data);
    } else if (data.jobs && Array.isArray(data.jobs)) {
      return NextResponse.json(data.jobs);
    } else {
      return NextResponse.json([]);
    }
    
  } catch (error) {
    console.error('[Jobs Proxy] Error getting jobs:', error);
    // Retornar array vacío para que la UI funcione
    return NextResponse.json([]);
  }
}
