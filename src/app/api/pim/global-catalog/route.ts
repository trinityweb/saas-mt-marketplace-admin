import { NextRequest, NextResponse } from 'next/server';

// Usar Kong como el overview (headers simplificados)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8001';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Construir query string para el backend
    const queryString = searchParams.toString();
    
    // Via Kong con headers simplificados como overview
    const url = `${API_BASE_URL}/pim/api/v1/global-catalog/products${queryString ? `?${queryString}` : ''}`;

    console.log('🔗 Proxy API GET Request (via Kong - simplified):', url);

    // Headers simplificados como overview
    const headers = {
      'Content-Type': 'application/json',
      'X-Tenant-ID': 'global', // Mismo que overview
    };

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      console.error('❌ Backend Error:', response.status, response.statusText);
      return NextResponse.json(
        { error: `Failed to fetch products: ${response.status} ${response.statusText}` }, 
        { status: response.status }
      );
    }

    const data = await response.json();
    
    console.log('✅ Proxy API GET Response:', { 
      total: data.total_count || data.total || 0, 
      items: Array.isArray(data.items) ? data.items.length : 0,
      page: data.page || 1
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
    
    // Via Kong con headers simplificados
    const url = `${API_BASE_URL}/pim/api/v1/global-catalog/products`;

    console.log('🔗 Proxy API POST Request (via Kong - simplified):', url);

    // Headers simplificados como overview
    const headers = {
      'Content-Type': 'application/json',
      'X-Tenant-ID': 'global',
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