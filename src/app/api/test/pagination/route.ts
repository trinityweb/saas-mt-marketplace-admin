import { NextRequest, NextResponse } from 'next/server';

const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:8001';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Simular exactamente lo que hace el frontend
    const results = [];
    
    for (let page = 1; page <= 3; page++) {
      // Simular la lógica del frontend ACTUALIZADA
      const pageSize = 20;
      
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('page_size', pageSize.toString());
      params.append('_t', Date.now().toString());
      
      const apiUrl = `/api/pim/marketplace-categories?${params.toString()}`;
      
      const response = await fetch(`http://localhost:3004${apiUrl}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });

      if (response.ok) {
        const data = await response.json();
        results.push({
          page,
          offset: data.pagination?.offset || 0,
          pageSize,
          categories_count: data.categories?.length || 0,
          first_5_names: data.categories?.slice(0, 5)?.map((c: any) => c.name) || [],
          pagination: data.pagination
        });
      } else {
        results.push({
          page,
          error: `${response.status}: ${response.statusText}`
        });
      }
    }
    
    return NextResponse.json({
      test_results: results,
      timestamp: new Date().toISOString(),
      message: "Simulando exactamente lo que hace el frontend"
    });
    
  } catch (error) {
    console.error('❌ Test Error:', error);
    return NextResponse.json(
      { error: 'Test error', details: error }, 
      { status: 500 }
    );
  }
} 