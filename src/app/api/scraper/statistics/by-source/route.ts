import { NextRequest, NextResponse } from 'next/server';

// SIEMPRE usar Kong Gateway como punto de entrada
const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:8001';

// GET /api/scraper/statistics/by-source - Obtener estadísticas por fuente
export async function GET(request: NextRequest) {
  try {
    // Obtener headers del request original
    const authHeader = request.headers.get('authorization');
    const tenantId = request.headers.get('x-tenant-id') || '';
    
    const url = `${API_GATEWAY_URL}/scraper/api/v1/marketplace/statistics/by-source`;
    
    console.log('[Scraper Statistics Proxy] GET via Kong:', url);
    
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
      headers,
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('[Scraper Statistics Proxy] Error:', response.status, data);
      return NextResponse.json(
        { error: data.error || 'Error al obtener estadísticas' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[Scraper Statistics Proxy] Error fetching statistics:', error);
    return NextResponse.json(
      { error: 'Error al conectar con el servicio de scraping' },
      { status: 500 }
    );
  }
}