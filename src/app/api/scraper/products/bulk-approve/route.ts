import { NextRequest, NextResponse } from 'next/server';

// SIEMPRE usar Kong Gateway como punto de entrada
const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:8001';

// PAUSADO: Auto-aprobación deshabilitada temporalmente para validación manual
// Establecer AUTO_APPROVE_CURATED=true en .env para habilitar auto-aprobación
const AUTO_APPROVE_CURATED = process.env.AUTO_APPROVE_CURATED === 'true';

// POST /api/scraper/products/bulk-approve - Aprobar productos masivamente
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
        { error: 'Maximum 100 products can be approved at once' },
        { status: 400 }
      );
    }
    
    console.log(`[Bulk Approve] Processing ${product_ids.length} products`);
    
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
        console.log(`[Bulk Approve] Approving product ${productId} via Kong:`, url);
        
        // Determinar el estado final según configuración
        const finalStatus = AUTO_APPROVE_CURATED ? 'published' : 'curated';
        
        const response = await fetch(url, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({
            status: finalStatus, // 'curated' por defecto, 'published' si AUTO_APPROVE_CURATED=true
            notes: notes || 'Approved via bulk action'
          }),
        });

        if (response.ok) {
          results.successful.push(productId);
          console.log(`[Bulk Approve] ✅ Product ${productId} approved`);
        } else {
          const error = await response.text();
          results.failed.push({ id: productId, error: `HTTP ${response.status}: ${error}` });
          console.error(`[Bulk Approve] ❌ Product ${productId} failed:`, error);
        }
      } catch (error) {
        results.failed.push({ id: productId, error: String(error) });
        console.error(`[Bulk Approve] ❌ Product ${productId} error:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Bulk approval completed: ${results.successful.length}/${results.total} products approved`,
      results: {
        successful_count: results.successful.length,
        failed_count: results.failed.length,
        total_count: results.total,
        successful_ids: results.successful,
        failed_items: results.failed
      }
    });
    
  } catch (error) {
    console.error('[Bulk Approve] Error in bulk approval:', error);
    return NextResponse.json(
      { error: 'Error al aprobar productos masivamente' },
      { status: 500 }
    );
  }
}
