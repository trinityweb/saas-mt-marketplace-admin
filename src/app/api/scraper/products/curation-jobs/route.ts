import { NextRequest, NextResponse } from 'next/server';
import { getAuthHeaders } from '@/lib/api/auth-helpers';

// SIEMPRE usar Kong Gateway como punto de entrada
const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:8001';

// GET /api/scraper/products/curation-jobs - NUEVO: Listar jobs de curación
export async function GET(request: NextRequest) {
  try {
    // Obtener headers de autenticación
    const authResult = getAuthHeaders(request);
    if ('error' in authResult) {
      return authResult.error;
    }

    // Obtener parámetros de query
    const searchParams = request.nextUrl.searchParams;
    const tenantId = searchParams.get('tenant_id');
    const status = searchParams.get('status');
    const limit = searchParams.get('limit') || '50';

    // Construir query string
    const queryParams = new URLSearchParams();
    if (tenantId) queryParams.append('tenant_id', tenantId);
    if (status) queryParams.append('status', status);
    queryParams.append('limit', limit);

    // Llamar al scraper service via Kong Gateway
    const url = `${API_GATEWAY_URL}/scraper/api/v1/marketplace/products/curation-jobs?${queryParams.toString()}`;
    console.log('[Curation Jobs List Proxy] GET via Kong:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: authResult.headers
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('[Curation Jobs List Proxy] Error:', response.status, data);
      return NextResponse.json(
        { error: data.detail || 'Error al listar jobs de curación' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[Curation Jobs List Proxy] Error:', error);
    return NextResponse.json(
      { error: 'Error al conectar con el servicio' },
      { status: 500 }
    );
  }
}

