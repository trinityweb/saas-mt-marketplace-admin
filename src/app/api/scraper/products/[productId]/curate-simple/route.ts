import { NextRequest, NextResponse } from 'next/server';
import { getAuthHeaders } from '@/lib/api/auth-helpers';

const KONG_GATEWAY_URL = process.env.KONG_GATEWAY_URL || 'http://localhost:8001';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    // Obtener headers de autenticación
    const authResult = getAuthHeaders(request);
    if ('error' in authResult) {
      return authResult.error;
    }

    // En Next.js 15, params debe ser awaited
    const { productId } = await params;

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Obtener el producto desde el scraper service
    const productResponse = await fetch(
      `${KONG_GATEWAY_URL}/scraper/api/v1/marketplace/products/${productId}`,
      {
        method: 'GET',
        headers: authResult.headers,
      }
    );

    if (!productResponse.ok) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    const product = await productResponse.json();
    
    // Verificar que el producto esté en estado "pending"
    if (product.curation_status !== 'pending') {
      return NextResponse.json(
        { error: `El producto no está pendiente de curación. Estado actual: ${product.curation_status}` },
        { status: 400 }
      );
    }

    // Simular curación simple (sin AI por ahora)
    const curatedData = {
      name: product.title || product.name,
      description: product.description || `${product.title} - Producto de alta calidad`,
      sku: product.sku || `SKU-${productId.slice(-8).toUpperCase()}`,
      ean: product.ean || '',
      brand_name: product.brand || 'Marca Genérica',
      brand_validated: false,
      category_name: product.category || 'General',
      category_validated: false,
      attributes: {
        source: product.source || 'scraper',
        original_url: product.url || product.source_url || '',
        scraping_date: product.created_at || new Date().toISOString(),
        confidence_score: product.confidence_score || 75
      }
    };

    // Actualizar el estado en el scraper service a "curated"
    const updateResponse = await fetch(
      `${KONG_GATEWAY_URL}/scraper/api/v1/marketplace/products/${productId}/curation-status`,
      {
        method: 'PATCH',
        headers: authResult.headers,
        body: JSON.stringify({
          status: 'curated',
          notes: 'Curado mediante proceso simplificado (sin AI)',
          curated_data: curatedData
        }),
      }
    );

    if (!updateResponse.ok) {
      console.error('Failed to update curation status');
      return NextResponse.json(
        { error: 'Error al actualizar estado de curación' },
        { status: updateResponse.status }
      );
    }

    return NextResponse.json({
      success: true,
      product_id: productId,
      curated_data: curatedData,
      message: 'Producto curado exitosamente (proceso simplificado)'
    });

  } catch (error) {
    console.error('Error in simple curation:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}