import { NextRequest, NextResponse } from 'next/server';

// SIEMPRE usar Kong Gateway como punto de entrada
const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:8001';

// POST /api/scraper/products/bulk-delete - Eliminar productos masivamente
export async function POST(request: NextRequest) {
  try {
    // Obtener headers del request original
    const authHeader = request.headers.get('authorization');
    
    const body = await request.json();
    const { product_ids, confirm } = body;
    
    if (!product_ids || !Array.isArray(product_ids) || product_ids.length === 0) {
      return NextResponse.json(
        { error: 'Product IDs array is required' },
        { status: 400 }
      );
    }

    if (!confirm) {
      return NextResponse.json(
        { error: 'Deletion must be confirmed with confirm: true' },
        { status: 400 }
      );
    }

    if (product_ids.length > 50) {
      return NextResponse.json(
        { error: 'Maximum 50 products can be deleted at once for safety' },
        { status: 400 }
      );
    }
    
    console.log(`[Bulk Delete] Processing ${product_ids.length} products`);
    
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
        const url = `${API_GATEWAY_URL}/scraper/api/v1/marketplace/products/${productId}`;
        console.log(`[Bulk Delete] Deleting product ${productId} via Kong:`, url);
        
        const response = await fetch(url, {
          method: 'DELETE',
          headers,
        });

        if (response.ok || response.status === 404) { // 404 significa que ya fue eliminado
          results.successful.push(productId);
          console.log(`[Bulk Delete] ✅ Product ${productId} deleted`);
        } else {
          const error = await response.text();
          results.failed.push({ id: productId, error: `HTTP ${response.status}: ${error}` });
          console.error(`[Bulk Delete] ❌ Product ${productId} failed:`, error);
        }
      } catch (error) {
        results.failed.push({ id: productId, error: String(error) });
        console.error(`[Bulk Delete] ❌ Product ${productId} error:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Bulk deletion completed: ${results.successful.length}/${results.total} products deleted`,
      results: {
        successful_count: results.successful.length,
        failed_count: results.failed.length,
        total_count: results.total,
        successful_ids: results.successful,
        failed_items: results.failed
      }
    });
    
  } catch (error) {
    console.error('[Bulk Delete] Error in bulk deletion:', error);
    return NextResponse.json(
      { error: 'Error al eliminar productos masivamente' },
      { status: 500 }
    );
  }
}
