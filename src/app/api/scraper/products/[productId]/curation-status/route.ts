import { NextRequest, NextResponse } from 'next/server';

// PATCH /api/scraper/products/[productId]/curation-status - Actualizar estado de curación
export async function PATCH(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const scraperServiceUrl = process.env.SCRAPER_SERVICE_URL || 'http://localhost:8086';
    const body = await request.json();
    
    const response = await fetch(
      `${scraperServiceUrl}/api/v1/marketplace/products/${params.productId}/curation-status`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Error al actualizar estado' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating curation status:', error);
    return NextResponse.json(
      { error: 'Error al conectar con el servicio de scraping' },
      { status: 500 }
    );
  }
}