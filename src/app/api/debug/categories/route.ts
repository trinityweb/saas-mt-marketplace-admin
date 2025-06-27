import { NextRequest, NextResponse } from 'next/server';

const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:8001';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('page_size') || '20');
    
    // Construir URLs para 3 páginas
    const results = [];
    
    for (let p = 1; p <= 3; p++) {
      const offset = (p - 1) * pageSize;
      const backendUrl = new URL(`${API_GATEWAY_URL}/pim/api/v1/marketplace/categories`);
      backendUrl.searchParams.set('offset', offset.toString());
      backendUrl.searchParams.set('limit', pageSize.toString());
      
      const headers = {
        'Content-Type': 'application/json',
        'X-Tenant-ID': 'marketplace-admin',
        'X-User-Role': 'marketplace_admin',
        'Authorization': 'Bearer admin-test-token'
      };

      const response = await fetch(backendUrl.toString(), {
        method: 'GET',
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        results.push({
          page: p,
          offset,
          limit: pageSize,
          categories_count: data.categories?.length || 0,
          categories_names: data.categories?.slice(0, 5)?.map((c: any) => c.name) || [],
          pagination: data.pagination
        });
      } else {
        results.push({
          page: p,
          error: `${response.status}: ${response.statusText}`
        });
      }
    }
    
    return NextResponse.json({
      debug_info: results,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Debug Error:', error);
    return NextResponse.json(
      { error: 'Debug error', details: error }, 
      { status: 500 }
    );
  }
} 