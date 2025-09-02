import { NextRequest, NextResponse } from 'next/server';

const KONG_GATEWAY_URL = process.env.KONG_GATEWAY_URL || 'http://localhost:8001';
const MARKETPLACE_ADMIN_API_KEY = process.env.MARKETPLACE_ADMIN_API_KEY || 'marketplace-admin-key-2025';

export async function POST(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const productId = params.productId;

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Actualizar el estado en MongoDB a través del scraper service vía Kong
    const response = await fetch(
      `${KONG_GATEWAY_URL}/scraper/api/v1/marketplace/products/${productId}/curation-status`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': MARKETPLACE_ADMIN_API_KEY,
          'X-User-Role': 'marketplace_admin'
        },
        body: JSON.stringify({
          status: 'rejected',
          notes: 'Rejected by user'
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Scraper service error:', error);
      return NextResponse.json(
        { error: 'Failed to reject product' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      product_id: productId,
      status: 'rejected',
      message: 'Product rejected successfully'
    });

  } catch (error) {
    console.error('Error rejecting product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}