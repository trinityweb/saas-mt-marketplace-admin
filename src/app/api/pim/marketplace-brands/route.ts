import { NextRequest, NextResponse } from 'next/server';

const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:8001';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Construir query string para el backend
    const queryString = searchParams.toString();
    
    // Construir URL del backend a través de Kong
    const url = `${API_GATEWAY_URL}/pim/api/v1/marketplace-brands${queryString ? `?${queryString}` : ''}`;

    console.log('🔗 Proxy API GET Request (via Kong):', url);

    // Headers hardcodeados para desarrollo (igual que otros endpoints)
    const headers = {
      'Content-Type': 'application/json',
      'X-Tenant-ID': 'marketplace-admin',
      'X-User-Role': 'marketplace_admin',
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
        { error: `Failed to fetch marketplace brands: ${response.status} ${response.statusText}` }, 
        { status: response.status }
      );
    }

    const data = await response.json();
    
    console.log('✅ Proxy API GET Response:', { 
      total: data.pagination?.total || data.length, 
      count: Array.isArray(data.brands) ? data.brands.length : data.length,
      structure: data.brands ? 'brands_array' : 'unknown',
      brands_received: data.brands?.length || 0
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
    const url = `${API_GATEWAY_URL}/pim/api/v1/marketplace-brands`;

    console.log('🔗 Proxy API POST Request (via Kong):', url);

    // Headers hardcodeados para desarrollo (igual que otros endpoints)
    const headers = {
      'Content-Type': 'application/json',
      'X-Tenant-ID': 'marketplace-admin',
      'X-User-Role': 'marketplace_admin',
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