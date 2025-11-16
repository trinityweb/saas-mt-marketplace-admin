import { NextRequest, NextResponse } from 'next/server';
import { getAuthHeaders } from '@/lib/api/auth-helpers';

// SIEMPRE usar Kong Gateway como punto de entrada
const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:8001';

// GET /api/scraper/products/curation-jobs/[jobId] - NUEVO: Obtener estado de job
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    // Obtener headers de autenticación
    const authResult = getAuthHeaders(request);
    if ('error' in authResult) {
      return authResult.error;
    }

    const { jobId } = await params;

    if (!jobId) {
      return NextResponse.json(
        { error: 'jobId es requerido' },
        { status: 400 }
      );
    }

    // Llamar al scraper service via Kong Gateway
    const url = `${API_GATEWAY_URL}/scraper/api/v1/marketplace/products/curation-jobs/${jobId}`;
    console.log('[Curation Job Status Proxy] GET via Kong:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: authResult.headers
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('[Curation Job Status Proxy] Error:', response.status, data);
      return NextResponse.json(
        { error: data.detail || 'Error al obtener estado del job' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[Curation Job Status Proxy] Error:', error);
    return NextResponse.json(
      { error: 'Error al conectar con el servicio' },
      { status: 500 }
    );
  }
}

