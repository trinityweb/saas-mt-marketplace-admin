import { NextRequest, NextResponse } from 'next/server';

const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:8001';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const productId = resolvedParams.id;
    
    // Construir URL del backend a través de Kong
    const backendUrl = `${API_GATEWAY_URL}/pim/api/v1/global-catalog/products/${productId}`;

    console.log('🔗 Proxy API GET Request (via Kong):', backendUrl);

    // Headers para el backend
    const headers = {
      'Content-Type': 'application/json',
      'X-Tenant-ID': 'marketplace-admin',
      'X-Role': 'admin',
      'Authorization': 'Bearer admin-test-token'
    };

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      console.error('❌ Backend Error:', response.status, response.statusText);
      return NextResponse.json(
        { error: `Failed to fetch product: ${response.status} ${response.statusText}` }, 
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // El backend devuelve { "product": { ... } }, pero el frontend espera los datos directamente
    const product = data.product || data;
    
    console.log('✅ Proxy API GET Response:', { id: product.id, name: product.name });
    
    return NextResponse.json(product);
    
  } catch (error) {
    console.error('❌ Proxy GET Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const productId = resolvedParams.id;
    const body = await request.json();
    
    // Construir URL del backend a través de Kong
    const backendUrl = `${API_GATEWAY_URL}/pim/api/v1/global-catalog/products/${productId}`;

    console.log('🔗 Proxy API PUT Request (via Kong):', backendUrl);

    // Headers para el backend
    const headers = {
      'Content-Type': 'application/json',
      'X-Tenant-ID': 'marketplace-admin',
      'X-Role': 'admin',
      'Authorization': 'Bearer admin-test-token'
    };

    const response = await fetch(backendUrl, {
      method: 'PUT',
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
    
    // El backend devuelve { "product": { ... } }, pero el frontend espera los datos directamente
    const product = data.product || data;
    
    console.log('✅ Proxy API PUT Response:', { id: product.id, name: product.name });
    
    return NextResponse.json(product);
    
  } catch (error) {
    console.error('❌ Proxy PUT Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const productId = resolvedParams.id;
    
    // Construir URL del backend a través de Kong
    const backendUrl = `${API_GATEWAY_URL}/pim/api/v1/global-catalog/products/${productId}`;

    console.log('🔗 Proxy API DELETE Request (via Kong):', backendUrl);

    // Headers para el backend
    const headers = {
      'Content-Type': 'application/json',
      'X-Tenant-ID': 'marketplace-admin',
      'X-Role': 'admin',
      'Authorization': 'Bearer admin-test-token'
    };

    const response = await fetch(backendUrl, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      console.error('❌ Backend Error:', response.status, errorData);
      return NextResponse.json(
        { error: errorData.error || `HTTP ${response.status}: ${response.statusText}` },
        { status: response.status }
      );
    }

    // DELETE puede retornar 204 sin contenido
    if (response.status === 204) {
      console.log('✅ Proxy API DELETE Response: 204 No Content');
      return NextResponse.json({ success: true });
    }

    const data = await response.json();
    
    console.log('✅ Proxy API DELETE Response:', data);
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('❌ Proxy DELETE Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
} 