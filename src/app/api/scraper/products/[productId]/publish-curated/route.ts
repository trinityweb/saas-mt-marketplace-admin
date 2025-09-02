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

    // Primero obtener el producto desde el scraper service
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

    const productData = await productResponse.json();
    
    // Verificar que el producto esté en estado "curated"
    if (productData.curation_status !== 'curated') {
      return NextResponse.json(
        { error: `El producto debe estar curado antes de publicarse. Estado actual: ${productData.curation_status}` },
        { status: 400 }
      );
    }

    // Preparar los datos curados para enviar al PIM
    const curatedProduct = {
      name: productData.curated_data?.name || productData.title,
      description: productData.curated_data?.description || productData.description || '',
      sku: productData.curated_data?.sku || productData.sku || '',
      ean: productData.curated_data?.ean || productData.ean || '',
      brand_id: productData.curated_data?.brand_id || null,
      category_id: productData.curated_data?.category_id || null,
      price: productData.price || 0,
      currency: productData.currency || 'ARS',
      images: productData.images || [],
      attributes: productData.curated_data?.attributes || {},
      source: productData.source || 'scraper',
      source_url: productData.url || productData.source_url || '',
      original_id: productData.id
    };

    // Enviar al PIM global catalog
    const pimResponse = await fetch(
      `${KONG_GATEWAY_URL}/pim/api/v1/global-catalog/products`,
      {
        method: 'POST',
        headers: authResult.headers,
        body: JSON.stringify(curatedProduct),
      }
    );

    if (!pimResponse.ok) {
      const error = await pimResponse.text();
      console.error('Failed to create product in PIM:', error);
      return NextResponse.json(
        { error: 'Error al crear producto en el catálogo global' },
        { status: pimResponse.status }
      );
    }

    const pimResult = await pimResponse.json();

    // Actualizar el estado en el scraper service a "published"
    await fetch(
      `${KONG_GATEWAY_URL}/scraper/api/v1/marketplace/products/${productId}/curation-status`,
      {
        method: 'PATCH',
        headers: authResult.headers,
        body: JSON.stringify({
          status: 'published',
          notes: `Publicado en PIM con ID global: ${pimResult.id}`
        }),
      }
    );

    return NextResponse.json({
      success: true,
      product_id: productId,
      global_product_id: pimResult.id,
      status: 'published',
      message: 'Producto curado publicado exitosamente en el catálogo global'
    });

  } catch (error) {
    console.error('Error publishing curated product:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}