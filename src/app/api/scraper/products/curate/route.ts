import { NextRequest, NextResponse } from 'next/server';
import { getAuthHeaders } from '@/lib/api/auth-helpers';

// SIEMPRE usar Kong Gateway como punto de entrada
const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:8001';

// POST /api/scraper/products/curate-async - NUEVO: Curación asíncrona
export async function POST(request: NextRequest) {
  try {
    // Obtener headers de autenticación
    const authResult = getAuthHeaders(request);
    if ('error' in authResult) {
      return authResult.error;
    }

    const body = await request.json();
    const { product_ids, curation_notes } = body;

    if (!product_ids || !Array.isArray(product_ids) || product_ids.length === 0) {
      return NextResponse.json(
        { error: 'product_ids es requerido y debe ser un array no vacío' },
        { status: 400 }
      );
    }

    // Llamar al scraper service via Kong Gateway
    const url = `${API_GATEWAY_URL}/scraper/api/v1/marketplace/products/curate`;
    console.log('[Async Curation Proxy] POST via Kong:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...authResult.headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        product_ids,
        tenant_id: authResult.headers['X-Tenant-ID'],
        curation_notes: curation_notes || 'Curación iniciada desde marketplace admin'
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('[Async Curation Proxy] Error:', response.status, data);
      return NextResponse.json(
        { error: data.detail || 'Error al iniciar curación asíncrona' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[Async Curation Proxy] Error:', error);
    return NextResponse.json(
      { error: 'Error al conectar con el servicio de curación' },
      { status: 500 }
    );
  }
}

