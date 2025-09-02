import { NextRequest, NextResponse } from 'next/server';

// SIEMPRE usar Kong Gateway como punto de entrada
const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:8001';

// POST /api/scraper/products/bulk-curate - Curación masiva de productos
export async function POST(request: NextRequest) {
  try {
    // Obtener headers del request original
    const authHeader = request.headers.get('authorization');
    const tenantId = request.headers.get('x-tenant-id') || '';
    
    const body = await request.json();
    
    const url = `${API_GATEWAY_URL}/scraper/api/v1/marketplace/products/bulk-curate`;
    console.log('[Scraper Bulk Curate Proxy] POST via Kong:', url);
    
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
        product_ids: body.product_ids,
        tenant_id: tenantId,
        action: body.action || 'approve'
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('[Scraper Bulk Curate Proxy] Error:', response.status, data);
      return NextResponse.json(
        { error: data.detail || 'Error en curación masiva' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[Scraper Bulk Curate Proxy] Error in bulk curation:', error);
    return NextResponse.json(
      { error: 'Error al conectar con el servicio de curación' },
      { status: 500 }
    );
  }
}