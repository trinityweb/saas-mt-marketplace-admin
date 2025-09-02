import { NextRequest, NextResponse } from 'next/server';

const KONG_GATEWAY_URL = process.env.KONG_GATEWAY_URL || 'http://localhost:8001';
const MARKETPLACE_ADMIN_API_KEY = process.env.MARKETPLACE_ADMIN_API_KEY || 'marketplace-admin-key-2025';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { product_ids, batch_id } = body;

    if (!product_ids || !Array.isArray(product_ids) || product_ids.length === 0) {
      return NextResponse.json(
        { error: 'Product IDs array is required' },
        { status: 400 }
      );
    }

    // Llamar al AI Gateway para curación masiva a través de Kong
    const response = await fetch(`${KONG_GATEWAY_URL}/ai/curation/products/bulk-curate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': MARKETPLACE_ADMIN_API_KEY,
        'X-User-Role': 'marketplace_admin'
      },
      body: JSON.stringify({
        products: product_ids.map(id => ({ id })),
        batch_id: batch_id || `batch-${Date.now()}`,
        use_ai_extraction: true,
        validate_brand: true
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('AI Gateway bulk curate error:', error);
      return NextResponse.json(
        { error: 'Failed to bulk curate products' },
        { status: response.status }
      );
    }

    const result = await response.json();

    // Actualizar estados en MongoDB para productos exitosos a través de Kong
    if (result.successful_ids && result.successful_ids.length > 0) {
      for (const productId of result.successful_ids) {
        try {
          await fetch(`${KONG_GATEWAY_URL}/scraper/api/v1/marketplace/products/${productId}/curation-status`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'X-API-Key': MARKETPLACE_ADMIN_API_KEY,
              'X-User-Role': 'marketplace_admin'
            },
            body: JSON.stringify({
              status: 'curated',
              notes: 'Bulk curated by AI'
            }),
          });
        } catch (err) {
          console.error(`Failed to update status for product ${productId}:`, err);
        }
      }
    }

    return NextResponse.json({
      success: true,
      statistics: result.statistics,
      successful_ids: result.successful_ids,
      failed_ids: result.failed_ids,
      message: `${result.statistics?.total_processed || 0} products processed`
    });

  } catch (error) {
    console.error('Error in bulk curate endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}