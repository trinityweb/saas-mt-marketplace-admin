import { NextRequest, NextResponse } from 'next/server';
import { getAuthHeaders } from '@/lib/api/auth-helpers';

// Usar Kong Gateway como punto de entrada único
const KONG_GATEWAY_URL = process.env.KONG_GATEWAY_URL || 'http://localhost:8001';

// GET /api/scraper/products - Listar productos scrapeados a través de Kong
export async function GET(request: NextRequest) {
  try {
    // Obtener headers de autenticación
    const authResult = getAuthHeaders(request);
    if ('error' in authResult) {
      return authResult.error;
    }

    const searchParams = request.nextUrl.searchParams;
    
    // Construir la URL a través de Kong
    const url = new URL(`${KONG_GATEWAY_URL}/scraper/api/v1/marketplace/products`);
    
    // Copiar todos los query params
    searchParams.forEach((value, key) => {
      url.searchParams.append(key, value);
    });

    console.log('[Scraper Products Proxy] GET:', url.toString());

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: authResult.headers,
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[Scraper Products Proxy] Error:', response.status, error);
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Transformar los datos para asegurar consistencia
    const transformedData = {
      ...data,
      products: (data.products || []).map((product: any) => ({
        ...product,
        // Asegurar que algunos campos críticos existan
        id: product.id || product._id,
        title: product.title || product.name || 'Sin título',
        name: product.title || product.name || 'Sin título', // Agregar name para compatibilidad
        status: product.curation_status || product.status || 'pending',
        images: product.images || (product.image_url ? [product.image_url] : []),
        source: product.source || 'unknown',
        currency: product.currency || 'ARS',
        confidence_score: product.confidence_score ?? 50,
        source_url: product.url || product.source_url,
        curated_data: product.curated_data || {
          brand_validated: false,
          category_name: product.category,
          brand_name: product.brand
        }
      }))
    };

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('[Scraper Products Proxy] Error fetching products:', error);
    return NextResponse.json(
      { error: 'Error al conectar con el servicio de scraping' },
      { status: 500 }
    );
  }
}