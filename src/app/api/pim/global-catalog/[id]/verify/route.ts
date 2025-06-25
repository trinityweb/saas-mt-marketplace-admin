import { NextRequest, NextResponse } from 'next/server';

const PIM_BASE_URL = process.env.PIM_API_URL || 'http://localhost:8001/pim/api/v1';
const TENANT_ID = '9a4c3eb9-2471-4688-bfc8-973e5b3e4ce8';
const AUTH_TOKEN = 'admin-test-token';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const url = `${PIM_BASE_URL}/global-catalog/products/${id}/verify`;
    
    console.log('🔗 Proxy API PATCH Request:', url);
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': TENANT_ID,
        'X-Role': 'admin',
        'Authorization': `Bearer ${AUTH_TOKEN}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      console.error('❌ Proxy API Error:', response.status, errorData);
      return NextResponse.json(
        { error: errorData.error || `HTTP ${response.status}: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ Proxy API PATCH Response:', data);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Proxy PATCH Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 