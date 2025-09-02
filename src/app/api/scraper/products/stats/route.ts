import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Obtener el token de autenticación
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No authorization token provided' },
        { status: 401 }
      );
    }

    // Hacer la petición al backend scraper
    const scraperUrl = process.env.SCRAPER_SERVICE_URL || 'http://localhost:8086';
    const response = await fetch(`${scraperUrl}/api/v1/marketplace/products/stats`, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const stats = await response.json();
    
    // Calcular el total real sumando los estados individuales
    // En lugar de usar el total de la base de datos (10120)
    const realTotal = (stats.pending || 0) + 
                     (stats.processing || 0) + 
                     (stats.curated || 0) + 
                     (stats.rejected || 0) + 
                     (stats.published || 0);
    
    // Devolver las estadísticas con el total corregido
    return NextResponse.json({
      total: realTotal, // Total real basado en suma de estados
      pending: stats.pending || 0,
      processing: stats.processing || 0,
      curated: stats.curated || 0,
      rejected: stats.rejected || 0,
      published: stats.published || 0
    });

  } catch (error) {
    console.error('Error fetching product stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product statistics' },
      { status: 500 }
    );
  }
}