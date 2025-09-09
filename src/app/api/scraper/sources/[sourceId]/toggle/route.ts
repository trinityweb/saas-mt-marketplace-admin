import { NextRequest, NextResponse } from 'next/server';
import { getAuthHeaders } from '@/lib/api/auth-helpers';

// SIEMPRE usar Kong Gateway como punto de entrada
const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:8001';

export async function PATCH(
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

    const body = await request.json();
    const { is_active } = body;

    const url = `${API_GATEWAY_URL}/scraper/api/v1/scraping/sources/${sourceId}`;
    console.log('[Sources Toggle Proxy] PATCH via Kong:', url);
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        ...authResult.headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ is_active })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Error desconocido' }));
      console.error('[Sources Toggle Proxy] Error:', response.status, errorData);
      
      // Para targets hardcoded, simular éxito (no se puede cambiar realmente)
      if (response.status === 404) {
        console.warn(`[Sources Toggle Proxy] Source ${sourceId} not found in MongoDB, simulating toggle`);
        return NextResponse.json({
          success: true,
          message: `Estado de la fuente simulado como ${is_active ? 'activo' : 'inactivo'}`,
          source: {
            source_id: sourceId,
            is_active: is_active,
            status: is_active ? 'active' : 'inactive',
            updated_at: new Date().toISOString()
          },
          note: 'Simulated for hardcoded target'
        });
      }
      
      return NextResponse.json(
        { error: errorData.detail || 'Error al cambiar estado de la fuente' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('[Sources Toggle Proxy] Error toggling source:', error);
    return NextResponse.json(
      { error: 'Error al conectar con el servicio de scraping' },
      { status: 500 }
    );
  }
}
