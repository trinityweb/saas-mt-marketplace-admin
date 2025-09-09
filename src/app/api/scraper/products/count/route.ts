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

    // Obtener query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const source = searchParams.get('source');
    const confidence = searchParams.get('confidence');
    
    // Construir query params para el backend
    const backendParams = new URLSearchParams();
    if (status && status !== 'all') {
      backendParams.set('status', status);
    }
    if (source && source !== 'all') {
      backendParams.set('source', source);
    }
    if (confidence) {
      backendParams.set('confidence_min', confidence === 'high' ? '0.8' : confidence === 'medium' ? '0.5' : '0');
      if (confidence !== 'low') {
        backendParams.set('confidence_max', confidence === 'high' ? '1.0' : '0.8');
      }
    }

    const url = `${API_GATEWAY_URL}/scraper/api/v1/marketplace/products/count?${backendParams}`;
    console.log('[Products Count Proxy] GET via Kong:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: authResult.headers
    });

    if (!response.ok) {
      console.error('[Products Count Proxy] Error:', response.status, await response.text());
      return NextResponse.json(
        { 
          error: 'Error al obtener conteo de productos',
          count: 0 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Asegurar que siempre retornamos un count
    return NextResponse.json({
      count: data.count || data.total || data.total_count || 0,
      status: status || 'all',
      filters: {
        status,
        source,
        confidence
      }
    });
    
  } catch (error) {
    console.error('[Products Count Proxy] Error getting product count:', error);
    return NextResponse.json(
      { 
        error: 'Error al conectar con el servicio de conteo',
        count: 0
      },
      { status: 500 }
    );
  }
}
