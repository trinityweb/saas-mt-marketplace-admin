import { NextRequest, NextResponse } from 'next/server';

const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:8001';

// Función para transformar el formato del backend al frontend con paginación
function transformBackendAttributesToFrontend(backendAttributes: any[], page: number = 1, pageSize: number = 20): any {
  // Aplicar paginación del lado del frontend
  const offset = (page - 1) * pageSize;
  const paginatedAttributes = backendAttributes.slice(offset, offset + pageSize);
  
  const transformedAttributes = paginatedAttributes.map(attr => ({
    id: attr.id,
    code: attr.slug || attr.code, // Mapear slug a code
    name: attr.name,
    description: attr.description || '', // Valor por defecto
    type: attr.type,
    is_required: attr.is_required_for_listing || false, // Mapear is_required_for_listing a is_required
    is_filterable: attr.is_filterable || false,
    is_searchable: attr.is_searchable || false,
    default_value: attr.default_value || '', // Valor por defecto
    options: attr.options || [], // Valor por defecto
    validation_rules: attr.validation_rules || {}, // Valor por defecto
    unit: attr.unit || '', // Valor por defecto
    group_name: attr.group_name || '', // Valor por defecto
    sort_order: attr.sort_order || 0,
    is_active: attr.is_active !== undefined ? attr.is_active : true, // Valor por defecto true
    created_at: attr.created_at,
    updated_at: attr.updated_at
  }));

  return {
    attributes: transformedAttributes,
    total: backendAttributes.length, // Total real de registros
    page: page,
    page_size: pageSize
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Construir URL del backend a través de Kong con todos los parámetros
    const url = `${API_GATEWAY_URL}/pim/api/v1/marketplace/attributes${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

    console.log('🔗 Proxy API GET Request (via Kong):', url);

    // Headers para el backend
    const headers = {
      'Content-Type': 'application/json',
      'X-Tenant-ID': 'marketplace-admin',
      'X-User-Role': 'marketplace_admin', // Header requerido por marketplace attribute handler
      'X-Role': 'admin',
      'Authorization': 'Bearer admin-test-token'
    };

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      console.error('❌ Backend Error:', response.status, response.statusText);
      return NextResponse.json(
        { error: `Failed to fetch marketplace attributes: ${response.status} ${response.statusText}` }, 
        { status: response.status }
      );
    }

    const data = await response.json();
    
    console.log('✅ Raw Backend Response:', { 
      has_items: !!data.items,
      total_count: data.total_count,
      page: data.page,
      page_size: data.page_size
    });

    // Pasar los datos tal como los devuelve el backend (sin transformación)
    console.log('✅ Proxy Response (transparent):', { 
      total_count: data.total_count,
      items_count: data.items?.length || 0,
      page: data.page,
      page_size: data.page_size,
      sample_item: data.items?.[0] ? Object.keys(data.items[0]).slice(0, 5) : []
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
    
    // Construir URL del backend a través de Kong
    const url = `${API_GATEWAY_URL}/pim/api/v1/marketplace/attributes`;

    console.log('🔗 Proxy API POST Request (via Kong):', url);

    // Headers para el backend
    const headers = {
      'Content-Type': 'application/json',
      'X-Tenant-ID': 'marketplace-admin',
      'X-User-Role': 'marketplace_admin', // Header requerido por marketplace attribute handler
      'X-Role': 'admin',
      'Authorization': 'Bearer admin-test-token'
    };

    const response = await fetch(url, {
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