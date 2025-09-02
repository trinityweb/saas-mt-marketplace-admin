import { NextRequest, NextResponse } from 'next/server';

// SIEMPRE usar Kong Gateway como punto de entrada
const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:8001';

// POST /api/scraper/products/:productId/curate - Curar producto al catálogo global
export async function POST(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    // Obtener headers del request original
    const authHeader = request.headers.get('authorization');
    const tenantId = request.headers.get('x-tenant-id') || '';
    
    const body = await request.json();
    
    const url = `${API_GATEWAY_URL}/scraper/api/v1/marketplace/products/${params.productId}/curate-to-global`;
    console.log('[Scraper Curate Proxy] POST via Kong:', url);
    
    // Headers para Kong Gateway - usar token real del usuario
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'X-Tenant-ID': tenantId,
      'X-User-Role': 'marketplace_admin'
    };
    
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        tenant_id: tenantId,
        curation_notes: body.curation_notes
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('[Scraper Curate Proxy] Error:', response.status, data);
      return NextResponse.json(
        { error: data.detail || 'Error al curar producto' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[Scraper Curate Proxy] Error curating product:', error);
    return NextResponse.json(
      { error: 'Error al conectar con el servicio de curación' },
      { status: 500 }
    );
  }
}