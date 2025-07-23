import { NextRequest, NextResponse } from 'next/server';

const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:8001';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Construir URL del backend a través de Kong
    const url = `${API_GATEWAY_URL}/pim/api/v1/business-types/${id}`;

    console.log('🔗 Proxy API GET Request (via Kong):', url);

    // Headers para el backend
    const headers = {
      'Content-Type': 'application/json',
      'X-Tenant-ID': 'marketplace-admin',
      'X-User-Role': 'admin',
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
        { error: `Failed to fetch business type: ${response.status} ${response.statusText}` }, 
        { status: response.status }
      );
    }

    const data = await response.json();
    
    console.log('✅ Proxy API GET Response:', { id: data.id, name: data.name });
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('❌ Proxy GET Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Construir URL del backend a través de Kong
    const url = `${API_GATEWAY_URL}/pim/api/v1/business-types/${id}`;

    console.log('🔗 Proxy API PUT Request (via Kong):', url);

    // Headers para el backend
    const headers = {
      'Content-Type': 'application/json',
      'X-Tenant-ID': 'marketplace-admin',
      'X-User-Role': 'admin',
      'X-Role': 'admin',
      'Authorization': 'Bearer admin-test-token'
    };

    const response = await fetch(url, {
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
    
    console.log('✅ Proxy API PUT Response:', { id: data.id, name: data.name });
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('❌ Proxy PUT Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Construir URL del backend a través de Kong
    const url = `${API_GATEWAY_URL}/pim/api/v1/business-types/${id}`;

    console.log('🔗 Proxy API DELETE Request (via Kong):', url);

    // Headers para el backend
    const headers = {
      'Content-Type': 'application/json',
      'X-Tenant-ID': 'marketplace-admin',
      'X-User-Role': 'admin',
      'X-Role': 'admin',
      'Authorization': 'Bearer admin-test-token'
    };

    const response = await fetch(url, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      console.error('❌ Backend Error:', response.status, response.statusText);
      return NextResponse.json(
        { error: `Failed to delete business type: ${response.status} ${response.statusText}` }, 
        { status: response.status }
      );
    }

    // DELETE puede devolver 204 No Content o un objeto
    let data = {};
    try {
      data = await response.json();
    } catch {
      // Si no hay contenido, está bien
      data = { message: 'Business type deleted successfully' };
    }
    
    console.log('✅ Proxy API DELETE Response:', { id });
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('❌ Proxy DELETE Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
} 