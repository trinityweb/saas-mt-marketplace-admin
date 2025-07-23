import { NextRequest, NextResponse } from 'next/server';

const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:8001';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Construir query string para el backend
    const queryString = searchParams.toString();
    
    // Construir URL del backend a través de Kong
    const url = `${API_GATEWAY_URL}/pim/api/v1/business-types${queryString ? `?${queryString}` : ''}`;

    console.log('🔗 Proxy API GET Request (via Kong):', url);

    // Headers para el backend
    const headers = {
      'Content-Type': 'application/json',
      'X-Tenant-ID': 'marketplace-admin',
      'X-User-Role': 'marketplace_admin',
      'Authorization': 'Bearer admin-test-token'
    };

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      console.error('❌ Backend Error:', response.status, response.statusText);
      return NextResponse.json(
        { error: `Failed to fetch business types: ${response.status} ${response.statusText}` }, 
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Mantener la estructura original que espera el frontend
    if (data.business_types && Array.isArray(data.business_types)) {
      console.log('✅ Proxy API GET Response (business types):', { 
        total: data.total,
        count: data.business_types.length,
        first_item: data.business_types[0]?.name
      });
      
      // Devolver la estructura original sin transformación
      return NextResponse.json(data);
    }
    
    console.log('✅ Proxy API GET Response:', { 
      total: Array.isArray(data) ? data.length : data.total || 0,
      count: Array.isArray(data) ? data.length : data.business_types?.length || 0,
      structure: Array.isArray(data) ? 'array' : 'object'
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
    const url = `${API_GATEWAY_URL}/pim/api/v1/business-types`;

    console.log('🔗 Proxy API POST Request (via Kong):', url);

    // Headers para el backend
    const headers = {
      'Content-Type': 'application/json',
      'X-Tenant-ID': 'marketplace-admin',
      'X-User-Role': 'marketplace_admin',
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