import { NextRequest, NextResponse } from 'next/server';
import { getAuthHeaders, extractJWT } from '@/lib/api/auth-helpers';

const KONG_GATEWAY_URL = process.env.KONG_GATEWAY_URL || 'http://localhost:8001';
const MARKETPLACE_ADMIN_API_KEY = process.env.MARKETPLACE_ADMIN_API_KEY || 'marketplace-admin-key-2025';

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

    // Extraer JWT para pasarlo al backend si es necesario
    const jwtToken = extractJWT(request);

    // Primero verificar el estado del producto
    const productStatusResponse = await fetch(
      `${KONG_GATEWAY_URL}/scraper/api/v1/marketplace/products/${productId}`,
      {
        method: 'GET',
        headers: authResult.headers,
      }
    );

    if (!productStatusResponse.ok) {
      return NextResponse.json(
        { error: 'No se pudo obtener el estado del producto' },
        { status: productStatusResponse.status }
      );
    }

    const productData = await productStatusResponse.json();
    
    // Verificar que el producto esté en estado "curated"
    if (productData.curation_status !== 'curated') {
      console.error(`Producto ${productId} no está curado. Estado actual: ${productData.curation_status}`);
      return NextResponse.json(
        { error: `El producto debe estar curado antes de publicarse. Estado actual: ${productData.curation_status}` },
        { status: 400 }
      );
    }

    // Publicar el producto curado al catálogo global del PIM a través de Kong
    const curateResponse = await fetch(
      `${KONG_GATEWAY_URL}/scraper/api/v1/marketplace/products/${productId}/curate-to-global`,
      {
        method: 'POST',
        headers: authResult.headers,
        body: JSON.stringify({
          tenant_id: '00000000-0000-0000-0000-000000000000', // Global tenant for admin operations
          auth_token: jwtToken, // Incluir JWT para backends que lo requieran
          curation_notes: 'Approved and published to PIM from curated state'
        }),
      }
    );

    if (!curateResponse.ok) {
      const error = await curateResponse.text();
      console.error('Failed to publish to global catalog:', error);
      
      return NextResponse.json(
        { error: 'Error al publicar producto curado al catálogo global' },
        { status: curateResponse.status }
      );
    }

    const curateResult = await curateResponse.json();

    // Actualizar el estado en MongoDB a published
    await fetch(
      `${KONG_GATEWAY_URL}/scraper/api/v1/marketplace/products/${productId}/curation-status`,
      {
        method: 'PATCH',
        headers: authResult.headers,
        body: JSON.stringify({
          status: 'published',
          notes: `Published to PIM with global ID: ${curateResult.global_product_id || 'unknown'}`
        }),
      }
    );

    return NextResponse.json({
      success: true,
      product_id: productId,
      global_product_id: curateResult.global_product_id,
      status: 'published',
      message: 'Product published to PIM global catalog successfully'
    });

  } catch (error) {
    console.error('Error publishing product to PIM:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}