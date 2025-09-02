import { NextRequest, NextResponse } from 'next/server';
import { getAuthHeaders } from '@/lib/api/auth-helpers';

const KONG_GATEWAY_URL = process.env.KONG_GATEWAY_URL || 'http://localhost:8001';
const AI_GATEWAY_URL = process.env.AI_GATEWAY_URL || 'http://localhost:8050';

export async function POST(request: NextRequest) {
  try {
    // Obtener headers de autenticación
    const authResult = getAuthHeaders(request);
    if ('error' in authResult) {
      return authResult.error;
    }

    const body = await request.json();
    const { product_id } = body;

    if (!product_id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Primero, obtener el producto desde MongoDB a través de Kong
    const productResponse = await fetch(
      `${KONG_GATEWAY_URL}/scraper/api/v1/marketplace/products/${product_id}`,
      {
        headers: authResult.headers
      }
    );
    
    if (!productResponse.ok) {
      console.error('Failed to fetch product from scraper service');
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const product = await productResponse.json();

    // Llamar al AI Gateway para curar el producto
    // NOTA: Usando endpoint de categorización como alternativa (curation no disponible)
    const response = await fetch(`${AI_GATEWAY_URL}/ai/products/batch-categorize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': '00000000-0000-0000-0000-000000000001' // Default tenant para desarrollo
      },
      body: JSON.stringify({
        tenant_id: '00000000-0000-0000-0000-000000000001',
        products: [{
          product_id: product_id,
          product_data: {
            name: product.title || product.name,
            description: product.description || '',
            brand: product.brand || '',
            price: product.price || 0
          }
        }],
        categorization_mode: 'detailed',
        confidence_threshold: 0.7
      }),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to curate product';
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.error || errorMessage;
        console.error('AI Gateway error:', errorData);
      } catch {
        const errorText = await response.text();
        console.error('AI Gateway error text:', errorText);
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    const result = await response.json();
    
    // El endpoint de categorización devuelve resultados diferentes
    const categorizedProduct = result.batch_results?.[0] || result.results?.[0] || result;
    
    // Crear datos curados basados en la categorización
    const curatedData = {
      name: product.title || product.name,
      description: product.description || '',
      brand: categorizedProduct.primary_category?.brand || product.brand || 'Sin Marca',
      brand_validated: false,
      category_name: categorizedProduct.primary_category?.name || product.category || 'General',
      category_validated: categorizedProduct.primary_category?.confidence > 0.7,
      confidence_score: categorizedProduct.overall_confidence || 0.5,
      attributes: categorizedProduct.extracted_attributes || {}
    };
    
    // Actualizar el estado en MongoDB a través del scraper service vía Kong
    await fetch(`${KONG_GATEWAY_URL}/scraper/api/v1/marketplace/products/${product_id}/curation-status`, {
      method: 'PATCH',
      headers: authResult.headers,
      body: JSON.stringify({
        status: 'curated',
        notes: 'Categorized by AI (curation endpoint not available)',
        curated_data: curatedData
      }),
    });

    return NextResponse.json({
      success: true,
      product_id,
      curated_data: curatedData,
      message: 'Product categorized successfully (using fallback method)'
    });

  } catch (error) {
    console.error('Error in curate endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}