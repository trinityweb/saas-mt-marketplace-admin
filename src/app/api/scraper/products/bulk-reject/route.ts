import { NextRequest, NextResponse } from 'next/server';

// SIEMPRE usar Kong Gateway como punto de entrada
const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:8001';

// POST /api/scraper/products/bulk-reject - Rechazar productos masivamente
export async function POST(request: NextRequest) {
  try {
    // Obtener headers del request original
    const authHeader = request.headers.get('authorization');
    
    const body = await request.json();
    const { product_ids, notes } = body;
    
    if (!product_ids || !Array.isArray(product_ids) || product_ids.length === 0) {
      return NextResponse.json(
        { error: 'Product IDs array is required' },
        { status: 400 }
      );
    }

    if (product_ids.length > 100) {
      return NextResponse.json(
        { error: 'Maximum 100 products can be rejected at once' },
        { status: 400 }
      );
    }
    
    console.log(`[Bulk Reject] Processing ${product_ids.length} products`);
    
    const results = {
      successful: [] as string[],
      failed: [] as { id: string; error: string }[],
      total: product_ids.length
    };
    
    // Headers para Kong Gateway - usar token real del usuario
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'X-User-Role': 'marketplace_admin'
    };
    
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    // Procesar productos uno por uno
    for (const productId of product_ids) {
      try {
        const url = `${API_GATEWAY_URL}/scraper/api/v1/marketplace/products/${productId}/curation-status`;
        console.log(`[Bulk Reject] Rejecting product ${productId} via Kong:`, url);
        
        const response = await fetch(url, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({
            status: 'rejected',
            notes: notes || 'Rejected via bulk action'
          }),
        });

        if (response.ok) {
          results.successful.push(productId);
          console.log(`[Bulk Reject] ✅ Product ${productId} rejected`);
        } else {
          const error = await response.text();
          results.failed.push({ id: productId, error: `HTTP ${response.status}: ${error}` });
          console.error(`[Bulk Reject] ❌ Product ${productId} failed:`, error);
        }
      } catch (error) {
        results.failed.push({ id: productId, error: String(error) });
        console.error(`[Bulk Reject] ❌ Product ${productId} error:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Bulk rejection completed: ${results.successful.length}/${results.total} products rejected`,
      results: {
        successful_count: results.successful.length,
        failed_count: results.failed.length,
        total_count: results.total,
        successful_ids: results.successful,
        failed_items: results.failed
      }
    });
    
  } catch (error) {
    console.error('[Bulk Reject] Error in bulk rejection:', error);
    return NextResponse.json(
      { error: 'Error al rechazar productos masivamente' },
      { status: 500 }
    );
  }
}
