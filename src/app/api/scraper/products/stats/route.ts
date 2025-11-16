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

    // Hacer la petición al backend scraper via Kong Gateway
    const url = `${API_GATEWAY_URL}/scraper/api/v1/marketplace/products/stats`;
    console.log('[Products Stats Proxy] GET via Kong:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: authResult.headers
    });

    if (!response.ok) {
      console.error('[Products Stats Proxy] Error:', response.status, await response.text());
      return NextResponse.json(
        { 
          error: 'Error al obtener estadísticas de productos',
          total: 0,
          pending: 0,
          processing: 0,
          curated: 0,
          rejected: 0,
          published: 0
        },
        { status: response.status }
      );
    }

    const stats = await response.json();
    
    console.log('[Products Stats] Backend response:', stats);
    
    // Usar el total real del backend, no recalcular
    // El backend ya tiene la información correcta de todos los productos
    return NextResponse.json({
      total: stats.total || 0, // Usar total del backend (10,120)
      pending: stats.pending || 0,
      processing: stats.processing || 0,
      curated: stats.curated || 0,
      rejected: stats.rejected || 0,
      published: stats.published || 0
    });

  } catch (error) {
    console.error('[Products Stats Proxy] Error getting product stats:', error);
    return NextResponse.json(
      { 
        error: 'Error al conectar con el servicio de estadísticas',
        total: 0,
        pending: 0,
        processing: 0,
        curated: 0,
        rejected: 0,
        published: 0
      },
      { status: 500 }
    );
  }
}