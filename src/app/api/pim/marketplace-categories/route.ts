import { NextRequest, NextResponse } from 'next/server';

const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:8001';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Construir URL del backend a través de Kong - RUTA CORREGIDA
    const backendUrl = new URL(`${API_GATEWAY_URL}/pim/api/v1/marketplace/categories`);
    
    // Convertir parámetros de paginación page/page_size a offset/limit
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('page_size') || '20');
    const offset = (page - 1) * pageSize;
    
    // Agregar parámetros convertidos
    backendUrl.searchParams.set('offset', offset.toString());
    backendUrl.searchParams.set('limit', pageSize.toString());
    
    // Copiar otros parámetros (excluyendo page y page_size)
    searchParams.forEach((value, key) => {
      if (key !== 'page' && key !== 'page_size') {
        backendUrl.searchParams.append(key, value);
      }
    });

    console.log('🔗 Proxy API GET Request (via Kong):', backendUrl.toString());

    // Headers para el backend - HEADERS CORREGIDOS
    const headers = {
      'Content-Type': 'application/json',
      'X-Tenant-ID': 'marketplace-admin',
      'X-User-Role': 'marketplace_admin', // Cambiado de X-Role a X-User-Role
      'Authorization': 'Bearer admin-test-token'
    };

    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      console.error('❌ Backend Error:', response.status, response.statusText);
      return NextResponse.json(
        { error: `Failed to fetch categories: ${response.status} ${response.statusText}` }, 
        { status: response.status }
      );
    }

    const data = await response.json();
    
    console.log('✅ Proxy API GET Response:', { 
      total: data.pagination?.total || data.categories?.length || 0, 
      count: Array.isArray(data.categories) ? data.categories.length : 0 
    });
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('❌ Proxy GET Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar datos requeridos
    if (!body.name || !body.slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      );
    }

    // Construir URL del backend a través de Kong - RUTA CORREGIDA
    const backendUrl = `${API_GATEWAY_URL}/pim/api/v1/marketplace/categories`;

    console.log('🔗 Proxy API POST Request (via Kong):', backendUrl);

    // Headers para el backend - HEADERS CORREGIDOS
    const headers = {
      'Content-Type': 'application/json',
      'X-Tenant-ID': 'marketplace-admin',
      'X-User-Role': 'marketplace_admin', // Cambiado de X-Role a X-User-Role
      'Authorization': 'Bearer admin-test-token'
    };

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      console.error('❌ Backend Error:', response.status, errorData);
      return NextResponse.json(
        { error: errorData.error || `HTTP ${response.status}: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    console.log('✅ Proxy API POST Response:', { id: data.id, name: data.name });
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('❌ Proxy POST Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
} 