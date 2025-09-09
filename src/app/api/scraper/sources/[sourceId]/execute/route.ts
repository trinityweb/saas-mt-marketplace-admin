import { NextRequest, NextResponse } from 'next/server';
import { getAuthHeaders } from '@/lib/api/auth-helpers';

// SIEMPRE usar Kong Gateway como punto de entrada
const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:8001';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sourceId: string }> }
) {
  try {
    const { sourceId } = await params;
    
    // Obtener headers de autenticación
    const authResult = getAuthHeaders(request);
    if ('error' in authResult) {
      return authResult.error;
    }

    const url = `${API_GATEWAY_URL}/scraper/api/v1/scraping/sources/${sourceId}/execute`;
    console.log('[Sources Execute Proxy] POST via Kong:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...authResult.headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({}) // Body vacío, el backend maneja la lógica
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Error desconocido' }));
      console.error('[Sources Execute Proxy] Error:', response.status, errorData);
      
      return NextResponse.json(
        { error: errorData.detail || 'Error al ejecutar scraping' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('[Sources Execute Proxy] Error executing source:', error);
    return NextResponse.json(
      { error: 'Error al conectar con el servicio de scraping' },
      { status: 500 }
    );
  }
}